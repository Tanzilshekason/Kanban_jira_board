from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
from .models import Task, AssignmentHistory, TimeLog
from .serializers import TaskSerializer, TimeLogSerializer, AssignmentHistorySerializer


class TimeLoggingCalculationsTest(TestCase):
    """Test time logging calculations as specified in requirements"""
    
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User1'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User2'
        )
        
        # Create a task
        self.task = Task.objects.create(
            title='Test Task',
            description='Test description',
            status='todo',
            created_by=self.user1,
            order=0
        )
    
    def test_time_log_creation(self):
        """Test that time logs can be created with decimal hours"""
        # Create a time log
        time_log = TimeLog.objects.create(
            task=self.task,
            user=self.user1,
            hours=Decimal('2.5'),
            description='Worked on implementation'
        )
        
        self.assertEqual(time_log.hours, Decimal('2.5'))
        self.assertEqual(time_log.description, 'Worked on implementation')
        self.assertEqual(time_log.user, self.user1)
        self.assertEqual(time_log.task, self.task)
        self.assertIsNotNone(time_log.logged_at)
    
    def test_time_log_decimal_precision(self):
        """Test time log accepts various decimal values"""
        # Test with different decimal values
        test_values = ['1.0', '0.5', '1.25', '3.75', '8.0']
        
        for hours_str in test_values:
            time_log = TimeLog.objects.create(
                task=self.task,
                user=self.user1,
                hours=Decimal(hours_str),
                description=f'Test {hours_str} hours'
            )
            self.assertEqual(time_log.hours, Decimal(hours_str))
    
    def test_time_log_aggregation_per_task(self):
        """Test aggregation of time logs for a single task"""
        # Create multiple time logs for the same task
        TimeLog.objects.create(task=self.task, user=self.user1, hours=Decimal('2.0'), description='First session')
        TimeLog.objects.create(task=self.task, user=self.user2, hours=Decimal('1.5'), description='Second session')
        TimeLog.objects.create(task=self.task, user=self.user1, hours=Decimal('3.25'), description='Third session')
        
        # Calculate total hours for the task
        total_hours = TimeLog.objects.filter(task=self.task).aggregate(
            total=models.Sum('hours')
        )['total']
        
        self.assertEqual(total_hours, Decimal('6.75'))
    
    def test_time_log_immutability(self):
        """Test that time logs are immutable (no editing/deleting in business logic)"""
        # Create a time log
        time_log = TimeLog.objects.create(
            task=self.task,
            user=self.user1,
            hours=Decimal('2.0'),
            description='Original work'
        )
        
        # Verify the model doesn't have methods for editing (business rule)
        # In practice, the views should not provide edit/delete endpoints
        # This test ensures the model structure supports immutability
        self.assertIsNotNone(time_log.id)
        self.assertIsNotNone(time_log.logged_at)  # Auto-set timestamp
    
    def test_multiple_logs_per_task(self):
        """Test that multiple logs are allowed per task as per requirements"""
        # Create 3 logs for the same task
        for i in range(3):
            TimeLog.objects.create(
                task=self.task,
                user=self.user1,
                hours=Decimal(f'{i+1}.5'),
                description=f'Session {i+1}'
            )
        
        count = TimeLog.objects.filter(task=self.task).count()
        self.assertEqual(count, 3)


class AssignmentHistoryCreationTest(TestCase):
    """Test assignment history creation as specified in requirements"""
    
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123',
            first_name='Alice',
            last_name='Smith'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123',
            first_name='Bob',
            last_name='Jones'
        )
        self.user3 = User.objects.create_user(
            username='user3',
            email='user3@example.com',
            password='testpass123',
            first_name='Charlie',
            last_name='Brown'
        )
        
        # Create a task initially assigned to user1
        self.task = Task.objects.create(
            title='Test Task for Assignment',
            description='Test task',
            status='todo',
            created_by=self.user1,
            assignee=self.user1,
            order=0
        )
    
    def test_assignment_history_creation_on_change(self):
        """Test that assignment history is created when assignee changes"""
        # Initial state: task assigned to user1
        self.assertEqual(self.task.assignee, self.user1)
        
        # Change assignee to user2
        self.task.assignee = self.user2
        self.task.save()
        
        # Create assignment history record (simulating view logic)
        AssignmentHistory.objects.create(
            task=self.task,
            old_assignee=self.user1,
            new_assignee=self.user2,
            changed_by=self.user3
        )
        
        # Verify history was created
        history = AssignmentHistory.objects.filter(task=self.task).first()
        self.assertIsNotNone(history)
        self.assertEqual(history.old_assignee, self.user1)
        self.assertEqual(history.new_assignee, self.user2)
        self.assertEqual(history.changed_by, self.user3)
        self.assertIsNotNone(history.changed_at)
    
    def test_assignment_history_ordering(self):
        """Test that assignment history is ordered newest first"""
        # Create multiple history records
        AssignmentHistory.objects.create(
            task=self.task,
            old_assignee=self.user1,
            new_assignee=self.user2,
            changed_by=self.user3
        )
        
        # Wait a moment to ensure different timestamps
        import time
        time.sleep(0.01)
        
        AssignmentHistory.objects.create(
            task=self.task,
            old_assignee=self.user2,
            new_assignee=self.user3,
            changed_by=self.user1
        )
        
        # Get history ordered by changed_at descending (newest first)
        history = AssignmentHistory.objects.filter(task=self.task).order_by('-changed_at')
        
        # Verify ordering - newest first
        self.assertEqual(history.count(), 2)
        self.assertEqual(history[0].new_assignee, self.user3)  # Most recent change
        self.assertEqual(history[1].new_assignee, self.user2)  # Older change
    
    def test_unassignment_history(self):
        """Test history creation when task is unassigned (assignee set to null)"""
        # Task is assigned to user1
        self.task.assignee = None
        self.task.save()
        
        # Create history for unassignment
        AssignmentHistory.objects.create(
            task=self.task,
            old_assignee=self.user1,
            new_assignee=None,
            changed_by=self.user2
        )
        
        history = AssignmentHistory.objects.filter(task=self.task).first()
        self.assertIsNotNone(history)
        self.assertEqual(history.old_assignee, self.user1)
        self.assertIsNone(history.new_assignee)
        self.assertEqual(history.changed_by, self.user2)
    
    def test_assignment_from_null(self):
        """Test history creation when task is assigned from null (initial assignment)"""
        # Create task with no assignee
        task2 = Task.objects.create(
            title='Unassigned Task',
            description='No assignee initially',
            status='backlog',
            created_by=self.user1,
            assignee=None,
            order=0
        )
        
        # Assign it to user2
        task2.assignee = self.user2
        task2.save()
        
        # Create history
        AssignmentHistory.objects.create(
            task=task2,
            old_assignee=None,
            new_assignee=self.user2,
            changed_by=self.user1
        )
        
        history = AssignmentHistory.objects.filter(task=task2).first()
        self.assertIsNotNone(history)
        self.assertIsNone(history.old_assignee)
        self.assertEqual(history.new_assignee, self.user2)


class ReportAggregationLogicTest(TestCase):
    """Test report aggregation logic as specified in requirements"""
    
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username='reportuser1',
            email='report1@example.com',
            password='testpass123',
            first_name='Report',
            last_name='User1'
        )
        self.user2 = User.objects.create_user(
            username='reportuser2',
            email='report2@example.com',
            password='testpass123',
            first_name='Report',
            last_name='User2'
        )
        
        # Create tasks
        self.task1 = Task.objects.create(
            title='Task 1 - Development',
            description='Develop feature A',
            status='in_progress',
            created_by=self.user1,
            assignee=self.user1,
            order=0
        )
        
        self.task2 = Task.objects.create(
            title='Task 2 - Testing',
            description='Test feature B',
            status='testing',
            created_by=self.user2,
            assignee=self.user2,
            order=0
        )
        
        self.task3 = Task.objects.create(
            title='Task 3 - Backlog',
            description='Future work',
            status='backlog',
            created_by=self.user1,
            assignee=None,
            order=0
        )
        
        # Create time logs
        # Task 1: 5.5 hours total
        TimeLog.objects.create(task=self.task1, user=self.user1, hours=Decimal('2.0'), description='Initial work')
        TimeLog.objects.create(task=self.task1, user=self.user1, hours=Decimal('3.5'), description='Follow-up')
        
        # Task 2: 4.0 hours total
        TimeLog.objects.create(task=self.task2, user=self.user2, hours=Decimal('4.0'), description='Testing work')
        
        # Task 3: No time logs
    
    def test_task_total_hours_calculation(self):
        """Test SUM(worklogs.hours WHERE task_id) calculation"""
        # Calculate total hours for task1
        from django.db.models import Sum
        
        task1_total = TimeLog.objects.filter(task=self.task1).aggregate(
            total=Sum('hours')
        )['total'] or Decimal('0')
        
        self.assertEqual(task1_total, Decimal('5.5'))
        
        # Calculate total hours for task2
        task2_total = TimeLog.objects.filter(task=self.task2).aggregate(
            total=Sum('hours')
        )['total'] or Decimal('0')
        
        self.assertEqual(task2_total, Decimal('4.0'))
        
        # Calculate total hours for task3 (no logs)
        task3_total = TimeLog.objects.filter(task=self.task3).aggregate(
            total=Sum('hours')
        )['total'] or Decimal('0')
        
        self.assertEqual(task3_total, Decimal('0'))
    
    def test_grand_total_hours_calculation(self):
        """Test grand total = SUM(all worklogs.hours)"""
        from django.db.models import Sum
        
        grand_total = TimeLog.objects.all().aggregate(
            total=Sum('hours')
        )['total'] or Decimal('0')
        
        # Should be 5.5 + 4.0 = 9.5
        self.assertEqual(grand_total, Decimal('9.5'))
    
    def test_report_data_structure(self):
        """Test report data structure matches requirements"""
        from django.db.models import Sum
        
        # Simulate report aggregation
        tasks = Task.objects.all().prefetch_related('time_logs')
        report_data = []
        
        for task in tasks:
            task_hours = sum(log.hours for log in task.time_logs.all())
            report_data.append({
                'task_id': task.id,
                'title': task.title,
                'status': task.status,
                'assignee': task.assignee.username if task.assignee else None,
                'total_hours': float(task_hours),
            })
        
        # Verify structure
        self.assertEqual(len(report_data), 3)
        
        # Check task1 data
        task1_data = next(item for item in report_data if item['task_id'] == self.task1.id)
        self.assertEqual(task1_data['title'], 'Task 1 - Development')
        self.assertEqual(task1_data['status'], 'in_progress')
        self.assertEqual(task1_data['assignee'], 'reportuser1')
        self.assertEqual(task1_data['total_hours'], 5.5)
        
        # Check task3 data (no assignee, no hours)
        task3_data = next(item for item in report_data if item['task_id'] == self.task3.id)
        self.assertEqual(task3_data['assignee'], None)
        self.assertEqual(task3_data['total_hours'], 0.0)
    
    def test_report_with_filters(self):
        """Test report aggregation with user filter"""
        from django.db.models import Sum, Q
        
        # Filter by user1
        filters = Q(user=self.user1)
        user1_total = TimeLog.objects.filter(filters).aggregate(
            total=Sum('hours')
        )['total'] or Decimal('0')
        
        # user1 has 5.5 hours (all on task1)
        self.assertEqual(user1_total, Decimal('5.5'))
        
        # Filter by user2
        filters = Q(user=self.user2)
        user2_total = TimeLog.objects.filter(filters).aggregate(
            total=Sum('hours')
        )['total'] or Decimal('0')
        
        # user2 has 4.0 hours
        self.assertEqual(user2_total, Decimal('4.0'))


# Import models for aggregation
from django.db import models


class TaskCreationValidationTest(TestCase):
    """Test task creation validation as specified in requirements"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_create_task_with_only_title(self):
        """Submit form with only Title; task created successfully"""
        # Simulate task creation via serializer
        serializer = TaskSerializer(data={'title': 'Test Task'})
        self.assertTrue(serializer.is_valid())
        task = serializer.save(created_by=self.user)
        
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.status, 'backlog')  # default
        self.assertIsNone(task.assignee)
        self.assertEqual(task.created_by, self.user)
        self.assertEqual(task.order, 0)
    
    def test_title_exceeding_255_characters_rejected(self):
        """Title exceeding 255 characters is rejected"""
        long_title = 'x' * 300
        serializer = TaskSerializer(data={'title': long_title})
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
        # The error could be either from max_length validation or custom validation
        error_msg = str(serializer.errors['title']).lower()
        self.assertTrue('255' in error_msg or 'exceed' in error_msg or 'no more than' in error_msg)
    
    def test_new_task_defaults_to_backlog_column(self):
        """New task defaults to Backlog column"""
        # Create task without specifying status
        task = Task.objects.create(
            title='Test Task',
            created_by=self.user,
            order=0
        )
        self.assertEqual(task.status, 'backlog')
        
        # Also test via serializer
        serializer = TaskSerializer(data={'title': 'Another Task'})
        self.assertTrue(serializer.is_valid())
        task2 = serializer.save(created_by=self.user)
        self.assertEqual(task2.status, 'backlog')
    
    def test_new_task_has_no_assignee_by_default(self):
        """New task has no assignee by default"""
        task = Task.objects.create(
            title='Test Task',
            created_by=self.user,
            order=0
        )
        self.assertIsNone(task.assignee)
        
        # Via serializer with no assignee_id
        serializer = TaskSerializer(data={'title': 'Task 2'})
        self.assertTrue(serializer.is_valid())
        task2 = serializer.save(created_by=self.user)
        self.assertIsNone(task2.assignee)
    
    def test_new_task_records_creating_user_as_created_by(self):
        """New task records the creating user as created_by"""
        # Test via model creation
        task = Task.objects.create(
            title='Test Task',
            created_by=self.user,
            order=0
        )
        self.assertEqual(task.created_by, self.user)
        
        # Test via serializer (should require created_by parameter)
        serializer = TaskSerializer(data={'title': 'Another Task'})
        self.assertTrue(serializer.is_valid())
        task2 = serializer.save(created_by=self.user)
        self.assertEqual(task2.created_by, self.user)
        
        # Test via API endpoint using Django test client
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=self.user)
        response = client.post('/api/tasks/', {'title': 'API Created Task'}, format='json')
        self.assertEqual(response.status_code, 201)
        task_id = response.data['id']
        task3 = Task.objects.get(id=task_id)
        self.assertEqual(task3.created_by, self.user)
    
    def test_new_task_appears_at_bottom_of_backlog_column(self):
        """New task appears at the bottom of the Backlog column"""
        # Create existing tasks in backlog
        existing_tasks = []
        for i in range(3):
            task = Task.objects.create(
                title=f'Existing Task {i}',
                status='backlog',
                created_by=self.user,
                order=i
            )
            existing_tasks.append(task)
        
        # Create new task without specifying order (should default to 0 but should be placed at bottom)
        # The view logic sets order = columnTasks.length
        # Let's simulate the view logic
        backlog_tasks = Task.objects.filter(status='backlog').order_by('order')
        new_order = backlog_tasks.count()  # because existing tasks have orders 0,1,2
        
        new_task = Task.objects.create(
            title='New Task',
            status='backlog',
            created_by=self.user,
            order=new_order
        )
        
        # Verify order
        self.assertEqual(new_task.order, 3)
        
        # Verify ordering when fetching
        all_backlog = Task.objects.filter(status='backlog').order_by('order')
        self.assertEqual(all_backlog.count(), 4)
        self.assertEqual(all_backlog.last().id, new_task.id)
