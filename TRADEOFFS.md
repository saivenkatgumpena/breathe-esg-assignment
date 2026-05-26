# DESIGN TRADEOFFS

## Overview

This document is an honest account of what we intentionally did NOT build, and why. Every skipped feature was a deliberate tradeoff — not an oversight.

---

## Tradeoff 1: No Live SAP OData API Integration

**What we skipped:** Real-time SAP data pull using the SAP OData API or SAP Business Hub.

**What we built instead:** CSV file upload from SAP.

**Why we skipped it:**

A real SAP OData integration requires:
- SAP Basis access and configuration (SP levels, Gateway service activation)
- Security certificates and RFC destinations
- Company-specific SAP system IDs and client numbers
- VPN or allowlisted IP access
- Testing against actual SAP sandbox environments (S/4HANA, ECC 6.0)

This is a 2-4 week integration project on its own, requiring access to a licensed SAP system. It is completely out of scope for a 4-day assignment and also completely unnecessary — the vast majority of companies that report ESG data do so via CSV exports, not live API pulls.

**Acceptable because:** The ingestion pipeline, normalization engine, validation rules, and audit workflow are all functional with CSV data. The source format is a pluggable implementation detail.

---

## Tradeoff 2: No PDF Bill Parsing (Utility Invoices)

**What we skipped:** Extracting data from scanned PDF electricity bills using OCR.

**What we built instead:** CSV export from the utility portal.

**Why we skipped it:**

PDF parsing for structured financial documents is a significant engineering challenge:
- Utility bill formats vary wildly between providers (BESCOM, TATA Power, MSEDCL, etc.)
- OCR libraries (Tesseract, AWS Textract, Google Document AI) require significant training data
- Scanned PDFs have image quality issues, rotation, shadows, and handwritten corrections
- A robust PDF → structured data pipeline is a standalone product worth millions

**What a real implementation would need:**
- AWS Textract or Google Document AI API integration
- Per-provider bill template configuration
- Manual review queue for OCR confidence below threshold
- Post-extraction validation

**Acceptable because:** Most enterprise utility portals (SAP RE-FX, Schneider Electric EcoStruxure) provide CSV exports directly. Requiring CSV is a reasonable constraint for an MVP.

---

## Tradeoff 3: No Live Concur / Navan Travel API

**What we skipped:** OAuth2 authentication with Concur's travel expense API and pulling live trip data.

**What we built instead:** JSON file upload mirroring the Concur travel record structure.

**Why we skipped it:**

The Concur Developer API requires:
- SAP Concur partner application approval (takes days/weeks)
- OAuth 2.0 authorization code flow with company-admin consent
- Company-specific sandbox credentials
- Handling paginated trip reports with complex status fields

Beyond access, live API integrations need webhook infrastructure, retry logic, and API version change management — a significant operational overhead for what is fundamentally a data ingestion feature.

**Acceptable because:** The JSON upload schema we designed mirrors Concur's expense report JSON response structure. The ingestion logic would require minimal changes to consume live API data.

---

## Tradeoff 4: No Asynchronous Processing (Celery + Redis)

**What we skipped:** Background task queue for processing large file uploads asynchronously.

**What we built instead:** Synchronous file processing within the Django request/response cycle.

**Why we skipped it:**

For very large files (e.g., a SAP CSV with 100,000 purchase order lines), synchronous processing would time out the HTTP request and block the Django worker thread for minutes.

A proper implementation would use:
- **Celery** as the task queue worker
- **Redis** or **RabbitMQ** as the message broker
- A polling endpoint for the frontend to check upload progress

**Why acceptable for now:** The sample datasets in this assignment are small (< 10 rows each). Synchronous processing completes in milliseconds. For an MVP with < 1000 rows per upload, this is fine.

**If we were to productionize this:** Each file upload would return a `task_id` immediately, and the frontend would poll `GET /api/tasks/{task_id}/status/` until completion.

---

## Tradeoff 5: No Role-Based Access Control (RBAC)

**What we skipped:** Different permission levels for different user roles (Uploader, Analyst, Auditor, Admin).

**What we built instead:** Single authenticated user with full access to all operations.

**Why we skipped it:**

A proper RBAC system would define:
- `Uploader` role: Can upload files, cannot approve or lock
- `Analyst` role: Can approve/reject/edit records, cannot lock
- `Auditor` role: Read-only, can export locked records
- `Admin` role: Can manage users and companies

Implementing this with Django's `groups` and `permissions` system, combined with custom permission classes in DRF, is a substantial feature. It was deprioritized in favor of building the core data pipeline correctly.

**Acceptable because:** In a small ESG team (which is the target user for this MVP), a single analyst role is realistic. RBAC would be a Phase 2 feature.

---

## Tradeoff 6: No Emission Factor Calculations (CO₂e)

**What we skipped:** Converting raw activity data (litres of diesel, kWh of electricity) into CO₂-equivalent (CO₂e) emissions using GHG Protocol emission factors.

**What we built instead:** Storage and display of raw normalized quantities.

**Why we skipped it:**

Emission factor databases are complex:
- **DEFRA** (UK) emission factors update annually
- **EPA eGRID** (US) factors vary by grid region
- **IEA** global electricity emission factors vary by country
- Factors are different for Scope 1 vs. Scope 2 (market-based vs. location-based)

A proper implementation would require:
- Integrating an emission factor database (EcoInvent, DEFRA, EPA)
- Country/region-aware factor selection
- Annual factor version management
- Uncertainty reporting

**Acceptable because:** The assignment asks to build a data ingestion and audit workflow platform, not a carbon accounting engine. The platform correctly captures, normalizes, and audits the activity data that would feed into such calculations.

---

*Last updated: May 2026 | Breathe ESG Platform v1.0*
