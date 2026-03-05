"""
URL configuration for uniprep_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from api.admin import upload_dataset_csv

urlpatterns = [
    path('admin/upload-dataset/', upload_dataset_csv, name='upload_dataset_csv'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
