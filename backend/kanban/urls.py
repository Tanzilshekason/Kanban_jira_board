from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('api/auth/register/', views.RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/profile/', views.UserProfileView.as_view(), name='profile'),
    path('api/auth/users/', views.UserListView.as_view(), name='user-list'),
    
    # Tasks
    path('api/tasks/', views.TaskListCreateView.as_view(), name='task-list'),
    path('api/tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    
    # Board Columns
    path('api/board/columns/', views.BoardColumnsView.as_view(), name='board-columns'),
    
    # Assignment History
    path('api/tasks/<int:task_id>/assignment-history/', views.AssignmentHistoryListView.as_view(), name='assignment-history'),
    
    # Time Logs
    path('api/tasks/<int:task_id>/time-logs/', views.TimeLogListView.as_view(), name='time-log-list'),
    path('api/tasks/<int:task_id>/time-logs/create/', views.TimeLogCreateView.as_view(), name='time-log-create'),
    
    # Reports
    path('api/reports/time/', views.ReportTimeView.as_view(), name='report-time'),
    
    # Health Check
    path('api/health/', views.HealthCheckView.as_view(), name='health-check'),
]