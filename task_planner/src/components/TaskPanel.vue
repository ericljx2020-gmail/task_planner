<script setup>
import { ref, inject, computed } from 'vue';
import { parseISO, isAfter, addDays, isFuture } from 'date-fns';

// Inject the shared events from Calendar component with a fallback empty array
const calendarEvents = inject('events', ref([]));

// Local task lists
const dueTasks = ref([
  {
    id: 1,
    title: 'Complete project proposal',
    dueDate: '2024-01-25',
    duration: '2h',
    tag: 'Due soon',
    completed: false
  },
  {
    id: 2,
    title: 'Team meeting',
    dueDate: '2024-01-25',
    duration: '1h',
    tag: 'Due soon',
    completed: false
  }
]);

const inboxTasks = ref([
  {
    id: 3,
    title: 'Review documentation',
    dueDate: '2024-02-01',
    duration: '3h',
    tag: 'Inbox',
    completed: false
  },
  {
    id: 4,
    title: 'Update dependencies',
    dueDate: '2024-02-02',
    duration: '30m',
    tag: 'Inbox',
    completed: false
  }
]);

// Compute the combined task list from calendar events and local tasks
const combinedDueTasks = computed(() => {
  // Convert calendar events to task format
  const today = new Date();
  const dueSoonThreshold = addDays(today, 3); // Events due within 3 days go to "Due Soon"
  
  // Make sure calendarEvents.value exists before filtering
  const calendarDueTasks = calendarEvents.value
    ? calendarEvents.value
        .filter(event => {
          const eventDate = parseISO(event.date);
          return isFuture(eventDate) && !isAfter(eventDate, dueSoonThreshold);
        })
        .map(event => ({
          id: event.id,
          title: event.title,
          dueDate: event.date,
          duration: calculateDuration(event.startTime, event.endTime),
          tag: 'Due soon',
          completed: event.completed,
          isCalendarEvent: true // Flag to identify calendar events
        }))
    : [];
  
  // Combine with local due tasks
  return [...dueTasks.value, ...calendarDueTasks];
});

// Compute the inbox tasks
const combinedInboxTasks = computed(() => {
  // Convert calendar events to task format
  const today = new Date();
  const dueSoonThreshold = addDays(today, 3);
  
  // Make sure calendarEvents.value exists before filtering
  const calendarInboxTasks = calendarEvents.value
    ? calendarEvents.value
        .filter(event => {
          const eventDate = parseISO(event.date);
          return isAfter(eventDate, dueSoonThreshold);
        })
        .map(event => ({
          id: event.id,
          title: event.title,
          dueDate: event.date,
          duration: calculateDuration(event.startTime, event.endTime),
          tag: 'Inbox',
          completed: event.completed,
          isCalendarEvent: true // Flag to identify calendar events
        }))
    : [];
  
  // Combine with local inbox tasks
  return [...inboxTasks.value, ...calendarInboxTasks];
});

// Calculate duration from start and end time
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '1h'; // Default duration if times are missing
  
  const [startHour, startMin = '0'] = startTime.split(':');
  const [endHour, endMin = '0'] = endTime.split(':');
  
  const start = parseInt(startHour) * 60 + parseInt(startMin);
  const end = parseInt(endHour) * 60 + parseInt(endMin);
  const durationMinutes = end - start;
  
  if (durationMinutes >= 60) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    return `${durationMinutes}m`;
  }
}

const toggleTaskComplete = (taskId) => {
  // Check if it's a calendar event
  if (calendarEvents.value) {
    const calendarEvent = calendarEvents.value.find(event => event.id === taskId);
    if (calendarEvent) {
      calendarEvent.completed = !calendarEvent.completed;
      return;
    }
  }
  
  // Otherwise, check local tasks
  const findAndToggle = (tasks) => {
    const task = tasks.value.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      return true;
    }
    return false;
  };

  if (!findAndToggle(dueTasks)) {
    findAndToggle(inboxTasks);
  }
};
</script>

<template>
  <section class="w-[320px] p-4 border-r border-app-light overflow-y-auto bg-app-dark">
    <!-- Header -->
    <div class="header flex justify-between items-center mb-6">
      <h2 class="text-lg font-semibold">Tasks</h2>
      <div class="actions space-x-2">
        <button class="p-2 bg-app-light rounded-lg hover:bg-app-hover">
          <span class="text-sm">Filter</span>
        </button>
        <button class="p-2 bg-app-light rounded-lg hover:bg-app-hover">
          <span class="text-sm">+ Add</span>
        </button>
      </div>
    </div>

    <!-- Due Soon Section -->
    <div class="task-section mb-8">
      <h3 class="text-sm text-gray-500 font-medium uppercase mb-3">Due Soon</h3>
      <div class="space-y-2">
        <div
          v-for="task in combinedDueTasks"
          :key="task.id"
          class="task-item p-3 bg-app-light rounded-lg hover:bg-app-hover cursor-pointer"
          :class="{ 'opacity-50': task.completed, 'border-l-4 border-blue-500': task.isCalendarEvent }"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="task.completed"
              class="mt-1"
              @change="toggleTaskComplete(task.id)"
            >
            <div>
              <h4 class="font-medium" :class="{ 'line-through': task.completed }">
                {{ task.title }}
              </h4>
              <div class="flex gap-2 mt-1 text-sm text-gray-400">
                <span>{{ task.dueDate }}</span>
                <span>·</span>
                <span>{{ task.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inbox Section -->
    <div class="task-section">
      <h3 class="text-sm text-gray-500 font-medium uppercase mb-3">Inbox</h3>
      <div class="space-y-2">
        <div
          v-for="task in combinedInboxTasks"
          :key="task.id"
          class="task-item p-3 bg-app-light rounded-lg hover:bg-app-hover cursor-pointer"
          :class="{ 'opacity-50': task.completed, 'border-l-4 border-green-500': task.isCalendarEvent }"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="task.completed"
              class="mt-1"
              @change="toggleTaskComplete(task.id)"
            >
            <div>
              <h4 class="font-medium" :class="{ 'line-through': task.completed }">
                {{ task.title }}
              </h4>
              <div class="flex gap-2 mt-1 text-sm text-gray-400">
                <span>{{ task.dueDate }}</span>
                <span>·</span>
                <span>{{ task.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>