# DATA MODEL DOCUMENTATION

## Overview

This document explains the data models used in the Breathe ESG platform, why each model exists, how they relate to each other, and the design decisions behind them.

---

## Model Architecture Diagram

```
Company
   |
   |── UserProfile (User ←→ Company)
   |
   |── DataSource (SAP / Utility / Travel uploads)
         |
         └── ESGRecord (Normalized emission record)
               |
               └── AuditLog (Immutable history of every change)

UnitConversion (Lookup table for kg, litres, kWh normalization)
```

---

## 1. `Company`

```python
class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Why this model?

This model provides **multi-tenant support**. In a real ESG platform, the system serves multiple client companies. Each company's data must be completely isolated — Breathe ESG Corp cannot see Infosys's data, for example.

By attaching every `DataSource` and `ESGRecord` to a `Company`, we can:
- Filter every API query by `request.user.profile.company`
- Prevent data leaks between tenants
- Scale the platform to serve multiple enterprise clients from a single database

### Why `unique=True` on name?

To prevent duplicate companies. In a real system, this would also involve a `company_code` or `registration_number`.

---

## 2. `UserProfile`

```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='users')
```

### Why this model?

Django's built-in `User` model does not have a `company` field. Instead of modifying Django's internal auth model (which is risky and discouraged), we use a **profile extension pattern** — a separate table that links each user to a company.

This is the industry-standard approach for extending Django's auth system without breaking migrations or security.

### Why `OneToOneField`?

Each user belongs to exactly one company. `OneToOneField` enforces this at the database level.

---

## 3. `DataSource`

```python
class DataSource(models.Model):
    SOURCE_TYPES = (
        ('SAP', 'SAP ERP'),
        ('UTILITY', 'Utility Portal'),
        ('TRAVEL', 'Corporate Travel Platform'),
    )
    company = models.ForeignKey(Company, ...)
    source_type = models.CharField(max_length=50, choices=SOURCE_TYPES)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, ...)
```

### Why this model?

In the real world, companies upload files repeatedly — monthly electricity bills, weekly SAP exports. Each upload is a distinct **ingestion event** that must be tracked independently.

`DataSource` serves as a **file manifest**. Every `ESGRecord` is linked back to the specific file upload that created it, which means:
- Analysts can see exactly which file a record came from
- If a file was corrupt/wrong, all records from that datasource can be identified and re-evaluated
- Compliance teams can trace every emission value back to its original document

### Why track `uploaded_by`?

Chain of custody is critical in ESG reporting. Auditors need to know who uploaded which data, and when.

---

## 4. `ESGRecord`

```python
class ESGRecord(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('FAILED', 'Ingestion Failed'),
        ('SUSPICIOUS', 'Suspicious Record'),
        ('APPROVED', 'Approved by Analyst'),
        ('LOCKED', 'Locked for Audit'),
    )
    SCOPE_CHOICES = (
        ('Scope 1', 'Direct Emissions'),
        ('Scope 2', 'Indirect Emissions - Electricity'),
        ('Scope 3', 'Other Indirect Emissions'),
    )

    company, source, category, scope, quantity,
    normalized_unit, activity_date, status, notes,
    raw_data, created_at, updated_at
```

### Why this model?

This is the **core normalized table** of the entire platform. It is the output of every ingestion pipeline — regardless of whether the source was SAP, Utility, or Travel data, all records converge into this single, common schema.

This is why it's called a "normalization" platform.

### Key field explanations:

| Field | Purpose |
|---|---|
| `category` | Human-readable label: "Diesel", "Electricity (Meter: M001)", "Travel (flight) HYD → DEL" |
| `scope` | GHG Protocol scope classification (1, 2, or 3) |
| `quantity` | Normalized numeric value (always in the `normalized_unit`) |
| `normalized_unit` | Target unit after conversion (litres, kg, kWh, trip, km) |
| `activity_date` | Date the emission activity occurred (not the upload date) |
| `status` | Workflow state — drives the analyst review process |
| `notes` | Why a record was flagged or edited |
| `raw_data` | The original source row stored as JSON for full traceability |

### Why store `raw_data`?

Even after normalization, we preserve the original source row. This is critical for:
- Auditor verification ("Show me the original SAP row for this emission")
- Re-processing if normalization logic changes
- Debugging parsing failures

### Why the 5-state status workflow?

```
PENDING → reviewed by analyst
  ↓
APPROVED → analyst confirms it is correct
  ↓
LOCKED → submitted for official audit (immutable)

PENDING → flagged by engine
  ↓
SUSPICIOUS → needs analyst review

Any → FAILED → bad data, cannot be used
```

The `LOCKED` state is particularly important. Once a record is locked for audit, it **cannot be edited or deleted**, even by admins. This enforces the integrity of submitted ESG reports.

---

## 5. `AuditLog`

```python
class AuditLog(models.Model):
    record = models.ForeignKey(ESGRecord, ...)
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    edited_by = models.ForeignKey(User, ...)
    edited_at = models.DateTimeField(auto_now_add=True)
```

### Why this model?

ESG reports are submitted to regulatory bodies (CDP, GRI, TCFD). If a record is edited, the original value must be preserved for auditors.

The `AuditLog` is an **immutable event log**. We never update or delete audit log entries — we only append. This means:
- Full history of every edit is preserved
- Analysts cannot cover their tracks
- Auditors can reconstruct the exact state of any record at any point in time

### Why log `field_name`, `old_value`, `new_value` separately?

This allows fine-grained audit queries such as:
- "Show all records where the `scope` was changed"
- "Show all records that Nihar edited last month"
- "What was the original quantity for Record #42?"

---

## 6. `UnitConversion`

```python
class UnitConversion(models.Model):
    source_unit = models.CharField(max_length=50)
    normalized_unit = models.CharField(max_length=50)
    multiplier = models.DecimalField(max_digits=12, decimal_places=4)

    class Meta:
        unique_together = ('source_unit', 'normalized_unit')
```

### Why this model?

Different data sources use different units for the same type of measurement:
- SAP might export fuel in `L`, `Ton`, or `KG`
- A European supplier might use `litres`; an Indian supplier might use `l` or `liter`
- Electricity can come in `kWh` or `MWh`

Instead of hard-coding conversion logic in Python, we store conversions in a database table. This means:
- Adding a new unit (e.g., `gallons`) only requires inserting a row — no code change
- The conversion table is admin-editable via Django Admin
- Each company can theoretically have custom unit mappings (future enhancement)

### Why `unique_together`?

Prevents duplicate conversion entries for the same unit pair (e.g., two rows both mapping `L → litres`).

---

## Multi-Tenancy Architecture

All data queries in the platform are filtered by company:

```python
def get_queryset(self):
    company = self.request.user.profile.company
    return ESGRecord.objects.filter(company=company)
```

This ensures complete data isolation at the API layer. Even if two companies use the same analyst credentials (unlikely but possible), they will only ever see their own company's ESG data.

For a production deployment, this would be further hardened with:
- Row-level security in PostgreSQL
- API rate limiting per company
- Company-specific JWT claims

---

*Last updated: May 2026 | Breathe ESG Platform v1.0*
