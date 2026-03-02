from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Temporary in-memory storage (we’ll replace with database later)
applications = []

class Application(BaseModel):
    company: str
    role: str
    status: str = "applied"

@app.get("/")
def read_root():
    return {"message": "Job Tracker API is running 🚀"}

@app.post("/applications")
def create_application(app_data: Application):
    applications.append(app_data)
    return app_data

@app.get("/applications", response_model=List[Application])
def list_applications():
    return applications