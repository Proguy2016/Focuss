import { useState, useEffect } from 'react';

export interface DetailedMetrics {
  engagement: {
    totalInteractions: number;
    averageSessionLength: number;
    peakActivityHours: number[];
    engagementTrend: 'up' | 'down' | 'stable';
    participationBalance: number; // 0-100, higher = more balanced
  };
  productivity: {
    tasksPerHour: number;
    completionVelocity: number;
    qualityScore: number;
    blockerFrequency: number;
    focusTimePercentage: number;
  };
  collaboration: {
    crossFunctionalInteractions: number;
    knowledgeSharingEvents: number;
    conflictResolutionTime: number;
    consensusReachingEfficiency: number;
    mentorshipActivities: number;
  };
  communication: {
    clarityScore: number;
    responseTime: number;
    threadResolutionRate: number;
    questionToAnswerRatio: number;
    sentimentScore: number;
  };
}

export interface TeamDynamics {
  roles: {
    userId: string;
    userName: string;
    primaryRole: 'leader' | 'contributor' | 'facilitator' | 'specialist' | 'observer';
    influence: number;
    collaboration: number;
    expertise: string[];
  }[];
  networkAnalysis: {
    centralNodes: string[];
    isolatedMembers: string[];
    communicationClusters: string[][];
    informationFlow: number;
  };
  healthScore: {
    overall: number;
    psychological_safety: number;
    trust_level: number;
    innovation_index: number;
    burnout_risk: number;
  };
}

export function useAdvancedAnalytics(roomData: any) {
  const [detailedMetrics, setDetailedMetrics] = useState<DetailedMetrics | null>(null);
  const [teamDynamics, setTeamDynamics] = useState<TeamDynamics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!roomData) return;

    const analyzeMetrics = () => {
      const metrics: DetailedMetrics = {
        engagement: {
          totalInteractions: (roomData.messages?.length || 0) + (roomData.tasks?.length || 0) + (roomData.files?.length || 0),
          averageSessionLength: roomData.sessionTimer || 0,
          peakActivityHours: [10, 11, 14, 15], // Mock data
          engagementTrend: 'up',
          participationBalance: 75 + Math.random() * 20,
        },
        productivity: {
          tasksPerHour: (roomData.tasks?.length || 0) / Math.max(1, (roomData.sessionTimer || 3600) / 3600),
          completionVelocity: 0.8 + Math.random() * 0.3,
          qualityScore: 85 + Math.random() * 10,
          blockerFrequency: Math.random() * 0.3,
          focusTimePercentage: 65 + Math.random() * 25,
        },
        collaboration: {
          crossFunctionalInteractions: Math.floor(Math.random() * 20) + 10,
          knowledgeSharingEvents: Math.floor(Math.random() * 15) + 5,
          conflictResolutionTime: 15 + Math.random() * 30, // minutes
          consensusReachingEfficiency: 0.7 + Math.random() * 0.25,
          mentorshipActivities: Math.floor(Math.random() * 8) + 2,
        },
        communication: {
          clarityScore: 78 + Math.random() * 15,
          responseTime: 2 + Math.random() * 8, // minutes
          threadResolutionRate: 0.85 + Math.random() * 0.1,
          questionToAnswerRatio: 0.6 + Math.random() * 0.3,
          sentimentScore: 0.7 + Math.random() * 0.25,
        },
      };

      const dynamics: TeamDynamics = {
        roles: roomData.participants?.map((p: any, index: number) => ({
          userId: p.id,
          userName: p.name,
          primaryRole: ['leader', 'contributor', 'facilitator', 'specialist', 'observer'][index % 5] as any,
          influence: Math.random() * 100,
          collaboration: Math.random() * 100,
          expertise: ['Design', 'Development', 'Product', 'Research'][Math.floor(Math.random() * 4)],
        })) || [],
        networkAnalysis: {
          centralNodes: roomData.participants?.slice(0, 2).map((p: any) => p.id) || [],
          isolatedMembers: [],
          communicationClusters: [
            roomData.participants?.slice(0, 3).map((p: any) => p.id) || [],
            roomData.participants?.slice(3, 6).map((p: any) => p.id) || [],
          ],
          informationFlow: 0.8 + Math.random() * 0.15,
        },
        healthScore: {
          overall: 82 + Math.random() * 10,
          psychological_safety: 85 + Math.random() * 10,
          trust_level: 88 + Math.random() * 8,
          innovation_index: 75 + Math.random() * 15,
          burnout_risk: Math.random() * 30,
        },
      };

      setDetailedMetrics(metrics);
      setTeamDynamics(dynamics);
    };

    analyzeMetrics();
  }, [roomData]);

  const generateReport = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    
    return {
      summary: 'Team performance is above average with strong collaboration patterns.',
      recommendations: [
        'Increase focus time allocation by 15%',
        'Implement structured check-ins for isolated members',
        'Leverage peak activity hours for critical decisions',
      ],
      trends: {
        productivity: 'increasing',
        engagement: 'stable',
        satisfaction: 'high',
      },
    };
  };

  return {
    detailedMetrics,
    teamDynamics,
    isAnalyzing,
    generateReport,
  };
}