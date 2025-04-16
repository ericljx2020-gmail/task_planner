<script setup>
import { ref, computed } from 'vue';
import { format } from 'date-fns';

const props = defineProps({
  selectedSlot: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'add-event']);

const title = ref('');
const startTime = ref(`${props.selectedSlot.hour}:00`);
const endTime = ref(`${props.selectedSlot.hour + 1}:00`);
const category = ref('work');

const categories = [
  { id: 'work', label: 'Work', color: 'bg-blue-900/50' },
  { id: 'personal', label: 'Personal', color: 'bg-yellow-900/50' },
  { id: 'family', label: 'Family', color: 'bg-green-900/50' },
  { id: 'travel', label: 'Travel', color: 'bg-purple-900/50' }
];

const selectedCategory = computed(() => {
  return categories.find(c => c.id === category.value);
});

const handleSubmit = () => {
  if (!title.value) return;

  emit('add-event', {
    title: title.value,
    date: props.selectedSlot.date,
    startTime: startTime.value,
    endTime: endTime.value,
    category: category.value,
    color: selectedCategory.value.color
  });
};
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div class="bg-app-dark p-6 rounded-xl w-full max-w-md">
      <h3 class="text-xl font-semibold mb-4">Add New Event</h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">Title</label>
          <input 
            v-model="title"
            type="text"
            class="w-full px-3 py-2 bg-app-darker rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Event title"
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1">Start Time</label>
            <input 
              v-model="startTime"
              type="time"
              class="w-full px-3 py-2 bg-app-darker rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
          </div>
          <div>
            <label class="block text-sm mb-1">End Time</label>
            <input 
              v-model="endTime"
              type="time"
              class="w-full px-3 py-2 bg-app-darker rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              class="px-4 py-2 rounded-lg text-sm text-left"
              :class="[
                cat.color,
                category === cat.id ? 'ring-2 ring-white' : ''
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
            class="px-4 py-2 bg-app-light rounded-lg hover:bg-app-hover"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Event
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 