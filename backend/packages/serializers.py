
from rest_framework import serializers
from .models import (
    Package,
    PackageImage,
    CustomerExperience,
    CustomerGallery,
    WhatsAppLocationRoute,
    CustomerEnquiry,
)
from PIL import Image, ImageOps
from django.core.files.base import ContentFile
from io import BytesIO


class PackageImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PackageImage
        fields = ["id", "image", "caption"]


class PackageSerializer(serializers.ModelSerializer):

    images = PackageImageSerializer(many=True, read_only=True)
    is_expired = serializers.ReadOnlyField()
    whatsapp_number = serializers.SerializerMethodField()
    whatsapp_contact_id = serializers.SerializerMethodField()

    def get_whatsapp_number(self, obj):
        # 1. Package-specific WhatsApp number
        if obj.whatsapp_contact and obj.whatsapp_contact.is_active:
            return obj.whatsapp_contact.phone_number

        # 2. Location-based WhatsApp number
        route = WhatsAppLocationRoute.objects.filter(
            location__iexact=obj.destination,
            contact__is_active=True,
        ).select_related("contact").first()

        if route:
            return route.contact.phone_number

         # 3. No matching number
        return None
    
    def get_whatsapp_contact_id(self, obj):
        # 1. Package-specific WhatsApp contact
        if obj.whatsapp_contact and obj.whatsapp_contact.is_active:
            return obj.whatsapp_contact.id

        # 2. Location-based WhatsApp contact
        route = WhatsAppLocationRoute.objects.filter(
            location__iexact=obj.destination,
            contact__is_active=True,
        ).select_related("contact").first()

        if route:
            return route.contact.id

        # 3. No matching contact
        return None


    class Meta:
        model = Package
        fields = [
            "id",
            "title",
            "destination",
            "whatsapp_number",
            "whatsapp_contact_id",
            "category",
            "domestic_region",
            "special_type",
            "description",
            "duration_days",
            "duration_nights",
            "price",
            "price_type",
            "itinerary",
            "main_image",
            "images",
            "is_seasonal",
            "expiry_date",
            "is_active",
            "is_expired",
            "created_at",
        ]

class CustomerExperienceSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomerExperience
        fields = [
            "id",
            "customer_name",
            "destination",
            "review",
            "rating",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )
        return value


class CustomerGallerySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomerGallery
        fields = [
            "id",
            "customer_name",
            "destination",
            "image",
            "caption",
            "consent",
            "uploaded_by",
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_by", "uploaded_at"]

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must agree to share the photo."
            )
        return value


    def validate_image(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Image size should not exceed 5 MB."
            )

        allowed_types = ["image/jpeg", "image/png", "image/webp"]

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Only JPG, PNG and WEBP images are allowed."
            )

        try:
            image = Image.open(value)
            image = ImageOps.exif_transpose(image)
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)

            output = BytesIO()

            # Convert all accepted images into JPEG
            if image.mode in ("RGBA", "LA", "P"):
                image = image.convert("RGBA")
                background = Image.new("RGB", image.size, "white")
                background.paste(image, mask=image.getchannel("A"))
                image = background
            else:
                image = image.convert("RGB")

            image.save(
                output,
                format="JPEG",
                quality=80,
                optimize=True
            )

            new_name = value.name.rsplit(".", 1)[0] + ".jpg"

            value = ContentFile(output.getvalue(), name=new_name)

        except Exception:
            raise serializers.ValidationError("Invalid image file.")

        return value

class CustomerEnquirySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CustomerEnquiry
        fields = [
            "id",
            "customer_name",
            "phone_number",
            "email",
            "package",
            "trip_start_date",
            "trip_end_date",
            "message",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate(self, data):
        start_date = data.get("trip_start_date")
        end_date = data.get("trip_end_date")

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {
                    "trip_end_date": (
                        "Trip end date cannot be before "
                        "the start date."
                    )
                }
            )

        return data