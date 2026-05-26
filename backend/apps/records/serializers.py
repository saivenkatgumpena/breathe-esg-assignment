from rest_framework import serializers
from django.contrib.auth.models import User
from apps.companies.models import Company
from apps.records.models import DataSource, ESGRecord, UnitConversion
from apps.audit.models import AuditLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name')

class DataSourceSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)

    class Meta:
        model = DataSource
        fields = ('id', 'company', 'source_type', 'file_name', 'uploaded_at', 'uploaded_by')

class ESGRecordSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    source = DataSourceSerializer(read_only=True)
    
    class Meta:
        model = ESGRecord
        fields = (
            'id', 'company', 'source', 'category', 'scope', 
            'quantity', 'normalized_unit', 'activity_date', 
            'status', 'notes', 'raw_data', 'created_at', 'updated_at'
        )

class ESGRecordEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGRecord
        fields = ('category', 'scope', 'quantity', 'normalized_unit', 'activity_date', 'notes')

class AuditLogSerializer(serializers.ModelSerializer):
    edited_by = serializers.CharField(source='edited_by.username', read_only=True)
    record_id = serializers.IntegerField(source='record.id', read_only=True)
    category = serializers.CharField(source='record.category', read_only=True)

    class Meta:
        model = AuditLog
        fields = ('id', 'record_id', 'category', 'field_name', 'old_value', 'new_value', 'edited_by', 'edited_at')

class UnitConversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitConversion
        fields = ('id', 'source_unit', 'normalized_unit', 'multiplier')
