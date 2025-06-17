/**
 * Interface for a message in the AI chat
 */
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

/**
 * Interface for history messages in the Gemini API format
 */
export interface ChatHistory {
  role: 'user' | 'model';
  content: string;
}

/**
 * Interface for Gemini API response
 */
export interface GeminiResponse {
  success: boolean;
  data?: string;
  message?: string;
}

/**
 * Interface for an AI-generated insight
 */
export interface AIInsight {
  id: string;
  type: 'productivity' | 'habit' | 'focus' | 'goal';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Interface for a user goal
 */
export interface UserGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
}

/**
 * AI Coach settings interface
 */
export interface AICoachSettings {
  personality: 'encouraging' | 'direct' | 'analytical' | 'casual';
  responseStyle: 'detailed' | 'concise' | 'actionable';
  voiceEnabled: boolean;
  proactiveInsights: boolean;
  dailyCheckins: boolean;
} 