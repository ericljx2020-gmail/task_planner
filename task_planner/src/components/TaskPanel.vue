<script setup>
import { ref } from 'vue';

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

const toggleTaskComplete = (taskId) => {
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
          v-for="task in dueTasks"
          :key="task.id"
          class="task-item p-3 bg-app-light rounded-lg hover:bg-app-hover cursor-pointer"
          :class="{ 'opacity-50': task.completed }"
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
          v-for="task in inboxTasks"
          :key="task.id"
          class="task-item p-3 bg-app-light rounded-lg hover:bg-app-hover cursor-pointer"
          :class="{ 'opacity-50': task.completed }"
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