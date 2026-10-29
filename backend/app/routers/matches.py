from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.report import ItemReport
from app.models.match import ItemMatch
from app.schemas.match import MatchOut, MatchStatusUpdate
from app.services.matching_service import matching_service

router = APIRouter(prefix="/matches", tags=["AI Matches"])

@router.get("/report/{report_id}", response_model=list[MatchOut])
def get_report_matches(
    report_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns all AI-ranked potential matches for a given report ID.
    Works whether the report is lost or found.
    """
    report = db.query(ItemReport).filter(ItemReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    matches = db.query(ItemMatch).filter(
        or_(
            ItemMatch.lost_report_id == report_id,
            ItemMatch.found_report_id == report_id
        )
    ).order_by(desc(ItemMatch.total_score)).all()

    # Ensure user display names are populated on child reports
    for m in matches:
        if m.lost_report and m.lost_report.user:
            m.lost_report.user_name = m.lost_report.user.name
        if m.found_report and m.found_report.user:
            m.found_report.user_name = m.found_report.user.name

    return matches

@router.post("/run-match/{report_id}", response_model=list[MatchOut])
def trigger_matching(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually re-runs the multimodal AI matching engine for a specific report."""
    report = db.query(ItemReport).filter(ItemReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    if report.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to run matching on this report.")

    matches = matching_service.run_matches_for_report(db, report)
    for m in matches:
        if m.lost_report and m.lost_report.user:
            m.lost_report.user_name = m.lost_report.user.name
        if m.found_report and m.found_report.user:
            m.found_report.user_name = m.found_report.user.name
    return matches

@router.patch("/{match_id}/status", response_model=MatchOut)
def update_match_status(
    match_id: str,
    status_in: MatchStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates match review status ('acknowledged', 'rejected', etc.)."""
    match = db.query(ItemMatch).filter(ItemMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found.")

    # Only participants of the match or admin can update status
    is_participant = (
        (match.lost_report and match.lost_report.user_id == current_user.id) or
        (match.found_report and match.found_report.user_id == current_user.id)
    )
    if not is_participant and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this match.")

    match.status = status_in.status
    db.commit()
    db.refresh(match)
    return match
