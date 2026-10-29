import math
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.report import ItemReport
from app.schemas.report import ReportOut, ReportListResponse, ReportStatusUpdate
from app.services.storage_service import storage_service
from app.services.text_service import text_service
from app.services.image_service import image_service
from app.services.matching_service import matching_service

router = APIRouter(prefix="/reports", tags=["Item Reports"])

@router.post("/", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_type: str = Form(...),
    title: str = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    description: str = Form(...),
    location_name: str = Form(...),
    incident_date: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a new lost or found report with optional photograph.
    Computes AI multimodal embeddings and automatically triggers background candidate matching.
    """
    if report_type not in ["lost", "found"]:
        raise HTTPException(status_code=400, detail="report_type must be 'lost' or 'found'.")

    try:
        parsed_date = date.fromisoformat(incident_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid incident_date format. Expected YYYY-MM-DD.")

    # 1. Process and save uploaded photograph
    image_url = None
    if image and image.filename:
        image_url = await storage_service.save_image(image)

    # 2. Compute Text Embedding
    text_prompt = text_service.build_text_prompt(
        title=title,
        category=category,
        color=color,
        description=description,
        location_name=location_name
    )
    text_emb = text_service.generate_embedding(text_prompt)

    # 3. Compute Image Embedding (CLIP)
    image_emb = None
    if image_url:
        image_emb = image_service.generate_embedding_from_file(image_url)

    # 4. Save to Database
    report = ItemReport(
        user_id=current_user.id,
        report_type=report_type,
        title=title.strip(),
        category=category.strip(),
        color=color.strip(),
        description=description.strip(),
        location_name=location_name.strip(),
        latitude=latitude,
        longitude=longitude,
        incident_date=parsed_date,
        image_url=image_url,
        text_embedding=text_emb,
        image_embedding=image_emb,
        status="open"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # 5. Automatically execute AI matching against opposing reports
    try:
        matching_service.run_matches_for_report(db, report)
    except Exception as e:
        print(f"[MatchingEngine] Warning: Background matching encountered error: {e}")

    # Attach reporter name for display
    report.user_name = current_user.name
    return report

@router.get("/", response_model=ReportListResponse)
def list_reports(
    report_type: Optional[str] = Query(None, pattern="^(lost|found)$"),
    category: Optional[str] = None,
    color: Optional[str] = None,
    status_filter: Optional[str] = Query("open", alias="status"),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Browses active reports with filtering, searching, and pagination."""
    query = db.query(ItemReport)

    if report_type:
        query = query.filter(ItemReport.report_type == report_type)
    if category and category.lower() != "all":
        query = query.filter(ItemReport.category.ilike(f"%{category}%"))
    if color and color.lower() != "all":
        query = query.filter(ItemReport.color.ilike(f"%{color}%"))
    if status_filter and status_filter.lower() != "all":
        query = query.filter(ItemReport.status == status_filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ItemReport.title.ilike(search_term),
                ItemReport.description.ilike(search_term),
                ItemReport.location_name.ilike(search_term),
                ItemReport.category.ilike(search_term),
                ItemReport.color.ilike(search_term)
            )
        )

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit

    items = query.order_by(desc(ItemReport.created_at)).offset(offset).limit(limit).all()

    # Populate reporter display names
    for item in items:
        if item.user:
            item.user_name = item.user.name

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.get("/my", response_model=list[ReportOut])
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all reports submitted by the authenticated user."""
    reports = db.query(ItemReport)\
        .filter(ItemReport.user_id == current_user.id)\
        .order_by(desc(ItemReport.created_at))\
        .all()
    for r in reports:
        r.user_name = current_user.name
    return reports

@router.get("/{report_id}", response_model=ReportOut)
def get_report_detail(
    report_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves full details of a specific item report."""
    report = db.query(ItemReport).filter(ItemReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.user:
        report.user_name = report.user.name
    return report

@router.patch("/{report_id}/status", response_model=ReportOut)
def update_report_status(
    report_id: str,
    status_in: ReportStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows report owner or administrator to update status (e.g., mark resolved)."""
    report = db.query(ItemReport).filter(ItemReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    if report.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this report.")

    report.status = status_in.status
    db.commit()
    db.refresh(report)
    if report.user:
        report.user_name = report.user.name
    return report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an item report and cleans up its stored photo."""
    report = db.query(ItemReport).filter(ItemReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    if report.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this report.")

    if report.image_url:
        storage_service.delete_image(report.image_url)

    db.delete(report)
    db.commit()
    return None
