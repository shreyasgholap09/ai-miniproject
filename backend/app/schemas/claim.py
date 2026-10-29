from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.report import ReportOut
from app.schemas.user import UserOut

ClaimStatus = Literal["pending", "approved", "rejected"]

class ClaimCreate(BaseModel):
    report_id: str
    match_id: Optional[str] = None
    proof_details: str = Field(..., min_length=10, description="Serial number, unique marks, contents")
    contact_info: str = Field(..., min_length=5, description="Preferred contact method")

class ClaimReview(BaseModel):
    status: Literal["approved", "rejected"]
    admin_notes: Optional[str] = None

class ClaimOut(BaseModel):
    id: str
    report_id: str
    match_id: Optional[str] = None
    claimant_id: str
    proof_details: str
    contact_info: str
    status: ClaimStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    report: Optional[ReportOut] = None
    claimant: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)
