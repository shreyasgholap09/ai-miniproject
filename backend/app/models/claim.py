import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class ItemClaim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    match_id = Column(String(36), ForeignKey("matches.id", ondelete="SET NULL"), nullable=True, index=True)
    claimant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Private proof for verification
    proof_details = Column(Text, nullable=False)
    contact_info = Column(String(100), nullable=False)
    
    status = Column(String(20), default="pending", nullable=False, index=True)  # "pending", "approved", "rejected"
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    report = relationship("ItemReport", back_populates="claims")
    match = relationship("ItemMatch", back_populates="claims")
    claimant = relationship("User", back_populates="claims")
