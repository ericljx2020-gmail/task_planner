# 🗂️ Task & Calendar Web App – UI Layout Spec (Vue.js Implementation)

## 🧭 Overview

This is a Vue-based web task management app with a **3-column layout**:
1. **Left Sidebar** – Navigation (tasks, friends, account icon)
2. **Middle Panel** – Task list with categorized items
3. **Right Panel** – Weekly calendar showing 7 days with 24-hour vertical time slots

Framework: **Vue 3 + Composition API**

---

## 🧱 Layout Structure

```vue
<template>
  <div class="app-container flex h-screen">
    <NavSidebar />      <!-- Left: navigation -->
    <TaskPanel />       <!-- Middle: task list -->
    <CalendarPanel />   <!-- Right: calendar view -->
  </div>
</template>
```

```css
/* Tailwind CSS assumed */
.app-container {
  @apply bg-white text-gray-900;
}
```

---

## 🧭 1. `<NavSidebar />` – Navigation Sidebar

**Fixed narrow sidebar (leftmost) with:**
- Navigation icons (Tasks, Friends, Calendar)
- User avatar (account access)

**Component Sketch:**
```vue
<template>
  <aside class="w-14 flex flex-col items-center bg-gray-100 py-4">
    <nav class="space-y-6 flex-1">
      <SidebarIcon icon="check-circle" label="Tasks" />
      <SidebarIcon icon="users" label="Friends" />
      <SidebarIcon icon="calendar" label="Calendar" />
    </nav>
    <div class="mt-auto">
      <UserAvatar />
    </div>
  </aside>
</template>
```

---

## 📋 2. `<TaskPanel />` – Task List Panel (Middle)

**Displays:**
- "Tasks" heading with filter/add options
- "Due Soon" section
- "Inbox" section

**Vue Component:**
```vue
<template>
  <section class="w-[320px] p-4 border-r overflow-y-auto bg-white">
    <div class="header flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Tasks</h2>
      <div class="actions space-x-2">
        <FilterButton />
        <AddTaskButton />
      </div>
    </div>
    <TaskSection title="Due soon" :tasks="dueTasks" />
    <TaskSection title="Inbox" :tasks="inboxTasks" />
  </section>
</template>
```

---

## 🗓 3. `<CalendarPanel />` – Weekly Calendar (Rightmost)

**Displays:**
- Week starting from Sunday
- 7-day horizontal layout
- Each column shows 24-hour vertical timeline (midnight to 11 PM)

**Vue Component:**
```vue
<template>
  <section class="flex-1 p-4 overflow-auto">
    <div class="calendar-header grid grid-cols-7 text-center text-xs font-semibold border-b pb-2">
      <div v-for="day in daysOfWeek" :key="day">{{ formatDay(day) }}</div>
    </div>
    <div class="calendar-grid grid grid-cols-7 border-t h-[calc(24*60px)]">
      <div v-for="hour in 24" :key="hour" class="row-span-1 border-b text-[10px] pl-1">
        {{ hour }}:00
      </div>
      <!-- Each day column would be populated with task blocks -->
    </div>
  </section>
</template>
```

---

## 🧩 Supporting Components

### ✅ TaskSection.vue
```vue
<template>
  <div class="mb-6">
    <h3 class="text-sm text-gray-500 font-medium uppercase mb-2">{{ title }}</h3>
    <div v-for="task in tasks" :key="task.id">
      <TaskItem :task="task" />
    </div>
  </div>
</template>
```

### 🕒 TaskItem.vue Schema
```ts
interface Task {
  id: number
  title: string
  dueDate: string
  duration: string // e.g., "30m", "1h"
  tag: string      // Inbox, Due soon
  icon?: string
  completed: boolean
}
```

---

## ⚙️ Features to Implement

| Feature                      | Notes                                               |
|-----------------------------|-----------------------------------------------------|
| Drag tasks into calendar     | Use `vue-draggable` or `interact.js`                |
| Scrollable 24h time grid     | Use CSS height + scroll for each calendar column    |
| Weekly view auto scroll      | Scroll to current time on load                      |
| Account access in sidebar    | Avatar with dropdown or modal                       |
| Dynamic calendar render      | Compute current week using `date-fns` or `luxon`    |
| Persisted tasks              | `localStorage` or Firebase for now                  |

---

## 🧰 Tech Stack

- **Vue 3 + Composition API**
- **Tailwind CSS** for responsive layout
- **Pinia / Vuex** for global task state
- **vue-draggable / interact.js** for drag-and-drop scheduling
- Optional: Firebase for sync/auth

---

Want the base folder structure or actual Vue code scaffolding for this layout?