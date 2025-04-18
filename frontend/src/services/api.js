// API service to communicate with the Django backend

const API_URL = 'http://localhost:8000/api';

export default {
  // Authentication
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async logout() {
    try {
      const response = await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  async getUserInfo() {
    try {
      const response = await fetch(`${API_URL}/auth/user/`, {
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  },
  
  // Calendar Events
  async getEvents() {
    try {
      const response = await fetch(`${API_URL}/events/`, {
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Get events error:', error);
      throw error;
    }
  },
  
  async createEvent(eventData) {
    try {
      const response = await fetch(`${API_URL}/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  },
  
  async updateEvent(eventId, eventData) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  },
  
  async deleteEvent(eventId) {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.status === 204) {
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },
  
  // Tasks
  async getTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },
  
  async createTask(taskData) {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },
  
  async updateTask(taskId, taskData) {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },
  
  async deleteTask(taskId) {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.status === 204) {
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }
}; 