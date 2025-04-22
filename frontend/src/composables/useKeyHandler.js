import { onMounted, onUnmounted, ref } from 'vue';

export function useKeyHandler() {
  const isShiftEnterPressed = ref(false);
  
  const keydownHandler = (event) => {
    // Check for Shift+Enter key combination
    if (event.shiftKey && event.key === 'Enter') {
      event.preventDefault(); // Prevent default behavior
      isShiftEnterPressed.value = !isShiftEnterPressed.value; // Toggle state
    }
  };
  
  onMounted(() => {
    window.addEventListener('keydown', keydownHandler);
  });
  
  onUnmounted(() => {
    window.removeEventListener('keydown', keydownHandler);
  });
  
  return {
    isShiftEnterPressed
  };
} 