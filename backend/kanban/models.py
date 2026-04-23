from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    STATUS_CHOICES = [
        ('backlog', 'Backlog'),
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('in_review', 'In Review'),
        ('testing', 'Testing'),
        ('done', 'Done'),
        ('blocked', 'Blocked'),
        ('archived', 'Archived'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='backlog')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    time_estimate = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    due_date = models.DateField(null=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['status', 'order', 'created_at']
    
    def __str__(self):
        return self.title

class AssignmentHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='assignment_history')
    old_assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='old_assignments')
    new_assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='new_assignments')
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_changes')
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f'{self.task.title} assignment changed'

class TimeLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_logs')
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(blank=True, default='')
    logged_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-logged_at']
    
    def __str__(self):
        return f'{self.hours}h on {self.task.title}'
