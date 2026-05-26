# ENGINEERING DECISIONS

## Overview

This document explains the key engineering decisions made while building the Breathe ESG Data Management Platform. For every choice, we explain what alternative was considered and why we chose what we did.

---

## Decision 1: CSV for SAP instead of SAP OData API

**Decision:** Accept SAP data as a CSV file upload.

**Alternatives considered:**
- SAP OData API (real-time pull)
- SAP RFC/BAPI integration
- SAP IDOC message format

**Why CSV?**

Real-world SAP integrations require SAP Basis team access, security certificates, VPN tunneling, and often weeks of configuration. For a data ingestion platform that must work across many client companies — each with different SAP versions and configurations — a **CSV export** is by far the most realistic, portable, and universally supported method.

Nearly every SAP system in the world can produce a CSV extract from transaction codes like `ME2M` (purchase orders), `MB51` (material movements), or custom ALV reports. This is exactly how most mid-sized companies actually export their environmental data — they don't have dedicated API infrastructure for ESG.

**Tradeoff:** Data is not real-time. Analysts must manually upload files rather than having automated pulls. This is acceptable for monthly ESG reporting cycles.

---

## Decision 2: JSON for Corporate Travel instead of Concur API

**Decision:** Accept travel data as a JSON file upload.

**Alternatives considered:**
- Concur Travel API (OAuth2 + REST)
- Navan API
- Expensify API
- Excel/CSV export

**Why JSON?**

After reviewing Concur's developer documentation (SAP Concur API), their travel records endpoint returns expense reports in a JSON format that closely mirrors the structure we designed. A JSON upload mimics this structure while avoiding OAuth2 credential management, API rate limits, and company-specific sandbox environments.

JSON is also more expressive than CSV for travel data because a single trip can have multiple legs (flight out, hotel, flight back) — nested structures are natural in JSON but awkward in flat CSV.

**Why not Excel?**

Excel files require `openpyxl` or `xlrd` as extra dependencies and are harder to validate programmatically. JSON is self-describing and easier to schema-validate.

---

## Decision 3: PostgreSQL over SQLite

**Decision:** Use PostgreSQL as the primary database (with SQLite as a local fallback).

**Alternatives considered:**
- SQLite (default Django database)
- MySQL

**Why PostgreSQL?**

ESG records can scale to millions of rows per company per year. PostgreSQL offers:
- `JSONField` support (native, fast) — critical for storing `raw_data` on each ESG record
- Better concurrent write performance for simultaneous file uploads
- Row-level security for production multi-tenancy
- Excellent Django ORM compatibility via `psycopg2`

We kept SQLite as a **fallback** (the settings.py auto-detects whether PostgreSQL is reachable). This means tests and local development can still run without PostgreSQL configured, but the production deployment uses a real database.

---

## Decision 4: JWT Authentication over Session Authentication

**Decision:** Use `djangorestframework-simplejwt` for token-based authentication.

**Alternatives considered:**
- Django session authentication (cookie-based)
- API key authentication
- OAuth2 / Social Auth

**Why JWT?**

The frontend is a separate React SPA served from a different origin than the Django backend. Cookie-based session authentication requires careful CSRF configuration and `SameSite` cookie policies across cross-origin requests.

JWT tokens are stateless, stored in `localStorage`, and sent as `Authorization: Bearer <token>` headers on every API request. This is the standard approach for decoupled React + Django REST Framework architectures and avoids the complexity of CSRF token management in SPAs.

**Tradeoff:** JWTs are not revocable without a token blacklist. We set a short 1-day expiry with a 7-day refresh token as a reasonable balance between convenience and security.

---

## Decision 5: Per-Unit UnitConversion Database Table

**Decision:** Store unit conversions in a database table (`UnitConversion` model) instead of hard-coding them in Python.

**Alternatives considered:**
- Hard-coded Python dictionary: `CONVERSIONS = {'L': ('litres', 1.0), 'Ton': ('kg', 1000.0)}`
- Pint (Python unit conversion library)

**Why a database table?**

New units appear constantly in real-world ESG data. A European subsidiary might upload data in `cubic meters`, an Indian plant in `MT` (metric tons). If conversions are hard-coded, adding a new unit requires a code deployment.

With a database table, a non-technical administrator can add new unit conversions via Django Admin without any code change — making the system genuinely maintainable by operations teams.

**Why not Pint?**

The Pint library handles physics-based units well but doesn't know about ESG-specific concepts like `trip` or `flight leg`. We need a custom, domain-aware conversion table.

---

## Decision 6: Status-Based Workflow (PENDING → APPROVED → LOCKED)

**Decision:** Implement a 5-state workflow: `PENDING`, `FAILED`, `SUSPICIOUS`, `APPROVED`, `LOCKED`.

**Alternatives considered:**
- Simple boolean `is_approved` flag
- Two-state (valid/invalid)

**Why 5 states?**

ESG data goes through multiple hands before being submitted to regulators. A simple `is_approved` boolean cannot express the nuance of the real workflow:

| State | Meaning | Who sets it |
|---|---|---|
| `PENDING` | Successfully ingested, awaiting analyst review | Ingestion engine |
| `FAILED` | Could not be parsed/normalized | Ingestion engine |
| `SUSPICIOUS` | Valid data but statistically unusual | Ingestion engine (rules) |
| `APPROVED` | Analyst has verified and accepted | Analyst via UI |
| `LOCKED` | Submitted for official audit, immutable | Analyst via UI |

The `LOCKED` state is particularly important — it enforces that once data is submitted to an auditor, it cannot be altered, maintaining the legal integrity of the ESG report.

---

## Decision 7: Suspicious Record Auto-Detection Rules

**Decision:** Implement business-rule-based flagging for suspicious records rather than ML-based anomaly detection.

**Alternatives considered:**
- Statistical anomaly detection (z-score, IQR)
- Machine learning (isolation forest)
- No automated flagging

**Why rule-based?**

Rule-based flagging is:
1. **Explainable** — analysts can understand exactly why a record was flagged
2. **Auditable** — the flagging reason is stored in `notes` as plain English
3. **Maintainable** — business rules can be added/changed without ML expertise

Rules implemented:
- SAP: Quantity > 10,000 litres/kg (unusual for a single purchase order line)
- SAP: Missing plant code (organizational data quality issue)
- Utility: Billing period < 15 or > 45 days (atypical billing cycle)
- Utility: Consumption > 50,000 kWh (unusual for standard metering)
- Travel: Identical departure and destination airports (data entry error)
- Travel: Missing flight origin/destination
- Travel: > 10 trips in a single record (unrealistic booking)
- Travel: > 500 km in a single taxi record

---

*Last updated: May 2026 | Breathe ESG Platform v1.0*
