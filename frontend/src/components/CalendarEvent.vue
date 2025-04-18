<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  conflictIndex: {
    type: Number,
    default: 0
  },
  totalConflicts: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['toggle-complete']);

const handleCheckboxClick = (e) => {
  e.stopPropagation();
  emit('toggle-complete', props.event.id);
};

// Calculate the position and dimensions based on event time
const eventStyles = computed(() => {
  try {
    const startHour = parseInt(props.event.startTime.split(':')[0]) || 0;
    const startMinute = parseInt(props.event.startTime.split(':')[1] || 0);
    const endHour = parseInt(props.event.endTime.split(':')[0]) || (startHour + 1);
    const endMinute = parseInt(props.event.endTime.split(':')[1] || 0);
    
    // Calculate duration in minutes
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = Math.max(30, endTotalMinutes - startTotalMinutes); // Minimum 30 min height
    
    // Convert to pixels (assuming each hour is 60px tall)
    const cellHeight = 60;
    const topOffset = (startHour + startMinute / 60) * cellHeight;
    const height = (durationMinutes / 60) * cellHeight;
    
    // Calculate width and left position for handling overlaps
    const width = 100 / props.totalConflicts;
    const left = props.conflictIndex * width;
    
    return {
      position: 'absolute',
      top: `${topOffset}px`,
      height: `${Math.max(30, height)}px`, // Minimum height of 30px
      width: `${width}%`,
      left: `${left}%`,
      zIndex: 5
    };
  } catch (error) {
    console.error('Error calculating event styles:', error);
    // Fallback styles
    return {
      position: 'absolute',
      top: '0px',
      height: '60px',
      width: '100%',
      left: '0%',
      zIndex: 5
    };
  }
});
</script>

<template>
  <div 
    class="task-card absolute rounded-md p-2 border-l-4 overflow-hidden"
    :class="[
      event.color || 'bg-gray-800/80',
      event.completed ? 'opacity-50' : ''
    ]"
    :style="eventStyles"
    @click.stop
  >
    <div class="flex items-center gap-2">
      <input 
        type="checkbox" 
        :checked="event.completed"
        class="rounded-sm"
        @click="handleCheckboxClick"
      >
      <span :class="{ 'line-through': event.completed }" class="text-sm font-medium truncate">{{ event.title }}</span>
    </div>
    <div class="text-xs text-gray-400 ml-5 truncate">
      {{ event.startTime }} - {{ event.endTime }}
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background-color: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(4px);
  min-width: 100px;
  min-height: 30px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.task-card:hover {
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}
</style>