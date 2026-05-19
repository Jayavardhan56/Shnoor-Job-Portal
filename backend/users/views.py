import json
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile, Resume, CompanyProfile

from django.db.models import Q
from .utils import calculate_profile_strength

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email=request.data.get("email")
    password=request.data.get("password")
    user=User.objects.filter(email=email).first()
    if user and user.check_password(password):
        if not user.is_approved:return Response({"error":"Pending Approval"},status=403)
        refresh=RefreshToken.for_user(user)
        return Response({
            "token":str(refresh.access_token),
            "role":user.role,
            "username":user.username,
            "email":user.email
        })
    return Response({"error":"Invalid credentials"},status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    data=request.data
    if User.objects.filter(email=data.get("email")).exists():
        return Response({"error":"Email exists"},status=400)
    user=User.objects.create_user(
        username=data.get("username") or data.get("name"),
        email=data.get("email"),
        password=data.get("password"),
        role=data.get("role","user"),
        first_name=data.get("name","")
    )
    user.is_approved=(user.role=="user")
    user.organization_name=data.get("organization_name","")
    user.save()
    return Response({"message":"User registered"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    profile,created=Profile.objects.select_related('user').get_or_create(user=request.user)
    return Response({
        "user_id":request.user.id,
        "role":request.user.role,
        "date_joined":request.user.date_joined,
        "last_login":request.user.last_login,
        "name":request.user.username,
        "first_name":request.user.first_name,
        "last_name":request.user.last_name,
        "email":request.user.email,
        "phone":profile.phone,
        "photo":profile.photo.url if profile.photo else None,
        "headline":profile.headline,
        "summary":profile.summary,
        "education":profile.education,
        "experiences":profile.experiences,
        "projects":profile.projects,
        "skills":profile.skills,
        "personal_info":profile.personal_info,
        "certifications":profile.certifications,
        "social_links":profile.social_links,
        "viewers":profile.viewers,
        "ats_score":calculate_profile_strength(profile)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile,created=Profile.objects.get_or_create(user=request.user)
    if "first_name" in request.data:request.user.first_name=request.data.get("first_name")
    if "last_name" in request.data:request.user.last_name=request.data.get("last_name")
    if "name" in request.data:request.user.username=request.data.get("name")
    request.user.save()
    profile.phone=request.data.get("phone",profile.phone)
    profile.headline=request.data.get("headline",profile.headline)
    profile.summary=request.data.get("summary",profile.summary)
    for field in ["education","experiences","projects","skills","personal_info","certifications","social_links","viewers"]:
        if field in request.data:
            try:
                val=json.loads(request.data.get(field))
                if isinstance(val,(list,dict)):profile.__setattr__(field,val)
            except:pass
    if request.FILES.get("photo"):profile.photo=request.FILES.get("photo")
    profile.save()
    return Response({"message":"Profile updated"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    try:
        file_obj=request.FILES.get("file")
        if not file_obj:return Response({"error":"No file"},status=400)
        name=request.data.get("name",file_obj.name)
        doc_type=request.data.get("type","resume").lower()
        res=Resume.objects.create(user=request.user,file=file_obj,name=name,type=doc_type)
        from .utils import extract_text
        try:
            res.extracted_text=extract_text(res.file.path)
            res.save()
        except:pass
        return Response({"message":"Uploaded","id":res.id})
    except Exception as e:return Response({"error":str(e)},status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_resumes(request):
    res=Resume.objects.filter(user=request.user).order_by('-uploaded_at')
    return Response([{"id":r.id,"name":r.name,"file":r.file.url,"type":r.type} for r in res])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rename_resume(request,id):
    try:
        resume=Resume.objects.get(id=id,user=request.user)
        resume.name=request.data.get("name",resume.name)
        resume.save()
        return Response({"message":"Renamed"})
    except Resume.DoesNotExist:return Response({"error":"Not found"},status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_resume(request,id):
    Resume.objects.filter(id=id,user=request.user).delete()
    return Response({"message":"Deleted"})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_managers(request):
    return Response(User.objects.filter(role="manager").values("id","username","email","organization_name","is_approved"))

@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_manager(request,id):
    User.objects.filter(id=id).update(is_approved=True)
    return Response({"message":"Approved"})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    users=User.objects.filter(role="user")
    data=[]
    for u in users:
        p=Profile.objects.filter(user=u).first()
        data.append({
            "id":u.id,
            "username":u.username,
            "email":u.email,
            "date_joined":u.date_joined,
            "has_pending_password":bool(p.pending_password) if p else False
        })
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request,id):
    User.objects.filter(id=id,role="user").delete()
    return Response({"message":"Deleted"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_delete_users(request):
    ids=request.data.get("ids",[])
    User.objects.filter(id__in=ids,role="user").delete()
    return Response({"message":"Bulk deleted"})

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_manager(request,id):
    User.objects.filter(id=id,role="manager").delete()
    return Response({"message":"Deleted"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_delete_managers(request):
    ids=request.data.get("ids",[])
    User.objects.filter(id__in=ids,role="manager").delete()
    return Response({"message":"Bulk deleted"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_password_change(request):
    profile=Profile.objects.get(user=request.user)
    profile.pending_password=request.data.get("password")
    profile.save()
    return Response({"message":"Request sent"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_password_change(request,id):
    profile=Profile.objects.select_related('user').get(user_id=id)
    if profile.pending_password:
        user=profile.user
        user.set_password(profile.pending_password)
        user.save()
        profile.pending_password=""
        profile.save()
    return Response({"message":"Password updated"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request,id):
    if request.user.role not in ['admin','manager']:return Response({"error":"Unauthorized"},status=403)
    user=User.objects.get(id=id)
    p=Profile.objects.get(user=user)
    return Response({
        "user_id":user.id,"name":user.username,"email":user.email,"phone":p.phone,"photo":p.photo.url if p.photo else None,
        "headline":p.headline,"summary":p.summary,"education":p.education,"experiences":p.experiences,"projects":p.projects,"skills":p.skills,"personal_info":p.personal_info,
        "social_links":p.social_links,"certifications":p.certifications
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    request.user.delete()
    return Response({"message":"Account deleted"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ats_score(request):
    return Response({"score":75})

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_company_profile(request):
    if request.user.role != 'manager':
        return Response({"error":"Unauthorized"}, status=403)
    profile, created = CompanyProfile.objects.get_or_create(
        manager=request.user,
        defaults={
            "name": request.user.organization_name or f"{request.user.username}'s Company",
            "location": "Remote",
            "website": "",
            "industry": "Technology",
            "size": "50-200 employees",
            "description": "About our company...",
            "culture": "Our work culture...",
            "benefits": [],
            "media": []
        }
    )
    if request.method == 'GET':
        return Response({
            "id": profile.id,
            "name": profile.name,
            "logo": profile.logo.url if profile.logo else None,
            "website": profile.website,
            "location": profile.location,
            "industry": profile.industry,
            "size": profile.size,
            "description": profile.description,
            "culture": profile.culture,
            "benefits": profile.benefits,
            "media": profile.media
        })
    elif request.method == 'PUT':
        name = request.data.get("name")
        website = request.data.get("website")
        location = request.data.get("location")
        industry = request.data.get("industry")
        size = request.data.get("size")
        description = request.data.get("description")
        culture = request.data.get("culture")
        benefits = request.data.get("benefits")
        media = request.data.get("media")
        
        if name is not None: profile.name = name
        if website is not None: profile.website = website
        if location is not None: profile.location = location
        if industry is not None: profile.industry = industry
        if size is not None: profile.size = size
        if description is not None: profile.description = description
        if culture is not None: profile.culture = culture
        
        if benefits is not None:
            if isinstance(benefits, str):
                profile.benefits = json.loads(benefits)
            else:
                profile.benefits = benefits
        if media is not None:
            if isinstance(media, str):
                profile.media = json.loads(media)
            else:
                profile.media = media
                
        logo_file = request.FILES.get("logo")
        if logo_file:
            profile.logo = logo_file
            
        profile.save()
        return Response({
            "id": profile.id,
            "name": profile.name,
            "logo": profile.logo.url if profile.logo else None,
            "website": profile.website,
            "location": profile.location,
            "industry": profile.industry,
            "size": profile.size,
            "description": profile.description,
            "culture": profile.culture,
            "benefits": profile.benefits,
            "media": profile.media
        })

@api_view(['GET'])
def get_public_company_profile(request, manager_id):
    try:
        manager = User.objects.get(id=manager_id, role='manager')
    except User.DoesNotExist:
        return Response({"error": "Manager not found"}, status=404)
    profile, created = CompanyProfile.objects.get_or_create(
        manager=manager,
        defaults={
            "name": manager.organization_name or f"{manager.username}'s Company",
            "location": "Remote",
            "website": "",
            "industry": "Technology",
            "size": "50-200 employees",
            "description": "About our company...",
            "culture": "Our work culture...",
            "benefits": [],
            "media": []
        }
    )
    from jobs.models import Job
    jobs = Job.objects.filter(created_by=manager, is_draft=False)
    jobs_data = [{
        "id": j.id,
        "title": j.title,
        "location": j.location,
        "work_mode": j.work_mode,
        "job_type": j.job_type,
        "salary": j.salary,
        "deadline": j.deadline,
        "experience_level": j.experience_level
    } for j in jobs]
    return Response({
        "id": profile.id,
        "name": profile.name,
        "logo": profile.logo.url if profile.logo else None,
        "website": profile.website,
        "location": profile.location,
        "industry": profile.industry,
        "size": profile.size,
        "description": profile.description,
        "culture": profile.culture,
        "benefits": profile.benefits,
        "media": profile.media,
        "open_jobs": jobs_data
    })

