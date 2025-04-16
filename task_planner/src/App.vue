<script setup>
import { onMounted } from 'vue';
import Calendar from './components/Calendar.vue'
import Sidebar from './components/Sidebar.vue'
import TaskPanel from './components/TaskPanel.vue'

console.log("App.vue mounted");

const generateHours = () => {
  const hours = [];
  for (let i = 0; i <= 24; i++) {
    hours.push(`${i > 12 ? i - 12 : i} ${i >= 12 ? 'PM' : 'AM'}`);
  }
  return hours;
};

onMounted(() => {
  console.log("App component mounted and ready");
});
</script>

<template>
  <div class="min-h-screen flex bg-app-darker text-white">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Task Panel -->
    <TaskPanel />

    <!-- Main Calendar -->
    <main class="flex-1">
      <Calendar />
    </main>
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
