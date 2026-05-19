from django.db import models
from users.models import User, Resume
from jobs.models import Job
class Application(models.Model):
    STATUS_CHOICES=(
        ('applied', 'Applied'),
        ('interviewing', 'Interviewing'),
        ('shortlisted', 'Shortlisted'),
        ('assessment_pending', 'Assessment Pending'),
        ('assessment_completed', 'Assessment Completed'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected')
    )
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    job=models.ForeignKey(Job,on_delete=models.CASCADE)
    resume=models.ForeignKey(Resume,on_delete=models.CASCADE,null=True,blank=True)
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='applied')
    assessment_score=models.FloatField(default=0.0)
    assessment_completed=models.BooleanField(default=False)
    ats_score=models.FloatField(default=0.0)
    ai_analysis=models.TextField(null=True,blank=True)
    match_highlights=models.JSONField(null=True,blank=True)
    applied_at=models.DateTimeField(auto_now_add=True)
    screening_answers=models.JSONField(default=dict)
    class Meta:
        unique_together = ('user', 'job')
class InterviewReview(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    job=models.ForeignKey(Job,on_delete=models.CASCADE)
    technical_difficulty=models.IntegerField(default=5)
    process_clarity=models.IntegerField(default=5)
    interviewer_behavior=models.IntegerField(default=5)
    on_boarding_experience=models.IntegerField(default=5)
    overall_rating=models.IntegerField(default=5)
    review_text=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.user.username} - {self.job.title}"
