<script setup>
import { onMounted, ref } from 'vue';
import Calendar from './components/Calendar.vue'
import Sidebar from './components/Sidebar.vue'
import TaskPanel from './components/TaskPanel.vue'
import LoginForm from './components/LoginForm.vue'
import api from './services/api'

console.log("App.vue mounted");

// User authentication state
const isAuthenticated = ref(false);
const user = ref(null);

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
onMounted(() => {
  checkAuth();
});
</script>

<template>
  <div class="app h-screen flex flex-col bg-app-dark text-white">
    <div v-if="!isAuthenticated" class="flex items-center justify-center h-screen">
      <div class="w-full max-w-md p-6 bg-app-dark shadow-lg rounded-lg border border-app-light">
        <LoginForm @login-success="handleLoginSuccess" />
      </div>
    </div>
    
    <template v-else>
      <header class="border-b border-app-light p-3 flex justify-between items-center">
        <h1 class="text-xl font-bold">Task Planner</h1>
        <div class="flex items-center gap-4">
          <span>{{ user.username }}</span>
          <button @click="handleLogout" class="px-3 py-1 bg-app-light rounded-lg hover:bg-app-hover text-sm">
            Logout
          </button>
        </div>
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
:root {
  --app-dark: #1a1a1a;
  --app-darker: #121212;
  --app-light: #2a2a2a;
  --app-hover: #333333;
}

body {
  margin: 0;
  padding: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--app-darker);
  color: white;
}

.bg-app-dark {
  background-color: var(--app-dark);
}

.bg-app-darker {
  background-color: var(--app-darker);
}

.bg-app-light {
  background-color: var(--app-light);
}

.bg-app-hover:hover {
  background-color: var(--app-hover);
}

.border-app-light {
  border-color: var(--app-light);
}
</style>
