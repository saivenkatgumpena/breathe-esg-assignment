"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter

from apps.ingestion.views import SAPUploadView, UtilityUploadView, TravelUploadView
from apps.records.views import ESGRecordViewSet
from apps.audit.views import AuditLogViewSet

router = DefaultRouter()
router.register(r'records', ESGRecordViewSet, basename='record')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication APIs
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Ingestion / Upload APIs
    path('api/upload/sap/', SAPUploadView.as_view(), name='upload_sap'),
    path('api/upload/utility/', UtilityUploadView.as_view(), name='upload_utility'),
    path('api/upload/travel/', TravelUploadView.as_view(), name='upload_travel'),
    
    # Main REST API router urls (records, audit logs)
    path('api/', include(router.urls)),
]
