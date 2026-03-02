from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_taxpayer, name='register'),
    path('login/', views.login_taxpayer, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Taxpayer endpoints
    path('profile/', views.taxpayer_profile, name='profile'),
    path('payments/', views.payments, name='payments'),
    
    # Admin endpoints
    path('admin/taxpayers/', views.admin_all_taxpayers, name='admin_taxpayers'),
    path('admin/taxpayers/<int:pk>/', views.admin_taxpayer_detail, name='admin_taxpayer_detail'),
    path('admin/payments/', views.admin_all_payments, name='admin_payments'),
    path('admin/unpaid/', views.admin_unpaid_taxpayers, name='admin_unpaid'),
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/taxpayer/create/', views.admin_create_taxpayer, name='admin_create_taxpayer'),
]
