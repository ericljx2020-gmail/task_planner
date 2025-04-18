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
  <aside class="w-14 flex flex-col items-center bg-app-light py-4">
    <nav class="space-y-6 flex-1">
      <button
        v-for="item in icons"
        :key="item.id"
        class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
        :class="activeIcon === item.id ? 'bg-app-hover text-white' : 'text-gray-400 hover:bg-app-hover/50'"
        @click="setActive(item.id)"
        :title="item.label"
      >
        <span class="text-xl">{{ item.icon }}</span>
      </button>
    </nav>
    
    <div class="mt-auto">
      <button 
        class="w-10 h-10 rounded-full bg-app-hover flex items-center justify-center"
        title="Account"
      >
        <span class="text-xl">👤</span>
      </button>
    </div>
  </aside>
</template> 