import { ref, watch, onMounted } from 'vue';

export function useTheme() {
  const theme = ref(localStorage.getItem('theme') || 'dark');
  
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme.value);
    applyTheme(theme.value);
  };
  
  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      theme.value = newTheme;
      localStorage.setItem('theme', theme.value);
      applyTheme(theme.value);
    }
  };
  
  const applyTheme = (currentTheme) => {
    const root = document.documentElement;
    const body = document.body;
    
    if (currentTheme === 'dark') {
      // Apply dark theme class
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
      
      // Dark theme colors
      root.style.setProperty('--bg-primary', '#121212');
      root.style.setProperty('--bg-secondary', '#1e1e1e');
      root.style.setProperty('--bg-tertiary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0a0a0');
      root.style.setProperty('--border-color', '#333333');
      root.style.setProperty('--event-bg', 'rgba(82, 158, 212, 0.8)');
      root.style.setProperty('--event-bg-hover', 'rgba(82, 158, 212, 0.9)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--grid-line-color', 'rgba(255, 255, 255, 0.1)');
    } else {
      // Apply light theme class
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
      
      // Light theme colors
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f5f5f5');
      root.style.setProperty('--bg-tertiary', '#e8e8e8');
      root.style.setProperty('--text-primary', '#333333');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--border-color', '#dddddd');
      root.style.setProperty('--event-bg', 'rgba(82, 158, 212, 0.7)');
      root.style.setProperty('--event-bg-hover', 'rgba(82, 158, 212, 0.8)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--grid-line-color', 'rgba(0, 0, 0, 0.1)');
    }
  };
  
  // Apply theme on component mount
  onMounted(() => {
    applyTheme(theme.value);
  });
  
  // Watch for system preference changes
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (localStorage.getItem('theme') === null) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Initial check
    if (localStorage.getItem('theme') === null) {
      const initialTheme = mediaQuery.matches ? 'dark' : 'light';
      setTheme(initialTheme);
    }
  });
  
  return {
    theme,
    toggleTheme,
    setTheme
  };
} 