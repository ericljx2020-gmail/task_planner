# Task Planner Application

A full-stack task planning application with calendar integration, built with Vue.js and Django.

## Project Structure

- **frontend/**: Vue.js frontend application
- **backend/**: Django REST API backend

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.x
- pip (Python package manager)
- PostgreSQL 16 (or later)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Activate your virtual environment (optional but recommended):
   ```
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install the required dependencies:
   ```
   pip install django djangorestframework django-cors-headers psycopg2-binary
   ```

4. Start PostgreSQL service:
   ```
   # On macOS with Homebrew
   brew services start postgresql@16
   
   # On Windows
   # PostgreSQL service should be running automatically
   # Or use the SQL Server Configuration Manager
   
   # On Linux
   sudo systemctl start postgresql
   ```

5. Create a PostgreSQL database:
   ```
   # Create a PostgreSQL user (first time only)
   createuser -s postgres
   # Set a password for the postgres user (first time only)
   psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
   # Create the database
   createdb -U postgres task_planner
   ```

6. Run migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create a superuser (for admin access):
   ```
   python manage.py createsuperuser
   ```

6. Start the Django development server:
   ```
   python manage.py runserver
   ```

The backend API will be available at http://localhost:8000/api/

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend application will be available at http://localhost:5173/ (or another port if 5173 is in use)

## Features

- User authentication (login/register)
- Calendar events management
- Task management with due dates
- Responsive UI with dark mode
- Cross-device synchronization

## API Endpoints

### Authentication
- `POST /api/auth/register/`: Register a new user
- `POST /api/auth/login/`: Login a user
- `POST /api/auth/logout/`: Logout a user
- `GET /api/auth/user/`: Get current user information

### Calendar Events
- `GET /api/events/`: List all events for the current user
- `POST /api/events/`: Create a new event
- `GET /api/events/{id}/`: Retrieve a specific event
- `PUT /api/events/{id}/`: Update an event
- `DELETE /api/events/{id}/`: Delete an event

### Tasks
- `GET /api/tasks/`: List all tasks for the current user
- `POST /api/tasks/`: Create a new task
- `GET /api/tasks/{id}/`: Retrieve a specific task
- `PUT /api/tasks/{id}/`: Update a task
- `DELETE /api/tasks/{id}/`: Delete a task

## Development

### Backend

The backend is built with Django and Django REST Framework. The main components are:

- Models: `CalendarEvent`, `Task`, and `UserProfile`
- Serializers: Convert model instances to JSON and vice versa
- Views: API endpoints and business logic
- URLs: API routing

### Frontend

The frontend is built with Vue.js. The main components are:

- Calendar component for viewing and managing events
- Task panel for managing tasks
- Authentication forms
- API service for backend communication 