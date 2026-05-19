from django.urls import path
from .views import create_job,get_jobs,manager_jobs,delete_job,bulk_delete_jobs,update_job,get_job_questions,get_draft_jobs,get_scheduled_jobs,get_job,admin_manager_details
urlpatterns=[
    path('bulk-delete/',bulk_delete_jobs),
    path('create/',create_job),
    path('drafts/',get_draft_jobs),
    path('scheduled/',get_scheduled_jobs),
    path('all/',get_jobs),
    path('my/',manager_jobs),
    path('admin/manager/<int:id>/',admin_manager_details),
    path('update/<int:id>/',update_job),
    path('detail/<int:id>/',get_job),
    path('<int:id>/',delete_job),
    path('questions/<int:id>/',get_job_questions),
]