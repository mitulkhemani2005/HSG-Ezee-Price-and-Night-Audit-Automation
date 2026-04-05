from fastapi import FastAPI
import json
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
import os
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
import threading

load_dotenv()

EZEEUSER = os.getenv("EZEEUSER")
PASSWORD = os.getenv("PASSWORD")
PROPCODE = os.getenv("PROPCODE")

app = FastAPI()
scheduler = BackgroundScheduler()
scheduler.start()

class PriceData(BaseModel):
    A: int
    B: int
    C: int
    D: int

class PriceSchedule(BaseModel):
    time: str   # "HH:MM"
    prices: PriceData

class AuditConfig(BaseModel):
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

@app.post("/audit/time")
def set_audit(data: AuditConfig):
    write_json("audit_config.json", data.dict())
    schedule_jobs()
    return {"message": "audit updated"}

@app.get("/audit/time")
def get_audit():
    return read_json("audit_config.json")

#Scheduled Functions
def set_value(page, selector, value):
    page.wait_for_selector(selector)
    page.click(selector)
    page.keyboard.press("Control+A")
    page.keyboard.press("Backspace")
    page.type(selector, str(value))

def run_price_update(prices):
    for attempt in range(3):
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
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
                page.wait_for_timeout(500)
                set_value(page, "#input-2-7-3", prices["B"])
                page.wait_for_timeout(500)
                set_value(page, "#input-2-3-3", prices["C"])
                page.wait_for_timeout(500)
                set_value(page, "#input-2-5-3", prices["D"])
                page.get_by_role("button", name="Save").click()
                page.wait_for_timeout(5000)
                browser.close()
                return
        except Exception as e:
            print("❌ Error:", e)
            if attempt == 2:
                print("❌ Failed after retries")

def run_price_update_async(prices):
    threading.Thread(target=run_price_update, args=(prices,)).start()

@app.get("/test")
def test():
    run_price_update_async({"A":3500,"B":2500,"C":2200,"D":1800})
    return {"status": "done"}


def run_audit():
    print("Running night audit")

def schedule_jobs():
    scheduler.remove_all_jobs()

    # Load price schedules
    schedules = read_json("price_schedules.json")

    for job in schedules:
        time = job["time"]
        h, m = map(int, time.split(":"))

        scheduler.add_job(
            run_price_update_async,
            'cron',
            hour=h,
            minute=m,
            args=[job["prices"]],
            id=f"price_{time}",
            replace_existing=True
        )

    # Load audit time
    audit = read_json("audit_config.json")
    h, m = map(int, audit["time"].split(":"))
    scheduler.add_job(
        run_audit,
        'cron',
        hour=h,
        minute=m,
        id="audit_job",
        replace_existing=True
    )

@app.on_event("startup")
def startup_event():
    schedule_jobs()