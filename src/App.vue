<script setup>
import Calendar from './components/Calendar.vue'
import Sidebar from './components/Sidebar.vue'
import TaskPanel from './components/TaskPanel.vue'

const generateHours = () => {
  const hours = [];
  for (let i = 0; i <= 24; i++) {
    hours.push(`${i > 12 ? i - 12 : i} ${i >= 12 ? 'PM' : 'AM'}`);
  }
  return hours;
};
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

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>