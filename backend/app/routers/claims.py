from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.report import ItemReport
from app.models.match import ItemMatch
from app.models.claim import ItemClaim
from app.schemas.claim import ClaimCreate, ClaimReview, ClaimOut
from app.services.notification_service import notification_service

router = APIRouter(prefix="/claims", tags=["Claims"])

@router.post("/", response_model=ClaimOut, status_code=status.HTTP_201_CREATED)
def submit_claim(
    claim_in: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits a confidential ownership claim on an item report."""
    report = db.query(ItemReport).filter(ItemReport.id == claim_in.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Item report not found.")

    if report.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot submit a claim on your own report.")

    if report.status in ["resolved", "claimed"]:
        raise HTTPException(status_code=400, detail="This item has already been claimed or resolved.")

    # Check for existing pending claim
    existing = db.query(ItemClaim).filter(
        ItemClaim.report_id == claim_in.report_id,
        ItemClaim.claimant_id == current_user.id,
        ItemClaim.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending claim on this item.")

    claim = ItemClaim(
        report_id=claim_in.report_id,
        match_id=claim_in.match_id,
        claimant_id=current_user.id,
        proof_details=claim_in.proof_details.strip(),
        contact_info=claim_in.contact_info.strip(),
        status="pending"
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    # Notify report creator
    notification_service.create_notification(
        db=db,
        user_id=report.user_id,
        title="New Ownership Claim Received",
        message=f"{current_user.name} submitted an ownership claim for your report '{report.title}'. Review their proof to verify.",
        link_url=f"/claims/received"
    )

    return claim

@router.get("/my-claims", response_model=list[ClaimOut])
def get_my_claims(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all claims filed by the current user."""
    return db.query(ItemClaim)\
        .filter(ItemClaim.claimant_id == current_user.id)\
        .order_by(desc(ItemClaim.created_at))\
        .all()

@router.get("/received", response_model=list[ClaimOut])
def get_received_claims(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns claims submitted by others on reports created by the current user."""
    return db.query(ItemClaim)\
        .join(ItemReport, ItemClaim.report_id == ItemReport.id)\
        .filter(ItemReport.user_id == current_user.id)\
        .order_by(desc(ItemClaim.created_at))\
        .all()

@router.get("/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves full details of a specific claim."""
    claim = db.query(ItemClaim).filter(ItemClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    # Claimant, Report Owner, or Admin
    is_owner = claim.report and claim.report.user_id == current_user.id
    if claim.claimant_id != current_user.id and not is_owner and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this claim.")

    return claim

@router.patch("/{claim_id}/review", response_model=ClaimOut)
def review_claim(
    claim_id: str,
    review_in: ClaimReview,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reviews and either approves or rejects a claim."""
    claim = db.query(ItemClaim).filter(ItemClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    report = claim.report
    is_report_owner = report and report.user_id == current_user.id

    if not is_report_owner and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the report owner or admin can review this claim.")

    claim.status = review_in.status
    if review_in.admin_notes:
        claim.admin_notes = review_in.admin_notes.strip()

    if review_in.status == "approved":
        # Mark report as resolved
        if report:
            report.status = "resolved"
        # If there's an associated match, mark it resolved
        if claim.match_id:
            match = db.query(ItemMatch).filter(ItemMatch.id == claim.match_id).first()
            if match:
                match.status = "resolved"

        # Notify claimant of approval with contact details
        notification_service.create_notification(
            db=db,
            user_id=claim.claimant_id,
            title="Claim Approved! Item Recovered",
            message=f"Congratulations! Your claim for '{report.title}' has been verified and approved by the owner.",
            link_url=f"/my-claims"
        )
    else:
        # Notify claimant of rejection
        notification_service.create_notification(
            db=db,
            user_id=claim.claimant_id,
            title="Claim Rejected",
            message=f"Your claim for '{report.title}' was reviewed and declined.",
            link_url=f"/my-claims"
        )

    db.commit()
    db.refresh(claim)
    return claim
