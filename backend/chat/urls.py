from django.urls import path
from .views import *

urlpatterns=[
    path('room/<int:application_id>/',get_chat_room),
    path('send/',send_message),
    path('messages/<int:room_id>/',get_messages),
    path('manager-list/',manager_chat_list),
    path('user-list/',user_chat_list),
    path('delete-notification/',delete_notification),
    path('close-chat/',close_and_rate_chat),
    path('manager-close-chat/',manager_close_chat),
    path('analytics/',chat_analytics),
]