from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from apps.companies.models import Company, UserProfile
from apps.records.models import ESGRecord, DataSource
from apps.audit.models import AuditLog
from .serializers import ESGRecordSerializer, ESGRecordEditSerializer

class ESGRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ESGRecordSerializer

    def get_company(self):
        try:
            return self.request.user.profile.company
        except (AttributeError, UserProfile.DoesNotExist):
            company = Company.objects.first()
            if not company:
                company = Company.objects.create(name="Breathe ESG Corp")
            return company

    def get_queryset(self):
        company = self.get_company()
        queryset = ESGRecord.objects.filter(company=company).order_by('-created_at')
        
        # Filtering
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        scope_param = self.request.query_params.get('scope')
        if scope_param:
            queryset = queryset.filter(scope=scope_param)

        source_param = self.request.query_params.get('source_type')
        if source_param:
            queryset = queryset.filter(source__source_type=source_param)

        search_param = self.request.query_params.get('search')
        if search_param:
            queryset = queryset.filter(category__icontains=search_param) | queryset.filter(notes__icontains=search_param)

        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if instance.status == 'LOCKED':
            return Response({'error': 'Cannot edit locked audit records.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ESGRecordEditSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Perform update and audit logging
        with transaction.atomic():
            changed_fields = []
            for field, val in serializer.validated_data.items():
                old_val = getattr(instance, field)
                # Convert to string or check difference
                if str(old_val) != str(val):
                    changed_fields.append((field, old_val, val))
            
            # Save the new values
            instance = serializer.save()
            
            # Log changes
            for field, old_val, new_val in changed_fields:
                AuditLog.objects.create(
                    record=instance,
                    field_name=field,
                    old_value=str(old_val) if old_val is not None else "",
                    new_value=str(new_val) if new_val is not None else "",
                    edited_by=request.user
                )
                
            # If the record was previously FAILED, let's reset it to PENDING since it has been corrected
            if instance.status == 'FAILED' and changed_fields:
                instance.status = 'PENDING'
                instance.save()

        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        instance = self.get_object()
        if instance.status == 'LOCKED':
            return Response({'error': 'Record is locked for audit and cannot be approved.'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = 'APPROVED'
        instance.save()
        
        # Log approval
        AuditLog.objects.create(
            record=instance,
            field_name='status',
            old_value='PENDING',
            new_value='APPROVED',
            edited_by=request.user
        )
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        instance = self.get_object()
        if instance.status != 'APPROVED':
            return Response({'error': 'Only approved records can be locked for audit.'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = 'LOCKED'
        instance.save()
        
        # Log lock
        AuditLog.objects.create(
            record=instance,
            field_name='status',
            old_value='APPROVED',
            new_value='LOCKED',
            edited_by=request.user
        )
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        instance = self.get_object()
        if instance.status == 'LOCKED':
            return Response({'error': 'Record is locked and cannot be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = instance.status
        instance.status = 'FAILED'
        instance.save()
        
        # Log reject
        AuditLog.objects.create(
            record=instance,
            field_name='status',
            old_value=old_status,
            new_value='FAILED',
            edited_by=request.user
        )
        return Response(self.get_serializer(instance).data)
