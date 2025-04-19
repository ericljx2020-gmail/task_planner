<script setup>
import { ref, computed, watch } from 'vue';
import { format } from 'date-fns';

const props = defineProps({
  selectedSlot: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'add-event']);

const title = ref('');
const startTime = ref('');
const endTime = ref('');
const category = ref('work');

// Initialize times when selectedSlot changes
watch(() => props.selectedSlot, (newSlot) => {
  if (newSlot && newSlot.hour !== undefined) {
    // Format the hour with leading zero if needed
    const hour = newSlot.hour.toString().padStart(2, '0');
    startTime.value = `${hour}:00`;
    
    // Set end time to 1 hour later
    const endHour = (newSlot.hour + 1) % 24;
    endTime.value = `${endHour.toString().padStart(2, '0')}:00`;
  }
}, { immediate: true });

const categories = [
  { id: 'work', label: 'Work', color: 'category-work' },
  { id: 'personal', label: 'Personal', color: 'category-personal' },
  { id: 'family', label: 'Family', color: 'category-family' },
  { id: 'travel', label: 'Travel', color: 'category-travel' }
];

const selectedCategory = computed(() => {
  return categories.find(c => c.id === category.value) || categories[0];
});

const handleSubmit = () => {
  if (!title.value) {
    alert('Please enter a title for the event');
    return;
  }

  if (!props.selectedSlot || !props.selectedSlot.date) {
    console.error('No date selected');
    return;
  }

  emit('add-event', {
    title: title.value,
    date: props.selectedSlot.date,
    startTime: startTime.value,
    endTime: endTime.value,
    category: category.value,
    color: selectedCategory.value.color
  });
  
  // Reset form
  title.value = '';
};

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div class="modal-overlay fixed inset-0 flex items-center justify-center z-50">
    <div 
      class="modal-container p-6 rounded-xl w-full max-w-md"
      @click.stop
    >
      <h3 class="text-xl font-semibold mb-4">Add New Event</h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Title</label>
          <input 
            v-model="title"
            type="text"
            class="modal-input w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Event title"
            autofocus
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1">Start Time</label>
            <input 
              v-model="startTime"
              type="time"
              class="modal-input w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
          </div>
          <div>
            <label class="block text-sm mb-1">End Time</label>
            <input 
              v-model="endTime"
              type="time"
              class="modal-input w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
          </div>
        </div>

        <div>
          <label class="block text-sm mb-1">Category</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="category-button px-4 py-2 rounded-lg text-sm text-left"
              :class="[
                cat.color,
                category === cat.id ? 'category-selected' : ''
              ]"
              @click="category = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            type="button"
            class="cancel-button px-4 py-2 rounded-lg"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="submit-button px-4 py-2 rounded-lg"
          >
            Add Event
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  transition: var(--theme-transition);
}

.modal-container {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  box-shadow: 0 8px 24px var(--shadow-color);
  transition: var(--theme-transition);
}

.modal-input {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: var(--theme-transition);
}

.modal-input:focus {
  border-color: var(--primary-color);
}

.category-button {
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  transition: var(--theme-transition);
}

.category-selected {
  box-shadow: 0 0 0 2px var(--primary-color);
}

.category-work {
  background-color: rgba(30, 64, 175, 0.3);
}

.category-personal {
  background-color: rgba(180, 83, 9, 0.3);
}

.category-family {
  background-color: rgba(21, 128, 61, 0.3);
}

.category-travel {
  background-color: rgba(107, 33, 168, 0.3);
}

.cancel-button {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transition: var(--theme-transition);
}

.cancel-button:hover {
  background-color: var(--bg-primary);
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  transition: var(--theme-transition);
}

.submit-button:hover {
  opacity: 0.9;
}

/* For dark mode, make colors more vivid */
:root.dark-theme .category-work {
  background-color: rgba(59, 130, 246, 0.5);
}

:root.dark-theme .category-personal {
  background-color: rgba(245, 158, 11, 0.5);
}

:root.dark-theme .category-family {
  background-color: rgba(16, 185, 129, 0.5);
}

:root.dark-theme .category-travel {
  background-color: rgba(139, 92, 246, 0.5);
}

/* For light mode, make colors slightly muted */
:root.light-theme .category-work {
  background-color: rgba(59, 130, 246, 0.2);
}

:root.light-theme .category-personal {
  background-color: rgba(245, 158, 11, 0.2);
}

:root.light-theme .category-family {
  background-color: rgba(16, 185, 129, 0.2);
}

:root.light-theme .category-travel {
  background-color: rgba(139, 92, 246, 0.2);
}
</style>