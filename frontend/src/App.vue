<script setup>
import { onMounted, ref } from 'vue';
import Calendar from './components/Calendar.vue'
import Sidebar from './components/Sidebar.vue'
import TaskPanel from './components/TaskPanel.vue'
import LoginForm from './components/LoginForm.vue'
import api from './services/api'
import ThemeToggle from './components/ThemeToggle.vue'
import './assets/theme.css'
import { useTheme } from './composables/useTheme'

console.log("App.vue mounted");

// User authentication state
const isAuthenticated = ref(false);
const user = ref(null);
const isLoading = ref(true); // Add loading state

// Initialize theme system
const { theme } = useTheme();

// Check if user is logged in on page load
const checkAuth = async () => {
  try {
    const userData = await api.getUserInfo();
    
    if (userData.id) {
      user.value = userData;
      isAuthenticated.value = true;
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    // Not authenticated or error, leave as is
  } finally {
    // Regardless of result, we're done loading
    isLoading.value = false;
  }
};

// Handle successful login
const handleLoginSuccess = (userData) => {
  user.value = userData;
  isAuthenticated.value = true;
};

// Handle logout
const handleLogout = async () => {
  try {
    await api.logout();
    user.value = null;
    isAuthenticated.value = false;
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Check authentication on component mount
onMounted(async () => {
  // First fetch the CSRF token
  isLoading.value = true; // Start loading
  try {
    await fetch('http://localhost:8000/api/csrf-token/', {
      method: 'GET',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
  
  // Then check authentication
  await checkAuth();
});
</script>

<template>
  <div class="app h-screen flex flex-col">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center h-screen">
      <div class="animate-pulse text-xl">
        Loading app...
      </div>
    </div>
    
    <!-- Login form -->
    <div v-else-if="!isAuthenticated" class="flex items-center justify-center h-screen">
      <div class="w-full max-w-md p-6 shadow-lg rounded-lg border">
        <LoginForm @login-success="handleLoginSuccess" />
      </div>
    </div>
    
    <!-- Main app -->
    <template v-else>
      <header class="p-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">Task Planner</h1>
        <div class="flex items-center gap-4">
          <span>{{ user.username }}</span>
          <button @click="handleLogout" class="px-3 py-1 rounded-lg text-sm logout-btn">
            Logout
          </button>
        </div>
        <ThemeToggle class="theme-toggle-wrapper" />
      </header>
      
      <main class="flex-1 flex overflow-hidden">
        <Sidebar />
        <TaskPanel />
        <Calendar class="flex-1" />
      </main>
    </template>
  </div>
</template>

<style>
/* Global styles */
body {
  margin: 0;
  padding: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* App container */
.app {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Header styling */
header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

/* Login form container */
.app > div > div {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

/* Logout button */
.logout-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.logout-btn:hover {
  background-color: var(--primary-color);
  opacity: 0.9;
}

.theme-toggle-wrapper {
  margin-left: 1rem;
}

/* Handle theme transitions */
.app,
header,
main,
.logout-btn,
.app > div > div {
  transition: var(--theme-transition);
}
</style>
