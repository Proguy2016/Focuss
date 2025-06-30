import React from 'react';
import { BarChart3, Users, MessageSquare, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: any;
}

export function AnalyticsDashboard({ isOpen, onClose, roomData }: AnalyticsDashboardProps) {
  const { analytics, engagementMetrics, getTopContributors, getCollaborationInsights } = useAnalytics(roomData);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 20) return { level: 'High', color: 'text-theme-emerald' };
    if (score >= 10) return { level: 'Medium', color: 'text-theme-yellow' };
    return { level: 'Low', color: 'text-theme-red' };
  };

  const topContributors = getTopContributors();
  const insights = getCollaborationInsights();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white border-theme-primary/20 shadow-custom-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">Session Analytics</DialogTitle>
              <p className="text-sm text-theme-gray-dark">Real-time collaboration insights</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-theme-primary" />
                <span className="text-sm font-medium text-theme-gray-dark">Duration</span>
              </div>
              <div className="text-2xl font-bold text-theme-dark">
                {formatDuration(analytics.sessionDuration)}
              </div>
            </div>

            <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-theme-secondary" />
                <span className="text-sm font-medium text-theme-gray-dark">Messages</span>
              </div>
              <div className="text-2xl font-bold text-theme-dark">
                {analytics.messageCount}
              </div>
            </div>

            <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center gap-3 mb-2">
                <CheckSquare className="w-5 h-5 text-theme-emerald" />
                <span className="text-sm font-medium text-theme-gray-dark">Tasks Done</span>
              </div>
              <div className="text-2xl font-bold text-theme-dark">
                {Math.round(analytics.taskCompletion)}%
              </div>
            </div>

            <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-theme-yellow" />
                <span className="text-sm font-medium text-theme-gray-dark">Participants</span>
              </div>
              <div className="text-2xl font-bold text-theme-dark">
                {analytics.peakParticipants}
              </div>
            </div>
          </div>

          {/* Collaboration Score */}
          <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-theme-dark">Collaboration Score</h4>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-sm",
                  analytics.collaborationScore >= 80 ? "bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30" :
                  analytics.collaborationScore >= 60 ? "bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30" :
                  "bg-theme-red/10 text-theme-red border-theme-red/30"
                )}
              >
                {Math.round(analytics.collaborationScore)}/100
              </Badge>
            </div>
            <Progress 
              value={analytics.collaborationScore} 
              className="h-3 mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-theme-dark mb-2">Insights</h5>
                <ul className="space-y-1">
                  {insights.map((insight, index) => (
                    <li key={index} className="text-sm text-theme-gray-dark flex items-start gap-2">
                      <span className="w-1 h-1 bg-theme-primary rounded-full mt-2 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-theme-dark mb-2">Recommendations</h5>
                <ul className="space-y-1">
                  <li className="text-sm text-theme-gray-dark flex items-start gap-2">
                    <span className="w-1 h-1 bg-theme-secondary rounded-full mt-2 flex-shrink-0" />
                    Encourage quieter members to participate more
                  </li>
                  <li className="text-sm text-theme-gray-dark flex items-start gap-2">
                    <span className="w-1 h-1 bg-theme-secondary rounded-full mt-2 flex-shrink-0" />
                    Consider breaking down complex tasks
                  </li>
                  <li className="text-sm text-theme-gray-dark flex items-start gap-2">
                    <span className="w-1 h-1 bg-theme-secondary rounded-full mt-2 flex-shrink-0" />
                    Schedule regular check-ins for better coordination
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
            <h4 className="font-bold text-theme-dark mb-4">Top Contributors</h4>
            <div className="space-y-4">
              {topContributors.map((contributor, index) => {
                const engagement = getEngagementLevel(contributor.engagementScore);
                return (
                  <div key={contributor.userId} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-theme-primary">#{index + 1}</span>
                        <Avatar className="w-10 h-10 ring-2 ring-theme-primary/20 shadow-custom">
                          <AvatarFallback className="bg-gradient-to-br from-theme-primary to-theme-secondary text-white font-bold">
                            {contributor.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-theme-dark">{contributor.userName}</div>
                        <div className="text-sm text-theme-gray-dark">
                          {contributor.messagesCount} messages • {contributor.tasksCompleted} tasks • {contributor.filesShared} files
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-theme-dark">{contributor.engagementScore}</div>
                      <div className={cn("text-sm font-medium", engagement.color)}>
                        {engagement.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Engagement Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
              <h4 className="font-bold text-theme-dark mb-4">Participation Breakdown</h4>
              <div className="space-y-3">
                {engagementMetrics.map((metric) => (
                  <div key={metric.userId} className="flex items-center justify-between">
                    <span className="text-sm text-theme-gray-dark">{metric.userName}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(metric.engagementScore / Math.max(...engagementMetrics.map(m => m.engagementScore))) * 100} 
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-medium text-theme-dark w-8 text-right">
                        {metric.engagementScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
              <h4 className="font-bold text-theme-dark mb-4">Session Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-emerald rounded-full" />
                  <span className="text-sm text-theme-gray-dark">Session started</span>
                  <span className="text-xs text-theme-gray ml-auto">
                    {formatDuration(analytics.sessionDuration)} ago
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-primary rounded-full" />
                  <span className="text-sm text-theme-gray-dark">Peak activity period</span>
                  <span className="text-xs text-theme-gray ml-auto">
                    {Math.floor(analytics.sessionDuration * 0.6 / 60)}m ago
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-yellow rounded-full" />
                  <span className="text-sm text-theme-gray-dark">Most files shared</span>
                  <span className="text-xs text-theme-gray ml-auto">
                    {Math.floor(analytics.sessionDuration * 0.3 / 60)}m ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}