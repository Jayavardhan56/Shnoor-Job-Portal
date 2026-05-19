from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    email=models.EmailField(unique=True)
    role=models.CharField(max_length=20)
    is_approved=models.BooleanField(default=True)
    organization_name=models.CharField(max_length=255,blank=True)

class Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    phone=models.CharField(max_length=15,blank=True)
    photo=models.ImageField(upload_to='profiles/',blank=True,null=True)
    headline=models.CharField(max_length=255,blank=True)
    summary=models.TextField(blank=True)
    education=models.JSONField(default=list,blank=True)
    experiences=models.JSONField(default=list,blank=True)
    projects=models.JSONField(default=list,blank=True)
    skills=models.JSONField(default=list,blank=True)
    personal_info=models.JSONField(default=dict,blank=True)
    certifications=models.JSONField(default=list,blank=True)
    social_links=models.JSONField(default=dict,blank=True)
    viewers=models.JSONField(default=list,blank=True)
    pending_password=models.CharField(max_length=128,blank=True,null=True)

    def __str__(self):
        return self.user.email
    
class Resume(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    file=models.FileField(upload_to='resumes/')
    name=models.CharField(max_length=255)
    type=models.CharField(max_length=50,default='resume')
    uploaded_at=models.DateTimeField(auto_now_add=True)
    extracted_text=models.TextField(blank=True,null=True)

@receiver(post_save,sender=User)
def create_profile(sender,instance,created,**kwargs):
    if created:
        Profile.objects.create(user=instance)

class CompanyProfile(models.Model):
    manager=models.OneToOneField(User,on_delete=models.CASCADE,related_name="company_profile")
    name=models.CharField(max_length=255)
    logo=models.ImageField(upload_to='company_logos/',blank=True,null=True)
    website=models.CharField(max_length=255,blank=True)
    location=models.CharField(max_length=255,blank=True)
    industry=models.CharField(max_length=255,blank=True)
    size=models.CharField(max_length=255,blank=True)
    description=models.TextField(blank=True)
    culture=models.TextField(blank=True)
    benefits=models.JSONField(default=list,blank=True)
    media=models.JSONField(default=list,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)