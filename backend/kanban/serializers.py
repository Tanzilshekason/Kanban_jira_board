from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Task, AssignmentHistory, TimeLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'username': {'required': False}  # We'll generate it from email
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Use email as username if username not provided
        if not attrs.get('username'):
            attrs['username'] = attrs['email']
        
        return attrs

    def create(self, validated_data):
        # Remove password2 from validated_data
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='assignee', write_only=True, required=False, allow_null=True
    )
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'time_estimate', 'assignee', 'assignee_id', 'created_by', 'due_date', 'order', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']
        extra_kwargs = {
            'title': {'required': True, 'max_length': 255},
            'description': {'required': False, 'allow_blank': True},
            'status': {'required': False},
            'priority': {'required': False},
            'due_date': {'required': False, 'allow_null': True},
            'time_estimate': {'required': False, 'allow_null': True},
            'order': {'required': False},
        }

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title is required.")
        if len(value) > 255:
            raise serializers.ValidationError("Title cannot exceed 255 characters.")
        return value.strip()

class AssignmentHistorySerializer(serializers.ModelSerializer):
    old_assignee = UserSerializer(read_only=True)
    new_assignee = UserSerializer(read_only=True)
    changed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = AssignmentHistory
        fields = ['id', 'task', 'old_assignee', 'new_assignee', 'changed_by', 'changed_at']

class TimeLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TimeLog
        fields = ['id', 'task', 'user', 'hours', 'description', 'logged_at']
        read_only_fields = ['user', 'logged_at']