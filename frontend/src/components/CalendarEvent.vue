<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue';
import { createConfetti } from '../utils/confetti';

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
  },
  dayHeight: {
    type: Number,
    required: true
  },
  hourHeight: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['toggle-complete', 'delete-event', 'update:event']);

const handleCheckbox = (event) => {
  // Show confetti animation
  createConfetti(event.target);
  
  // Delay to let the confetti show before the item disappears
  setTimeout(() => {
    emit('delete-event', props.event.id);
  }, 2000); // Increased to 2 seconds to show more of the confetti animation
};

const deleteEvent = () => {
  if (confirm('Are you sure you want to delete this event?')) {
    emit('delete-event', props.event.id);
  }
};

// Calculate position based on time
const startTime = props.event.startTime || props.event.start_time;
const endTime = props.event.endTime || props.event.end_time;

const getStartPosition = () => {
  const [startHour, startMinute = '0'] = (props.event.startTime || props.event.start_time).split(':');
  return parseInt(startHour) * 60 + parseInt(startMinute);
};

const getEndPosition = () => {
  const [endHour, endMinute = '0'] = (props.event.endTime || props.event.end_time).split(':');
  return parseInt(endHour) * 60 + parseInt(endMinute);
};

// Create computed properties for reactive position values
const startPosition = computed(() => getStartPosition());
const endPosition = computed(() => getEndPosition());
const duration = computed(() => endPosition.value - startPosition.value);

// Calculate width when there are conflicts
const width = props.totalConflicts > 1 
  ? `calc((100% / ${props.totalConflicts}) - 4px)` 
  : 'calc(100% - 8px)';

// Calculate left offset for conflicts
const leftOffset = props.totalConflicts > 1 
  ? `calc((100% / ${props.totalConflicts}) * ${props.conflictIndex})` 
  : '0';

// Dragging state and utilities
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartX = ref(0);
const initialStartPosition = ref(0);
const initialEndPosition = ref(0);
const dragOffset = ref(0);
const dayOffset = ref(0);
const slotHeight = 15; // 15 minutes per slot
const hourHeight = 60; // 60px per hour in the calendar

// Format time for display (HH:MM)
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Snap to 15-minute grid 
const snapToGrid = (position) => {
  const slots = Math.round(position / slotHeight);
  return slots * slotHeight;
};

// Calculate active (current) time display during drag
const activeStartTime = computed(() => {
  if (!isDragging.value) return startTime;
  const newPosition = initialStartPosition.value + dragOffset.value;
  const snappedPosition = snapToGrid(newPosition);
  return formatTime(snappedPosition);
});

const activeEndTime = computed(() => {
  if (!isDragging.value) return endTime;
  const newPosition = initialEndPosition.value + dragOffset.value;
  const snappedPosition = snapToGrid(newPosition);
  return formatTime(snappedPosition);
});

// Dragging position style (applied while dragging)
const dragPositionStyle = computed(() => {
  if (!isDragging.value) return {};
  
  // Apply the offset to the initial position, snapped to 15-min increments
  const newStartPosition = snapToGrid(initialStartPosition.value + dragOffset.value);
  
  // Constrain to valid time ranges (00:00 - 23:45)
  const constrainedPosition = Math.max(0, Math.min(newStartPosition, 24 * 60 - 15));
  
  // Add horizontal offset for day changes
  let translateX = 0;
  if (dayOffset.value !== 0) {
    const dayWidth = document.querySelector('.day-column')?.offsetWidth || 200;
    translateX = dayOffset.value * dayWidth;
  }
  
  return {
    top: `${constrainedPosition}px`,
    transform: translateX !== 0 ? `translateX(${translateX}px)` : 'none',
    transition: 'none' // Remove transition during drag
  };
});

// Start dragging
const onDragStart = (event) => {
  // Only allow left mouse button
  if (event.button !== 0) return;
  
  // Prevent text selection during drag
  event.preventDefault();
  
  isDragging.value = true;
  dragStartY.value = event.clientY;
  dragStartX.value = event.clientX;
  initialStartPosition.value = startPosition.value;
  initialEndPosition.value = endPosition.value;
  dragOffset.value = 0;
  dayOffset.value = 0;
  
  // Add global event listeners for tracking drag outside the component
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  
  // Add escape key listener to cancel drag
  document.addEventListener('keydown', onKeyDown);
};

// Track drag movement
const onDragMove = (event) => {
  if (!isDragging.value) return;
  
  // Calculate vertical drag distance for time
  const deltaY = event.clientY - dragStartY.value;
  
  // Calculate horizontal drag distance for day movement
  const deltaX = event.clientX - dragStartX.value;
  const dayWidth = document.querySelector('.day-column')?.offsetWidth || 200;
  const daysDragged = Math.round(deltaX / dayWidth);
  
  // Convert to time offset (1px = 1 minute in the calendar)
  dragOffset.value = deltaY;
  dayOffset.value = daysDragged;
};

// Handle drag end (drop)
const onDragEnd = () => {
  if (!isDragging.value) return;
  
  // Clean up event listeners
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('keydown', onKeyDown);
  
  // Calculate new snapped times
  const newStartPosition = snapToGrid(initialStartPosition.value + dragOffset.value);
  const newEndPosition = newStartPosition + duration.value;
  
  // Constrain to valid time ranges
  const constrainedStartPosition = Math.max(0, Math.min(newStartPosition, 24 * 60 - 15));
  const constrainedEndPosition = Math.min(24 * 60, constrainedStartPosition + duration.value);
  
  // Format as HH:MM for API
  const newStartTime = formatTime(constrainedStartPosition);
  const newEndTime = formatTime(constrainedEndPosition);
  
  // Only emit update if position actually changed or day changed
  if (newStartTime !== startTime || newEndTime !== endTime || dayOffset.value !== 0) {
    // Create a deep copy of the event with updated properties
    const updatedEvent = {
      ...props.event,
      id: props.event.id,
      startTime: newStartTime,
      endTime: newEndTime,
      start_time: newStartTime, // Update both property naming conventions
      end_time: newEndTime,     // for compatibility
      dayOffset: dayOffset.value 
    };
    
    // Send the complete event object to ensure full update
    emit('update:event', updatedEvent);
  }
  
  // Reset dragging state
  isDragging.value = false;
  dragOffset.value = 0;
  dayOffset.value = 0;
};

// Handle key press during drag and keyboard navigation
const onKeyDown = (event) => {
  // Cancel drag on escape key if we're dragging
  if (isDragging.value && event.key === 'Escape') {
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('keydown', onKeyDown);
    
    isDragging.value = false;
    dragOffset.value = 0;
    dayOffset.value = 0;
    return;
  }

  // Handle keyboard navigation for event positioning
  if (!isDragging.value) {
    let minuteChange = 0;
    
    switch (event.key) {
      case 'ArrowUp':
        minuteChange = -15; // Move up 15 minutes
        event.preventDefault();
        break;
      case 'ArrowDown':
        minuteChange = 15; // Move down 15 minutes
        event.preventDefault();
        break;
      case 'PageUp':
        minuteChange = -60; // Move up 1 hour
        event.preventDefault();
        break;
      case 'PageDown':
        minuteChange = 60; // Move down 1 hour
        event.preventDefault();
        break;
      case 'Home':
        // Move to start of business day (8:00 AM)
        const morningPosition = 8 * 60; // 8:00 AM
        minuteChange = morningPosition - startPosition.value;
        event.preventDefault();
        break;
      case 'End':
        // Move to end of business day (5:00 PM minus event duration)
        const eveningPosition = 17 * 60; // 5:00 PM
        const latestStart = eveningPosition - duration.value;
        minuteChange = latestStart - startPosition.value;
        event.preventDefault();
        break;
      default:
        return; // Exit if not a navigation key
    }
    
    // Calculate new positions
    const newStartPosition = startPosition.value + minuteChange;
    const newEndPosition = newStartPosition + duration.value;
    
    // Validate the new positions are within bounds
    if (newStartPosition < 0 || newEndPosition > 24 * 60) {
      return; // Out of bounds
    }
    
    // Format as HH:MM for API
    const newStartTime = formatTime(newStartPosition);
    const newEndTime = formatTime(newEndPosition);
    
    // Only emit update if position actually changed
    if (newStartTime !== startTime || newEndTime !== endTime) {
      emit('update:event', {
        id: props.event.id,
        startTime: newStartTime,
        endTime: newEndTime
      });
    }
  }
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
    class="task-card calendar-event absolute rounded-md px-2 py-1 text-xs overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    :class="[
      event.color || 'default-event-color',
      { 'dragging': isDragging }
    ]"
    :style="[
      {
        top: `${startPosition}px`,
        height: `${duration}px`,
        left: leftOffset,
        width: width,
        zIndex: isDragging ? '20' : '10'
      },
      isDragging ? dragPositionStyle : {}
    ]"
    @mousedown="onDragStart"
    @touchstart="onDragStart"
    @keydown="onKeyDown"
    tabindex="0"
    role="button"
    aria-label="Calendar event"
  >
    <div class="flex justify-between items-center mb-1">
      <div class="checkbox-container">
        <input
          type="checkbox"
          @click.stop="(event) => handleCheckbox(event)"
          class="mr-1 h-3 w-3 event-checkbox"
        />
      </div>
      <button 
        @click.stop="deleteEvent" 
        class="text-gray-300 hover:text-white transition-colors ml-auto delete-button"
        title="Delete event"
      >
        ×
      </button>
    </div>
    <div class="event-title">{{ event.title }}</div>
    <div class="event-time">
      {{ isDragging ? activeStartTime : (event.startTime || event.start_time) }} - 
      {{ isDragging ? activeEndTime : (event.endTime || event.end_time) }}
    </div>
    
    <!-- Visual drag handle -->
    <div class="drag-handle" title="Drag to reschedule"></div>
  </div>
</template>

<style scoped>
.task-card {
  background-color: var(--event-bg, rgba(82, 158, 212, 0.8));
  backdrop-filter: blur(4px);
  min-width: 100px;
  min-height: 30px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px var(--shadow-color, rgba(0, 0, 0, 0.2));
  color: var(--text-primary, #ffffff);
}

.task-card:hover {
  z-index: 10;
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.3));
  transform: scale(1.02);
  background-color: var(--event-bg-hover, rgba(82, 158, 212, 0.9));
}

.task-card.dragging {
  cursor: grabbing;
  opacity: 0.9;
  box-shadow: 0 8px 16px var(--shadow-color, rgba(0, 0, 0, 0.5));
  transform: scale(1.05);
  z-index: 50;
  transition: box-shadow 0.2s, transform 0.2s;
}

.event-title {
  font-weight: 500;
  color: var(--text-primary, #ffffff);
}

.event-time {
  color: var(--text-primary, #e1e1e1);
  font-size: 0.75rem;
}

.default-event-color {
  background-color: var(--event-bg);
}

.delete-button {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.delete-button:hover {
  opacity: 1;
}

.checkbox-container {
  position: relative;
}

.event-checkbox {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.event-checkbox:hover {
  transform: scale(1.2);
}

.drag-handle {
  position: absolute;
  bottom: 2px;
  right: 5px;
  width: 10px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.7);
  cursor: grab;
}

.dragging .drag-handle {
  cursor: grabbing;
}

/* Add focus style for keyboard navigation */
.task-card:focus {
  outline: 2px solid var(--focus-color, #ffffff);
  outline-offset: 2px;
  z-index: 15;
}
</style>