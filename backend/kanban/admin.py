from django.contrib import admin
from .models import Task, AssignmentHistory, TimeLog

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'assignee', 'created_by', 'due_date', 'created_at')
    list_filter = ('status', 'assignee', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)

@admin.register(AssignmentHistory)
class AssignmentHistoryAdmin(admin.ModelAdmin):
    list_display = ('task', 'old_assignee', 'new_assignee', 'changed_by', 'changed_at')
    list_filter = ('changed_at',)
    search_fields = ('task__title', 'changed_by__username')

@admin.register(TimeLog)
class TimeLogAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'hours', 'logged_at')
    list_filter = ('logged_at', 'user')
    search_fields = ('task__title', 'user__username', 'description')
