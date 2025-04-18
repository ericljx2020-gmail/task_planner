from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CalendarEvent, Task, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'theme_preference']

class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ['id', 'title', 'date', 'start_time', 'end_time', 'category', 'completed', 'color']
    
    def create(self, validated_data):
        user = self.context['request'].user
        calendar_event = CalendarEvent.objects.create(user=user, **validated_data)
        return calendar_event

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'due_date', 'duration', 'tag', 'completed']
    
    def create(self, validated_data):
        user = self.context['request'].user
        task = Task.objects.create(user=user, **validated_data)
        return task 