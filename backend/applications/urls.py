from django.urls import path
from .views import apply_job,user_applications,job_applicants,update_status,manager_applicants,trigger_assessment,reanalyze_application,post_review,get_reviews, ai_resume_review, bulk_update_status, submit_assessment, delete_application
urlpatterns=[
    path('apply/',apply_job),
    path('user/',user_applications),
    path('delete/<int:id>/',delete_application),
    path('job/<int:job_id>/',job_applicants),
    path('update/<int:app_id>/',update_status),
    path('bulk-update/',bulk_update_status),
    path('trigger-assessment/',trigger_assessment),
    path('submit-assessment/',submit_assessment),
    path('manager-all/',manager_applicants),
    path('reanalyze/<int:app_id>/',reanalyze_application),
    path('reviews/post/',post_review),
    path('reviews/',get_reviews),
    path('ai-review/',ai_resume_review),
]