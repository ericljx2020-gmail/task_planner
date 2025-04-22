// API service to communicate with the Django backend

const API_URL = 'http://localhost:8000/api';

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

// Function to ensure CSRF token is available
const ensureCSRFToken = async () => {
  // Only fetch if we don't already have a token
  if (!getCSRFToken()) {
    try {
      await fetch(`${API_URL}/csrf-token/`, {
        method: 'GET',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  }
};

export default {
  // Authentication
  async register(userData) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
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
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
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
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
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
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/auth/user/`, {
        credentials: 'include',
      });
      
      if (response.status === 403) {
        return { detail: 'Authentication required' };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  },
  
  // Calendar Events
  async getEvents() {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/events/`, {
        credentials: 'include',
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get events error:', error);
      throw error;
    }
  },
  
  async createEvent(eventData) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  },
  
  async updateEvent(eventId, eventData) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/events/${eventId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  },
  
  async deleteEvent(eventId) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/events/${eventId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
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
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/tasks/`, {
        credentials: 'include',
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  },
  
  async createTask(taskData) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },
  
  async updateTask(taskId, taskData) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },
  
  async deleteTask(taskId) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      if (response.status === 204) {
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  },
  
  // Chat-driven event creation
  async createEventFromChat(query) {
    try {
      // Make sure we have a CSRF token
      await ensureCSRFToken();
      
      const response = await fetch(`${API_URL}/chat/add_event/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
        body: JSON.stringify({ query }),
      });
      
      if (response.status === 403) {
        throw new Error('Authentication required');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Chat event creation error:', error);
      throw error;
    }
  }
}; 