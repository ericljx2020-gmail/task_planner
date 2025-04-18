from django.contrib import admin
from .models import CalendarEvent, Task, UserProfile

# Register models
admin.site.register(CalendarEvent)
admin.site.register(Task)
admin.site.register(UserProfile)
