from fastapi import FastAPI, HTTPException
import anyio
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
import threading
import smtplib
from email.mime.text import MIMEText
import firebase_admin
from firebase_admin import credentials, messaging

load_dotenv(override=True)

EZEEUSER = os.getenv("EZEEUSER")
PASSWORD = os.getenv("PASSWORD")
PROPCODE = os.getenv("PROPCODE")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
SENDTOUSER = os.getenv("SENDTOUSER")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
scheduler = BackgroundScheduler()
scheduler.start()
cred = credentials.Certificate("hsg-price-night-audit-firebase.json")
firebase_admin.initialize_app(cred)

# Persist device tokens to file
def load_device_tokens():
    try:
        with open("device_tokens.json", "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_device_tokens(tokens):
    with open("device_tokens.json", "w") as f:
        json.dump(tokens, f, indent=2)

DEVICE_TOKENS = load_device_tokens()

class PriceData(BaseModel):
    A: int
    B: int
    C: int
    D: int

class PriceSchedule(BaseModel):
    time: str   # "HH:MM"
    prices: PriceData

class DeviceToken(BaseModel):
    token: str

class DeleteSchedule(BaseModel):
    time: str


def read_json(path):
    with open(path, "r") as f:
        return json.load(f)

def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

@app.post("/price/schedule")
def add_price_schedule(data: PriceSchedule):
    schedules = read_json("price_schedules.json")

    # remove existing same time
    schedules = [job for job in schedules if job["time"] != data.time]
    # add new
    schedules.append(data.dict())

    write_json("price_schedules.json", schedules)
    schedule_jobs()
    return {"message": "saved", "data": schedules}

@app.get("/price/schedules")
def get_schedules():
    return read_json("price_schedules.json")

@app.get("/price/previous")
async def get_previous_prices():
    try:
        data = await anyio.to_thread.run_sync(run_fetch_previous_prices_sync)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/register-device")
def register_device(data: DeviceToken):
    global DEVICE_TOKENS
    if data.token not in DEVICE_TOKENS:
        DEVICE_TOKENS.append(data.token)
        save_device_tokens(DEVICE_TOKENS)
    return {"status": "registered"}

@app.delete("/price/schedule")
def delete_price_schedule(data: DeleteSchedule):
    schedules = read_json("price_schedules.json")
    schedules = [job for job in schedules if job["time"] != data.time]
    write_json("price_schedules.json", schedules)
    schedule_jobs()
    return {"message": "deleted", "data": schedules}

def set_value(page, selector, value):
    page.wait_for_selector(selector)
    page.click(selector)
    page.keyboard.press("Control+A")
    page.keyboard.press("Backspace")
    page.type(selector, str(value))

current_fetch_process = None
fetch_lock = threading.Lock()

def run_price_update(prices):
    global current_fetch_process
    if current_fetch_process is not None:
        try:
            print("Terminating active fetch process to prioritize price update...")
            current_fetch_process.terminate()
            current_fetch_process.wait(timeout=5)
        except Exception as e:
            print("Error terminating fetch process:", e)
        finally:
            current_fetch_process = None

    for attempt in range(3):
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto("https://live.ipms247.com/login/")
                page.fill("#username", EZEEUSER)
                page.fill("#password", PASSWORD)
                page.fill("#hotelcode", PROPCODE)
                page.wait_for_selector("button#login")
                page.get_by_role("button", name="SIGN IN").click()
                page.wait_for_url("**/unity/**")
                page.goto("https://live.ipms247.com/unity/ratewizard/ratesinventory")
                page.wait_for_selector("#input-2-1-3")
                set_value(page, "#input-2-1-3", prices["A"])
                #day remaining rooms = 2-0-3
                page.wait_for_timeout(500)
                set_value(page, "#input-2-7-3", prices["B"])
                #day remaining rooms = 2-6-3
                page.wait_for_timeout(500)
                set_value(page, "#input-2-3-3", prices["C"])
                #day remaining rooms = 2-2-3
                page.wait_for_timeout(500)
                set_value(page, "#input-2-5-3", prices["D"])
                #day remaining rooms = 2-4-3
                page.get_by_role("button", name="Save").click()
                page.wait_for_timeout(5000)
                browser.close()
                notify("Price Update Success", "Prices updated successfully")
                return
        except Exception as e:
            print(f"Playwright error on attempt {attempt}:", e)
            if attempt == 2:
                notify("Price Update Failed", "Prices failed to update")

def run_fetch_previous_prices_sync():
    global current_fetch_process
    import subprocess
    import sys
    
    for attempt in range(3):
        try:
            # Get path to fetch_worker.py in the same directory as main.py
            worker_path = os.path.join(os.path.dirname(__file__), "fetch_worker.py")
            
            with fetch_lock:
                current_fetch_process = subprocess.Popen(
                    [sys.executable, worker_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                proc = current_fetch_process
            
            try:
                stdout, stderr = proc.communicate(timeout=120)
            except subprocess.TimeoutExpired:
                proc.kill()
                stdout, stderr = proc.communicate()
                raise Exception("Worker timed out")
            finally:
                if current_fetch_process == proc:
                    current_fetch_process = None
                
            if proc.returncode != 0:
                raise Exception(stderr or f"Worker failed with exit code {proc.returncode}")
            
            # Parse the stdout JSON
            data = json.loads(stdout.strip())
            return data
        except Exception as e:
            print(f"Subprocess fetch error on attempt {attempt}:", e)
            if attempt == 2:
                raise e

def run_price_update_async(time_str, prices):
    def _price_thread():
        run_price_update(prices)
        try:
            # Clean up JSON
            schedules = read_json("price_schedules.json")
            schedules = [s for s in schedules if s["time"] != time_str]
            write_json("price_schedules.json", schedules)
            # Remove from APScheduler ONLY if it still exists
            try:
                scheduler.remove_job(f"price_{time_str}")
            except Exception:
                pass # Job was likely already automatically deleted by APScheduler
        except Exception as e:
            print("Cleanup error:", e)
            
    threading.Thread(target=_price_thread).start()



def schedule_jobs():
    scheduler.remove_all_jobs()
    now = datetime.now()

    # Load price schedules
    schedules = read_json("price_schedules.json")
    active_schedules = []
    schedules_updated = False

    for job in schedules:
        time_str = job["time"]
        h, m = map(int, time_str.split(":"))
        
        target = now.replace(hour=h, minute=m, second=0, microsecond=0)
        # If it's already past the time today:
        if target < now:
            # If they just missed it by less than 2 minutes, trigger it right now
            if (now - target).total_seconds() < 120:
                target = now + timedelta(seconds=2)
                active_schedules.append(job)
            else:
                # Expired/past schedule - discard and remove from JSON
                schedules_updated = True
                continue
        else:
            active_schedules.append(job)

        scheduler.add_job(
            run_price_update_async,
            'date',
            run_date=target,
            args=[time_str, job["prices"]],
            id=f"price_{time_str}",
            replace_existing=True
        )

    if schedules_updated:
        write_json("price_schedules.json", active_schedules)

def send_email(subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_USER
        msg["To"] = SENDTOUSER

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)

    except Exception as e:
        print("Email error:", e)

def send_push(title, body):
    for token in DEVICE_TOKENS:
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                token=token,
            )
            messaging.send(message)
        except Exception as e:
            print("Push error:", e)

def notify(title, message):
    send_email(title, message)
    send_push(title, message)

@app.on_event("startup")
def startup_event():
    schedule_jobs()