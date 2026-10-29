from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.report import ItemReport
from app.models.match import ItemMatch
from app.models.claim import ItemClaim
from app.schemas.user import UserOut
from app.schemas.report import ReportOut
from app.schemas.claim import ClaimOut
from app.services.notification_service import notification_service

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/stats")
def get_platform_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Provides high-level platform analytics for administrators."""
    total_users = db.query(User).count()
    total_reports = db.query(ItemReport).count()
    lost_reports = db.query(ItemReport).filter(ItemReport.report_type == "lost").count()
    found_reports = db.query(ItemReport).filter(ItemReport.report_type == "found").count()
    resolved_reports = db.query(ItemReport).filter(ItemReport.status == "resolved").count()
    moderated_reports = db.query(ItemReport).filter(ItemReport.status == "moderated").count()

    total_matches = db.query(ItemMatch).count()
    total_claims = db.query(ItemClaim).count()
    approved_claims = db.query(ItemClaim).filter(ItemClaim.status == "approved").count()
    pending_claims = db.query(ItemClaim).filter(ItemClaim.status == "pending").count()

    recovery_rate = round((resolved_reports / total_reports * 100), 1) if total_reports > 0 else 0.0

    return {
        "total_users": total_users,
        "total_reports": total_reports,
        "lost_reports": lost_reports,
        "found_reports": found_reports,
        "resolved_reports": resolved_reports,
        "moderated_reports": moderated_reports,
        "total_matches": total_matches,
        "total_claims": total_claims,
        "approved_claims": approved_claims,
        "pending_claims": pending_claims,
        "recovery_rate_percent": recovery_rate
    }

@router.get("/reports", response_model=list[ReportOut])
def list_all_reports_for_admin(
    status_filter: str = Query("all"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lists reports for administrative moderation."""
    query = db.query(ItemReport)
    if status_filter != "all":
        query = query.filter(ItemReport.status == status_filter)
    reports = query.order_by(desc(ItemReport.created_at)).all()
    for r in reports:
        if r.user:
            r.user_name = r.user.name
    return reports

@router.patch("/reports/{report_id}/moderate", response_model=ReportOut)
def moderate_report(
    report_id: str,
    action: str = Query(..., pattern="^(flag_spam|restore_open)$"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Moderates a report by hiding it or restoring it to open status."""
    report = db.query(ItemReport).filter(ItemReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    if action == "flag_spam":
        report.status = "moderated"
        notification_service.create_notification(
            db=db,
            user_id=report.user_id,
            title="Report Moderated",
            message=f"Your report '{report.title}' has been flagged for moderation by administrators.",
            link_url="/my-reports"
        )
    else:
        report.status = "open"

    db.commit()
    db.refresh(report)
    if report.user:
        report.user_name = report.user.name
    return report

@router.get("/users", response_model=list[UserOut])
def list_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lists registered accounts with management controls."""
    return db.query(User).order_by(desc(User.created_at)).all()

@router.patch("/users/{user_id}/toggle-active", response_model=UserOut)
def toggle_user_active(
    user_id: str,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Deactivates or activates a user account."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrative account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

@router.get("/claims", response_model=list[ClaimOut])
def list_all_claims_admin(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Views all claims submitted across the platform."""
    return db.query(ItemClaim).order_by(desc(ItemClaim.created_at)).all()
