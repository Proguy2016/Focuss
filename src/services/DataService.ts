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
    return data.habits || [];
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

  // Habit Completions
  async getHabitCompletions(): Promise<HabitCompletion[]> {
    const data = this.getData();
    return data.habitCompletions || [];
  }

  async saveHabitCompletion(completion: HabitCompletion): Promise<void> {
    const completions = await this.getHabitCompletions();
    completions.push(completion);
    await this.saveHabitCompletions(completions);
  }

  private async saveHabitCompletions(completions: HabitCompletion[]): Promise<void> {
    const data = this.getData();
    data.habitCompletions = completions;
    this.saveData(data);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const data = this.getData();
    return data.tasks || [];
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
    return data.analytics || {
      overall: {
        productivityScore: 0,
        achievements: [],
      },
      focusSessions: {
        totalSessions: 0,
        totalFocusTime: 0,
        averageSessionLength: 0,
        completionRate: 0,
        productivityTrends: [],
        peakProductivity: {
          time: '',
          day: '',
        },
      },
      tasks: {
        totalTasks: 0,
        completionRate: 0,
        overdueTasks: 0,
      },
      habits: {
        totalHabits: 0,
        completionRate: 0,
        streaks: [],
      },
    };
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const data = this.getData();
    return data.achievements || [];
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
}