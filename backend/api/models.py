from django.db import models
from django.contrib.auth.models import User

class CalendarEvent(models.Model):
    CATEGORY_CHOICES = [
        ('work', 'Work'),
        ('personal', 'Personal'),
        ('meeting', 'Meeting'),
        ('other', 'Other'),
    ]
    
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.CharField(max_length=5)  # Format: "HH:MM"
    end_time = models.CharField(max_length=5)    # Format: "HH:MM"
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='work')
    completed = models.BooleanField(default=False)
    color = models.CharField(max_length=20, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_events')
    
    def __str__(self):
        return f"{self.title} on {self.date} at {self.start_time}"

class Task(models.Model):
    TAG_CHOICES = [
        ('Due soon', 'Due soon'),
        ('Inbox', 'Inbox'),
    ]
    
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    due_date = models.DateField()
    duration = models.CharField(max_length=10)  # Format: "2h", "30m", "1h 30m"
    tag = models.CharField(max_length=20, choices=TAG_CHOICES, default='Inbox')
    completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    def __str__(self):
        return f"{self.title} - Due: {self.due_date}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    theme_preference = models.CharField(max_length=20, default='dark')
    
    def __str__(self):
        return f"{self.user.username}'s profile"
