from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from .models import CalendarEvent, Task, UserProfile
from .serializers import UserSerializer, UserProfileSerializer, CalendarEventSerializer, TaskSerializer
import json
from rest_framework.views import APIView
from django.conf import settings
import os
import re

# Create your views here.

# Viewsets for our models
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

class CalendarEventViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CalendarEvent.objects.filter(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

# Authentication views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data['password'])
        user.save()
        
        # Create a profile for the user
        UserProfile.objects.create(user=user)
        
        # Create response with user data
        response = Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Ensure CSRF cookie is set
        from django.middleware.csrf import get_token
        get_token(request)
        
        return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        login(request, user)
        # Prepare response with user data
        response_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
        
        # Create response object
        response = Response(response_data, status=status.HTTP_200_OK)
        
        # Ensure CSRF cookie is set
        from django.middleware.csrf import get_token
        get_token(request)
        
        return response
    return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    View to get a CSRF token cookie.
    Frontend can call this endpoint to get a CSRF token before making authenticated requests.
    """
    from django.middleware.csrf import get_token
    get_token(request)
    return Response({"detail": "CSRF cookie set"}, status=status.HTTP_200_OK)

class ChatAddEventView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response(
                {'success': False, 'error': 'No query provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the API key from environment
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                return Response(
                    {'success': False, 'error': 'OpenAI API key not configured'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Use OpenAI client directly instead of LangChain
            import openai
            client = openai.OpenAI(api_key=api_key)
            
            # Define the system prompt and user query
            prompt = """
            Extract event details from the user description in JSON format with keys: 
            title, date, start_time, end_time.
            
            The date should be in YYYY-MM-DD format, and times should be in 24-hour HH:MM format.
            If no specific date is mentioned, use today's date.
            If no end time is specified, make the event 1 hour after the start time.
            
            Respond only with a valid JSON object, nothing else.
            """
            
            # Call the API
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0
            )
            
            # Extract the response text
            result = response.choices[0].message.content.strip()
            
            # Parse the JSON response
            try:
                details = json.loads(result)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract just the JSON part
                import re
                json_match = re.search(r'({.*})', result, re.DOTALL)
                if json_match:
                    details = json.loads(json_match.group(1))
                else:
                    return Response(
                        {'success': False, 'error': 'Failed to parse AI response'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            # Create the event
            event = CalendarEvent.objects.create(
                title=details.get('title', 'Untitled Event'),
                date=details.get('date'),
                start_time=details.get('start_time'),
                end_time=details.get('end_time'),
                user=request.user
            )
            
            serializer = CalendarEventSerializer(event)
            return Response({'success': True, 'event': serializer.data})
            
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
