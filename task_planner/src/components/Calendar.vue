<script setup>
import { ref, computed } from 'vue';
import { format, startOfWeek, addDays, parseISO, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import CalendarEvent from './CalendarEvent.vue';
import AddEventModal from './AddEventModal.vue';

const currentDate = ref(new Date());
const showAddEventModal = ref(false);
const selectedTimeSlot = ref(null);

const events = ref([
  {
    id: 1,
    title: 'Weekly planning',
    date: '2024-01-21',
    startTime: '10:00',
    endTime: '11:00',
    category: 'work',
    completed: false,
    color: 'bg-blue-900/50'
  },
  {
    id: 2,
    title: 'TestFlight submission',
    date: '2024-01-21',
    startTime: '11:00',
    endTime: '12:00',
    category: 'work',
    completed: false,
    color: 'bg-gray-700/50'
  },
  {
    id: 3,
    title: 'Update documentation',
    date: '2024-01-21',
    startTime: '13:00',
    endTime: '14:00',
    category: 'work',
    completed: false,
    color: 'bg-green-900/50'
  }
]);

const hourToTimeSlot = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:1,14:2,15:3,16:4,17:5,18:6,19:7,20:8,21:9,22:10,23:11,24:0}

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

const getEventsForTimeSlot = (date, hour) => {
  const dayStart = startOfDay(parseISO(`${format(date, 'yyyy-MM-dd')}T${hour}:00:00`));
  const dayEnd = endOfDay(dayStart);
  
  return events.value.filter(event => {
    const eventDate = parseISO(`${event.date}T${event.startTime}`);
    return isWithinInterval(eventDate, { start: dayStart, end: dayEnd }) &&
           parseInt(event.startTime.split(':')[0]) === hour;
  });
};

const handleTimeSlotClick = (date, hour) => {
  selectedTimeSlot.value = {
    date: format(date, 'yyyy-MM-dd'),
    hour
  };
  showAddEventModal.value = true;
};

const addEvent = (newEvent) => {
  events.value.push({
    id: events.value.length + 1,
    ...newEvent,
    completed: false
  });
  showAddEventModal.value = false;
  selectedTimeSlot.value = null;
};

const toggleEventComplete = (eventId) => {
  const event = events.value.find(e => e.id === eventId);
  if (event) {
    event.completed = !event.completed;
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
    <div class="calendar-header grid grid-cols-7 text-center text-xs font-semibold border-b pb-2">
      <div v-for="day in weekDays" :key="format(day, 'yyyy-MM-dd')">
        {{ formatDay(day) }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid grid grid-cols-7 border-t h-[calc(24*60px)] overflow-y-auto">
      <!-- Time slots for each day -->
      <div 
        v-for="day in weekDays" 
        :key="format(day, 'yyyy-MM-dd')"
        class="day-column border-r relative"
      >
        <div 
          v-for="slot in timeSlots" 
          :key="format(day, 'yyyy-MM-dd') + '-' + slot.hour"
          class="time-slot h-[60px] border-b relative group hover:bg-gray-50/5"
          @click="handleTimeSlotClick(day, slot.hour)"
        >
          <!-- Time label (only show on first column) -->
          <span 
            v-if="format(day, 'yyyy-MM-dd') === format(weekDays[0], 'yyyy-MM-dd')"
            class="absolute -left-12 -top-3 text-xs text-gray-500"
          >
            {{ slot.label }}
          </span>

          <!-- Events -->
          <div v-for="event in getEventsForTimeSlot(day, slot.hour)" :key="event.id">
            <CalendarEvent 
              :event="event"
              @toggle-complete="toggleEventComplete"
            />
          </div>
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
.calendar-grid {
  position: relative;
  margin-left: 3rem; /* Space for time labels */
}

.time-slot {
  transition: background-color 0.2s;
}

.day-column:last-child {
  border-right: none;
}
</style>