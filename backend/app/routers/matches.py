from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database.session import get_db
from app.core.deps import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.report import ItemReport
from app.models.match import ItemMatch
from app.schemas.match import MatchOut, MatchStatusUpdate
from app.services.matching_service import matching_service
from app.services.storage_service import storage_service
from app.services.text_service import text_service
from app.services.image_service import image_service

router = APIRouter(prefix="/matches", tags=["AI Matches"])

@router.post("/compare")
async def compare_items(
    lost_title: str = Form(...),
    lost_description: str = Form(...),
    lost_category: str = Form("Bags & Backpacks"),
    lost_color: str = Form("Black"),
    lost_location: str = Form("Campus Library"),
    lost_date: str = Form("2026-10-25"),
    lost_lat: Optional[float] = Form(37.7749),
    lost_lon: Optional[float] = Form(-122.4194),
    lost_image: Optional[UploadFile] = File(None),
    
    found_title: str = Form(...),
    found_description: str = Form(...),
    found_category: str = Form("Bags & Backpacks"),
    found_color: str = Form("Black"),
    found_location: str = Form("Library 2nd Floor"),
    found_date: str = Form("2026-10-26"),
    found_lat: Optional[float] = Form(37.7751),
    found_lon: Optional[float] = Form(-122.4192),
    found_image: Optional[UploadFile] = File(None),
    
    db: Session = Depends(get_db)
):
    """
    Directly compares a lost item and a found item in real-time using
    CLIP vision model, Sentence Transformers, and geospatial/temporal heuristics.
    """
    # 1. Process Lost Image
    lost_image_url = None
    lost_image_emb = None
    if lost_image and lost_image.filename:
        lost_image_url = await storage_service.save_image(lost_image)
        lost_image_emb = image_service.generate_embedding_from_file(lost_image_url)

    # 2. Process Found Image
    found_image_url = None
    found_image_emb = None
    if found_image and found_image.filename:
        found_image_url = await storage_service.save_image(found_image)
        found_image_emb = image_service.generate_embedding_from_file(found_image_url)

    # 3. Compute Text Embeddings
    lost_text = text_service.build_text_prompt(
        title=lost_title,
        category=lost_category,
        color=lost_color,
        description=lost_description,
        location_name=lost_location
    )
    lost_text_emb = text_service.generate_embedding(lost_text)

    found_text = text_service.build_text_prompt(
        title=found_title,
        category=found_category,
        color=found_color,
        description=found_description,
        location_name=found_location
    )
    found_text_emb = text_service.generate_embedding(found_text)

    try:
        lost_d = date.fromisoformat(lost_date)
    except ValueError:
        lost_d = date.today()

    try:
        found_d = date.fromisoformat(found_date)
    except ValueError:
        found_d = date.today()

    # Build temporary simulated objects for evaluation
    class TempReport:
        pass

    rep_lost = TempReport()
    rep_lost.title = lost_title
    rep_lost.category = lost_category
    rep_lost.color = lost_color
    rep_lost.description = lost_description
    rep_lost.location_name = lost_location
    rep_lost.latitude = lost_lat
    rep_lost.longitude = lost_lon
    rep_lost.incident_date = lost_d
    rep_lost.text_embedding = lost_text_emb
    rep_lost.image_embedding = lost_image_emb

    rep_found = TempReport()
    rep_found.title = found_title
    rep_found.category = found_category
    rep_found.color = found_color
    rep_found.description = found_description
    rep_found.location_name = found_location
    rep_found.latitude = found_lat
    rep_found.longitude = found_lon
    rep_found.incident_date = found_d
    rep_found.text_embedding = found_text_emb
    rep_found.image_embedding = found_image_emb

    total_score, component_scores, reasons = matching_service.evaluate_pair(rep_lost, rep_found)

    pct = int(round(total_score * 100))
    verdict = "High Match Probability" if pct >= 75 else "Moderate Candidate" if pct >= 50 else "Low Match Likelihood"

    return {
        "total_score": total_score,
        "total_score_percent": pct,
        "verdict": verdict,
        "component_scores": component_scores,
        "component_percentages": {
            "image": int(round(component_scores["image_score"] * 100)),
            "text": int(round(component_scores["text_score"] * 100)),
            "color": int(round(component_scores["color_score"] * 100)),
            "location": int(round(component_scores["location_score"] * 100)),
            "date": int(round(component_scores["date_score"] * 100)),
        },
        "explanation_tags": reasons,
        "lost_image_url": lost_image_url,
        "found_image_url": found_image_url
    }


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
