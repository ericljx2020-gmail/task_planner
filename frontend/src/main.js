import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import './assets/theme.css'
import './assets/confetti.css'

// Initialize theme before app mount
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set theme if not saved in localStorage
  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
  }
  
  // Apply theme to document
  const theme = localStorage.getItem('theme');
  document.documentElement.classList.add(`${theme}-theme`);
  document.body.classList.add(`${theme}-theme`);
};

// Initialize theme
initTheme();

// Create and mount app
const app = createApp(App)
app.mount('#app')
