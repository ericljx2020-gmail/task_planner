<script setup>
import { ref, inject, computed, onMounted, watchEffect } from 'vue';
import { parseISO, isAfter, addDays, isFuture } from 'date-fns';
import api from '../services/api';

// Inject the shared events from Calendar component with a fallback empty array
const calendarEvents = inject('events', ref([]));

// Task lists
const dueTasks = ref([]);
const inboxTasks = ref([]);
const isLoading = ref(false);

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
      try {
        // Update on the backend
        await api.updateEvent(taskId, {
          ...calendarEvent,
          completed: !calendarEvent.completed,
          start_time: calendarEvent.start_time || calendarEvent.startTime,
          end_time: calendarEvent.end_time || calendarEvent.endTime
        });
        
        // No need to manipulate the local state
        // The Calendar component will refresh the events
        
        return;
      } catch (error) {
        console.error('Error updating calendar event:', error);
        alert('Error updating task. Please try again.');
        return;
      }
    }
  }
  
  // Handle tasks from the task lists
  const findAndToggleTask = async (tasksList) => {
    const task = tasksList.value.find(t => t.id === taskId);
    if (task) {
      try {
        // Update on the backend
        await api.updateTask(taskId, {
          ...task,
          completed: !task.completed,
          due_date: task.dueDate
        });
        
        // Refresh tasks from the server
        await loadTasks();
        return true;
      } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
        return false;
      }
    }
    return false;
  };

  if (!await findAndToggleTask(dueTasks)) {
    await findAndToggleTask(inboxTasks);
  }
};

// Delete a task
const deleteTask = async (taskId) => {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  try {
    await api.deleteTask(taskId);
    // Refresh tasks from the server
    await loadTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Error deleting task. Please try again.');
  }
};

// Load tasks from the backend
const loadTasks = async () => {
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
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
    
    await api.createTask(taskData);
    
    // Refresh tasks from the server to ensure consistency
    await loadTasks();
    
    return true;
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Error creating task. Please try again.');
    return false;
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
  const success = await addTask(newTask.value);
  
  if (success) {
    // Reset form
    newTask.value = {
      title: '',
      dueDate: '',
      duration: '',
      tag: 'Inbox'
    };
    
    showAddTaskForm.value = false;
  }
};
</script>

<template>
  <section class="task-panel w-[320px] p-4 overflow-y-auto">
    <!-- Header -->
    <div class="header flex justify-between items-center mb-6">
      <h2 class="text-lg font-semibold">Tasks</h2>
      <div class="actions space-x-2">
        <button class="task-button p-2 rounded-lg">
          <span class="text-sm">Filter</span>
        </button>
        <button class="task-button p-2 rounded-lg" @click="showAddTaskForm = true">
          <span class="text-sm">+ Add</span>
        </button>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="text-center py-2 loading-indicator mb-3">
      Loading tasks...
    </div>

    <!-- Add Task Form -->
    <div v-if="showAddTaskForm" class="add-task-form mb-4 p-3 rounded-lg">
      <h3 class="text-sm font-medium mb-2">Add New Task</h3>
      <form @submit.prevent="handleAddTask">
        <div class="mb-2">
          <input
            v-model="newTask.title"
            type="text"
            placeholder="Task title"
            class="w-full p-2 rounded border form-input"
            required
          />
        </div>
        <div class="mb-2">
          <input
            v-model="newTask.dueDate"
            type="date"
            class="w-full p-2 rounded border form-input"
            required
          />
        </div>
        <div class="mb-2">
          <input
            v-model="newTask.duration"
            type="text"
            placeholder="Duration (e.g. 1h 30m)"
            class="w-full p-2 rounded border form-input"
            required
          />
        </div>
        <div class="mb-2">
          <select
            v-model="newTask.tag"
            class="w-full p-2 rounded border form-input"
          >
            <option value="Due soon">Due soon</option>
            <option value="Inbox">Inbox</option>
          </select>
        </div>
        <div class="flex justify-between">
          <button
            type="button"
            @click="showAddTaskForm = false"
            class="cancel-button px-3 py-1 border rounded text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="save-button px-3 py-1 rounded text-sm text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>

    <!-- Due Soon Section -->
    <div class="task-section mb-8">
      <h3 class="task-section-title text-sm font-medium uppercase mb-3">Due Soon</h3>
      <div class="space-y-2">
        <div
          v-for="task in combinedDueTasks"
          :key="task.id"
          class="task-item p-3 rounded-lg cursor-pointer group"
          :class="{ 'completed': task.completed, 'calendar-event': task.isCalendarEvent }"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="task.completed"
              class="task-checkbox mt-1"
              @change="toggleTaskComplete(task.id)"
            >
            <div class="flex-grow">
              <h4 class="task-title font-medium" :class="{ 'line-through': task.completed }">
                {{ task.title }}
              </h4>
              <div class="task-details flex gap-2 mt-1 text-sm">
                <span>{{ task.dueDate }}</span>
                <span>·</span>
                <span>{{ task.duration }}</span>
              </div>
            </div>
            <!-- Only show delete button for tasks, not events -->
            <button 
              v-if="!task.isCalendarEvent"
              @click="deleteTask(task.id)" 
              class="delete-button opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete task"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Inbox Section -->
    <div class="task-section">
      <h3 class="task-section-title text-sm font-medium uppercase mb-3">Inbox</h3>
      <div class="space-y-2">
        <div
          v-for="task in combinedInboxTasks"
          :key="task.id"
          class="task-item p-3 rounded-lg cursor-pointer group"
          :class="{ 'completed': task.completed, 'calendar-event-inbox': task.isCalendarEvent }"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="task.completed"
              class="task-checkbox mt-1"
              @change="toggleTaskComplete(task.id)"
            >
            <div class="flex-grow">
              <h4 class="task-title font-medium" :class="{ 'line-through': task.completed }">
                {{ task.title }}
              </h4>
              <div class="task-details flex gap-2 mt-1 text-sm">
                <span>{{ task.dueDate }}</span>
                <span>·</span>
                <span>{{ task.duration }}</span>
              </div>
            </div>
            <!-- Only show delete button for tasks, not events -->
            <button 
              v-if="!task.isCalendarEvent"
              @click="deleteTask(task.id)" 
              class="delete-button opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete task"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.task-panel {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-right: 1px solid var(--border-color);
  transition: var(--theme-transition);
}

.task-button {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transition: var(--theme-transition);
}

.task-button:hover {
  background-color: var(--primary-color);
  opacity: 0.9;
}

.loading-indicator {
  color: var(--primary-color);
}

.add-task-form {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}

.form-input {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.cancel-button {
  background-color: transparent;
  border-color: var(--border-color);
  color: var(--text-primary);
}

.save-button {
  background-color: var(--primary-color);
}

.task-section-title {
  color: var(--text-secondary);
}

.task-item {
  background-color: var(--bg-tertiary);
  transition: var(--theme-transition);
}

.task-item:hover {
  background-color: var(--bg-primary);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.task-item.completed {
  opacity: 0.5;
}

.task-title {
  color: var(--text-primary);
}

.task-details {
  color: var(--text-secondary);
}

.task-checkbox {
  accent-color: var(--primary-color);
}

.delete-button {
  color: var(--text-secondary);
}

.delete-button:hover {
  color: var(--text-primary);
}

.calendar-event {
  border-left: 4px solid var(--primary-color);
}

.calendar-event-inbox {
  border-left: 4px solid var(--success-color);
}
</style>