from django.db import models
from django.utils import timezone


class WhatsAppContact(models.Model):
    
    name = models.CharField(max_length=100)

    phone_number = models.CharField(
        max_length=20,
        unique=True,
        help_text="Enter number with country code, without + sign. Example: 919876543210",
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.phone_number}"


class WhatsAppLocationRoute(models.Model):

    location = models.CharField(
        max_length=200,
        unique=True,
    )

    contact = models.ForeignKey(
        WhatsAppContact,
        on_delete=models.PROTECT,
        related_name="location_routes",
    )

    def __str__(self):
        return f"{self.location} - {self.contact.name}"
    
class Package(models.Model):

    CATEGORY_CHOICES = [
        ("Domestic", "India"),
        ("International", "International"),
        ("Special", "Special Packages"),
    ]

    DOMESTIC_REGION_CHOICES = [
        ("South India", "South India"),
        ("North India", "North India"),
    ]

    SPECIAL_TYPE_CHOICES = [
        ("IV Trip", "IV Trip"),
        ("Strangers Trip", "Strangers Trip"),
        ("Group Trip", "Group Trip"),
        ("Other", "Other Special Trips"),
    ]

    PRICE_TYPE_CHOICES = [
        ("Per Person", "Per Person"),
        ("Group", "Group"),
    ]

    title = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    whatsapp_contact = models.ForeignKey(
    WhatsAppContact,
    on_delete=models.SET_NULL,
    blank=True,
    null=True,
    related_name="packages",
    help_text="Optional: Assign a separate WhatsApp number for this package.",
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="Domestic",
    )

    domestic_region = models.CharField(
        max_length=20,
        choices=DOMESTIC_REGION_CHOICES,
        blank=True,
        null=True,
    )

    special_type = models.CharField(
        max_length=30,
        choices=SPECIAL_TYPE_CHOICES,
        blank=True,
        null=True,
    )

    description = models.TextField()
    duration_days = models.PositiveIntegerField(default=1)
    duration_nights = models.PositiveIntegerField(default=0)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    price_type = models.CharField(
        max_length=20,
        choices=PRICE_TYPE_CHOICES,
        default="Per Person",
    )

    itinerary = models.TextField(blank=True)

    main_image = models.ImageField(
        upload_to="packages/",
        blank=True,
        null=True,
    )

    is_seasonal = models.BooleanField(default=False)
    expiry_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.destination}"

    @property
    def is_expired(self):
        return (
            self.expiry_date is not None
            and self.expiry_date < timezone.localdate()
        )


class PackageImage(models.Model):

    package = models.ForeignKey(
        Package,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.ImageField(upload_to="packages/gallery/")
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image - {self.package.title}"


class CustomerExperience(models.Model):

    customer_name = models.CharField(max_length=150)
    destination = models.CharField(max_length=200)
    review = models.TextField()
    rating = models.PositiveIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.customer_name} - {self.destination}"


class CustomerGallery(models.Model):

    UPLOADER_CHOICES = [
        ("Customer", "Customer"),
        ("Admin", "Admin"),
    ]

    customer_name = models.CharField(
        max_length=150,
        blank=True,
    )

    destination = models.CharField(max_length=200)

    image = models.ImageField(
        upload_to="customer_gallery/",
    )

    caption = models.CharField(
        max_length=250,
        blank=True,
    )

    uploaded_by = models.CharField(
        max_length=20,
        choices=UPLOADER_CHOICES,
        default="Customer",
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    consent = models.BooleanField(default=False)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.destination} - {self.uploaded_by}"
    
    
class CustomerEnquiry(models.Model):
    
    customer_name = models.CharField(max_length=150)

    phone_number = models.CharField(max_length=20)

    email = models.EmailField(
        blank=True,
        null=True,
    )

    package = models.ForeignKey(
        Package,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enquiries",
    )

    trip_start_date = models.DateField()

    trip_end_date = models.DateField()

    message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.customer_name} - "
            f"{self.phone_number}"
        )
    
    
class WhatsAppEnquiryClick(models.Model):
    
    whatsapp_contact = models.ForeignKey(
        WhatsAppContact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enquiry_clicks",
    )

    package = models.ForeignKey(
        Package,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="whatsapp_enquiry_clicks",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        if self.whatsapp_contact:
            return (
                f"Enquiry - {self.whatsapp_contact.name} "
                f"- {self.created_at}"
            )
        return f"WhatsApp Enquiry - {self.created_at}"