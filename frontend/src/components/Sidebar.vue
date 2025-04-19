<script setup>
import { ref } from 'vue';

const activeIcon = ref('calendar');

const icons = [
  { id: 'tasks', label: 'Tasks', icon: '✓' },
  { id: 'friends', label: 'Friends', icon: '👥' },
  { id: 'calendar', label: 'Calendar', icon: '📅' }
];

const setActive = (iconId) => {
  activeIcon.value = iconId;
};
</script>

<template>
  <aside class="sidebar w-14 flex flex-col items-center py-4">
    <nav class="space-y-6 flex-1">
      <button
        v-for="item in icons"
        :key="item.id"
        class="nav-button w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
        :class="{ 'active': activeIcon === item.id }"
        @click="setActive(item.id)"
        :title="item.label"
      >
        <span class="text-xl">{{ item.icon }}</span>
      </button>
    </nav>
    
    <div class="mt-auto">
      <button 
        class="account-button w-10 h-10 rounded-full flex items-center justify-center"
        title="Account"
      >
        <span class="text-xl">👤</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  transition: var(--theme-transition);
}

.nav-button {
  color: var(--text-secondary);
}

.nav-button:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-button.active {
  background-color: var(--primary-color, #529ed4);
  color: white;
}

.account-button {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transition: var(--theme-transition);
}

.account-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px var(--shadow-color);
}
</style> 