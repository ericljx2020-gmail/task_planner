<script setup>
import { ref, inject, computed, onMounted } from 'vue';
import { parseISO, isAfter, addDays, isFuture } from 'date-fns';
import api from '../services/api';

// Inject the shared events from Calendar component with a fallback empty array
const calendarEvents = inject('events', ref([]));

// Local task lists
const dueTasks = ref([]);
const inboxTasks = ref([]);

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
          duration: calculateDuration(event.start_time || event.startTime, event.end_time || event.endTime),
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
          duration: calculateDuration(event.start_time || event.startTime, event.end_time || event.endTime),
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

const toggleTaskComplete = async (taskId) => {
  // Check if it's a calendar event
  if (calendarEvents.value) {
    const calendarEvent = calendarEvents.value.find(event => event.id === taskId);
    if (calendarEvent) {
      // Toggle locally for responsive UI
      calendarEvent.completed = !calendarEvent.completed;
      
      try {
        // Update on the backend
        await api.updateEvent(taskId, {
          ...calendarEvent,
          start_time: calendarEvent.start_time || calendarEvent.startTime,
          end_time: calendarEvent.end_time || calendarEvent.endTime
        });
      } catch (error) {
        console.error('Error updating calendar event:', error);
        // Revert local change if API call fails
        calendarEvent.completed = !calendarEvent.completed;
      }
      return;
    }
  }
  
  // Otherwise, check local tasks
  const findAndToggleTask = async (tasks, updateFunc) => {
    const task = tasks.value.find(t => t.id === taskId);
    if (task) {
      // Toggle locally for responsive UI
      task.completed = !task.completed;
      
      try {
        // Update on the backend
        await updateFunc(taskId, {
          ...task,
          due_date: task.dueDate
        });
        return true;
      } catch (error) {
        console.error('Error updating task:', error);
        // Revert local change if API call fails
        task.completed = !task.completed;
        return false;
      }
    }
    return false;
  };

  if (!await findAndToggleTask(dueTasks, api.updateTask)) {
    await findAndToggleTask(inboxTasks, api.updateTask);
  }
};

// Load tasks from the backend
const loadTasks = async () => {
  try {
    const fetchedTasks = await api.getTasks();
    
    // Split tasks into due soon and inbox based on due date
    const today = new Date();
    const dueSoonThreshold = addDays(today, 3);
    
    dueTasks.value = fetchedTasks
      .filter(task => {
        const taskDate = parseISO(task.due_date);
        return isFuture(taskDate) && !isAfter(taskDate, dueSoonThreshold);
      })
      .map(task => ({
        ...task,
        dueDate: task.due_date // Keep frontend property naming
      }));
    
    inboxTasks.value = fetchedTasks
      .filter(task => {
        const taskDate = parseISO(task.due_date);
        return isAfter(taskDate, dueSoonThreshold);
      })
      .map(task => ({
        ...task,
        dueDate: task.due_date // Keep frontend property naming
      }));
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
};

// Add task function
const addTask = async (task) => {
  try {
    const taskData = {
      title: task.title,
      due_date: task.dueDate,
      duration: task.duration,
      tag: task.tag,
      completed: false
    };
    
    const createdTask = await api.createTask(taskData);
    
    // Add to the appropriate list
    const today = new Date();
    const dueSoonThreshold = addDays(today, 3);
    const taskDate = parseISO(createdTask.due_date);
    
    if (isFuture(taskDate) && !isAfter(taskDate, dueSoonThreshold)) {
      dueTasks.value.push({
        ...createdTask,
        dueDate: createdTask.due_date
      });
    } else {
      inboxTasks.value.push({
        ...createdTask,
        dueDate: createdTask.due_date
      });
    }
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

// Load tasks on component mount
onMounted(() => {
  loadTasks();
});

// Add task form state
const showAddTaskForm = ref(false);
const newTask = ref({
  title: '',
  dueDate: '',
  duration: '',
  tag: 'Inbox'
});

// Handle form submission
const handleAddTask = async () => {
  await addTask(newTask.value);
  
  // Reset form
  newTask.value = {
    title: '',
    dueDate: '',
    duration: '',
    tag: 'Inbox'
  };
  
  showAddTaskForm.value = false;
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
        <button class="p-2 bg-app-light rounded-lg hover:bg-app-hover" @click="showAddTaskForm = true">
          <span class="text-sm">+ Add</span>
        </button>
      </div>
    </div>

    <!-- Add Task Form -->
    <div v-if="showAddTaskForm" class="mb-4 p-3 bg-app-light rounded-lg">
      <h3 class="text-sm font-medium mb-2">Add New Task</h3>
      <form @submit.prevent="handleAddTask">
        <div class="mb-2">
          <input
            v-model="newTask.title"
            type="text"
            placeholder="Task title"
            class="w-full p-2 rounded border border-gray-600 bg-app-dark"
            required
          />
        </div>
        <div class="mb-2">
          <input
            v-model="newTask.dueDate"
            type="date"
            class="w-full p-2 rounded border border-gray-600 bg-app-dark"
            required
          />
        </div>
        <div class="mb-2">
          <input
            v-model="newTask.duration"
            type="text"
            placeholder="Duration (e.g. 1h 30m)"
            class="w-full p-2 rounded border border-gray-600 bg-app-dark"
            required
          />
        </div>
        <div class="mb-2">
          <select
            v-model="newTask.tag"
            class="w-full p-2 rounded border border-gray-600 bg-app-dark"
          >
            <option value="Due soon">Due soon</option>
            <option value="Inbox">Inbox</option>
          </select>
        </div>
        <div class="flex justify-between">
          <button
            type="button"
            @click="showAddTaskForm = false"
            class="px-3 py-1 border border-gray-600 rounded text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-3 py-1 bg-blue-600 rounded text-sm text-white"
          >
            Save
          </button>
        </div>
      </form>
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