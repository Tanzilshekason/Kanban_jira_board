from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db.models import Q
from .serializers import RegisterSerializer, UserSerializer, TaskSerializer, AssignmentHistorySerializer, TimeLogSerializer
from .models import Task, AssignmentHistory, TimeLog

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        return User.objects.all().order_by('username')

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Task.objects.all().select_related('assignee', 'created_by')
        return Task.objects.filter(
            Q(created_by=user) | Q(assignee=user)
        ).select_related('assignee', 'created_by')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Task.objects.all()
    
    def perform_update(self, serializer):
        instance = serializer.instance
        old_assignee = instance.assignee
        new_assignee = serializer.validated_data.get('assignee', instance.assignee)
        serializer.save()
        if old_assignee != new_assignee:
            AssignmentHistory.objects.create(
                task=instance,
                old_assignee=old_assignee,
                new_assignee=new_assignee,
                changed_by=self.request.user
            )

class AssignmentHistoryListView(generics.ListAPIView):
    serializer_class = AssignmentHistorySerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return AssignmentHistory.objects.filter(task_id=task_id).select_related('old_assignee', 'new_assignee', 'changed_by')

class TimeLogCreateView(generics.CreateAPIView):
    serializer_class = TimeLogSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TimeLogListView(generics.ListAPIView):
    serializer_class = TimeLogSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return TimeLog.objects.filter(task_id=task_id).select_related('user')

class ReportTimeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        from django.db.models import Sum, Q
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        # Get query parameters
        user_id = request.query_params.get('user_id')
        task_id = request.query_params.get('task_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        group_by = request.query_params.get('group_by', 'task')  # task, user, day
        
        # Build filters on Task
        filters = Q(time_estimate__isnull=False) & Q(time_estimate__gt=0)
        
        if user_id:
            filters &= Q(assignee_id=user_id)
        
        if task_id:
            filters &= Q(id=task_id)
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                filters &= Q(updated_at__gte=start)
            except ValueError:
                pass
        
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d')
                end = end + timedelta(days=1)
                filters &= Q(updated_at__lt=end)
            except ValueError:
                pass
        
        # Query tasks
        tasks = Task.objects.filter(filters).select_related('assignee')
        
        if group_by == 'task':
            task_data = {}
            for task in tasks:
                if task.id not in task_data:
                    task_data[task.id] = {
                        'task_id': task.id,
                        'title': task.title,
                        'status': task.status,
                        'assignee': task.assignee.username if task.assignee else None,
                        'total_hours': float(task.time_estimate or 0),
                        'logs': []
                    }
            
            data = list(task_data.values())
            grand_total = sum(item['total_hours'] for item in data)
            
            return Response({
                'group_by': 'task',
                'data': data,
                'grand_total_hours': grand_total,
                'filters': {
                    'user_id': user_id,
                    'task_id': task_id,
                    'start_date': start_date,
                    'end_date': end_date
                }
            })
        
        elif group_by == 'user':
            user_data = {}
            for task in tasks:
                user = task.assignee
                if not user:
                    continue
                if user.id not in user_data:
                    user_data[user.id] = {
                        'user_id': user.id,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'total_hours': 0,
                        'tasks': []
                    }
                hours = float(task.time_estimate or 0)
                user_data[user.id]['total_hours'] += hours
                user_data[user.id]['tasks'].append({
                    'task_id': task.id,
                    'title': task.title,
                    'hours': hours
                })
            
            data = list(user_data.values())
            grand_total = sum(item['total_hours'] for item in data)
            
            return Response({
                'group_by': 'user',
                'data': data,
                'grand_total_hours': grand_total,
                'filters': {
                    'user_id': user_id,
                    'task_id': task_id,
                    'start_date': start_date,
                    'end_date': end_date
                }
            })
        
        elif group_by == 'day':
            day_data = {}
            for task in tasks:
                day_str = task.updated_at.strftime('%Y-%m-%d')
                if day_str not in day_data:
                    day_data[day_str] = {
                        'date': day_str,
                        'total_hours': 0,
                        'logs': []
                    }
                hours = float(task.time_estimate or 0)
                day_data[day_str]['total_hours'] += hours
                day_data[day_str]['logs'].append({
                    'task_id': task.id,
                    'task_title': task.title,
                    'hours': hours,
                    'user': task.assignee.username if task.assignee else 'Unassigned',
                    'description': 'Estimated/Logged time'
                })
            
            data = list(day_data.values())
            grand_total = sum(item['total_hours'] for item in data)
            
            return Response({
                'group_by': 'day',
                'data': data,
                'grand_total_hours': grand_total,
                'filters': {
                    'user_id': user_id,
                    'task_id': task_id,
                    'start_date': start_date,
                    'end_date': end_date
                }
            })
        
        else:
            # Default
            data = []
            for task in tasks:
                data.append({
                    'task_id': task.id,
                    'title': task.title,
                    'status': task.status,
                    'assignee': task.assignee.username if task.assignee else None,
                    'total_hours': float(task.time_estimate or 0),
                })
            grand_total = sum(item['total_hours'] for item in data)
            return Response({
                'tasks': data,
                'grand_total_hours': grand_total
            })

class BoardColumnsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        columns = [
            {'id': 'todo', 'title': 'To Do', 'order': 1},
            {'id': 'in_progress', 'title': 'In Progress', 'order': 2},
            {'id': 'in_review', 'title': 'In Review', 'order': 3},
            {'id': 'testing', 'title': 'Testing', 'order': 4},
            {'id': 'done', 'title': 'Done', 'order': 5},
            {'id': 'blocked', 'title': 'Blocked', 'order': 6},
            {'id': 'archived', 'title': 'Archived', 'order': 7},
            {'id': 'backlog', 'title': 'Backlog', 'order': 8},
        ]
        return Response(columns)


class HealthCheckView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        return Response({"status": "healthy", "service": "vibeflow-backend"})
