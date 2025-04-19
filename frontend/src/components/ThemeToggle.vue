<script setup>
import { useTheme } from '../composables/useTheme';

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle" 
    :class="{ 'theme-toggle-light': theme === 'light' }"
    :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Sun icon for dark theme (clicking will switch to light) -->
    <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    
    <!-- Moon icon for light theme (clicking will switch to dark) -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px var(--shadow-color);
}

.theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.theme-toggle:active {
  transform: translateY(0);
}

.theme-toggle-light {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.theme-icon {
  width: 20px;
  height: 20px;
}

/* Animation for theme switch */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.theme-toggle:hover .theme-icon {
  animation: spin 2s linear infinite;
}
</style> 