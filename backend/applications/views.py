from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from applications.models import Application,InterviewReview
from users.models import User,Resume,Profile
from jobs.models import Job,JobQuestion
from users.utils import extract_text,get_advanced_ai_analysis
from django.core.mail import send_mail
from django.conf import settings
from groq import Groq
from chat.models import ChatRoom,Message
import os,json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_job(request):
    user=request.user
    job_id=request.data.get("job") or request.data.get("job_id")
    resume_id=request.data.get("resume_id")
    raw_answers=request.data.get('screening_answers',[])
    if not job_id:
        return Response({"error":"Job ID Required"},status=400)
    try:
        job=Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error":"Job Not Found"},status=404)
    if Application.objects.filter(user=user,job=job).exists():
        return Response({"error":"Already Applied"},status=400)
    questions=JobQuestion.objects.filter(job=job)
    screening_data=[]
    for q in questions:
        ans=next((a.get('answer') for a in raw_answers if a.get('question')==q.question),None)
        screening_data.append({
            "question":q.question,
            "expected_answer":q.expected_answer,
            "answer":ans or "Not provided"
        })
    resume_obj=None
    resume_file=request.FILES.get("resume")
    if resume_file:
        resume_obj=Resume.objects.create(user=user,file=resume_file,name=resume_file.name)
        resume_obj.extracted_text=extract_text(resume_obj.file.path)
        resume_obj.save()
    elif resume_id:
        try:
            resume_obj=Resume.objects.get(id=resume_id,user=user)
        except Resume.DoesNotExist:
            pass
    score=0
    status='applied'
    ai_analysis=None
    match_highlights=None
    if resume_obj and resume_obj.extracted_text:
        ai_res=get_advanced_ai_analysis(resume_obj.extracted_text,job.title,job.description,job.skills,screening_data)
        score=ai_res.get("score",0)
        ai_analysis=ai_res["analysis"]
        match_highlights=ai_res["highlights"]
        if score>=job.min_ats_score:
            status='shortlisted'
            subj=f"Good News! You've been shortlisted for {job.title}"
            html=f"""
        <div style='font-family:sans-serif;background:#f8fafc;padding:50px 20px;'>
        <div style='max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);'>
        <div style='background:#22c55e;padding:40px;text-align:center;'>
        <h1 style='color:#fff;margin:0;font-size:28px;letter-spacing:-1px;'>Congratulations!</h1>
        <p style='color:#f0fdf4;margin:10px 0 0;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;'>You're Shortlisted</p>
        </div>
        <div style='padding:40px;'>
        <p style='color:#64748b;font-size:16px;line-height:1.6;'>Hi {user.username},</p>
        <p style='color:#1e293b;font-size:18px;line-height:1.6;font-weight:bold;'>We are excited to inform you that you have been shortlisted for the <b>{job.title}</b> position at SHNOOR Portal.</p>
        <div style='background:#f1f5f9;border-radius:16px;padding:30px;margin:30px 0;text-align:center;'>
        <p style='color:#64748b;margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;'>Dynamic AI Match Score</p>
        <h2 style='color:#22c55e;margin:0;font-size:48px;'>{score}%</h2>
        </div>
        <p style='color:#475569;font-size:15px;line-height:1.7;'>Our recruitment team will review your profile further and reach out regarding the next steps in our hiring process.</p>
        <p style='color:#94a3b8;font-size:12px;text-align:center;margin-top:40px;'>Best Regards,<br><b>SHNOOR Recruitment Team</b></p>
        </div>
        </div>
        </div>
        """
            send_mail(subj,"",None,[user.email],html_message=html,fail_silently=True)
    Application.objects.create(
        user=user,
        job=job,
        resume=resume_obj,
        status=status,
        ats_score=score,
        ai_analysis=ai_analysis,
        match_highlights=match_highlights,
        screening_answers=screening_data,
        )
    return Response({"message":"Applied Successfully"},status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_applications(request):
    user=request.user
    apps=Application.objects.filter(user=user).order_by('-applied_at')
    data=[]
    for a in apps:
        try:
            room=ChatRoom.objects.get(application=a)
            has_unread=Message.objects.filter(room=room,sender=a.job.created_by,is_read=False).exists()
            unread_count=Message.objects.filter(room=room,sender=a.job.created_by,is_read=False).count()
        except ChatRoom.DoesNotExist:
            has_unread=False
            unread_count=0
        data.append({
            "id":a.id,
            "job_id":a.job.id,
            "job_title":a.job.title,
            "description":a.job.description,
            "deadline":a.job.deadline,
            "skills":a.job.skills,
            "salary":a.job.salary,
            "applied_at":a.applied_at,
            "status":a.status,
            "reviewed":InterviewReview.objects.filter(user=user,job=a.job).exists(),
            "has_unread":has_unread,
            "unread_count":unread_count,
            "manager":a.job.created_by.username
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_applicants(request,job_id):
    apps=Application.objects.filter(job_id=job_id,job__created_by=request.user)
    data=[{
        "id":a.id,
        "user_id":a.user.id,
        "username":a.user.username,
        "email":a.user.email,
        "status":a.status,
        "resume":a.resume.file.url if a.resume and a.resume.file else None,
        "ats_score":a.ats_score,
        "assessment_score":a.assessment_score,
        "assessment_completed":a.assessment_completed,
        "applied_at":a.applied_at,
        "ai_analysis":a.ai_analysis,
        "highlights":a.match_highlights,
        "screening_answers":a.screening_answers
    } for a in apps]
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_status(request,app_id):
    try:
        app=Application.objects.get(id=app_id,job__created_by=request.user)
        old_status=app.status
        new_status=request.data.get("status")
        app.status=new_status
        app.save()
        if new_status=='shortlisted' and old_status!='shortlisted':
            subj=f"Good News! You've been shortlisted for {app.job.title}"
            html=f"""
        <div style='font-family:sans-serif;background:#f8fafc;padding:50px 20px;'>
        <div style='max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);'>
        <div style='background:#22c55e;padding:40px;text-align:center;'>
        <h1 style='color:#fff;margin:0;font-size:28px;letter-spacing:-1px;'>Congratulations!</h1>
        <p style='color:#f0fdf4;margin:10px 0 0;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;'>You're Shortlisted</p>
        </div>
        <div style='padding:40px;'>
        <p style='color:#64748b;font-size:16px;line-height:1.6;'>Hi {app.user.username},</p>
        <p style='color:#1e293b;font-size:18px;line-height:1.6;font-weight:bold;'>We are excited to inform you that you have been shortlisted for the <b>{app.job.title}</b> position at SHNOOR Portal.</p>
        <div style='background:#f1f5f9;border-radius:16px;padding:30px;margin:30px 0;text-align:center;'>
        <p style='color:#64748b;margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;'>Dynamic AI Match Score</p>
        <h2 style='color:#22c55e;margin:0;font-size:48px;'>{app.ats_score}%</h2>
        </div>
        <p style='color:#475569;font-size:15px;line-height:1.7;'>Our recruitment team will review your profile further and reach out regarding the next steps in our hiring process.</p>
        <p style='color:#94a3b8;font-size:12px;text-align:center;margin-top:40px;'>Best Regards,<br><b>SHNOOR Recruitment Team</b></p>
        </div>
        </div>
        </div>
        """
            send_mail(subj,"",None,[app.user.email],html_message=html,fail_silently=True)
        return Response({"message":"Status updated"})
    except Application.DoesNotExist:
        return Response({"error":"Application not found"},status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_applicants(request):
    apps=Application.objects.filter(job__created_by=request.user).order_by('-applied_at')
    data=[{
        "id":a.id,
        "username":a.user.username,
        "email":a.user.email,
        "job_title":a.job.title,
        "status":a.status,
        "applied_at":a.applied_at,
        "resume":a.resume.file.url if a.resume and a.resume.file else None,
        "ats_score":a.ats_score,
        "assessment_score":a.assessment_score,
        "assessment_completed":a.assessment_completed,
        "ai_analysis":a.ai_analysis,
        "highlights":a.match_highlights,
        "screening_answers":a.screening_answers
    } for a in apps]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_assessment(request):
    job_id=request.data.get("job_id")
    link=request.data.get("link")
    if not job_id or not link:
        return Response({"error":"Required:job_id,link"},status=400)
    apps=Application.objects.filter(job_id=job_id,status='shortlisted')
    emails=[a.user.email for a in apps if a.user.email]
    if not emails:
        return Response({"error":"No shortlisted candidates found."},status=400)
    subj="Action Required: Assessment Link - SHNOOR"
    html=f"""
        <div style='font-family:sans-serif;background:#f8fafc;padding:50px 20px;'>
        <div style='max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);'>
        <div style='background:#0f172a;padding:40px;text-align:center;'>
        <h1 style='color:#fff;margin:0;font-size:28px;letter-spacing:-1px;'>Assessment Center</h1>
        </div>
        <div style='padding:40px;'>
        <p style='color:#64748b;font-size:16px;line-height:1.6;'>Hello Candidate,</p>
        <p style='color:#1e293b;font-size:18px;line-height:1.6;font-weight:bold;'>It's time for the next phase of your application!</p>
        <div style='text-align:center;margin:40px 0;'>
        <a href='{link}' style='display:inline-block;padding:18px 40px;background:#0f172a;color:#fff;text-decoration:none;border-radius:14px;font-weight:bold;font-size:14px;text-transform:uppercase;letter-spacing:1px;'>Start Assessment</a>
        </div>
        <p style='color:#94a3b8;font-size:12px;text-align:center;margin-top:40px;'>Best Regards,<br><b>SHNOOR Recruitment Team</b></p>
        </div>
        </div>
        </div>
        """
    send_mail(subj,"",None,emails,html_message=html,fail_silently=True)
    apps.update(status='assessment_pending')
    return Response({"message":"Assessment link sent"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_status(request):
    ids=request.data.get("application_ids",[])
    new_status=request.data.get("status")
    if not ids or not new_status:
        return Response({"error":"application_ids and status required"},status=400)
    apps=Application.objects.filter(id__in=ids,job__created_by=request.user)
    count=apps.count()
    apps.update(status=new_status)
    return Response({"message":f"Updated {count} candidates to {new_status}"})

@api_view(['POST'])
def submit_assessment(request):
    app_id=request.data.get("application_id")
    score=request.data.get("score")
    passing_score=request.data.get("passing_score",70)
    if not app_id or score is None:
        return Response({"error":"application_id and score required"},status=400)
    try:
        app=Application.objects.get(id=app_id)
        app.assessment_score=score
        app.assessment_completed=True
        if float(score)>=float(passing_score):
            app.status='interviewing'
        else:
            app.status='assessment_completed'
        app.save()
        return Response({"message":"Assessment submitted","new_status":app.status})
    except Application.DoesNotExist:
        return Response({"error":"Application not found"},status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reanalyze_application(request,app_id):
    try:
        app=Application.objects.get(id=app_id,job__created_by=request.user)
        if app.resume:
            if not app.resume.extracted_text:
                app.resume.extracted_text=extract_text(app.resume.file.path)
                app.resume.save()
            if app.resume.extracted_text:
                ai_res=get_advanced_ai_analysis(app.resume.extracted_text,app.job.title,app.job.description,app.job.skills,app.screening_answers)
                app.ats_score=ai_res.get("score",0)
                app.ai_analysis=ai_res["analysis"]
                app.match_highlights=ai_res["highlights"]
                app.save()
                return Response({"message":"Re-analysis complete","ats_score":app.ats_score})
        return Response({"error":"No resume text found"},status=400)
    except Application.DoesNotExist:return Response({"error":"Application not found"},status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_review(request):
    user=request.user
    job_id=request.data.get("job_id")
    text=request.data.get("review_text")
    if not job_id or not text:
        return Response({"error":"job_id and review_text required"},status=400)
    try:
        job=Job.objects.get(id=job_id)
        if not Application.objects.filter(user=user,job=job,status__in=['interviewing','hired','rejected']).exists():
            return Response({"error":"You can only review after an interview"},status=403)
        if InterviewReview.objects.filter(user=user,job=job).exists():
            return Response({"error":"Already reviewed"},status=400)
        InterviewReview.objects.create(
            user=user,
            job=job,
            technical_difficulty=request.data.get("technical_difficulty",5),
            process_clarity=request.data.get("process_clarity",5),
            interviewer_behavior=request.data.get("interviewer_behavior",5),
            overall_rating=request.data.get("overall_rating",5),
            review_text=text
        )
        return Response({"message":"Review posted"},status=201)
    except Job.DoesNotExist:
        return Response({"error":"Job not found"},status=404)

@api_view(['GET'])
def get_reviews(request):
    revs=InterviewReview.objects.all().order_by('-created_at')
    data=[]
    for r in revs:
        p,c=Profile.objects.get_or_create(user=r.user)
        data.append({
            "id":r.id,
            "username":r.user.username,
            "photo":p.photo.url if p.photo else None,
            "headline":p.headline,
            "job_title":r.job.title,
            "overall_rating":r.overall_rating,
            "technical_difficulty":r.technical_difficulty,
            "process_clarity":r.process_clarity,
            "interviewer_behavior":r.interviewer_behavior,
            "text":r.review_text,
            "date":r.created_at
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_resume_review(request):
    resume_id=request.data.get("resume_id")
    api_key=os.getenv("GROQ_API_KEY")
    if not resume_id:
        return Response({"error":"Resume ID Required"},status=400)
    if not api_key:
        return Response({"error":"AI Engine Configuration Missing"},status=500)
    try:
        resume=Resume.objects.get(id=resume_id,user=request.user)
    except Resume.DoesNotExist:
        return Response({"error":"Resume Not Found"},status=404)
    if not resume.extracted_text:
        return Response({"error":"Extraction failed. Re-upload resume."},status=400)
    try:
        jobs=Job.objects.all()
        all_skills=[]
        for job in jobs:
            if job.skills:
                for s in job.skills.split(','):
                    cleaned=s.strip()
                    if cleaned and cleaned not in all_skills:
                        all_skills.append(cleaned)
        market_skills=", ".join(all_skills[:20])
        prompt=f"""
        You are an elite AI Career Advisor for the SHNOOR Job Portal.
        Analyze the resume against current SHNOOR hiring trends.
        MARKET SKILLS:{market_skills}
        RESUME CONTENT:{resume.extracted_text}
        Respond ONLY with valid JSON.
        {{
          "ats_score":0-100,
          "career_summary":"concise career guidance",
          "strengths":["point1","point2"],
          "missing_skills":["skill1","skill2"],
          "resume_improvements":["tip1","tip2"],
          "recommended_roles":["role1","role2"]
        }}
        """
        client=Groq(api_key=api_key)
        chat=client.chat.completions.create(
            messages=[{"role":"user","content":prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type":"json_object"}
        )
        parsed=json.loads(chat.choices[0].message.content)
        return Response({
            "ats_score":parsed.get("ats_score",0),
            "career_summary":parsed.get("career_summary",""),
            "strengths":parsed.get("strengths",[]),
            "missing_skills":parsed.get("missing_skills",[]),
            "resume_improvements":parsed.get("resume_improvements",[]),
            "recommended_roles":parsed.get("recommended_roles",[]),
            "market_skills":all_skills[:10]
        })
    except Exception as e:
        return Response({"error":str(e)},status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_application(request,id):
    try:
        app=Application.objects.get(id=id,user=request.user)
        app.delete()
        return Response({"message":"Application deleted"})
    except Application.DoesNotExist:
        return Response({"error":"Not Found"},status=404)