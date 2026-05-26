# RESEARCH SOURCES

## Overview

This document outlines the research, references, and real-world documentation consulted while designing and building the Breathe ESG Data Management Platform.

---

## Source 1: SAP ERP Data Structures

**What we researched:**
- SAP Plant Maintenance (PM) and Materials Management (MM) module export formats
- SAP ALV grid CSV export capabilities
- SAP transaction codes for environmental data: `MB51` (material movements), `ME2M` (purchase orders by material)
- Common SAP CSV column naming conventions (PlantCode, Material, Quantity, Unit, etc.)
- German ERP header naming patterns (e.g., `Menge` for Quantity, `Werk` for Plant)

**Key findings:**
- SAP CSV exports always include a `PlantCode` (Werk) and `Material` number as the primary identifiers
- Quantity units in SAP are standardized to ISO unit codes (L, KG, T, ST) but often exported as German abbreviations
- Dates in German SAP systems default to `DD.MM.YYYY` format
- Fuel purchases are tracked under movement types 201 (goods issue) or 261 (consumption)
- Procurement data appears in Material Documents with movement type 101 (goods receipt)

**How this influenced the design:**
- Our SAP parser handles 4 date formats: `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, `DD.MM.YYYY`
- Unit conversion supports both English (`L`) and German (`l`, `liter`) abbreviations
- Fields include `PlantCode`, `Material`, `Fuel_Type` mirroring SAP's MM module structure
- Scope classification: fuel types → Scope 1, raw material procurement → Scope 3

---

## Source 2: Utility Billing Standards

**What we researched:**
- Standard utility bill data fields from Indian electricity distribution companies (BESCOM, MSEDCL, TATA Power)
- UK REGO (Renewable Energy Guarantees of Origin) certificate data format
- IEC smart meter data standards
- DEFRA Scope 2 electricity reporting guidelines
- Billing cycle patterns for industrial vs. commercial vs. residential meters

**Key findings:**
- Most utility portals (Honeywell, Schneider EcoStruxure, Oracle Utilities) export billing data with: `Meter_ID`, `Consumption_kWh`, `Billing_Start`, `Billing_End`, `Tariff`
- Billing periods are NOT always calendar months — industrial meters often have 28-45 day billing cycles based on meter reading schedules
- Some meters have bi-monthly billing (61+ day periods) which is legitimate but unusual
- The `Meter_ID` is the primary identifier for chain of custody — a missing meter ID is a data quality concern
- `kWh` is the universal standard for energy consumption; `MWh` is common for large industrial consumers

**How this influenced the design:**
- Our suspicious detection checks for billing periods outside the 15–45 day window
- Missing `Meter_ID` is flagged as suspicious (data quality concern)
- We normalize `MWh → kWh` via the unit conversion table (multiplier: 1000)
- All utility records are classified as Scope 2 (indirect emissions from electricity)

---

## Source 3: Corporate Travel Platforms (Concur, Navan, Expensify)

**What we researched:**
- SAP Concur Travel API documentation (developer.concur.com)
- Navan (formerly TripActions) open API schema
- Expensify API expense report structure
- IATA airline codes and airport identifiers (IATA 3-letter codes: HYD, DEL, BOM)
- GHG Protocol guidance for Scope 3 Category 6 (Business Travel) emissions

**Key findings:**
- Concur's `/api/v3.0/expense/reports` endpoint returns trip expenses in JSON format with fields: `EmployeeName`, `ExpenseTypeName` (flight/hotel/taxi), `TransactionDate`, `TransactionAmount`, `CurrencyCode`, `BusinessPurpose`
- Travel platforms distinguish between: air travel, hotel stays, ground transport (taxi/rental car), and rail
- All business travel is classified as **Scope 3, Category 6** under the GHG Protocol
- IATA airport codes (3 letters) are the universal standard for route tracking
- A flight from HYD (Hyderabad) to BOM (Mumbai) with identical departure/arrival is physically impossible → strong indicator of data entry error
- Normal expense reports have 1-3 trips per booking; more than 10 suggests a data entry mistake

**How this influenced the design:**
- Our travel JSON schema uses `employee`, `type`, `from`, `to`, `quantity`, `unit`, `date`
- IATA-style airport codes are used in sample data (HYD, DEL, BOM, BLR)
- Identical `from` and `to` values trigger the suspicious flag
- Distance-based units (km) have a separate threshold (> 500 km) from trip-based units (> 10 trips)
- All travel records are classified as Scope 3

---

## Source 4: GHG Protocol — Scope Classification

**What we researched:**
- GHG Protocol Corporate Accounting and Reporting Standard (Revised Edition)
- Scope 1, 2, and 3 category definitions
- GHG Protocol Scope 3 Standard (15 categories)

**Key findings:**

| Emission Source | GHG Protocol Scope |
|---|---|
| Fuel combustion on-site/in company vehicles | Scope 1 |
| Purchased electricity, steam, heating | Scope 2 |
| Purchased goods and raw materials | Scope 3, Category 1 |
| Business travel (air, hotel, taxi) | Scope 3, Category 6 |

**How this influenced the design:**
- SAP fuel records (Diesel, Petrol, Coal, Gas, LPG) → Scope 1
- SAP raw material procurement → Scope 3
- All utility electricity → Scope 2
- All corporate travel → Scope 3

---

## Source 5: ESG Reporting Platform Benchmarks

**What we researched:**
- Watershed (watershed.com) — ESG data ingestion architecture
- Persefoni — carbon accounting platform data model
- Greenly (greenly.earth) — SME carbon management platform
- Plan A (plana.earth) — German ESG platform

**Key findings:**
- All leading ESG platforms share a common pattern: raw data ingestion → normalization → review workflow → audit lock
- Multi-tenancy is universal — every platform serves multiple companies from a shared infrastructure
- Audit trails are a non-negotiable feature for regulatory compliance (CSRD, GRI, TCFD)
- Suspicious/anomaly detection is always rule-based at the ingestion tier; ML is used for trend analysis at the reporting tier

**How this influenced the design:**
- The 5-state status workflow (PENDING → SUSPICIOUS → APPROVED → LOCKED) mirrors industry patterns
- The `raw_data` JSON field for full source data traceability is a direct industry best practice
- Multi-tenant company isolation via `UserProfile.company` foreign key
- Immutable `AuditLog` with `edited_by` and `edited_at` for regulatory compliance

---

## Source 6: Django REST Framework Best Practices

**What we researched:**
- DRF official documentation (django-rest-framework.org)
- `djangorestframework-simplejwt` documentation
- Django multi-tenancy patterns (django-tenant-schemas, row-level tenancy)

**Key findings:**
- Row-level multi-tenancy (filtering by company in every queryset) is the simplest and most robust approach for a single-schema database
- `ModelViewSet` with custom `@action` decorators is the cleanest way to implement state-transition endpoints (approve, lock, reject)
- `MultiPartParser` is required for file upload endpoints in DRF

**How this influenced the design:**
- `ESGRecordViewSet` uses `get_queryset()` to enforce company-level isolation on every request
- Custom `@action(detail=True)` decorators implement `approve`, `lock`, and `reject` transitions
- All upload views extend `BaseUploadView` with `MultiPartParser` to handle file uploads

---

*Last updated: May 2026 | Breathe ESG Platform v1.0*
