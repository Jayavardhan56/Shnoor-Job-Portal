from django.urls import path
from .views import admin_stats,landing_stats
urlpatterns=[
    path('stats/',admin_stats),
    path('public-stats/',landing_stats),
]
