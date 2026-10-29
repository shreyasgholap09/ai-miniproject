import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Text, Float, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class ItemReport(Base):
    __tablename__ = "item_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(10), nullable=False, index=True)  # "lost" or "found"
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    color = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    incident_date = Column(Date, nullable=False, index=True)
    image_url = Column(String(255), nullable=True)
    
    # Precomputed AI vectors for fast matching
    text_embedding = Column(JSON, nullable=True)  # 384-dimensional dense vector
    image_embedding = Column(JSON, nullable=True)  # 512-dimensional CLIP vector
    
    status = Column(String(20), default="open", nullable=False, index=True)  # "open", "claimed", "resolved", "moderated"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="reports")
    lost_matches = relationship(
        "ItemMatch", 
        foreign_keys="[ItemMatch.lost_report_id]", 
        back_populates="lost_report",
        cascade="all, delete-orphan"
    )
    found_matches = relationship(
        "ItemMatch", 
        foreign_keys="[ItemMatch.found_report_id]", 
        back_populates="found_report",
        cascade="all, delete-orphan"
    )
    claims = relationship("ItemClaim", back_populates="report", cascade="all, delete-orphan")
