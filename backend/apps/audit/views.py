from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.companies.models import Company, UserProfile
from apps.audit.models import AuditLog
from apps.records.serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        try:
            company = self.request.user.profile.company
        except (AttributeError, UserProfile.DoesNotExist):
            company = Company.objects.first()
            if not company:
                company = Company.objects.create(name="Breathe ESG Corp")
        
        return AuditLog.objects.filter(record__company=company).order_by('-edited_at')
