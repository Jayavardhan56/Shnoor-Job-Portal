from django.urls import path
from .views import contact_create, contact_list, reply_query, contact_delete
urlpatterns=[
    path('contact/',contact_create),
    path('contact/admin/',contact_list),
    path('contact/reply/<int:pk>/',reply_query),
    path('contact/delete/',contact_delete)
]