from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.throttling import AnonRateThrottle

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import WhatsAppEnquiryClick, WhatsAppContact ,Package


from .models import (
    Package,
    CustomerExperience,
    CustomerGallery,
    CustomerEnquiry,
)
from .serializers import (
    PackageSerializer,
    CustomerExperienceSerializer,
    CustomerGallerySerializer,
    CustomerEnquirySerializer,
)
from rest_framework.pagination import PageNumberPagination

class EnquirySubmissionThrottle(AnonRateThrottle):
    scope = "enquiry"
    rate = "60/hour"


class ReviewSubmissionThrottle(AnonRateThrottle):
    scope = "review"
    rate = "10/hour"


class GallerySubmissionThrottle(AnonRateThrottle):
    scope = "gallery"
    rate = "10/hour"
    
class PackageListView(generics.ListAPIView):
    serializer_class = PackageSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Package.objects.filter(
            is_active=True
        ).filter(
            models_expiry_filter()
        )


def models_expiry_filter():
    from django.db.models import Q

    today = timezone.localdate()

    return Q(expiry_date__isnull=True) | Q(expiry_date__gte=today)


class PackageDetailView(generics.RetrieveAPIView):
    serializer_class = PackageSerializer
    permission_classes = [AllowAny]
    lookup_field = "pk"

    def get_queryset(self):
        from django.db.models import Q

        today = timezone.localdate()

        return Package.objects.filter(
            is_active=True
        ).filter(
            Q(expiry_date__isnull=True) | Q(expiry_date__gte=today)
        )


class PackageCreateView(generics.CreateAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAdminUser]


class PackageUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAdminUser]

class CustomerPagination(PageNumberPagination):
    page_size = 3
# Customer Reviews API

class CustomerExperienceListCreateView(generics.ListCreateAPIView):
    queryset = CustomerExperience.objects.all()
    serializer_class = CustomerExperienceSerializer
    permission_classes = [AllowAny]
    pagination_class = CustomerPagination
    def get_throttles(self):
        if self.request.method == "POST":
            return [ReviewSubmissionThrottle()]
        return []
   
    
    
# Customer Gallery API

class CustomerGalleryListCreateView(generics.ListCreateAPIView):
    queryset = CustomerGallery.objects.all()
    serializer_class = CustomerGallerySerializer
    permission_classes = [AllowAny]
    pagination_class = CustomerPagination
    def get_throttles(self):
        if self.request.method == "POST":
            return [GallerySubmissionThrottle()]
        return []
    
    
    

    def perform_create(self, serializer):
        serializer.save(uploaded_by="Customer")
        

class WhatsAppEnquiryClickView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        package_id = request.data.get("package_id")
        whatsapp_contact_id = request.data.get("whatsapp_contact_id")

        package = None
        whatsapp_contact = None

        if package_id:
            package = Package.objects.filter(id=package_id).first()

        if whatsapp_contact_id:
            whatsapp_contact = WhatsAppContact.objects.filter(
                id=whatsapp_contact_id
            ).first()

        WhatsAppEnquiryClick.objects.create(
            package=package,
            whatsapp_contact=whatsapp_contact,
        )

        return Response(
            {"message": "Enquiry click recorded"},
            status=status.HTTP_201_CREATED,
        )
        
class CustomerEnquiryCreateView(generics.CreateAPIView):
    queryset = CustomerEnquiry.objects.all()
    serializer_class = CustomerEnquirySerializer
    permission_classes = [AllowAny]

    def get_throttles(self):
        return [EnquirySubmissionThrottle()]
        