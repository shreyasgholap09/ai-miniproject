from typing import Optional
from sqlalchemy.orm import Session
from app.models.report import ItemReport
from app.models.match import ItemMatch
from app.utils.scoring import cosine_similarity, calculate_color_score, calculate_date_score
from app.utils.geo import calculate_location_score
from app.services.notification_service import notification_service
from app.core.config import settings

class MatchingService:
    def evaluate_pair(
        self, 
        lost_report: ItemReport, 
        found_report: ItemReport
    ) -> tuple[float, dict[str, float], list[str]]:
        """
        Evaluates similarity between a lost report and a found report.
        Returns:
            (total_score, component_scores_dict, explanation_tags)
        """
        reasons = []

        # 1. Text Similarity
        if lost_report.text_embedding and found_report.text_embedding:
            text_sim = cosine_similarity(lost_report.text_embedding, found_report.text_embedding)
        else:
            text_sim = 0.0

        if text_sim >= 0.70:
            reasons.append(f"Strong description match ({int(text_sim * 100)}%)")
        elif text_sim >= 0.50:
            reasons.append(f"Moderate description similarity ({int(text_sim * 100)}%)")

        # 2. Image Similarity
        has_both_images = bool(lost_report.image_embedding and found_report.image_embedding)
        if has_both_images:
            image_sim = cosine_similarity(lost_report.image_embedding, found_report.image_embedding)
            if image_sim >= 0.75:
                reasons.append(f"High visual photo resemblance ({int(image_sim * 100)}%)")
            elif image_sim >= 0.50:
                reasons.append(f"Moderate photo resemblance ({int(image_sim * 100)}%)")
        else:
            image_sim = 0.0

        # 3. Color Compatibility
        color_score = calculate_color_score(lost_report.color, found_report.color)
        if color_score >= 0.90:
            reasons.append(f"Matching color: {lost_report.color}")
        elif color_score >= 0.70:
            reasons.append(f"Compatible color tones ({lost_report.color} ~ {found_report.color})")

        # 4. Location Proximity
        loc_score, distance = calculate_location_score(
            lost_report.latitude, lost_report.longitude,
            found_report.latitude, found_report.longitude
        )
        if distance is not None:
            if distance <= 150:
                reasons.append(f"Reported nearby (~{int(distance)}m away)")
            elif distance <= 1000:
                reasons.append(f"Within same neighborhood (~{round(distance/1000, 1)}km)")
        else:
            # Fallback to textual location comparison
            if lost_report.location_name.strip().lower() in found_report.location_name.strip().lower() or \
               found_report.location_name.strip().lower() in lost_report.location_name.strip().lower():
                loc_score = 0.85
                reasons.append(f"Similar reported landmark: {lost_report.location_name}")

        # 5. Date Feasibility
        date_score = calculate_date_score(lost_report.incident_date, found_report.incident_date)
        delta_days = (found_report.incident_date - lost_report.incident_date).days
        if delta_days >= 0:
            if delta_days == 0:
                reasons.append("Reported on the exact same date")
            elif delta_days <= 3:
                reasons.append(f"Found {delta_days} day(s) after being lost")
            elif delta_days <= 14:
                reasons.append(f"Found within {delta_days} days of loss")

        # Category compatibility verification
        is_same_category = lost_report.category.strip().lower() == found_report.category.strip().lower()
        if is_same_category:
            reasons.append(f"Exact category match: {lost_report.category}")

        # 6. Dynamic Weight Allocation
        if has_both_images:
            # Baseline 5-component weighted average
            w_img = 0.40
            w_txt = 0.30
            w_col = 0.10
            w_loc = 0.10
            w_dat = 0.10
        else:
            # Normalized weights when photo is absent
            w_img = 0.00
            w_txt = 0.50
            w_col = 0.167
            w_loc = 0.167
            w_dat = 0.166

        raw_total = (
            (w_img * image_sim) +
            (w_txt * text_sim) +
            (w_col * color_score) +
            (w_loc * loc_score) +
            (w_dat * date_score)
        )

        # Mild category penalty if categories explicitly conflict
        if not is_same_category:
            raw_total *= 0.65

        total_score = round(min(1.0, max(0.0, raw_total)), 4)

        component_scores = {
            "image_score": round(image_sim, 4),
            "text_score": round(text_sim, 4),
            "color_score": round(color_score, 4),
            "location_score": round(loc_score, 4),
            "date_score": round(date_score, 4),
        }

        return total_score, component_scores, reasons

    def run_matches_for_report(
        self, 
        db: Session, 
        report: ItemReport, 
        threshold: float = settings.MATCH_THRESHOLD
    ) -> list[ItemMatch]:
        """
        Compares the given report against all compatible opposite-type reports,
        persists matches that exceed threshold, and notifies users.
        """
        # Exclude self-matches and non-open reports
        opposite_type = "found" if report.report_type == "lost" else "lost"
        
        candidates = db.query(ItemReport).filter(
            ItemReport.report_type == opposite_type,
            ItemReport.status == "open",
            ItemReport.user_id != report.user_id
        ).all()

        saved_matches = []

        for candidate in candidates:
            # Determine which is lost and which is found
            lost_rep = report if report.report_type == "lost" else candidate
            found_rep = candidate if report.report_type == "lost" else report

            total_score, scores, reasons = self.evaluate_pair(lost_rep, found_rep)

            if total_score >= threshold:
                # Check for existing match record
                existing_match = db.query(ItemMatch).filter(
                    ItemMatch.lost_report_id == lost_rep.id,
                    ItemMatch.found_report_id == found_rep.id
                ).first()

                if existing_match:
                    existing_match.total_score = total_score
                    existing_match.image_score = scores["image_score"]
                    existing_match.text_score = scores["text_score"]
                    existing_match.color_score = scores["color_score"]
                    existing_match.location_score = scores["location_score"]
                    existing_match.date_score = scores["date_score"]
                    existing_match.explanation_tags = reasons
                    db.commit()
                    db.refresh(existing_match)
                    saved_matches.append(existing_match)
                else:
                    new_match = ItemMatch(
                        lost_report_id=lost_rep.id,
                        found_report_id=found_rep.id,
                        total_score=total_score,
                        image_score=scores["image_score"],
                        text_score=scores["text_score"],
                        color_score=scores["color_score"],
                        location_score=scores["location_score"],
                        date_score=scores["date_score"],
                        explanation_tags=reasons,
                        status="potential"
                    )
                    db.add(new_match)
                    db.commit()
                    db.refresh(new_match)
                    saved_matches.append(new_match)

                    # Notify both users of the potential match
                    pct = int(total_score * 100)
                    notification_service.create_notification(
                        db=db,
                        user_id=report.user_id,
                        title=f"Potential Match Found ({pct}%)",
                        message=f"We found a potential match for your {report.report_type} item '{report.title}'. Check potential matches!",
                        link_url=f"/reports/{report.id}/matches"
                    )
                    notification_service.create_notification(
                        db=db,
                        user_id=candidate.user_id,
                        title=f"Potential Match Found ({pct}%)",
                        message=f"A new report '{report.title}' might match your {candidate.report_type} item '{candidate.title}'.",
                        link_url=f"/reports/{candidate.id}/matches"
                    )

        # Sort matches descending by total score
        saved_matches.sort(key=lambda m: m.total_score, reverse=True)
        return saved_matches

matching_service = MatchingService()
