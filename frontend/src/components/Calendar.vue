<script setup>
import { ref, computed, provide, onMounted } from 'vue';
import { format, startOfWeek, addDays, parseISO, isWithinInterval, startOfDay, endOfDay, subDays, isSameDay } from 'date-fns';
import CalendarEvent from './CalendarEvent.vue';
import AddEventModal from './AddEventModal.vue';
import api from '../services/api';

const currentDate = ref(new Date());
const showAddEventModal = ref(false);
const selectedTimeSlot = ref(null);

// Shared events store (will be synchronized with TaskPanel)
const events = ref([]);

// Provide the events to child components
provide('events', events);

const hourToTimeSlot = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:1,14:2,15:3,16:4,17:5,18:6,19:7,20:8,21:9,22:10,23:11,24:0};

// Format functions
const formatDay = (date) => format(date, 'EEE dd');
const formatHour = (hour) => `${hour}:00`;

const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value);  // Starts from Sunday by default
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
});

const timeSlots = computed(() => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: formatHour(i)
  }));
});

// Check if two events overlap in time
const eventsOverlap = (event1, event2) => {
  if (event1.date !== event2.date) return false;
  
  const start1 = parseInt(event1.start_time.split(':')[0]) * 60 + parseInt(event1.start_time.split(':')[1] || 0);
  const end1 = parseInt(event1.end_time.split(':')[0]) * 60 + parseInt(event1.end_time.split(':')[1] || 0);
  const start2 = parseInt(event2.start_time.split(':')[0]) * 60 + parseInt(event2.start_time.split(':')[1] || 0);
  const end2 = parseInt(event2.end_time.split(':')[0]) * 60 + parseInt(event2.end_time.split(':')[1] || 0);
  
  return (start1 < end2 && start2 < end1);
};

// Get events for a specific day with conflict information
const getEventsForDay = (date) => {
  const dateString = format(date, 'yyyy-MM-dd');
  const dayEvents = events.value.filter(event => event.date === dateString);
  
  if (dayEvents.length === 0) return [];
  
  // Group overlapping events
  const conflictGroups = [];
  
  dayEvents.forEach(event => {
    // Check if this event belongs in any existing group
    let foundGroup = false;
    
    for (const group of conflictGroups) {
      if (group.some(groupEvent => eventsOverlap(groupEvent, event))) {
        group.push(event);
        foundGroup = true;
        break;
      }
    }
    
    // If no group found, create a new one
    if (!foundGroup) {
      conflictGroups.push([event]);
    }
  });
  
  // Assign conflict indices to each event
  const eventsWithConflicts = dayEvents.map(event => {
    for (const group of conflictGroups) {
      const index = group.findIndex(e => e.id === event.id);
      if (index !== -1) {
        return {
          ...event,
          conflictIndex: index,
          totalConflicts: group.length
        };
      }
    }
    return {
      ...event,
      conflictIndex: 0,
      totalConflicts: 1
    };
  });
  
  return eventsWithConflicts;
};

// This function is kept for compatibility
const getEventsForTimeSlot = (date, hour) => {
  const dayStart = startOfDay(parseISO(`${format(date, 'yyyy-MM-dd')}T${hour}:00:00`));
  const dayEnd = endOfDay(dayStart);
  
  return events.value.filter(event => {
    const eventDate = parseISO(`${event.date}T${event.start_time}`);
    return isWithinInterval(eventDate, { start: dayStart, end: dayEnd }) &&
           parseInt(event.start_time.split(':')[0]) === hour;
  });
};

const handleTimeSlotClick = (date, hour) => {
  console.log('Time slot clicked:', date, hour);
  selectedTimeSlot.value = {
    date: format(date, 'yyyy-MM-dd'),
    hour
  };
  showAddEventModal.value = true;
};

const addEvent = async (newEvent) => {
  console.log('Adding new event:', newEvent);
  
  try {
    // Format event data for the API
    const eventData = {
      title: newEvent.title,
      date: newEvent.date,
      start_time: newEvent.startTime,
      end_time: newEvent.endTime,
      category: newEvent.category,
      color: newEvent.color,
      completed: false
    };
    
    // Send to the API
    const createdEvent = await api.createEvent(eventData);
    
    // Update local events
    events.value.push({
      ...createdEvent,
      startTime: createdEvent.start_time, // Keep compatibility with frontend naming
      endTime: createdEvent.end_time
    });
    
    showAddEventModal.value = false;
    selectedTimeSlot.value = null;
  } catch (error) {
    console.error('Error creating event:', error);
    // Handle error (show notification, etc.)
  }
};

const toggleEventComplete = async (eventId) => {
  const event = events.value.find(e => e.id === eventId);
  if (event) {
    // Toggle locally first for responsive UI
    event.completed = !event.completed;
    
    try {
      // Send update to API
      await api.updateEvent(eventId, {
        ...event,
        start_time: event.startTime || event.start_time,
        end_time: event.endTime || event.end_time
      });
    } catch (error) {
      console.error('Error updating event completion status:', error);
      // Revert the local change if API call fails
      event.completed = !event.completed;
    }
  }
};

// Load events from the backend
const loadEvents = async () => {
  try {
    const fetchedEvents = await api.getEvents();
    
    // Convert API format to frontend format
    events.value = fetchedEvents.map(event => ({
      ...event,
      startTime: event.start_time, // Add frontend property names for compatibility
      endTime: event.end_time
    }));
  } catch (error) {
    console.error('Error loading events:', error);
    // Handle error (show notification, etc.)
  }
};

// Scroll to current time on component mount
const scrollToCurrentTime = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const timeSlotHeight = 60; // height in pixels
  const container = document.querySelector('.calendar-grid');
  if (container) {
    container.scrollTop = currentHour * timeSlotHeight;
  }
};

// Navigation methods
const navigateNext = () => {
  currentDate.value = addDays(currentDate.value, 7);
};

const navigatePrevious = () => {
  currentDate.value = subDays(currentDate.value, 7);
};

const handleDateSelect = (event) => {
  const selectedDate = new Date(event.target.value);
  currentDate.value = selectedDate;
};

// Mount hook to scroll to current time and load events
onMounted(() => {
  scrollToCurrentTime();
  setTimeout(scrollToCurrentTime, 100);
});
</script>

<template>
  <section class="flex-1 p-4 overflow-auto">
    <!-- Calendar Header -->
    <div class="calendar-header flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">{{ format(currentDate, 'MMMM yyyy') }}</h2>
      <div class="flex gap-2">
        <input 
          type="date"
          :value="format(currentDate, 'yyyy-MM-dd')"
          @change="handleDateSelect"
          class="px-4 py-2 bg-app-light rounded-lg hover:bg-app-hover cursor-pointer"
        >
        <div class="flex gap-1">
          <button 
            class="p-2 bg-app-light rounded-lg hover:bg-app-hover"
            @click="navigatePrevious"
          >
            ←
          </button>
          <button 
            class="p-2 bg-app-light rounded-lg hover:bg-app-hover"
            @click="navigateNext"
          >
            →
          </button>
        </div>
      </div>
    </div>

    <!-- Days of Week Header -->
    <div class="calendar-days grid grid-cols-7 text-center text-xs font-semibold border-b border-white/10 pb-2 ml-16">
      <div v-for="day in weekDays" :key="format(day, 'yyyy-MM-dd')">
        {{ formatDay(day) }}
      </div>
    </div>

    <!-- Calendar + Hour Sidebar Wrapper -->
    <div class="calendar-wrapper relative">
      <!-- Hours sidebar -->
      <div class="hours-sidebar absolute left-0 top-0 h-[calc(24*60px)] w-16 text-right">
        <div
          v-for="slot in timeSlots"
          :key="slot.hour"
          class="h-[60px] flex items-center justify-end pr-4"
        >
          <span class="text-xs text-white">{{ slot.label }}</span>
        </div>
      </div>

      <!-- Calendar grid -->
      <div
        class="calendar-grid grid grid-cols-7 border border-white/10 h-[calc(24*60px)] overflow-y-auto mt-2 ml-16"
      >
        <div
          v-for="day in weekDays"
          :key="format(day, 'yyyy-MM-dd')"
          class="day-column border-r border-white/10 relative"
        >
          <!-- Time slots -->
          <div
            v-for="slot in timeSlots"
            :key="format(day, 'yyyy-MM-dd') + '-' + slot.hour"
            class="time-slot h-[60px] border-b border-white/10 relative group hover:bg-gray-50/5 cursor-pointer"
            @click="handleTimeSlotClick(day, slot.hour)"
          >
            <!-- Slot content is empty to allow clicking -->
          </div>
          
          <!-- Events rendered on top of time slots -->
          <template v-for="event in getEventsForDay(day)" :key="event.id">
            <CalendarEvent
              :event="event"
              :conflict-index="event.conflictIndex || 0"
              :total-conflicts="event.totalConflicts || 1"
              @toggle-complete="toggleEventComplete"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Add Event Modal -->
    <AddEventModal
      v-if="showAddEventModal"
      :selected-slot="selectedTimeSlot"
      @close="showAddEventModal = false"
      @add-event="addEvent"
    />
  </section>
</template>

<style scoped>
.calendar-wrapper {
  position: relative;
  width: 100%;
}

.calendar-grid {
  position: relative;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.time-slot {
  transition: background-color 0.2s;
  z-index: 2;
}

.time-slot:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.day-column:last-child {
  border-right: none;
}
</style>