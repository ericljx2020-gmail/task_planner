from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for viewsets
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'events', views.CalendarEventViewSet, basename='event')
router.register(r'tasks', views.TaskViewSet, basename='task')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/user/', views.get_user_info, name='user-info'),
    path('csrf-token/', views.get_csrf_token, name='csrf-token'),
    
    # DRF authentication
    path('api-auth/', include('rest_framework.urls')),
] 