import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.session import Base

class ItemMatch(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lost_report_id = Column(String(36), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    found_report_id = Column(String(36), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Matching Scores (0.0 to 1.0)
    total_score = Column(Float, nullable=False, index=True)
    image_score = Column(Float, default=0.0, nullable=False)
    text_score = Column(Float, default=0.0, nullable=False)
    color_score = Column(Float, default=0.0, nullable=False)
    location_score = Column(Float, default=0.0, nullable=False)
    date_score = Column(Float, default=0.0, nullable=False)
    
    # Explainable AI tags (e.g., ["High visual resemblance (85%)", "Nearby within 120m"])
    explanation_tags = Column(JSON, default=list, nullable=False)
    
    status = Column(String(20), default="potential", nullable=False)  # "potential", "acknowledged", "rejected", "resolved"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("lost_report_id", "found_report_id", name="uq_lost_found_match"),
    )

    # Relationships
    lost_report = relationship("ItemReport", foreign_keys=[lost_report_id], back_populates="lost_matches")
    found_report = relationship("ItemReport", foreign_keys=[found_report_id], back_populates="found_matches")
    claims = relationship("ItemClaim", back_populates="match")
