from fastapi import FastAPI
import json
from pydantic import BaseModel

app = FastAPI()

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
    return {"message": "saved", "data": schedules}

@app.get("/price/schedules")
def get_schedules():
    return read_json("price_schedules.json")

@app.post("/audit/time")
def set_audit(data: AuditConfig):
    write_json("audit_config.json", data.dict())
    return {"message": "audit updated"}

@app.get("/audit/time")
def get_audit():
    return read_json("audit_config.json")