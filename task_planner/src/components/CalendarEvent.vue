<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle-complete']);

const handleCheckboxClick = (e) => {
  e.stopPropagation();
  emit('toggle-complete', props.event.id);
};
</script>

<template>
  <div 
    class="task-card" 
    :class="[
      event.color,
      event.completed ? 'opacity-50' : ''
    ]"
    @click.stop
  >
    <div class="flex items-center gap-2">
      <input 
        type="checkbox" 
        :checked="event.completed"
        class="rounded-sm"
        @click="handleCheckboxClick"
      >
      <span :class="{ 'line-through': event.completed }">{{ event.title }}</span>
    </div>
    <div class="text-xs text-gray-400 ml-5">
      {{ event.startTime }} - {{ event.endTime }}
    </div>
  </div>
</template> 