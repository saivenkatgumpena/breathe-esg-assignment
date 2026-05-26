# Breathe ESG — Enterprise Carbon & Sustainability Data Management Platform

A full-stack ESG data ingestion, normalization, analyst review, and audit platform built with **Django REST Framework** and **React**.

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| **Frontend** | https://breathe-esg.vercel.app |
| **Backend API** | https://breathe-esg-backend.onrender.com/api |
| **Django Admin** | https://breathe-esg-backend.onrender.com/admin |

### Demo Credentials
```
Username: analyst
Password: password123
```

---

## 📋 What This Project Does

Companies send environmental data from multiple systems in different formats. This platform:

1. **Ingests** data from 3 real-world source types:
   - **SAP ERP** → Fuel consumption (Scope 1) + Raw material procurement (Scope 3)
   - **Utility Portal** → Electricity bills (Scope 2)
   - **Corporate Travel** → Flights/hotels/taxis (Scope 3)

2. **Normalizes** all data into a common schema:
   - `Ton → kg`, `L → litres`, `MWh → kWh`, etc.

3. **Validates** with business rules — flags suspicious rows (high quantities, bad dates, duplicate airports)

4. **Provides an analyst review workflow**:
   - Approve ✅ / Reject ❌ / Edit ✏️ / Lock for Audit 🔒

5. **Tracks every edit** in an immutable audit trail

---

## 🗂️ Project Structure

```
breathe-esg-assignment/
├── backend/                      # Django backend
│   ├── apps/
│   │   ├── companies/            # Multi-tenant company model
│   │   ├── ingestion/            # File parsing + normalization + validation
│   │   ├── records/              # ESGRecord model + analyst actions
│   │   └── audit/                # Immutable AuditLog
│   ├── config/
│   │   ├── settings.py           # Development settings
│   │   └── settings_production.py# Production settings (Render)
│   ├── requirements.txt
│   ├── Procfile                  # For Render deployment
│   └── render.yaml               # Render infrastructure config
│
├── frontend/                     # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx     # Metrics + records table + filters
│   │   │   ├── Upload.jsx        # SAP/Utility/Travel ingestion
│   │   │   └── Review.jsx        # Analyst review + audit trail
│   │   └── services/api.js       # Axios + JWT interceptors
│   ├── vercel.json               # For Vercel SPA routing
│   └── .env.production           # Points to Render backend
│
├── MODEL.md                      # Data model documentation
├── DECISIONS.md                  # Engineering decisions
├── TRADEOFFS.md                  # Design tradeoffs
└── SOURCES.md                    # Research sources
```

---

## 🚀 Local Setup

### Backend

```bash
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows

# 2. Install dependencies
cd backend
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Seed default data (company, user, unit conversions)
python manage.py seed_data

# 5. Start server
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with `analyst` / `password123`.

---

## 🧪 Running Tests

```bash
cd backend
..\venv\Scripts\python manage.py test --verbosity=2
```

**5 tests, all passing:**
- `test_parse_date` — date format normalization (4 formats)
- `test_normalize_quantity_and_unit` — unit conversion logic
- `test_process_sap_csv` — SAP ingestion pipeline
- `test_process_utility_csv` — Utility ingestion pipeline
- `test_process_travel_json` — Travel ingestion pipeline

---

## 📁 Sample Test Files

Included in the repository root:

| File | Source Type | Records |
|---|---|---|
| `sap_test_upload.csv` | SAP ERP | 6 rows (4 pending, 1 suspicious, 1 failed) |
| `utility_test_upload.csv` | Utility Portal | 5 rows (1 pending, 2 suspicious, 2 failed) |
| `travel_test_upload.json` | Corporate Travel | 4 rows (2 pending, 1 suspicious, 1 failed) |

---

## ☁️ Deploying to Render + Vercel

### Backend → Render

1. Push this repository to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `backend/render.yaml` automatically
5. It will create the PostgreSQL database, run migrations, seed data, and start the server

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-render-backend-url.onrender.com/api`
5. Deploy

---

## 📖 Documentation

| File | Contents |
|---|---|
| [MODEL.md](./MODEL.md) | Data model design decisions and multi-tenancy architecture |
| [DECISIONS.md](./DECISIONS.md) | Why CSV over OData API, PostgreSQL, JWT, etc. |
| [TRADEOFFS.md](./TRADEOFFS.md) | What was deliberately skipped and why |
| [SOURCES.md](./SOURCES.md) | Research on SAP exports, Concur API, GHG Protocol |

---

## 🔑 Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Django 6 + Django REST Framework |
| Authentication | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL (production) / SQLite (local fallback) |
| Backend Hosting | Render |
| Frontend Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Frontend Hosting | Vercel |

---

*Built for the Breathe ESG Technical Assignment — May 2026*
