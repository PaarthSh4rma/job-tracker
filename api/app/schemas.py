from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from uuid import UUID

class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "applied"
    applied_date: Optional[date] = None
    link: Optional[str] = None
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    link: Optional[str] = None
    notes: Optional[str] = None

class ApplicationOut(BaseModel):
    id: UUID
    company: str
    role: str
    status: str
    applied_date: Optional[date]
    link: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True