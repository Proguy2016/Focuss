# Dashboard Upcoming Tasks Fix

## Problem
The "Upcoming Tasks" widget in the Dashboard was not displaying any tasks, even when tasks existed in the database.

**Root Cause:** The `refreshStats()` function in AppContext was **not fetching tasks** from the backend, so `state.tasks` remained empty, causing the UpcomingTasks component to show "No upcoming tasks with due dates".

## Investigation

### What Was Missing:
The AppContext's `refreshStats()` function only fetched:
- ✅ User statistics (productivity score, XP, focus time, etc.)
- ✅ Habits data
- ❌ **Tasks data** - This was never fetched!

### UpcomingTasks Component Dependency:
```typescript
// UpcomingTasks.tsx
const upcomingTasks = state.tasks
  .filter(task => task.dueDate && !task.completed)
  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  .slice(0, 5);
```

The component relies on `state.tasks` from AppContext, but this array was never populated when the Dashboard loaded.

## Solution

### Added Task Fetching to refreshStats()
**File:** `src/contexts/AppContext.tsx`

**Added code after stats fetch:**
```typescript
// Fetch tasks
try {
  const tasksRes = await fetch('http://localhost:5001/api/stats/getTasks', {
    method: 'GET',
    credentials: 'include',
    headers,
  });
  
  if (tasksRes.ok) {
    const tasksData = await tasksRes.json();
    if (tasksData && Array.isArray(tasksData.tasks)) {
      // Map backend task format to frontend Task interface
      const mappedTasks = tasksData.tasks
        .filter((t: any) => typeof t === 'object' && t.taskTitle)
        .map((task: any) => ({
          id: task._id || task.taskId || task.id,
          title: task.taskTitle || task.title,
          description: task.taskDescription || task.description || '',
          priority: task.priority || 'Medium',
          dueDate: task.dueDate,
          completed: task.completed || false,
          subtasks: Array.isArray(task.subTasks) ? [...task.subTasks] : 
                    (Array.isArray(task.subtasks) ? [...task.subtasks] : []),
          category: task.category || '',
          tags: task.tags || [],
          estimatedTime: task.estimatedTime || 0,
        }));
      
      dispatch({ type: 'SET_TASKS', payload: mappedTasks });
    }
  }
} catch (taskError) {
  console.error('Failed to fetch tasks:', taskError);
  // Don't fail the whole refresh if tasks fail
}
```

## How It Works Now

### Dashboard Load Flow:
1. **User navigates to Dashboard** → `useEffect` triggers
2. **loadData() executes** → Calls `refreshStats()`
3. **refreshStats() fetches:**
   - ✅ User statistics from `/api/stats/get`
   - ✅ **Tasks from `/api/stats/getTasks`** (NEW!)
4. **Tasks dispatched to AppContext** → `state.tasks` populated
5. **UpcomingTasks component renders** → Shows filtered tasks

### Task Mapping:
Backend format → Frontend format:
- `taskTitle` → `title`
- `taskDescription` → `description`
- `subTasks` → `subtasks`
- `_id` → `id`
- All other fields preserved

### Error Handling:
- ✅ Task fetch wrapped in try-catch
- ✅ Won't break stats loading if tasks fail
- ✅ Logs error for debugging
- ✅ Continues with empty tasks array if fetch fails

## Data Flow

```
Dashboard Component
       ↓
   useEffect() → loadData()
       ↓
   refreshStats() [AppContext]
       ↓
   ├─→ fetch('/api/stats/get')
   │      ↓
   │   dispatch({ type: 'SET_ANALYTICS', payload: stats })
   │
   └─→ fetch('/api/stats/getTasks')  ← NEW!
          ↓
       Map tasks to frontend format
          ↓
       dispatch({ type: 'SET_TASKS', payload: mappedTasks })
          ↓
       state.tasks populated
          ↓
   UpcomingTasks Component
          ↓
       Filter & display tasks
```

## Benefits
✅ Dashboard now shows upcoming tasks on load
✅ Tasks automatically refresh when navigating to Dashboard
✅ Consistent with Tasks page (uses same endpoint and mapping)
✅ Graceful error handling (won't break Dashboard if tasks fail)
✅ Single source of truth for tasks in AppContext
✅ UpcomingTasks component works as designed

## What Gets Displayed

The **Upcoming Tasks** widget now shows:
- Up to **5 tasks**
- That have a **due date**
- That are **not completed** (`completed === false`)
- Sorted by **earliest due date first**
- With proper **priority colors** (Urgent/High/Medium/Low)
- With **due date formatting** (Due today, Due tomorrow, Due in X days)

## Testing Checklist
- [ ] Create tasks with due dates in the Tasks page
- [ ] Navigate to Dashboard
- [ ] Verify upcoming tasks appear in the widget
- [ ] Mark a task as complete and refresh Dashboard
- [ ] Verify completed task disappears from upcoming list
- [ ] Check that tasks are sorted by due date
- [ ] Verify priority colors display correctly
