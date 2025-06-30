import { useState, useEffect } from 'react';

export interface AnalyticsData {
  sessionDuration: number;
  messageCount: number;
  participantEngagement: Record<string, number>;
  taskCompletion: number;
  fileShares: number;
  peakParticipants: number;
  averageResponseTime: number;
  collaborationScore: number;
}

export interface EngagementMetric {
  userId: string;
  userName: string;
  messagesCount: number;
  tasksCompleted: number;
  filesShared: number;
  timeActive: number;
  engagementScore: number;
}

export function useAnalytics(roomData: any) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    sessionDuration: 0,
    messageCount: 0,
    participantEngagement: {},
    taskCompletion: 0,
    fileShares: 0,
    peakParticipants: 0,
    averageResponseTime: 0,
    collaborationScore: 0,
  });

  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetric[]>([]);

  useEffect(() => {
    if (!roomData) return;

    const completedTasks = roomData.tasks?.filter((t: any) => t.status === 'completed').length || 0;
    const totalTasks = roomData.tasks?.length || 1;
    const taskCompletionRate = (completedTasks / totalTasks) * 100;

    // Calculate engagement metrics
    const metrics: EngagementMetric[] = roomData.participants?.map((participant: any) => {
      const userMessages = roomData.messages?.filter((m: any) => m.userId === participant.id).length || 0;
      const userTasks = roomData.tasks?.filter((t: any) => t.assigneeId === participant.id && t.status === 'completed').length || 0;
      const userFiles = roomData.files?.filter((f: any) => f.uploadedBy === participant.id).length || 0;
      
      const engagementScore = (userMessages * 2) + (userTasks * 5) + (userFiles * 3);

      return {
        userId: participant.id,
        userName: participant.name,
        messagesCount: userMessages,
        tasksCompleted: userTasks,
        filesShared: userFiles,
        timeActive: Math.floor(Math.random() * 3600), // Mock active time
        engagementScore,
      };
    }) || [];

    const totalEngagement = metrics.reduce((sum, m) => sum + m.engagementScore, 0);
    const averageEngagement = totalEngagement / (metrics.length || 1);
    const collaborationScore = Math.min(100, (averageEngagement / 20) * 100);

    setAnalytics({
      sessionDuration: roomData.sessionTimer || 0,
      messageCount: roomData.messages?.length || 0,
      participantEngagement: metrics.reduce((acc, m) => ({ ...acc, [m.userId]: m.engagementScore }), {}),
      taskCompletion: taskCompletionRate,
      fileShares: roomData.files?.length || 0,
      peakParticipants: roomData.participants?.length || 0,
      averageResponseTime: 45 + Math.random() * 30, // Mock response time
      collaborationScore,
    });

    setEngagementMetrics(metrics);
  }, [roomData]);

  const getTopContributors = () => {
    return engagementMetrics
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 3);
  };

  const getCollaborationInsights = () => {
    const insights = [];
    
    if (analytics.collaborationScore > 80) {
      insights.push("Excellent collaboration! Team is highly engaged.");
    } else if (analytics.collaborationScore > 60) {
      insights.push("Good collaboration with room for improvement.");
    } else {
      insights.push("Consider encouraging more participation.");
    }

    if (analytics.taskCompletion > 75) {
      insights.push("Great task completion rate!");
    } else if (analytics.taskCompletion > 50) {
      insights.push("Moderate task completion. Consider breaking down complex tasks.");
    } else {
      insights.push("Low task completion. Review task clarity and deadlines.");
    }

    return insights;
  };

  return {
    analytics,
    engagementMetrics,
    getTopContributors,
    getCollaborationInsights,
  };
}