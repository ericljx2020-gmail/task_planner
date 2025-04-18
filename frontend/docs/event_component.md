Calendar Event Rendering Specification

📌 Purpose
This document outlines the implementation and UI behavior requirements for rendering calendar events within the Calendar.vue component. It ensures synchronization with the TaskPanel.vue and provides visual consistency for overlapping event blocks.

🧱 Component Structure
bash
复制
编辑
src/
├── components/
│   ├── Calendar.vue           # Main weekly calendar view
│   ├── CalendarEvent.vue      # Individual calendar event
│   ├── TaskPanel.vue          # Sidebar task list
│   └── AddEventModal.vue      # Modal for event creation
📆 Event Rendering Rules
1. ⏱ Time Span Visualization
Goal: Events should be visually represented across their exact time span.

Behavior:

If an event is scheduled from 15:00 to 19:00, the visual block inside the calendar must span vertically from the 15:00 row to the 19:00 row on the specified date.

Implementation Hint:

Use CSS height + top offset calculated from start and end time.

Example pseudocode:

js
复制
编辑
const startHour = parseInt(event.startTime.split(':')[0])
const endHour = parseInt(event.endTime.split(':')[0])
const duration = endHour - startHour
const top = startHour * cellHeight
const height = duration * cellHeight
2. 🔁 Overlapping Event Stacking
Goal: When multiple events overlap in time, stack them side by side, similar to the UI shown in the second reference image.

Behavior:

Maintain readable time spans.

Do not hide any event – reduce width to fit them side-by-side within the same time block.

Visual Reference:

Implementation Suggestion:

Detect conflicts by comparing start and end times.

Dynamically assign each event a horizontal index and reduce width accordingly.

Use Flexbox or absolute positioning with left: index * (100% / totalConflicts) logic.

3. 🔄 Task Synchronization
Goal: Any event created by clicking the calendar must also appear in the TaskPanel.vue under the appropriate section (e.g., “Due Soon” or “Inbox”).

Behavior:

When a user clicks a time slot and adds an event using AddEventModal.vue, that event:

Renders in the Calendar.vue

Automatically appears in TaskPanel.vue with consistent title, time, and duration

Sync Logic:

Use a shared reactive store (e.g., Vuex, Pinia, or a global ref) to maintain a single source of truth.

Bind both Calendar.vue and TaskPanel.vue to this store so that adding an event updates both UIs.