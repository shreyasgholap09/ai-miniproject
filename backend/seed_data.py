import os
import sys
from datetime import date, timedelta
from pathlib import Path
from PIL import Image, ImageDraw

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.database.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.report import ItemReport
from app.services.text_service import text_service
from app.services.image_service import image_service
from app.services.matching_service import matching_service
from app.core.config import settings

def create_sample_image(filename: str, color_bg: tuple, label: str, accent_color: tuple = None) -> str:
    """Generates a sample item photograph with realistic dimensions and visual cues."""
    img = Image.new("RGB", (512, 512), color=color_bg)
    draw = ImageDraw.Draw(img)

    # Draw simulated object outline
    draw.rounded_rectangle([64, 64, 448, 448], radius=32, outline=(220, 220, 220), width=4)
    
    if accent_color:
        draw.rounded_rectangle([200, 200, 312, 312], radius=16, fill=accent_color)
    
    # Simple marker circle
    draw.ellipse([236, 100, 276, 140], fill=(240, 240, 240))
    
    upload_path = settings.UPLOAD_PATH / filename
    img.save(upload_path, quality=90)
    return f"/uploads/{filename}"

def seed():
    print("[Seed] Seeding sample users, reports, and generating real AI embeddings...")
    db = SessionLocal()

    # Create Demo Users
    users_data = [
        {"name": "Alex Rivera", "email": "alex@campus.edu", "phone": "555-0101", "role": "user"},
        {"name": "Jordan Lee", "email": "jordan@campus.edu", "phone": "555-0102", "role": "user"},
        {"name": "Sarah Jenkins", "email": "sarah@campus.edu", "phone": "555-0103", "role": "user"},
        {"name": "David Chen", "email": "david@campus.edu", "phone": "555-0104", "role": "user"},
        {"name": "Maya Patel", "email": "maya@campus.edu", "phone": "555-0105", "role": "user"},
        {"name": "Marcus Vance", "email": "marcus@campus.edu", "phone": "555-0106", "role": "user"},
    ]

    user_map = {}
    for u in users_data:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user = User(
                name=u["name"],
                email=u["email"],
                phone=u["phone"],
                password_hash=get_password_hash("Student@123"),
                role=u["role"],
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            user_map[u["email"]] = user
        else:
            user_map[u["email"]] = existing

    # Create Sample Photos
    img_bag_lost = create_sample_image("sample_lost_backpack.jpg", (30, 30, 35), "Black Bag", (220, 38, 38))
    img_bag_found = create_sample_image("sample_found_backpack.jpg", (25, 25, 30), "Found Bag", (200, 30, 30))
    img_pods_lost = create_sample_image("sample_lost_airpods.jpg", (50, 50, 50), "AirPods", (180, 180, 180))
    img_pods_found = create_sample_image("sample_found_airpods.jpg", (45, 45, 48), "Earbuds", (170, 170, 170))
    img_wallet_lost = create_sample_image("sample_lost_wallet.jpg", (110, 60, 30), "Brown Wallet", (139, 69, 19))
    img_wallet_found = create_sample_image("sample_found_wallet.jpg", (105, 55, 28), "Leather Wallet", (130, 65, 15))

    today = date.today()

    reports_data = [
        # Pair 1: Backpack
        {
            "user_email": "alex@campus.edu",
            "report_type": "lost",
            "title": "Black Laptop Backpack with Red Keychain",
            "category": "Bags & Backpacks",
            "color": "Black",
            "description": "Lost my black water-resistant Dell laptop backpack with red Swiss gear keychain. Contains notebooks, scientific calculator, and blue water bottle in side pocket.",
            "location_name": "Campus Central Library, 2nd Floor Study Area",
            "incident_date": today - timedelta(days=2),
            "latitude": 37.7749,
            "longitude": -122.4194,
            "image_url": img_bag_lost
        },
        {
            "user_email": "jordan@campus.edu",
            "report_type": "found",
            "title": "Dark Laptop Rucksack with Red Keyring",
            "category": "Bags & Backpacks",
            "color": "Black",
            "description": "Found a black Dell laptop rucksack with a red keyring near the 2nd floor library reading tables. Safely deposited with campus security.",
            "location_name": "Library 2nd Floor, near silent study zone",
            "incident_date": today - timedelta(days=1),
            "latitude": 37.7751,
            "longitude": -122.4192,
            "image_url": img_bag_found
        },
        # Pair 2: AirPods
        {
            "user_email": "sarah@campus.edu",
            "report_type": "lost",
            "title": "Space Gray Apple AirPods Pro 2",
            "category": "Electronics",
            "color": "Grey",
            "description": "Lost my AirPods Pro 2nd Gen in a matte black silicone protective case. Case has a small scratch on the back hinge.",
            "location_name": "Engineering Hall Room 302",
            "incident_date": today - timedelta(days=3),
            "latitude": 37.7760,
            "longitude": -122.4180,
            "image_url": img_pods_lost
        },
        {
            "user_email": "david@campus.edu",
            "report_type": "found",
            "title": "Wireless Earbuds in Black Silicone Case",
            "category": "Electronics",
            "color": "Black",
            "description": "Found a pair of Apple wireless earbuds in a silicone case on a desk in Engineering Block 3rd floor.",
            "location_name": "Engineering Building, 3rd Floor Lab",
            "incident_date": today - timedelta(days=2),
            "latitude": 37.7762,
            "longitude": -122.4182,
            "image_url": img_pods_found
        },
        # Pair 3: Wallet
        {
            "user_email": "maya@campus.edu",
            "report_type": "lost",
            "title": "Brown Leather Bi-fold Wallet",
            "category": "Keys & Wallets",
            "color": "Brown",
            "description": "Lost brown bi-fold leather wallet with college student ID card and driver license.",
            "location_name": "Student Activity Center Cafeteria",
            "incident_date": today - timedelta(days=4),
            "latitude": 37.7735,
            "longitude": -122.4210,
            "image_url": img_wallet_lost
        },
        {
            "user_email": "marcus@campus.edu",
            "report_type": "found",
            "title": "Brown Men's Leather Wallet",
            "category": "Keys & Wallets",
            "color": "Brown",
            "description": "Found brown leather wallet left on cafeteria booth table. Contains cards.",
            "location_name": "Cafeteria dining hall table 14",
            "incident_date": today - timedelta(days=3),
            "latitude": 37.7736,
            "longitude": -122.4208,
            "image_url": img_wallet_found
        }
    ]

    created_reports = []
    for r in reports_data:
        # Check if already seeded
        existing_report = db.query(ItemReport).filter(ItemReport.title == r["title"]).first()
        if existing_report:
            created_reports.append(existing_report)
            continue

        user = user_map[r["user_email"]]

        # 1. Compute Text Embedding
        text_prompt = text_service.build_text_prompt(
            title=r["title"],
            category=r["category"],
            color=r["color"],
            description=r["description"],
            location_name=r["location_name"]
        )
        text_emb = text_service.generate_embedding(text_prompt)

        # 2. Compute Image Embedding
        image_emb = image_service.generate_embedding_from_file(r["image_url"])

        report = ItemReport(
            user_id=user.id,
            report_type=r["report_type"],
            title=r["title"],
            category=r["category"],
            color=r["color"],
            description=r["description"],
            location_name=r["location_name"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            incident_date=r["incident_date"],
            image_url=r["image_url"],
            text_embedding=text_emb,
            image_embedding=image_emb,
            status="open"
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        created_reports.append(report)
        print(f"  + Seeded report: '{report.title}' ({report.report_type})")

    # Run AI Matching engine across all reports
    print("[Seed] Running AI matching across seeded dataset...")
    for rep in created_reports:
        matches = matching_service.run_matches_for_report(db, rep)
        if matches:
            print(f"  -> Generated {len(matches)} potential match(es) for '{rep.title}'")

    db.close()
    print("[Seed] Sample dataset and AI matches successfully prepared!")

if __name__ == "__main__":
    seed()
