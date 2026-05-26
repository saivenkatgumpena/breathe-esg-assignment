from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from apps.companies.models import Company, UserProfile
from apps.records.models import DataSource
from .services import process_sap_csv, process_utility_csv, process_travel_json

class BaseUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get_company(self, user):
        try:
            return user.profile.company
        except (AttributeError, UserProfile.DoesNotExist):
            # Fallback for superusers or users without profile
            company = Company.objects.first()
            if not company:
                company = Company.objects.create(name="Breathe ESG Corp")
            return company

class SAPUploadView(BaseUploadView):
    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded under key "file"'}, status=status.HTTP_400_BAD_REQUEST)

        if not uploaded_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV file'}, status=status.HTTP_400_BAD_REQUEST)

        company = self.get_company(request.user)
        
        # Create data source tracker
        data_source = DataSource.objects.create(
            company=company,
            source_type='SAP',
            file_name=uploaded_file.name,
            uploaded_by=request.user
        )

        try:
            summary = process_sap_csv(uploaded_file.read(), data_source, company)
            return Response({
                'message': 'SAP data ingestion completed',
                'datasource_id': data_source.id,
                'summary': summary
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Mark datasource as failed if the file parsing crashed completely
            data_source.delete()
            return Response({'error': f"Failed to parse file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UtilityUploadView(BaseUploadView):
    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded under key "file"'}, status=status.HTTP_400_BAD_REQUEST)

        if not uploaded_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV file'}, status=status.HTTP_400_BAD_REQUEST)

        company = self.get_company(request.user)
        
        # Create data source tracker
        data_source = DataSource.objects.create(
            company=company,
            source_type='UTILITY',
            file_name=uploaded_file.name,
            uploaded_by=request.user
        )

        try:
            summary = process_utility_csv(uploaded_file.read(), data_source, company)
            return Response({
                'message': 'Utility data ingestion completed',
                'datasource_id': data_source.id,
                'summary': summary
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            data_source.delete()
            return Response({'error': f"Failed to parse file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TravelUploadView(BaseUploadView):
    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded under key "file"'}, status=status.HTTP_400_BAD_REQUEST)

        if not uploaded_file.name.endswith('.json') and not uploaded_file.name.endswith('.txt'):
            return Response({'error': 'File must be a JSON file'}, status=status.HTTP_400_BAD_REQUEST)

        company = self.get_company(request.user)
        
        # Create data source tracker
        data_source = DataSource.objects.create(
            company=company,
            source_type='TRAVEL',
            file_name=uploaded_file.name,
            uploaded_by=request.user
        )

        try:
            summary = process_travel_json(uploaded_file.read(), data_source, company)
            if 'error' in summary:
                data_source.delete()
                return Response({'error': summary['error']}, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                'message': 'Travel data ingestion completed',
                'datasource_id': data_source.id,
                'summary': summary
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            data_source.delete()
            return Response({'error': f"Failed to parse file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
