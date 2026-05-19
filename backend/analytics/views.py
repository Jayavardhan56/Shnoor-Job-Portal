from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from django.db import models
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from users.models import User
from jobs.models import Job
from applications.models import Application

@api_view(['GET'])
@permission_classes([IsAuthenticated,IsAdminUser])
def admin_stats(request):
    total_users=User.objects.count()
    total_jobs=Job.objects.count()
    total_apps=Application.objects.count()
    total_shortlisted=Application.objects.filter(status='shortlisted').count()
    total_rejected=Application.objects.filter(status='rejected').count()
    total_hires=Application.objects.filter(status='hired').count()
    
    six_months_ago=timezone.now()-timedelta(days=180)
    growth=Application.objects.filter(applied_at__gte=six_months_ago).annotate(month=TruncMonth('applied_at')).values('month').annotate(count=Count('id')).order_by('month')
    
    trends=Job.objects.values('created_by__username').annotate(
        apps=Count('application',distinct=True),
        hires=Count('application',filter=models.Q(application__status='hired'),distinct=True)
    )
    
    all_jobs=Job.objects.values_list('skills',flat=True)
    skill_counts={}
    for skills in all_jobs:
        for s in skills.split(','):
            s=s.strip()
            if s:skill_counts[s]=skill_counts.get(s,0)+1
    top_skills=sorted(skill_counts.items(),key=lambda x:x[1],reverse=True)[:5]

    return Response({
        "total_users":total_users,
        "total_jobs":total_jobs,
        "total_apps":total_apps,
        "total_shortlisted":total_shortlisted,
        "total_rejected":total_rejected,
        "total_hires":total_hires,
        "growth":list(growth),
        "trends":list(trends),
        "top_skills":dict(top_skills)
    })

@api_view(['GET'])
def landing_stats(request):
    users=User.objects.filter(role='user').count()
    jobs=Job.objects.count()
    apps=Application.objects.count()
    hires=Application.objects.filter(status='hired').count()
    rate=(hires/apps*100) if apps>0 else 98
    return Response({
        "users":users,
        "jobs":jobs,
        "apps":apps,
        "rate":round(rate,1)
    })
