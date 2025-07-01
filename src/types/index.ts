export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  totalFocusTime: number;
  streak: number;
  joinDate: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  customTheme?: CustomTheme;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  focusMusic: string;
  ambientVolume: number;
}

export interface CustomTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  productivity: number; // 1-10 rating
}

export interface FocusSession {
  id: string;
  userId: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  actualDuration: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  distractions: number;
  notes?: string;
  tags?: string[];
  productivity: number; // 1-10 rating
}

export interface Habit {
  id: string;
  habitId: string;
  userId: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number;
  priority: 'Low' | 'Medium' | 'High';
  currentStreak: number;
  longestStreak: number;
  lastCompleted: Date | null;
  completions: HabitCompletion[];
  createdAt: Date;
  progress: number;
  completed: boolean;
}

export interface HabitCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface HabitFrequency {
  type: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  customPattern?: number; // every N days
}

export interface HabitReminder {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
  message: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: Date;
  count: number;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  category?: string;
  estimatedTime: number;
  tags: string[];
  dueDate?: Date;
  subtasks: string[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskPriority {
  level: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
}

export interface TaskUrgency {
  level: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
}

export interface TaskStatus {
  type: 'todo' | 'inProgress' | 'blocked' | 'completed';
  label: string;
  color: string;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export interface Analytics {
  focusSessions: FocusSessionAnalytics;
  habits: HabitAnalytics;
  tasks: TaskAnalytics;
  overall: OverallAnalytics;
  dailyActivity?: Record<string, DailyActivityData>;
}

export interface DailyActivityData {
  focusSessions: number;
  focusTime: number;
  tasksCompleted: number;
}

export interface FocusSessionAnalytics {
  totalSessions: number;
  totalFocusTime: number;
  averageSessionLength: number;
  completionRate: number;
  streakData: StreakData[];
  productivityTrends: ProductivityTrend[];
  flowStateHours: number[];
  distractionPatterns: DistractionPattern[];
}

export interface HabitAnalytics {
  totalHabits: number;
  completionRate: number;
  averageStreak: number;
  categoryBreakdown: CategoryBreakdown[];
  weeklyPatterns: WeeklyPattern[];
}

export interface TaskAnalytics {
  totalTasks: number;
  totalCompleted?: number;
  completionRate: number;
  averageCompletionTime: number;
  priorityDistribution: PriorityDistribution[];
  productivityByHour: ProductivityByHour[];
}

export interface OverallAnalytics {
  productivityScore: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
  achievements: Achievement[];
  level: number;
  xp: number;
  nextLevelXp: number;
  totalXp?: number; // Optional, for client-side calculations
}

export interface StreakData {
  date: Date;
  count: number;
  type: 'focus' | 'habit' | 'task';
}

export interface ProductivityTrend {
  date: Date;
  score: number;
  sessions: number;
  focusTime: number;
}

export interface DistractionPattern {
  hour: number;
  count: number;
  type: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  completionRate: number;
  color: string;
}

export interface WeeklyPattern {
  dayOfWeek: number;
  completionRate: number;
  averageCompletions: number;
}

export interface PriorityDistribution {
  priority: string;
  count: number;
  completionRate: number;
  color: string;
}

export interface ProductivityByHour {
  hour: number;
  tasksCompleted: number;
  focusTime: number;
  productivityScore: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'focus' | 'habit' | 'task' | 'streak' | 'level';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

export interface FocusGroup {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdBy: string;
  createdAt: Date;
  settings: FocusGroupSettings;
  currentSession?: GroupSession;
}

export interface FocusGroupSettings {
  isPublic: boolean;
  maxMembers: number;
  sessionSync: boolean;
  leaderboard: boolean;
  shareProgress: boolean;
}

export interface GroupSession {
  id: string;
  groupId: string;
  startTime: Date;
  duration: number;
  participants: SessionParticipant[];
  type: 'work' | 'break';
}

export interface SessionParticipant {
  userId: string;
  joinedAt: Date;
  status: 'active' | 'away' | 'focused';
  productivity: number;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  sessionId?: string; // Linked to focus session
  createdAt: Date;
  updatedAt: Date;
  type: 'note' | 'mindMap' | 'flashcard';
}

export interface Flashcard {
  id: string;
  noteId: string;
  front: string;
  back: string;
  difficulty: number; // 1-5
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
}

export interface SoundscapeSettings {
  enabled: boolean;
  volume: number;
  activeScenes: string[];
  binauralBeats: BinauralBeatSettings;
  customMix: CustomSoundMix[];
}

export interface BinauralBeatSettings {
  enabled: boolean;
  frequency: number; // Hz
  volume: number;
  waveType: 'sine' | 'square' | 'triangle';
}

export interface CustomSoundMix {
  id: string;
  name: string;
  sounds: SoundLayer[];
}

export interface SoundLayer {
  type: 'rain' | 'ocean' | 'forest' | 'coffee' | 'fire' | 'wind' | 'binaural';
  volume: number;
  settings?: Record<string, any>;
}