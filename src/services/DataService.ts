import {
  User, FocusSession, Habit, Task, Analytics, HabitCompletion,
  Achievement, Note, FocusGroup, SoundscapeSettings
} from '../types';

export class DataService {
  private storageKey = 'focus-ritual-data';

  // Focus Sessions
  async createFocusSession(session: Omit<FocusSession, 'id'>): Promise<FocusSession> {
    const newSession: FocusSession = {
      ...session,
      id: this.generateId(),
    };
    
    const sessions = await this.getFocusSessions();
    sessions.push(newSession);
    await this.saveFocusSessions(sessions);
    
    return newSession;
  }

  async getFocusSessions(): Promise<FocusSession[]> {
    const data = this.getData();
    return data.focusSessions || [];
  }

  async updateFocusSession(session: FocusSession): Promise<void> {
    const sessions = await this.getFocusSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      sessions[index] = session;
      await this.saveFocusSessions(sessions);
    }
  }

  private async saveFocusSessions(sessions: FocusSession[]): Promise<void> {
    const data = this.getData();
    data.focusSessions = sessions;
    this.saveData(data);
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    const data = this.getData();
    return data.habits || this.getMockHabits();
  }

  async createHabit(habit: Omit<Habit, 'id'>): Promise<Habit> {
    const newHabit: Habit = {
      ...habit,
      id: this.generateId(),
    };
    
    const habits = await this.getHabits();
    habits.push(newHabit);
    await this.saveHabits(habits);
    
    return newHabit;
  }

  async updateHabit(habit: Habit): Promise<void> {
    const habits = await this.getHabits();
    const index = habits.findIndex(h => h.id === habit.id);
    if (index !== -1) {
      habits[index] = habit;
      await this.saveHabits(habits);
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    const habits = await this.getHabits();
    const filteredHabits = habits.filter(h => h.id !== habitId);
    await this.saveHabits(filteredHabits);
  }

  private async saveHabits(habits: Habit[]): Promise<void> {
    const data = this.getData();
    data.habits = habits;
    this.saveData(data);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const data = this.getData();
    return data.tasks || this.getMockTasks();
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const now = new Date();
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    const tasks = await this.getTasks();
    tasks.push(newTask);
    await this.saveTasks(tasks);
    
    return newTask;
  }

  async updateTask(task: Task): Promise<void> {
    const updatedTask = {
      ...task,
      updatedAt: new Date(),
    };
    
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      await this.saveTasks(tasks);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    await this.saveTasks(filteredTasks);
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    const data = this.getData();
    data.tasks = tasks;
    this.saveData(data);
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const data = this.getData();
    return data.analytics || this.getMockAnalytics();
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const data = this.getData();
    return data.achievements || this.getMockAchievements();
  }

  // Data persistence
  private getData(): any {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load data:', error);
      return {};
    }
  }

  private saveData(data: any): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mock data generators
  private getMockHabits(): Habit[] {
    return [
      {
        id: '1',
        userId: 'user-1',
        name: 'Morning Meditation',
        description: 'Start the day with 10 minutes of mindfulness',
        category: { id: '1', name: 'Wellness', color: '#10B981', icon: 'Heart' },
        frequency: { type: 'daily' },
        targetCount: 1,
        currentStreak: 12,
        bestStreak: 28,
        totalCompletions: 156,
        color: '#10B981',
        icon: 'Heart',
        priority: 'high',
        createdAt: new Date('2024-01-01'),
        reminders: [{ id: '1', time: '07:00', enabled: true, message: 'Time for morning meditation' }],
      },
      {
        id: '2',
        userId: 'user-1',
        name: 'Read 30 Minutes',
        description: 'Daily reading to expand knowledge',
        category: { id: '2', name: 'Learning', color: '#3B82F6', icon: 'Book' },
        frequency: { type: 'daily' },
        targetCount: 1,
        currentStreak: 8,
        bestStreak: 21,
        totalCompletions: 89,
        color: '#3B82F6',
        icon: 'Book',
        priority: 'medium',
        createdAt: new Date('2024-01-15'),
        reminders: [{ id: '2', time: '20:00', enabled: true, message: 'Time for evening reading' }],
      },
      {
        id: '3',
        userId: 'user-1',
        name: 'Exercise',
        description: 'Physical activity for health and energy',
        category: { id: '3', name: 'Fitness', color: '#F59E0B', icon: 'Zap' },
        frequency: { type: 'daily' },
        targetCount: 1,
        currentStreak: 5,
        bestStreak: 15,
        totalCompletions: 67,
        color: '#F59E0B',
        icon: 'Zap',
        priority: 'high',
        createdAt: new Date('2024-02-01'),
        reminders: [{ id: '3', time: '18:00', enabled: true, message: 'Time to exercise' }],
      },
    ];
  }

  private getMockTasks(): Task[] {
    return [
      {
        id: '1',
        userId: 'user-1',
        title: 'Complete project proposal',
        description: 'Finish the Q2 project proposal for client review',
        priority: { level: 'high', color: '#EF4444' },
        urgency: { level: 'high', color: '#EF4444' },
        status: { type: 'inProgress', label: 'In Progress', color: '#3B82F6' },
        category: 'Work',
        tags: ['urgent', 'client'],
        dueDate: new Date('2024-02-15'),
        estimatedTime: 120,
        actualTime: 80,
        subtasks: [
          { id: '1', title: 'Research requirements', completed: true },
          { id: '2', title: 'Draft proposal outline', completed: true },
          { id: '3', title: 'Write detailed proposal', completed: false },
          { id: '4', title: 'Review and finalize', completed: false },
        ],
        dependencies: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-10'),
      },
      {
        id: '2',
        userId: 'user-1',
        title: 'Update website content',
        description: 'Refresh the about page and add new team member bios',
        priority: { level: 'medium', color: '#F59E0B' },
        urgency: { level: 'low', color: '#10B981' },
        status: { type: 'todo', label: 'To Do', color: '#6B7280' },
        category: 'Marketing',
        tags: ['website', 'content'],
        dueDate: new Date('2024-02-20'),
        estimatedTime: 60,
        subtasks: [
          { id: '1', title: 'Gather team member info', completed: false },
          { id: '2', title: 'Write new bios', completed: false },
          { id: '3', title: 'Update about page', completed: false },
        ],
        dependencies: [],
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05'),
      },
      {
        id: '3',
        userId: 'user-1',
        title: 'Learn React hooks',
        description: 'Study advanced React hooks patterns and best practices',
        priority: { level: 'medium', color: '#F59E0B' },
        urgency: { level: 'low', color: '#10B981' },
        status: { type: 'inProgress', label: 'In Progress', color: '#3B82F6' },
        category: 'Learning',
        tags: ['react', 'development', 'self-improvement'],
        estimatedTime: 240,
        actualTime: 120,
        subtasks: [
          { id: '1', title: 'Read documentation', completed: true },
          { id: '2', title: 'Build practice projects', completed: false },
          { id: '3', title: 'Review code examples', completed: false },
        ],
        dependencies: [],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-08'),
      },
    ];
  }

  private getMockAnalytics(): Analytics {
    return {
      focusSessions: {
        totalSessions: 124,
        totalFocusTime: 2940, // minutes
        averageSessionLength: 23.7,
        completionRate: 87.5,
        streakData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
          count: Math.floor(Math.random() * 6) + 1,
          type: 'focus' as const,
        })),
        productivityTrends: Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
          score: Math.floor(Math.random() * 40) + 60,
          sessions: Math.floor(Math.random() * 8) + 2,
          focusTime: Math.floor(Math.random() * 180) + 60,
        })),
        flowStateHours: [9, 10, 11, 14, 15, 16, 20, 21],
        distractionPatterns: [
          { hour: 9, count: 3, type: 'email' },
          { hour: 11, count: 5, type: 'social' },
          { hour: 14, count: 7, type: 'phone' },
          { hour: 16, count: 4, type: 'notifications' },
        ],
      },
      habits: {
        totalHabits: 8,
        completionRate: 78.5,
        averageStreak: 12.3,
        categoryBreakdown: [
          { category: 'Wellness', count: 3, completionRate: 85, color: '#10B981' },
          { category: 'Learning', count: 2, completionRate: 72, color: '#3B82F6' },
          { category: 'Fitness', count: 2, completionRate: 68, color: '#F59E0B' },
          { category: 'Productivity', count: 1, completionRate: 90, color: '#8B5CF6' },
        ],
        weeklyPatterns: Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          completionRate: Math.floor(Math.random() * 30) + 70,
          averageCompletions: Math.floor(Math.random() * 3) + 2,
        })),
      },
      tasks: {
        totalTasks: 47,
        completionRate: 73.2,
        averageCompletionTime: 45.6,
        priorityDistribution: [
          { priority: 'High', count: 12, completionRate: 85, color: '#EF4444' },
          { priority: 'Medium', count: 23, completionRate: 78, color: '#F59E0B' },
          { priority: 'Low', count: 12, completionRate: 65, color: '#10B981' },
        ],
        productivityByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          tasksCompleted: i >= 8 && i <= 18 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2),
          focusTime: i >= 8 && i <= 18 ? Math.floor(Math.random() * 60) + 30 : Math.floor(Math.random() * 20),
          productivityScore: i >= 8 && i <= 18 ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30) + 20,
        })),
      },
      overall: {
        productivityScore: 87,
        weeklyGoalProgress: 72,
        monthlyGoalProgress: 68,
        achievements: this.getMockAchievements(),
        level: 12,
        xp: 2450,
        nextLevelXp: 3000,
      },
    };
  }

  private getMockAchievements(): Achievement[] {
    return [
      {
        id: '1',
        name: 'Focus Master',
        description: 'Complete 100 focus sessions',
        icon: 'Target',
        type: 'focus',
        requirement: 100,
        progress: 124,
        unlocked: true,
        unlockedAt: new Date('2024-01-20'),
        xpReward: 500,
      },
      {
        id: '2',
        name: 'Habit Architect',
        description: 'Maintain a 30-day streak',
        icon: 'Calendar',
        type: 'habit',
        requirement: 30,
        progress: 28,
        unlocked: false,
        xpReward: 750,
      },
      {
        id: '3',
        name: 'Task Ninja',
        description: 'Complete 50 tasks',
        icon: 'CheckCircle',
        type: 'task',
        requirement: 50,
        progress: 47,
        unlocked: false,
        xpReward: 300,
      },
      {
        id: '4',
        name: 'Level Up',
        description: 'Reach level 10',
        icon: 'Star',
        type: 'level',
        requirement: 10,
        progress: 12,
        unlocked: true,
        unlockedAt: new Date('2024-02-01'),
        xpReward: 1000,
      },
    ];
  }
}