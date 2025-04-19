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

const emit = defineEmits(['toggle-complete', 'delete-event']);

const toggleComplete = () => {
  emit('toggle-complete', props.event.id);
};

const deleteEvent = () => {
  if (confirm('Are you sure you want to delete this event?')) {
    emit('delete-event', props.event.id);
  }
};

// Calculate position based on time
const startTime = props.event.startTime || props.event.start_time;
const endTime = props.event.endTime || props.event.end_time;

const [startHour, startMinute = '0'] = startTime.split(':');
const [endHour, endMinute = '0'] = endTime.split(':');

const startPosition = parseInt(startHour) * 60 + parseInt(startMinute);
const endPosition = parseInt(endHour) * 60 + parseInt(endMinute);
const duration = endPosition - startPosition;

// Calculate width when there are conflicts
const width = props.totalConflicts > 1 
  ? `calc((100% / ${props.totalConflicts}) - 4px)` 
  : 'calc(100% - 8px)';

// Calculate left offset for conflicts
const leftOffset = props.totalConflicts > 1 
  ? `calc((100% / ${props.totalConflicts}) * ${props.conflictIndex})` 
  : '0';

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
    class="task-card calendar-event absolute rounded-md px-2 py-1 text-xs overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    :class="[
      event.color || 'bg-gray-800/80',
      { 'line-through opacity-50': event.completed }
    ]"
    :style="{
      top: `${startPosition}px`,
      height: `${duration}px`,
      left: leftOffset,
      width: width,
      zIndex: '10'
    }"
  >
    <div class="flex justify-between items-center mb-1">
      <input
        type="checkbox"
        :checked="event.completed"
        @click.stop="toggleComplete"
        class="mr-1 h-3 w-3"
      />
      <button 
        @click.stop="deleteEvent" 
        class="text-gray-300 hover:text-white transition-colors ml-auto"
        title="Delete event"
      >
        ×
      </button>
    </div>
    <div class="text-white font-medium">{{ event.title }}</div>
    <div class="text-gray-300">{{ startTime }} - {{ endTime }}</div>
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