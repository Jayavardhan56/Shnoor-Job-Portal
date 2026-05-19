from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Max
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
from applications.models import Application
from .models import ChatRoom,Message
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_room(request,application_id):
    try:
        app=Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return Response({"error":"Application Not Found"},status=404)
    if request.user!=app.user and request.user!=app.job.created_by:
        return Response({"error":"Unauthorized"},status=403)
    try:
        room=ChatRoom.objects.get(application=app)
    except ChatRoom.DoesNotExist:
        room=ChatRoom.objects.create(application=app,initiated=True)
    Message.objects.filter(room=room,is_read=False).exclude(sender=request.user).update(is_read=True)
    messages=Message.objects.filter(room=room).order_by('created_at')
    data=[]
    for msg in messages:
        data.append({
            "id":msg.id,
            "sender":msg.sender.username,
            "sender_id":msg.sender.id,
            "message":msg.message,
            "created_at":msg.created_at,
            "file":msg.file.url if msg.file else None
        })
    return Response({
        "room_id":room.id,
        "application_id":app.id,
        "is_closed":room.is_closed,
        "rating":room.rating,
        "suggestions":room.suggestions,
        "messages":data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    room_id=request.data.get("room_id")
    text=request.data.get("message")
    file_obj=request.FILES.get("file")
    if not room_id:
        return Response({"error":"room_id required"},status=400)
    try:
        room=ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error":"Chat Room Not Found"},status=404)
    app=room.application
    if request.user!=app.user and request.user!=app.job.created_by:
        return Response({"error":"Unauthorized"},status=403)
    msg=Message.objects.create(
        room=room,
        sender=request.user,
        message=text or "",
        file=file_obj
    )
    channel_layer=get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'chat_{room.id}',
        {
            'type':'chat_message',
            'message':{
                "id":msg.id,
                "sender":msg.sender.username,
                "sender_id":msg.sender.id,
                "message":msg.message,
                "file":msg.file.url if msg.file else None,
                "created_at":msg.created_at.isoformat()
            }
        }
    )
    return Response({
        "id":msg.id,
        "sender":msg.sender.username,
        "sender_id":msg.sender.id,
        "message":msg.message,
        "created_at":msg.created_at,
        "file":msg.file.url if msg.file else None
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request,room_id):
    try:
        room=ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error":"Chat Room Not Found"},status=404)
    app=room.application
    if request.user!=app.user and request.user!=app.job.created_by:
        return Response({"error":"Unauthorized"},status=403)
    Message.objects.filter(room=room,is_read=False).exclude(sender=request.user).update(is_read=True)
    messages=Message.objects.filter(room=room).order_by('created_at')
    data=[]
    for msg in messages:
        data.append({
            "id":msg.id,
            "sender":msg.sender.username,
            "sender_id":msg.sender.id,
            "message":msg.message,
            "created_at":msg.created_at,
            "file":msg.file.url if msg.file else None
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_chat_list(request):
    Message.objects.filter(created_at__lt=timezone.now()-timedelta(days=30)).delete()
    apps=Application.objects.filter(
        job__created_by=request.user,
        status__in=['shortlisted','interviewing']
    )
    for app in apps:
        ChatRoom.objects.get_or_create(application=app)
    rooms=ChatRoom.objects.filter(
        application__job__created_by=request.user,
        application__status__in=['shortlisted','interviewing']
    ).exclude(deleted_by_manager=True).annotate(latest_act=Coalesce(Max('messages__created_at'),'created_at')).order_by('-latest_act')
    data=[]
    for room in rooms:
        app=room.application
        unread_count=Message.objects.filter(room=room,sender=app.user,is_read=False).count()
        latest_msg=Message.objects.filter(room=room).order_by('-created_at').first()
        latest_time=latest_msg.created_at if latest_msg else room.created_at
        is_active=latest_time>timezone.now()-timedelta(minutes=5)
        diff=timezone.now()-latest_time
        mins=int(diff.total_seconds() / 60)
        data.append({
            "application_id":app.id,
            "username":app.user.username,
            "job_title":app.job.title,
            "status":app.status,
            "room_id":room.id,
            "initiated":room.initiated,
            "has_unread":unread_count>0,
            "unread_count":unread_count,
            "is_active":is_active,
            "last_active_mins":mins,
            "latest_time":latest_time,
            "is_closed":room.is_closed,
            "closed_at":room.closed_at
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_chat_list(request):
    rooms=ChatRoom.objects.filter(
        application__user=request.user,
        application__status__in=['shortlisted','interviewing'],
        deleted_by_user=False
    ).annotate(latest_act=Coalesce(Max('messages__created_at'),'created_at')).order_by('-latest_act')
    data=[]
    for room in rooms:
        app=room.application
        has_unread=Message.objects.filter(room=room,sender=app.job.created_by,is_read=False).exists()
        latest_msg=Message.objects.filter(room=room).order_by('-created_at').first()
        latest_time=latest_msg.created_at if latest_msg else room.created_at
        data.append({
            "room_id":room.id,
            "application_id":app.id,
            "job_title":app.job.title,
            "manager":app.job.created_by.username,
            "status":app.status,
            "has_unread":has_unread,
            "latest_time":latest_time,
            "is_closed":room.is_closed
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_notification(request):
    room_id=request.data.get("room_id")
    if not room_id:
        return Response({"error":"room_id required"},status=400)
    try:
        room=ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error":"Chat Room Not Found"},status=404)
    if request.user==room.application.user:
        room.deleted_by_user=True
        room.save()
    elif request.user==room.application.job.created_by:
        room.deleted_by_manager=True
        room.save()
    else:
        return Response({"error":"Unauthorized"},status=403)
    return Response({"message":"Notification deleted"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_and_rate_chat(request):
    room_id=request.data.get("room_id")
    rating=request.data.get("rating")
    suggestions=request.data.get("suggestions")
    if not room_id:
        return Response({"error":"room_id required"},status=400)
    try:
        room=ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error":"Chat Room Not Found"},status=404)
    if request.user!=room.application.user:
        return Response({"error":"Unauthorized"},status=403)
    room.is_closed=True
    room.closed_at=timezone.now()
    if rating is not None:
        room.rating=int(rating)
    if suggestions:
        room.suggestions=suggestions
    room.save()
    return Response({"message":"Chat closed and rated"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manager_close_chat(request):
    room_id=request.data.get("room_id")
    if not room_id:
        return Response({"error":"room_id required"},status=400)
    try:
        room=ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response({"error":"Chat Room Not Found"},status=404)
    if request.user!=room.application.job.created_by:
        return Response({"error":"Unauthorized"},status=403)
    room.is_closed=True
    room.closed_at=timezone.now()
    room.save()
    return Response({"message":"Chat closed by manager"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_analytics(request):
    rooms=ChatRoom.objects.filter(application__job__created_by=request.user,is_closed=True)
    ratings={1:0,2:0,3:0,4:0,5:0}
    suggestions=[]
    for r in rooms:
        if r.rating:
            ratings[r.rating]+=1
        if r.suggestions:
            suggestions.append({
                "username":r.application.user.username,
                "job_title":r.application.job.title,
                "text":r.suggestions,
                "date":r.created_at
            })
    return Response({
        "ratings":ratings,
        "suggestions":suggestions
    })