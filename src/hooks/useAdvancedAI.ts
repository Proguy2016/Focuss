import { useState, useCallback } from 'react';

export interface AIInsight {
  id: string;
  type: 'productivity' | 'collaboration' | 'quality' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedActions?: string[];
  timestamp: Date;
}

export interface SmartSuggestion {
  id: string;
  context: string;
  suggestion: string;
  type: 'autocomplete' | 'template' | 'improvement' | 'optimization';
  confidence: number;
  accepted?: boolean;
}

export interface PredictiveAnalytics {
  taskCompletionPrediction: {
    taskId: string;
    estimatedCompletion: Date;
    confidence: number;
    blockers: string[];
  }[];
  meetingEffectiveness: {
    score: number;
    factors: string[];
    improvements: string[];
  };
  teamProductivity: {
    trend: 'increasing' | 'decreasing' | 'stable';
    score: number;
    insights: string[];
  };
}

export function useAdvancedAI() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveAnalytics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateInsights = useCallback(async (roomData: any) => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newInsights: AIInsight[] = [
      {
        id: Date.now().toString(),
        type: 'productivity',
        title: 'Peak Productivity Window Detected',
        description: 'Team shows 40% higher task completion rate between 10-11 AM. Consider scheduling important discussions during this time.',
        confidence: 0.87,
        impact: 'high',
        actionable: true,
        suggestedActions: ['Schedule critical reviews at 10 AM', 'Block calendar for deep work'],
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'collaboration',
        title: 'Communication Pattern Analysis',
        description: 'Detected uneven participation. 2 team members contribute 70% of discussions.',
        confidence: 0.92,
        impact: 'medium',
        actionable: true,
        suggestedActions: ['Use round-robin discussion format', 'Assign speaking roles'],
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 2).toString(),
        type: 'prediction',
        title: 'Task Completion Forecast',
        description: 'Current velocity suggests project completion 3 days ahead of schedule.',
        confidence: 0.78,
        impact: 'high',
        actionable: false,
        timestamp: new Date(),
      },
    ];

    setInsights(prev => [...newInsights, ...prev].slice(0, 10));
    setIsProcessing(false);
  }, []);

  const generateSmartSuggestions = useCallback(async (context: string, content: string) => {
    const suggestions: SmartSuggestion[] = [
      {
        id: Date.now().toString(),
        context,
        suggestion: 'Consider breaking this task into smaller, more manageable subtasks',
        type: 'improvement',
        confidence: 0.85,
      },
      {
        id: (Date.now() + 1).toString(),
        context,
        suggestion: 'Add acceptance criteria to improve task clarity',
        type: 'template',
        confidence: 0.79,
      },
    ];

    setSuggestions(prev => [...suggestions, ...prev].slice(0, 5));
  }, []);

  const generatePredictiveAnalytics = useCallback(async (roomData: any) => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analytics: PredictiveAnalytics = {
      taskCompletionPrediction: roomData.tasks?.map((task: any) => ({
        taskId: task.id,
        estimatedCompletion: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        confidence: 0.7 + Math.random() * 0.25,
        blockers: task.status === 'todo' ? ['Waiting for design approval', 'Resource allocation'] : [],
      })) || [],
      meetingEffectiveness: {
        score: 78 + Math.random() * 15,
        factors: ['Clear agenda', 'Active participation', 'Time management'],
        improvements: ['Add more visual aids', 'Implement timeboxing'],
      },
      teamProductivity: {
        trend: 'increasing',
        score: 82,
        insights: ['Collaboration tools adoption up 25%', 'Task completion rate improved'],
      },
    };

    setPredictiveAnalytics(analytics);
    setIsProcessing(false);
  }, []);

  const acceptSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, accepted: true } : s
    ));
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  return {
    insights,
    suggestions,
    predictiveAnalytics,
    isProcessing,
    generateInsights,
    generateSmartSuggestions,
    generatePredictiveAnalytics,
    acceptSuggestion,
    dismissSuggestion,
  };
}