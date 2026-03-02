from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID

from .db import SessionLocal
from .models import Application
from .schemas import ApplicationCreate, ApplicationUpdate, ApplicationOut

app = FastAPI(title="Job Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://job-tracker-eosin-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/applications", response_model=ApplicationOut)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    obj = Application(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@app.get("/applications", response_model=List[ApplicationOut])
def list_applications(status: Optional[str] = None, db: Session = Depends(get_db)):
    stmt = select(Application).order_by(Application.created_at.desc())
    if status:
        stmt = stmt.where(Application.status == status)
    return db.execute(stmt).scalars().all()

@app.get("/applications/{app_id}", response_model=ApplicationOut)
def get_application(app_id: UUID, db: Session = Depends(get_db)):
    obj = db.get(Application, app_id)
    if not obj:
        raise HTTPException(404, "Not found")
    return obj

@app.patch("/applications/{app_id}", response_model=ApplicationOut)
def update_application(app_id: UUID, payload: ApplicationUpdate, db: Session = Depends(get_db)):
    obj = db.get(Application, app_id)
    if not obj:
        raise HTTPException(404, "Not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@app.delete("/applications/{app_id}")
def delete_application(app_id: UUID, db: Session = Depends(get_db)):
    obj = db.get(Application, app_id)
    if not obj:
        raise HTTPException(404, "Not found")
    db.delete(obj)
    db.commit()
    return {"deleted": True}

@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Application.status, func.count(Application.id)).group_by(Application.status)
    ).all()
    return {"by_status": {status: count for status, count in rows}}