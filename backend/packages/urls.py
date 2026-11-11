
from django.urls import path

from .views import (
    PackageListView,
    PackageDetailView,
    PackageCreateView,
    PackageUpdateDeleteView,
    CustomerExperienceListCreateView,
    CustomerGalleryListCreateView,
    WhatsAppEnquiryClickView,
    CustomerEnquiryCreateView,
)

urlpatterns = [
    # Packages
    path("", PackageListView.as_view(), name="package-list"),
    path("create/", PackageCreateView.as_view(), name="package-create"),
    path("<int:pk>/", PackageDetailView.as_view(), name="package-detail"),
    path(
        "<int:pk>/manage/",
        PackageUpdateDeleteView.as_view(),
        name="package-manage",
    ),

    # Customer Reviews
    path(
        "reviews/",
        CustomerExperienceListCreateView.as_view(),
        name="customer-reviews",
    ),

    # Customer Photo Gallery
    path(
        "gallery/",
        CustomerGalleryListCreateView.as_view(),
        name="customer-gallery",
    ),
    
    path(
    "whatsapp-enquiry/",
    WhatsAppEnquiryClickView.as_view(),
    name="whatsapp-enquiry"
),
    
    path(
    "customer-enquiry/",
    CustomerEnquiryCreateView.as_view(),
    name="customer-enquiry",
),
    
]