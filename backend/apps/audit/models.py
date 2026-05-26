from django.db import models
from django.contrib.auth.models import User
from apps.records.models import ESGRecord

class AuditLog(models.Model):
    record = models.ForeignKey(ESGRecord, on_delete=models.CASCADE, related_name='audit_logs')
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    edited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_edits')
    edited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record {self.record.id} edit: {self.field_name} by {self.edited_by.username if self.edited_by else 'System'}"
