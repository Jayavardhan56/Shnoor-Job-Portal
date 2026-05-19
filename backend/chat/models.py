from django.db import models
from users.models import User
from applications.models import Application
class ChatRoom(models.Model):
    application=models.OneToOneField(
        Application,
        on_delete=models.CASCADE
    )
    initiated=models.BooleanField(default=False)
    deleted_by_user=models.BooleanField(default=False)
    deleted_by_manager=models.BooleanField(default=False)
    is_closed=models.BooleanField(default=False)
    rating=models.IntegerField(null=True,blank=True)
    suggestions=models.TextField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    closed_at=models.DateTimeField(null=True,blank=True)
    def __str__(self):
        return f"Chat-{self.application.user.username}"
    
class Message(models.Model):
    room=models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender=models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    message=models.TextField()
    is_read=models.BooleanField(default=False)
    file=models.FileField(upload_to='chat_files/',null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.sender.username}-{self.room.id}"
