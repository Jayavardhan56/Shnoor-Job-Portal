from django.urls import path
from .views import login_view, register_view, get_managers, approve_manager,get_all_users, delete_user, bulk_delete_users, delete_manager, bulk_delete_managers, update_profile,upload_resume, get_profile, get_resumes, delete_resume, rename_resume, ats_score, request_password_change, approve_password_change, get_user_profile, delete_account, manage_company_profile, get_public_company_profile, forgot_password_view

urlpatterns=[
    path('login/',login_view),
    path('register/',register_view),
    path('managers/',get_managers),
    path('approve/<int:id>/',approve_manager),
    path('admin/users/',get_all_users),
    path('admin/users/<int:id>/',delete_user),
    path('admin/users/bulk-delete/',bulk_delete_users),
    path('admin/managers/<int:id>/',delete_manager),
    path('admin/managers/bulk-delete/',bulk_delete_managers),
    path('profile/update/',update_profile),
    path('profile/resume/',upload_resume),
    path('profile/',get_profile),
    path('profile/resumes/',get_resumes),
    path('profile/resume/<int:id>/',delete_resume),
    path('profile/resume/rename/<int:id>/', rename_resume),
    path('profile/request-password/',request_password_change),
    path('admin/approve-password/<int:id>/',approve_password_change),
    path('forgot-password/', forgot_password_view),
    path('user-profile/<int:id>/',get_user_profile),
    path('profile/delete/',delete_account),
    path('ats-score/',ats_score),
    path('company/profile/',manage_company_profile),
    path('company/public/<int:manager_id>/',get_public_company_profile),
]

