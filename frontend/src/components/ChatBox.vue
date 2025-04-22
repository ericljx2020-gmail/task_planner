<script setup>
import { ref, watch } from 'vue';
import api from '../services/api';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const messages = ref([]);
const inputText = ref('');
const loading = ref(false);

// Clear chat when closed
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    messages.value = [];
  }
});

const sendMessage = async () => {
  if (!inputText.value.trim() || loading.value) return;
  
  // Add user message
  messages.value.push({
    sender: 'user',
    text: inputText.value
  });
  
  const userQuery = inputText.value;
  inputText.value = ''; // Clear input
  loading.value = true;
  
  try {
    // Call the API to process the message
    const response = await api.createEventFromChat(userQuery);
    
    if (response.success) {
      // Add success message with event details
      const event = response.event;
      messages.value.push({
        sender: 'bot',
        text: `Event created: "${event.title}" on ${event.date} from ${event.start_time} to ${event.end_time}`
      });
    } else {
      // Add error message
      messages.value.push({
        sender: 'bot',
        text: `Error: ${response.error || 'Failed to create event'}`
      });
    }
  } catch (error) {
    // Add error message
    messages.value.push({
      sender: 'bot',
      text: `Error: ${error.message || 'Something went wrong'}`
    });
  } finally {
    loading.value = false;
  }
};

const handleKeyDown = (event) => {
  // Submit on Enter (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
  
  // Close on Escape
  if (event.key === 'Escape') {
    emit('close');
  }
};

// Scroll to bottom when messages change
const scrollToBottom = () => {
  const messagesContainer = document.querySelector('.chat-messages');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};

watch(messages, () => {
  // Use nextTick to ensure DOM is updated
  setTimeout(scrollToBottom, 0);
}, { deep: true });
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="visible" class="chat-box fixed bottom-4 right-4 w-80 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <span class="font-medium">Event Assistant</span>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            &times;
          </button>
        </div>
        
        <!-- Messages -->
        <div class="chat-messages overflow-auto h-60 p-3 flex flex-col gap-2">
          <div v-if="messages.length === 0" class="text-gray-500 dark:text-gray-400 text-center text-sm my-auto">
            Type a description of your event like: "Lunch with Sarah next Tuesday at noon"
          </div>
          
          <div v-for="(msg, index) in messages" :key="index" 
               :class="[
                 'p-2 rounded-lg max-w-[85%] break-words',
                 msg.sender === 'user' ? 'ml-auto bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-white'
               ]">
            {{ msg.text }}
          </div>
          
          <div v-if="loading" class="flex justify-center my-2">
            <div class="animate-pulse text-gray-500 dark:text-gray-400">
              Processing...
            </div>
          </div>
        </div>
        
        <!-- Input -->
        <div class="p-2 border-t border-gray-200 dark:border-gray-700">
          <input 
            v-model="inputText"
            @keydown="handleKeyDown"
            type="text"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your event..."
            :disabled="loading"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style> 