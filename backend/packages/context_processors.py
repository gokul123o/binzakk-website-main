from django.db.models import Count

from .models import (
    Package,
    CustomerExperience,
    CustomerGallery,
    WhatsAppContact,
    WhatsAppEnquiryClick,
)


def dashboard_stats(request):

    whatsapp_enquiry_stats = (
        WhatsAppContact.objects
        .filter(is_active=True)
        .annotate(total_enquiries=Count("enquiry_clicks"))
    )

    return {
        "total_packages": Package.objects.count(),
        "active_packages": Package.objects.filter(is_active=True).count(),
        "seasonal_packages": Package.objects.filter(
            is_seasonal=True,
            is_active=True,
        ).count(),
        "total_reviews": CustomerExperience.objects.count(),
        "total_gallery_photos": CustomerGallery.objects.count(),
        "total_whatsapp_contacts": WhatsAppContact.objects.filter(
            is_active=True
        ).count(),
        "total_enquiries": WhatsAppEnquiryClick.objects.count(),
        "whatsapp_enquiry_stats": whatsapp_enquiry_stats,
    }