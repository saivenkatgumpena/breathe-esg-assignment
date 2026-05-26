from django.db import models
from django.contrib.auth.models import User
from apps.companies.models import Company

class DataSource(models.Model):
    SOURCE_TYPES = (
        ('SAP', 'SAP ERP'),
        ('UTILITY', 'Utility Portal'),
        ('TRAVEL', 'Corporate Travel Platform'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='data_sources')
    source_type = models.CharField(max_length=50, choices=SOURCE_TYPES)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_sources')

    def __str__(self):
        return f"{self.source_type} - {self.file_name} ({self.company.name})"

class UnitConversion(models.Model):
    source_unit = models.CharField(max_length=50)
    normalized_unit = models.CharField(max_length=50)
    multiplier = models.DecimalField(max_digits=12, decimal_places=4)

    class Meta:
        unique_together = ('source_unit', 'normalized_unit')

    def __str__(self):
        return f"{self.source_unit} -> {self.normalized_unit} (*{self.multiplier})"

class ESGRecord(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('FAILED', 'Ingestion Failed'),
        ('SUSPICIOUS', 'Suspicious Record'),
        ('APPROVED', 'Approved by Analyst'),
        ('LOCKED', 'Locked for Audit'),
    )

    SCOPE_CHOICES = (
        ('Scope 1', 'Scope 1 (Direct Emissions)'),
        ('Scope 2', 'Scope 2 (Indirect Emissions)'),
        ('Scope 3', 'Scope 3 (Other Indirect Emissions)'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='esg_records')
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='records')
    category = models.CharField(max_length=100)  # e.g., Fuel, Procurement, Electricity, Travel
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    quantity = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    normalized_unit = models.CharField(max_length=50, blank=True)
    activity_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, null=True)  # Details on why failed/suspicious, or edit comments.
    
    # Original data (as JSON) for auditing and traceability
    raw_data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Record {self.id} - {self.category} ({self.status})"
