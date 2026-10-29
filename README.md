# AI Lost and Found Items Matcher

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

An intelligent, multimodal web platform designed for university campuses, public transit facilities, and organizations to automate the identification and recovery of lost belongings using state-of-the-art Artificial Intelligence.

---

## 1. Project Abstract

Traditional Lost and Found operations rely on disjointed paper logs, bulletin boards, or chaotic social media posts. Text-based keyword searches frequently fail because human reporters describe identical objects with divergent vocabulary (e.g., *"Navy Dell rucksack with keyring"* versus *"Blue laptop bag with keychain"*). 

The **AI Lost and Found Items Matcher** bridges this gap by implementing a **modular multimodal AI matching engine**. It computes deep visual embeddings using OpenAI's **CLIP (`clip-ViT-B-32`)**, semantic description embeddings using **Sentence Transformers (`all-MiniLM-L6-v2`)**, and computes normalized proximity scores for color, geospatial distance (Haversine formula), and chronological feasibility. Rather than asserting deterministic certainty, the system outputs probabilistic candidate rankings with clear explainability tags, supported by a privacy-preserving ownership verification and claim workflow.

---

## 2. Project Objectives

1. **Eliminate Vocabulary Mismatch**: Utilize semantic dense vector search so synonyms, alternative brand spellings, and paraphrase descriptions match reliably.
2. **Multimodal Visual & Textual Fusion**: Combine photographic visual feature vectors with textual semantics using dynamic weight redistribution.
3. **Geospatial & Temporal Realism**: Enforce physical constraints—ensuring candidate items are within reasonable proximity and chronology.
4. **Transparent Explainable AI (XAI)**: Provide granular component scores and clear human-readable rationale tags rather than black-box scores.
5. **Secure Claim & Verification Pipeline**: Preserve user privacy by concealing private contact details until an ownership claim backed by confidential proof is approved.
6. **Administrative Moderation**: Equip campus administrators with tools to moderate spam, monitor platform statistics, and oversee disputed claims.

---

## 3. System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client (React.js + Vite)"]
        UI["Modern Responsive UI\n(Components, Forms, Modals)"]
        State["State Management & API Client\n(Axios + JWT Auth)"]
    end

    subgraph Gateway["FastAPI Web Server"]
        Router["API Routers\n(/auth, /reports, /matches, /claims, /notifications, /admin)"]
        Security["Auth & Security Middleware\n(OAuth2 / JWT / CORS / Rate-Limit)"]
        StorageEngine["Local Media Storage Handler\n(/uploads directory)"]
    end

    subgraph ServiceLayer["Core Business & AI Services"]
        ReportService["Report & Search Service"]
        MatchEngine["Modular Matching Engine"]
        TextAI["Text Embedding Service\n(SentenceTransformers: all-MiniLM-L6-v2)"]
        ImageAI["Image Embedding Service\n(Pretrained CLIP: ViT-B-32)"]
        NotifyService["In-App Notification Dispatcher"]
    end

    subgraph DataLayer["Persistence Layer"]
        PG[("PostgreSQL Database\n(SQLAlchemy ORM)")]
    end

    UI --> State
    State -->|"REST API (JSON & Multipart)"| Router
    Router --> Security
    Router --> ReportService
    Router --> StorageEngine
    ReportService --> MatchEngine
    MatchEngine --> TextAI
    MatchEngine --> ImageAI
    MatchEngine --> NotifyService
    ReportService --> PG
    MatchEngine --> PG
    NotifyService --> PG
```

---

## 4. Methodology & AI Matching Formulation

### A. Feature Extraction
1. **Semantic Text Representation**:
   $$\vec{v}_{\text{text}} = \text{SentenceTransformer}_{\text{all-MiniLM-L6-v2}}(\text{Title} \oplus \text{Category} \oplus \text{Color} \oplus \text{Description} \oplus \text{Location}) \in \mathbb{R}^{384}$$
2. **Visual Image Representation**:
   $$\vec{v}_{\text{image}} = \text{CLIP}_{\text{ViT-B-32}}(\text{Preprocessed Item Photo}) \in \mathbb{R}^{512}$$

### B. Similarity Metrics
- **Cosine Similarity**:
  $$\text{Sim}(\vec{a}, \vec{b}) = \frac{\vec{a} \cdot \vec{b}}{\|\vec{a}\| \|\vec{b}\|}$$
- **Geospatial Proximity (Haversine Formula)**:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  $$\text{Score}_{\text{loc}} = \begin{cases} 1.0, & \text{if } d \le 100\text{m} \\ \max\left(0, 1 - \frac{d - 100}{d_{\text{max}} - 100}\right), & \text{if } 100\text{m} < d < d_{\text{max}} \\ 0.0, & \text{if } d \ge d_{\text{max}} \end{cases}$$
- **Chronological Feasibility**:
  $$\text{Score}_{\text{date}} = f(\text{Date}_{\text{found}} - \text{Date}_{\text{lost}})$$
  *(Penalizes instances where found date precedes lost date by more than 1 day).*

### C. Dynamic Weight Redistribution
To avoid unfairly penalizing reports where a student lacks a photograph of a lost belonging, the engine uses **adaptive weight normalization**:

| Scenario | $W_{\text{image}}$ | $W_{\text{text}}$ | $W_{\text{color}}$ | $W_{\text{location}}$ | $W_{\text{date}}$ | Total Weight |
|---|---|---|---|---|---|---|
| **Both Photos Present** | **0.40** | **0.30** | **0.10** | **0.10** | **0.10** | **1.00** |
| **Photo Missing in Either** | **0.00** | **0.50** | **0.167** | **0.167** | **0.166** | **1.00** |

$$\text{Final Score} = \sum_{k} W_k \cdot S_k \times \text{CategoryCompatibilityFactor}$$

---

## 5. Database Schema & Entities

The relational database is normalized and enforced with foreign keys, cascading deletions, and check constraints:

```mermaid
erDiagram
    USERS ||--o{ ITEM_REPORTS : "creates"
    USERS ||--o{ CLAIMS : "submits"
    USERS ||--o{ NOTIFICATIONS : "receives"
    ITEM_REPORTS ||--o{ MATCHES : "lost_report"
    ITEM_REPORTS ||--o{ MATCHES : "found_report"
    ITEM_REPORTS ||--o{ CLAIMS : "claimed_on"
    MATCHES ||--o| CLAIMS : "associated_with"

    USERS {
        uuid id PK
        string email UK
        string name
        string role "user | admin"
        boolean is_active
    }
    ITEM_REPORTS {
        uuid id PK
        uuid user_id FK
        string report_type "lost | found"
        string title
        string category
        string color
        text description
        string location_name
        float latitude
        float longitude
        date incident_date
        string image_url
        json text_embedding
        json image_embedding
        string status "open | claimed | resolved | moderated"
    }
    MATCHES {
        uuid id PK
        uuid lost_report_id FK
        uuid found_report_id FK
        float total_score
        float image_score
        float text_score
        float color_score
        float location_score
        float date_score
        json explanation_tags
        string status "potential | acknowledged | rejected | resolved"
    }
    CLAIMS {
        uuid id PK
        uuid report_id FK
        uuid match_id FK
        uuid claimant_id FK
        text proof_details
        string contact_info
        string status "pending | approved | rejected"
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        text message
        string link_url
        boolean is_read
    }
```

---

## 6. Installation & Execution Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL running locally on port 5432

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/ai-lost-and-found-matcher.git
cd ai-lost-and-found-matcher
```

### Step 2: Backend Setup
```bash
# 1. Create and activate Python virtual environment
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Configure backend/.env
# Verify your DATABASE_URL, e.g.:
# DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/lost_and_found_db

# 4. Seed database with demo users, reports, and AI embeddings
python backend/seed_data.py

# 5. Launch FastAPI backend server
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The interactive API documentation is available at:* `http://127.0.0.1:8000/docs`

### Step 3: Frontend Setup
```bash
# In a new terminal:
cd frontend

# 1. Install dependencies
npm install

# 2. Launch Vite dev server
npm run dev
```
*Access the React web application at:* `http://127.0.0.1:5173`

---

## 7. Viva Demonstration & Evaluation Walkthrough

To demonstrate the full project lifecycle during a viva examination:

1. **Open Application**: Navigate to `http://127.0.0.1:5173`.
2. **Quick Demo Login**: Click **`⚡ Demo Logins`** in the top navbar and select **`Alex (Lost Backpack)`**.
3. **View Dashboard**: Alex's dashboard immediately highlights a high-confidence potential match with **Jordan's found rucksack** (~93% Match Score).
4. **Inspect AI Match Breakdown**: Click **`Review Match Breakdown`** to view:
   - Visual side-by-side comparison of the lost and found photographs.
   - 5 granular progress meters: Vision (99%), Text (78%), Color (100%), Location (~28m away), Date (1 day difference).
   - Explainable AI reason chips.
5. **Submit Confidential Claim**: Click **`Claim This Item`**. Enter private identifying proof (*"Contains a TI-84 calculator and water bottle with sticker"*).
6. **Switch to Finder**: Use the **`⚡ Demo Logins`** switcher to switch to **`Jordan (Found Backpack)`**.
7. **Review & Approve Claim**: Go to **`Claims` -> `Received Claims to Review`**. Click **`Approve Ownership`**.
8. **Automated Status Update**: The report status transitions to `RESOLVED`, both users receive in-app notifications, and the item is archived from active matching.
9. **Admin Panel**: Log in via **`Campus Administrator`** to review the platform analytics, moderation queue, and user account management.

---

## 8. Automated Testing

Run the automated backend test suite covering authentication, report creation, similarity heuristics, and claim workflows:

```bash
# Run pytest from project root
$env:PYTHONPATH="backend"
pytest backend/tests/ -v
```

Expected result:
```
backend/tests/test_auth.py::test_register_success PASSED
backend/tests/test_auth.py::test_register_duplicate_email PASSED
backend/tests/test_auth.py::test_login_success PASSED
backend/tests/test_auth.py::test_login_invalid_password PASSED
backend/tests/test_auth.py::test_get_current_user_profile PASSED
backend/tests/test_claims.py::test_claim_workflow PASSED
backend/tests/test_matching.py::test_cosine_similarity_identical_and_orthogonal PASSED
backend/tests/test_matching.py::test_color_matching_logic PASSED
backend/tests/test_matching.py::test_date_feasibility_logic PASSED
backend/tests/test_matching.py::test_location_proximity_logic PASSED
backend/tests/test_reports.py::test_create_and_get_report PASSED
backend/tests/test_reports.py::test_list_reports_filter PASSED
================ 12 passed in 19.59s ================
```

---

## 9. Advantages & Limitations

### Advantages
- **Multimodal Intelligence**: Analyzes both semantic textual descriptions and visual imagery.
- **Probabilistic Ranking**: Avoids false definitive declarations by presenting candidates with transparent score breakdowns.
- **Privacy Preservation**: Confidential identifying proof prevents malicious users from falsely claiming valuable items.
- **Dynamic Weighting**: Gracefully handles reports submitted without photographs.

### Limitations
- **Local Media Storage**: Currently saves uploads to the local filesystem; requires S3/Cloudinary configuration for multi-instance cloud deployments.
- **Image Angle Variations**: Significant variations in lighting or damaged items may yield lower CLIP visual similarity, compensated by text and metadata weights.

---

## 10. Future Scope

1. **OCR Serial Number Extraction**: Integrate Tesseract OCR to automatically parse serial numbers from electronics photographs.
2. **Cloud Vector Search (pgvector)**: Migrate embeddings from JSON columns to PostgreSQL `pgvector` indexing (HNSW) for scaling to millions of campus items.
3. **Push Notifications & Email Alerts**: Integrate SendGrid or Firebase Cloud Messaging (FCM) for real-time mobile push notifications.
4. **Multilingual Embeddings**: Utilize multilingual Sentence Transformers (e.g., `paraphrase-multilingual-MiniLM-L12-v2`) for international university campuses.

---

## 11. Frequently Asked Viva Voce Questions & Model Answers

### Q1: Why did you choose Sentence Transformers instead of standard TF-IDF or keyword matching?
> **Answer:** Standard TF-IDF and keyword matching rely entirely on exact token overlap. If a student reports losing a *"black laptop rucksack"* and the finder logs a *"dark computer backpack"*, keyword matching fails because there is zero word overlap. Sentence Transformers map phrases into dense 384-dimensional vector spaces where words with similar semantic meanings reside close to each other, allowing the system to detect similarity regardless of phrasing.

### Q2: How does the CLIP model compute image similarity?
> **Answer:** CLIP (Contrastive Language-Image Pretraining) uses a Vision Transformer (`ViT-B-32`) to map images into a 512-dimensional embedding space. When two photos of an item are uploaded, we compute the cosine similarity between their normalized feature vectors:
> $$\text{Cosine Similarity} = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$
> Values close to 1.0 indicate high visual resemblance in color, shape, and structure.

### Q3: How do you handle missing photographs without penalizing the report?
> **Answer:** We implemented **Dynamic Weight Normalization**. If both reports have photos, image similarity contributes 40% and text contributes 30%. If either report lacks a photo, the image weight becomes 0.0, and the remaining weights (text, color, location, date) are proportionally rescaled so their sum remains 1.0.

### Q4: How is geospatial distance calculated?
> **Answer:** We use the **Haversine formula**, which computes the great-circle distance between two pairs of latitude and longitude coordinates over the Earth's spherical surface. The resulting distance in meters is passed through a linear decay function: items within 100 meters score 1.0, decaying to 0.0 beyond 3,000 meters.

### Q5: How does the system prevent fraudulent ownership claims?
> **Answer:** Public item detail pages conceal sensitive owner contact information and private marks. To claim an item, a claimant must submit private identifying proof (such as a serial number, unique internal markings, or pocket contents). The report owner reviews this proof before approving the claim. Only upon approval are contact details exchanged and the report marked resolved.
