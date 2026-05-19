from django.db import models
from users.models import User
class Job(models.Model):
    title=models.CharField(max_length=255)
    description=models.TextField()
    salary=models.CharField(max_length=50)
    skills=models.CharField(max_length=255)
    created_by=models.ForeignKey(User,on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)
    deadline=models.DateTimeField(null=True,blank=True)
    min_ats_score=models.IntegerField(default=50)
    is_draft=models.BooleanField(default=False)
    scheduled_publish_at=models.DateTimeField(null=True,blank=True)
    location=models.CharField(max_length=255,blank=True)
    work_mode=models.CharField(max_length=20,choices=[('remote','Remote'),('on-site','On-site'),('hybrid','Hybrid')],default='on-site')
    experience_level=models.CharField(max_length=50,blank=True)
    job_type=models.CharField(max_length=20,choices=[('full-time','Full-time'),('internship','Internship')],default='full-time')

class JobQuestion(models.Model):
    job=models.ForeignKey(Job,on_delete=models.CASCADE,related_name='questions')
    question=models.TextField()
    question_type=models.CharField(
        max_length=20,
        choices=[
            ('mcq','MCQ'),
            ('textarea','Textarea')
        ]
    )
    options=models.JSONField(default=list,blank=True)
    expected_answer=models.TextField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.question
