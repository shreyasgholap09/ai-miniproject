from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.report import ReportOut

MatchStatus = Literal["potential", "acknowledged", "rejected", "resolved"]

class MatchOut(BaseModel):
    id: str
    lost_report_id: str
    found_report_id: str
    total_score: float
    image_score: float
    text_score: float
    color_score: float
    location_score: float
    date_score: float
    explanation_tags: list[str]
    status: MatchStatus
    created_at: datetime
    
    # Associated reports
    lost_report: Optional[ReportOut] = None
    found_report: Optional[ReportOut] = None

    model_config = ConfigDict(from_attributes=True)

class MatchStatusUpdate(BaseModel):
    status: MatchStatus

class MatchBreakdown(BaseModel):
    total_score_percent: int
    image_similarity_percent: int
    text_similarity_percent: int
    color_score_percent: int
    location_score_percent: int
    date_score_percent: int
    reasons: list[str]
