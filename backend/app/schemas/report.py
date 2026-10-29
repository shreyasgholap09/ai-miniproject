from datetime import datetime, date
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

ReportType = Literal["lost", "found"]
ReportStatus = Literal["open", "claimed", "resolved", "moderated"]

class ReportBase(BaseModel):
    report_type: ReportType
    title: str = Field(..., min_length=3, max_length=150)
    category: str = Field(..., min_length=2, max_length=50)
    color: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=5)
    location_name: str = Field(..., min_length=2, max_length=150)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    incident_date: date

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    color: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, min_length=5)
    location_name: Optional[str] = Field(None, min_length=2, max_length=150)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    incident_date: Optional[date] = None

class ReportStatusUpdate(BaseModel):
    status: ReportStatus

class ReportOut(ReportBase):
    id: str
    user_id: str
    image_url: Optional[str] = None
    status: ReportStatus
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ReportListResponse(BaseModel):
    items: list[ReportOut]
    total: int
    page: int
    limit: int
    pages: int
