
from django.contrib import admin
from .models import (
    Package,
    PackageImage,
    CustomerExperience,
    CustomerGallery,
    WhatsAppContact,
    WhatsAppLocationRoute,
    CustomerEnquiry,
    WhatsAppEnquiryClick,
)


# ---------------- PACKAGE IMAGES ----------------

class PackageImageInline(admin.TabularInline):
    model = PackageImage
    extra = 1
    fields = ("image", "caption")


# ---------------- PACKAGE MANAGEMENT ----------------

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "destination",
        "category",
        "domestic_region",
        "special_type",
        "price",
        "price_type",
        "whatsapp_contact",
        "is_seasonal",
        "is_active",
    )

    list_filter = (
        "category",
        "domestic_region",
        "special_type",
        "price_type",
        "whatsapp_contact",
        "is_seasonal",
        "is_active",
    )

    search_fields = (
        "title",
        "destination",
    )

    list_editable = (
        "is_active",
        "is_seasonal",
    )

    autocomplete_fields = (
        "whatsapp_contact",
    )

    date_hierarchy = "created_at"

    ordering = ("-created_at",)

    inlines = [
        PackageImageInline,
    ]

    fieldsets = (

        ("Package Information", {
            "fields": (
                "title",
                "destination",
                "category",
                "domestic_region",
                "special_type",
                "description",
            )
        }),

        ("Trip Details", {
            "fields": (
                "duration_days",
                "duration_nights",
                "itinerary",
            )
        }),

        ("Pricing", {
            "fields": (
                "price",
                "price_type",
            )
        }),

        ("Package Images", {
            "fields": (
                "main_image",
            )
        }),

        ("WhatsApp Enquiry", {
            "fields": (
                "whatsapp_contact",
            )
        }),

        ("Seasonal Settings", {
            "fields": (
                "is_seasonal",
                "expiry_date",
                "is_active",
            )
        }),
    )


# ---------------- PACKAGE IMAGE MANAGEMENT ----------------

@admin.register(PackageImage)
class PackageImageAdmin(admin.ModelAdmin):

    list_display = (
        "package",
        "caption",
        "uploaded_at",
    )

    search_fields = (
        "package__title",
        "caption",
    )


# ---------------- CUSTOMER REVIEWS ----------------

@admin.register(CustomerExperience)
class CustomerExperienceAdmin(admin.ModelAdmin):

    list_display = (
        "customer_name",
        "destination",
        "rating",
        "created_at",
    )

    list_filter = (
        "rating",
        "created_at",
    )

    search_fields = (
        "customer_name",
        "destination",
        "review",
    )

    date_hierarchy = "created_at"


# ---------------- CUSTOMER GALLERY ----------------

@admin.register(CustomerGallery)
class CustomerGalleryAdmin(admin.ModelAdmin):

    list_display = (
        "customer_name",
        "destination",
        "uploaded_by",
        "consent",
        "uploaded_at",
    )

    list_filter = (
        "uploaded_by",
        "consent",
        "uploaded_at",
    )

    search_fields = (
        "customer_name",
        "destination",
        "caption",
    )

    date_hierarchy = "uploaded_at"


# ---------------- WHATSAPP CONTACTS ----------------

@admin.register(WhatsAppContact)
class WhatsAppContactAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "phone_number",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "phone_number",
    )


# ---------------- WHATSAPP LOCATION ROUTES ----------------

@admin.register(WhatsAppLocationRoute)
class WhatsAppLocationRouteAdmin(admin.ModelAdmin):

    list_display = (
        "location",
        "contact",
    )

    list_filter = (
        "contact",
    )

    search_fields = (
        "location",
        "contact__name",
        "contact__phone_number",
    )

    autocomplete_fields = (
        "contact",
    )


# ---------------- CUSTOMER ENQUIRIES ----------------

@admin.register(CustomerEnquiry)
class CustomerEnquiryAdmin(admin.ModelAdmin):

    list_display = (
        "customer_name",
        "phone_number",
        "email",
        "package",
        "trip_start_date",
        "trip_end_date",
        "created_at",
    )

    search_fields = (
        "customer_name",
        "phone_number",
        "email",
    )

    list_filter = (
        "package",
        "created_at",
    )

    readonly_fields = (
        "created_at",
    )

    date_hierarchy = "created_at"



# ---------------- WHATSAPP ENQUIRY CLICKS ----------------

@admin.register(WhatsAppEnquiryClick)
class WhatsAppEnquiryClickAdmin(admin.ModelAdmin):

    list_display = (
        "whatsapp_contact",
        "package",
        "created_at",
    )

    list_filter = (
        "whatsapp_contact",
        "created_at",
    )

    search_fields = (
        "whatsapp_contact__name",
        "whatsapp_contact__phone_number",
        "package__title",
    )

    readonly_fields = (
        "created_at",
    )

    date_hierarchy = "created_at"

    ordering = ("-created_at",)