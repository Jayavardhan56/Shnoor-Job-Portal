from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Contact
from .serializers import ContactSerializer

@api_view(["POST"])
@permission_classes([AllowAny])
def contact_create(request):
    serializer=ContactSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "Query sent successfully"
        })
    return Response(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([AllowAny])
def contact_list(request):
    queries=Contact.objects.all().order_by("-created_at")
    serializer=ContactSerializer(queries, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def reply_query(request,pk):
    try:
        query=Contact.objects.get(id=pk)
        reply=request.data.get("message")
        send_mail(
            subject="Shnoor Support Response",
            message=reply,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[query.email],
            fail_silently=False
        )
        return Response({"message":"Reply Sent Successfully"})
    except Contact.DoesNotExist:
        return Response({"error":"Query Not Found"},status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_delete(request):
    ids=request.data.get("ids",[])
    if ids:
        Contact.objects.filter(id__in=ids).delete()
        return Response({"message":"Queries deleted successfully"})
    return Response({"error":"No queries specified"},status=400)