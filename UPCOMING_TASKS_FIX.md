# Upcoming Tasks Dashboard Fix

## Problem
The "Upcoming Tasks" section in the Dashboard was showing completed tasks instead of only showing incomplete (yet to be completed) tasks.

**Root Causes:**
1. **Wrong filter condition**: Used `task.status.type !== 'completed'` but the Task interface has `completed: boolean`, not a `status` object
2. **Wrong priority structure**: Tried to access `task.priority.level` and `task.priority.color` but `priority` is a string ('Urgent', 'High', 'Medium', 'Low'), not an object

## Solution

### 1. Fixed Task Filtering
**File:** `src/components/dashboard/UpcomingTasks.tsx`

**Before:**
```typescript
const upcomingTasks = state.tasks
  .filter(task => task.dueDate && task.status.type !== 'completed')
  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  .slice(0, 5);
```

**After:**
```typescript
// Get upcoming tasks (next 5 incomplete tasks with due dates, sorted by due date)
const upcomingTasks = state.tasks
  .filter(task => task.dueDate && !task.completed)
  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  .slice(0, 5);
```

**Changes:**
- ✅ `task.status.type !== 'completed'` → `!task.completed`
- ✅ Matches the actual Task interface structure
- ✅ Only shows tasks where `completed === false`

### 2. Fixed Priority Handling
**File:** `src/components/dashboard/UpcomingTasks.tsx`

Added two helper functions to handle string-based priorities:

```typescript
const getPriorityColor = (priority: string) => {
  const priorityLower = priority?.toLowerCase() || 'low';
  switch (priorityLower) {
    case 'urgent':
      return 'text-red-400 bg-red-500/10';
    case 'high':
      return 'text-orange-400 bg-orange-500/10';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/10';
    case 'low':
    default:
      return 'text-green-400 bg-green-500/10';
  }
};

const getPriorityDotColor = (priority: string) => {
  const priorityLower = priority?.toLowerCase() || 'low';
  switch (priorityLower) {
    case 'urgent':
      return 'bg-red-400';
    case 'high':
      return 'bg-orange-400';
    case 'medium':
      return 'bg-yellow-400';
    case 'low':
    default:
      return 'bg-green-400';
  }
};
```

**Fixed usage:**
- ❌ `getPriorityColor(task.priority.level)` → ✅ `getPriorityColor(task.priority)`
- ❌ `task.priority.color === '#EF4444'` → ✅ `getPriorityDotColor(task.priority)`

## Task Interface Reference
```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;          // 'Urgent' | 'High' | 'Medium' | 'Low'
  completed: boolean;         // ← Key property for filtering
  category?: string;
  estimatedTime: number;
  tags: string[];
  dueDate?: Date;
  subtasks: string[];
}
```

## How It Works Now

### Display Logic:
1. **Fetch all tasks** from `state.tasks` (AppContext)
2. **Filter tasks** where:
   - Has a due date (`task.dueDate` exists)
   - Is NOT completed (`!task.completed`)
3. **Sort by due date** (earliest first)
4. **Take first 5** tasks
5. **Display** with proper priority colors

### Priority Colors:
- 🔴 **Urgent**: Red (`text-red-400 bg-red-500/10`)
- 🟠 **High**: Orange (`text-orange-400 bg-orange-500/10`)
- 🟡 **Medium**: Yellow (`text-yellow-400 bg-yellow-500/10`)
- 🟢 **Low**: Green (`text-green-400 bg-green-500/10`)

## Benefits
✅ Only shows incomplete tasks (tasks yet to be completed)
✅ Correctly sorted by due date (earliest first)
✅ Proper priority colors and indicators
✅ No TypeScript errors
✅ Matches the actual Task data structure
✅ Shows up to 5 upcoming tasks with due dates

## Testing Checklist
- [ ] Create tasks with different priorities and due dates
- [ ] Mark some tasks as completed
- [ ] Verify only incomplete tasks appear in "Upcoming Tasks"
- [ ] Verify tasks are sorted by due date (earliest first)
- [ ] Check priority colors match the task priority level
- [ ] Verify "You're all caught up!" message when no upcoming tasks
