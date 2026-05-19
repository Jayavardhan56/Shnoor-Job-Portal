from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from jobs.models import Job
from users.utils import send_mail_async
from users.models import User
from applications.models import Application
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from .models import JobQuestion,Job
from django.db.models import Q
import json
from groq import Groq

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_job(request):
    user=request.user
    title=request.data.get("title")
    description=request.data.get("description")
    salary=request.data.get("salary")
    skills=request.data.get("skills")
    if not title or not description or not salary or not skills:
        return Response({"error":"All fields Required"},status=400)
    days=int(request.data.get("deadline_days",30))
    min_ats=int(request.data.get("min_ats_score",50))
    deadline_date=timezone.now()+timedelta(days=days)
    is_draft=request.data.get("is_draft",False)
    scheduled_publish_at=request.data.get("scheduled_publish_at") or None
    location=request.data.get("location","")
    work_mode=request.data.get("work_mode","on-site")
    experience_level=request.data.get("experience_level","")
    job_type=request.data.get("job_type","full-time")
    
    job=Job.objects.create(
        title=title,
        description=description,
        salary=salary,
        skills=skills,
        created_by=user,
        deadline=deadline_date,
        min_ats_score=min_ats,
        is_draft=is_draft,
        scheduled_publish_at=scheduled_publish_at,
        location=location,
        work_mode=work_mode,
        experience_level=experience_level,
        job_type=job_type
    )
    questions=request.data.get('questions',[])
    for q in questions:
        JobQuestion.objects.create(
            job=job,
            question=q.get('question'),
            question_type=q.get('question_type'),
            options=q.get('options',[]),
            expected_answer=q.get('expected_answer')
        )
    is_scheduled=False
    if scheduled_publish_at:
        dt=parse_datetime(scheduled_publish_at)
        if dt and dt > timezone.now():
            is_scheduled=True
            
    if not is_draft and not is_scheduled:
        users=User.objects.filter(role="user")
        emails=[u.email for u in users if u.email]
        if emails:
            subject=f"New Career Opportunity: {title} | SHNOOR"
        html=f"""
        <div style='font-family:sans-serif;background:#f8fafc;padding:50px 20px;'>
        <div style='max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);'>
        <div style='background:#0f172a;padding:40px;text-align:center;'>
        <h1 style='color:#fff;margin:0;font-size:28px;letter-spacing:-1px;'>SHNOOR</h1>
        <p style='color:#94a3b8;margin:10px 0 0;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;'>Job Portal</p>
        </div>
        <div style='padding:40px;'>
        <p style='color:#64748b;font-size:16px;line-height:1.6;'>Hello Talent,</p>
        <p style='color:#1e293b;font-size:18px;line-height:1.6;font-weight:bold;'>A new opportunity has been posted by {user.username}:</p>
        <div style='background:#f1f5f9;border-radius:16px;padding:30px;margin:30px 0;'>
        <h2 style='color:#0f172a;margin:0 0 10px;font-size:22px;'>{title}</h2>
        <p style='color:#475569;margin:0 0 20px;font-size:15px;'>{description}</p>
        <p style='color:#0f172a;margin:0;font-size:14px;font-weight:bold;'>Salary: {salary}</p>
        </div>
        <div style='text-align:center;'>
        <a href='http://localhost:5173/browse-jobs' style='display:inline-block;padding:18px 40px;background:#0f172a;color:#fff;text-decoration:none;border-radius:14px;font-weight:bold;font-size:14px;text-transform:uppercase;letter-spacing:1px;'>View & Apply Now</a>
        </div>
        <p style='color:#94a3b8;font-size:12px;text-align:center;margin-top:40px;'>This is an automated notification from SHNOOR Job Portal.</p>
        </div>
        </div>
        </div>
        """
        send_mail_async(subject,"",None,emails,html_message=html)
    return Response({"message":"Job Created Successfully","job_id":job.id},status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_draft_jobs(request):
    if request.user.role != 'manager':
        return Response({"error":"Unauthorized"},status=403)
    jobs=Job.objects.filter(created_by=request.user,is_draft=True).order_by('-created_at')
    data=[]
    for job in jobs:
        data.append({
            "id":job.id,
            "title":job.title,
            "description":job.description,
            "salary":job.salary,
            "skills":job.skills,
            "deadline":job.deadline,
            "min_ats_score":job.min_ats_score,
            "location":job.location,
            "work_mode":job.work_mode,
            "experience_level":job.experience_level,
            "job_type":job.job_type,
            "scheduled_publish_at":job.scheduled_publish_at,
            "questions": [
                {
                    "question": q.question,
                    "question_type": q.question_type,
                    "options": q.options,
                    "expected_answer": q.expected_answer
                } for q in job.questions.all()
            ]
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_scheduled_jobs(request):
    if request.user.role != 'manager':
        return Response({"error":"Unauthorized"},status=403)
    jobs=Job.objects.filter(created_by=request.user,is_draft=False,scheduled_publish_at__gt=timezone.now()).order_by('scheduled_publish_at')
    data=[]
    for job in jobs:
        data.append({
            "id":job.id,
            "title":job.title,
            "description":job.description,
            "salary":job.salary,
            "skills":job.skills,
            "deadline":job.deadline,
            "min_ats_score":job.min_ats_score,
            "location":job.location,
            "work_mode":job.work_mode,
            "experience_level":job.experience_level,
            "job_type":job.job_type,
            "scheduled_publish_at":job.scheduled_publish_at,
            "questions": [
                {
                    "question": q.question,
                    "question_type": q.question_type,
                    "options": q.options,
                    "expected_answer": q.expected_answer
                } for q in job.questions.all()
            ]
        })
    return Response(data)

@api_view(['GET'])
def get_jobs(request):
    q=request.GET.get('q','')
    skills=request.GET.get('skills','')
    location=request.GET.get('location','')
    work_mode=request.GET.get('work_mode','')
    experience_level=request.GET.get('experience_level','')
    job_type=request.GET.get('job_type','')
    company=request.GET.get('company','')
    
    jobs=Job.objects.filter(is_draft=False)
    jobs=jobs.filter(Q(scheduled_publish_at__isnull=True) | Q(scheduled_publish_at__lte=timezone.now()))
    
    if q:
        jobs=jobs.filter(Q(title__icontains=q) | Q(description__icontains=q))
    if skills:
        jobs=jobs.filter(skills__icontains=skills)
    if location:
        jobs=jobs.filter(location__icontains=location)
    if work_mode:
        jobs=jobs.filter(work_mode=work_mode)
    if experience_level:
        jobs=jobs.filter(experience_level__icontains=experience_level)
    if job_type:
        jobs=jobs.filter(job_type=job_type)
    if company:
        jobs=jobs.filter(created_by__organization_name__icontains=company)
        
    jobs=jobs.order_by('-created_at')
    
    data=[]
    for job in jobs:
        data.append({
            "id":job.id,
            "title":job.title,
            "description":job.description,
            "salary":job.salary,
            "skills":job.skills,
            "created_by":job.created_by.username,
            "created_by_id":job.created_by.id,
            "company":job.created_by.organization_name,
            "created_at":job.created_at,
            "deadline":job.deadline,
            "min_ats_score":job.min_ats_score,
            "location":job.location,
            "work_mode":job.work_mode,
            "experience_level":job.experience_level,
            "job_type":job.job_type
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job(request,id):
    try:
        job=Job.objects.get(id=id)
        return Response({
            "id":job.id,
            "title":job.title,
            "description":job.description,
            "salary":job.salary,
            "skills":job.skills,
            "created_by":job.created_by.username,
            "created_by_id":job.created_by.id,
            "company":job.created_by.organization_name,
            "created_at":job.created_at,
            "deadline":job.deadline,
            "min_ats_score":job.min_ats_score,
            "location":job.location,
            "work_mode":job.work_mode,
            "experience_level":job.experience_level,
            "job_type":job.job_type
        })

    except Job.DoesNotExist:
        return Response({"error":"Job Not Found"},status=404)

@api_view(['GET'])
def get_job_questions(request,id):
    try:
        job=Job.objects.get(id=id)
        questions=JobQuestion.objects.filter(job=job)
        data=[]
        for q in questions:
            data.append({
                "id":q.id,
                "question":q.question,
                "question_type":q.question_type,
                "options":q.options,
                "expected_answer":q.expected_answer
            })
        return Response(data)
    except Job.DoesNotExist:
        return Response({"error":"Job Not Found"},status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_job(request,id):
    try:
        job=Job.objects.get(id=id,created_by=request.user)
        job.title=request.data.get("title",job.title)
        job.description=request.data.get("description",job.description)
        job.salary=request.data.get("salary",job.salary)
        job.skills=request.data.get("skills",job.skills)
        job.save()
        return Response({"message":"Job updated"})
    except Job.DoesNotExist:
        return Response({"error":"Job not found"},status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_delete_jobs(request):
    ids=request.data.get("ids",[])
    for job_id in ids:
        try:
            if request.user.role=="admin":
                job=Job.objects.get(id=job_id)
            else:
                job=Job.objects.get(id=job_id,created_by=request.user)
            apps=Application.objects.filter(job=job)
            emails=[a.user.email for a in apps if a.user.email]
            if emails:
                subject=f"Job Update: {job.title} | SHNOOR"
                html=f"""
                <div style='font-family:sans-serif;background:#f8fafc;padding:50px 20px;'>
                <div style='max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);'>
                <div style='background:#0f172a;padding:40px;text-align:center;'>
                <h1 style='color:#fff;margin:0;font-size:28px;letter-spacing:-1px;'>SHNOOR</h1>
                <p style='color:#94a3b8;margin:10px 0 0;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;'>Job Portal</p>
                </div>
                <div style='padding:40px;'>
                <p style='color:#64748b;font-size:16px;line-height:1.6;'>Hello,</p>
                <p style='color:#1e293b;font-size:16px;line-height:1.6;'>Your current applied job <b>{job.title}</b> is removed by manager and no longer available.</p>
                <p style='color:#1e293b;font-size:16px;line-height:1.6;'>Explore other opportunities on our platform.</p>
                <div style='text-align:center;margin-top:30px;'>
                <a href='http://localhost:5173/browse-jobs' style='display:inline-block;padding:18px 40px;background:#0f172a;color:#fff;text-decoration:none;border-radius:14px;font-weight:bold;font-size:14px;text-transform:uppercase;letter-spacing:1px;'>Explore Jobs</a>
                </div>
                <p style='color:#94a3b8;font-size:12px;text-align:center;margin-top:40px;'>This is an automated notification from SHNOOR Job Portal.</p>
                </div>
                </div>
                </div>
                """
                send_mail_async(subject,"",None,emails,html_message=html)
            job.delete()
        except Job.DoesNotExist:pass
    return Response({"message":"Bulk deleted"})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_manager_details(request,id):
    try:
        manager=User.objects.get(id=id,role="manager")
        jobs=Job.objects.filter(created_by=manager).order_by('-created_at')
        data=[]
        for job in jobs:
            apps=Application.objects.filter(job=job).select_related('user')
            stats={
                "total":apps.count(),
                "pending":{
                    "count":apps.filter(status='pending').count(),
                    "users":list(apps.filter(status='pending').values("user__id","user__username","user__email"))
                },
                "shortlisted":{
                    "count":apps.filter(status='shortlisted').count(),
                    "users":list(apps.filter(status='shortlisted').values("user__id","user__username","user__email"))
                },
                "interviewing":{
                    "count":apps.filter(status='interviewing').count(),
                    "users":list(apps.filter(status='interviewing').values("user__id","user__username","user__email"))
                },
                "hired":{
                    "count":apps.filter(status='hired').count(),
                    "users":list(apps.filter(status='hired').values("user__id","user__username","user__email"))
                },
                "rejected":{
                    "count":apps.filter(status='rejected').count(),
                    "users":list(apps.filter(status='rejected').values("user__id","user__username","user__email"))
                }
            }
            data.append({
                "id":job.id,
                "title":job.title,
                "description":job.description,
                "salary":job.salary,
                "skills":job.skills,
                "created_at":job.created_at,
                "deadline":job.deadline,
                "location":job.location,
                "work_mode":job.work_mode,
                "experience_level":job.experience_level,
                "job_type":job.job_type,
                "is_draft":job.is_draft,
                "stats":stats
            })
        return Response({
            "manager":{
                "id":manager.id,
                "username":manager.username,
                "email":manager.email,
                "organization":manager.organization_name
            },
            "jobs":data
        })
    except User.DoesNotExist:
        return Response({"error":"Manager not found"},status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_jobs(request):
    user=request.user
    jobs=Job.objects.filter(created_by=user,is_draft=False).filter(Q(scheduled_publish_at__isnull=True) | Q(scheduled_publish_at__lte=timezone.now())).order_by('-created_at')
    data=[]
    for job in jobs:
        data.append({
            "id":job.id,
            "title":job.title,
            "description":job.description,
            "salary":job.salary,
            "skills":job.skills,
            "created_by":job.created_by.username,
            "created_at":job.created_at,
            "deadline":job.deadline,
            "min_ats_score":job.min_ats_score,
            "is_draft":job.is_draft,
            "scheduled_publish_at":job.scheduled_publish_at
        })
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_job(request,id):
    try:
        if request.user.role=="admin":
            job=Job.objects.get(id=id)
        else:
            job=Job.objects.get(id=id,created_by=request.user)
        apps=Application.objects.filter(job=job)
        emails=[a.user.email for a in apps if a.user.email]
        if emails:
            subject=f"Job Update: {job.title} | SHNOOR"
            html=f"""
            <div style='font-family:sans-serif;background:#f8fafc;padding:50px 20px;'>
            <div style='max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);'>
            <div style='background:#0f172a;padding:40px;text-align:center;'>
            <h1 style='color:#fff;margin:0;font-size:28px;letter-spacing:-1px;'>SHNOOR</h1>
            <p style='color:#94a3b8;margin:10px 0 0;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;'>Job Portal</p>
            </div>
            <div style='padding:40px;'>
            <p style='color:#64748b;font-size:16px;line-height:1.6;'>Hello,</p>
            <p style='color:#1e293b;font-size:16px;line-height:1.6;'>Your current applied job <b>{job.title}</b> is removed by manager and no longer available.</p>
            <p style='color:#1e293b;font-size:16px;line-height:1.6;'>Explore other opportunities on our platform.</p>
            <div style='text-align:center;margin-top:30px;'>
            <a href='http://localhost:5173/browse-jobs' style='display:inline-block;padding:18px 40px;background:#0f172a;color:#fff;text-decoration:none;border-radius:14px;font-weight:bold;font-size:14px;text-transform:uppercase;letter-spacing:1px;'>Explore Jobs</a>
            </div>
            <p style='color:#94a3b8;font-size:12px;text-align:center;margin-top:40px;'>This is an automated notification from SHNOOR Job Portal.</p>
            </div>
            </div>
            </div>
            """
            send_mail_async(subject,"",None,emails,html_message=html)
        job.delete()
        return Response({"message":"Job deleted"})
    except Job.DoesNotExist:
        return Response({"error":"Job not found"},status=404)