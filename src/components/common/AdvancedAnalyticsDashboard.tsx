import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Brain, Target, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { cn } from '@/lib/utils';

interface AdvancedAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: any;
}

export function AdvancedAnalyticsDashboard({ isOpen, onClose, roomData }: AdvancedAnalyticsDashboardProps) {
  const { detailedMetrics, teamDynamics, isAnalyzing, generateReport } = useAdvancedAnalytics(roomData);
  const { insights, predictiveAnalytics, generatePredictiveAnalytics } = useAdvancedAI();
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    if (isOpen && roomData) {
      generatePredictiveAnalytics(roomData);
    }
  }, [isOpen, roomData, generatePredictiveAnalytics]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-theme-emerald';
    if (score >= 60) return 'text-theme-yellow';
    return 'text-theme-red';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return '👑';
      case 'contributor': return '🚀';
      case 'facilitator': return '🤝';
      case 'specialist': return '🎯';
      case 'observer': return '👁️';
      default: return '👤';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0 bg-white border-theme-primary/20 shadow-custom-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">Advanced Analytics</DialogTitle>
              <p className="text-sm text-theme-gray-dark">Deep insights and predictive analytics</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={generateReport}
            disabled={isAnalyzing}
          >
            <TrendingUp className="w-4 h-4" />
            {isAnalyzing ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
              <TabsTrigger value="team">Team Dynamics</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-theme-primary" />
                    <span className="text-sm font-medium text-theme-gray-dark">Engagement</span>
                  </div>
                  <div className="text-2xl font-bold text-theme-dark">
                    {detailedMetrics?.engagement.participationBalance.toFixed(0)}%
                  </div>
                  <div className="text-xs text-theme-emerald">↗ Trending up</div>
                </div>

                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-theme-secondary" />
                    <span className="text-sm font-medium text-theme-gray-dark">Productivity</span>
                  </div>
                  <div className="text-2xl font-bold text-theme-dark">
                    {detailedMetrics?.productivity.qualityScore.toFixed(0)}%
                  </div>
                  <div className="text-xs text-theme-emerald">High quality</div>
                </div>

                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-theme-yellow" />
                    <span className="text-sm font-medium text-theme-gray-dark">Team Health</span>
                  </div>
                  <div className="text-2xl font-bold text-theme-dark">
                    {teamDynamics?.healthScore.overall.toFixed(0)}%
                  </div>
                  <div className="text-xs text-theme-emerald">Excellent</div>
                </div>

                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 text-theme-emerald" />
                    <span className="text-sm font-medium text-theme-gray-dark">Velocity</span>
                  </div>
                  <div className="text-2xl font-bold text-theme-dark">
                    {detailedMetrics?.productivity.completionVelocity.toFixed(1)}x
                  </div>
                  <div className="text-xs text-theme-emerald">Above target</div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-4">
                <h4 className="font-bold text-theme-dark">AI-Generated Insights</h4>
                <div className="grid gap-4">
                  {insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          insight.impact === 'high' ? 'bg-theme-red/10' :
                          insight.impact === 'medium' ? 'bg-theme-yellow/10' :
                          'bg-theme-emerald/10'
                        )}>
                          {insight.type === 'productivity' && <Target className="w-4 h-4 text-theme-primary" />}
                          {insight.type === 'collaboration' && <Users className="w-4 h-4 text-theme-secondary" />}
                          {insight.type === 'prediction' && <TrendingUp className="w-4 h-4 text-theme-emerald" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-theme-dark">{insight.title}</h5>
                            <Badge variant="secondary" className={cn(
                              "text-xs",
                              insight.impact === 'high' ? 'bg-theme-red/10 text-theme-red border-theme-red/30' :
                              insight.impact === 'medium' ? 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30' :
                              'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30'
                            )}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-theme-gray-dark mb-3">{insight.description}</p>
                          {insight.suggestedActions && (
                            <div className="space-y-1">
                              {insight.suggestedActions.map((action, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs text-theme-gray-dark">
                                  <CheckCircle className="w-3 h-3 text-theme-emerald" />
                                  {action}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-6">
              {detailedMetrics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <h4 className="font-bold text-theme-dark mb-4">Productivity Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-theme-gray-dark">Quality Score</span>
                            <span className="font-semibold text-theme-dark">
                              {detailedMetrics.productivity.qualityScore.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={detailedMetrics.productivity.qualityScore} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-theme-gray-dark">Focus Time</span>
                            <span className="font-semibold text-theme-dark">
                              {detailedMetrics.productivity.focusTimePercentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={detailedMetrics.productivity.focusTimePercentage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-theme-gray-dark">Completion Velocity</span>
                            <span className="font-semibold text-theme-dark">
                              {detailedMetrics.productivity.completionVelocity.toFixed(1)}x
                            </span>
                          </div>
                          <Progress value={detailedMetrics.productivity.completionVelocity * 50} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <h4 className="font-bold text-theme-dark mb-4">Communication Quality</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-theme-gray-dark">Clarity Score</span>
                            <span className="font-semibold text-theme-dark">
                              {detailedMetrics.communication.clarityScore.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={detailedMetrics.communication.clarityScore} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-theme-gray-dark">Response Time</span>
                            <span className="font-semibold text-theme-dark">
                              {detailedMetrics.communication.responseTime.toFixed(1)}m
                            </span>
                          </div>
                          <Progress value={Math.max(0, 100 - detailedMetrics.communication.responseTime * 10)} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-theme-gray-dark">Sentiment</span>
                            <span className="font-semibold text-theme-dark">
                              {(detailedMetrics.communication.sentimentScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={detailedMetrics.communication.sentimentScore * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              {teamDynamics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <h4 className="font-bold text-theme-dark mb-4">Team Health Score</h4>
                      <div className="space-y-4">
                        {Object.entries(teamDynamics.healthScore).map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-theme-gray-dark capitalize">
                                {key.replace('_', ' ')}
                              </span>
                              <span className={cn("font-semibold", getHealthColor(value))}>
                                {value.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <h4 className="font-bold text-theme-dark mb-4">Team Roles</h4>
                      <div className="space-y-3">
                        {teamDynamics.roles.slice(0, 5).map((member) => (
                          <div key={member.userId} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{getRoleIcon(member.primaryRole)}</span>
                              <div>
                                <div className="font-semibold text-theme-dark text-sm">{member.userName}</div>
                                <div className="text-xs text-theme-gray-dark capitalize">{member.primaryRole}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-theme-dark">
                                {member.influence.toFixed(0)}%
                              </div>
                              <div className="text-xs text-theme-gray-dark">influence</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              {predictiveAnalytics && (
                <>
                  <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                    <h4 className="font-bold text-theme-dark mb-4">Task Completion Predictions</h4>
                    <div className="space-y-3">
                      {predictiveAnalytics.taskCompletionPrediction.slice(0, 5).map((prediction) => (
                        <div key={prediction.taskId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/60">
                          <div>
                            <div className="font-semibold text-theme-dark text-sm">Task {prediction.taskId}</div>
                            <div className="text-xs text-theme-gray-dark">
                              Estimated completion: {prediction.estimatedCompletion.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-theme-dark">
                              {(prediction.confidence * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-theme-gray-dark">confidence</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <h4 className="font-bold text-theme-dark mb-4">Meeting Effectiveness</h4>
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-theme-primary">
                          {predictiveAnalytics.meetingEffectiveness.score.toFixed(0)}%
                        </div>
                        <div className="text-sm text-theme-gray-dark">Overall Score</div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-theme-dark text-sm">Positive Factors:</h5>
                        {predictiveAnalytics.meetingEffectiveness.factors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-theme-gray-dark">
                            <CheckCircle className="w-3 h-3 text-theme-emerald" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <h4 className="font-bold text-theme-dark mb-4">Team Productivity Trend</h4>
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-theme-emerald">
                          {predictiveAnalytics.teamProductivity.score}%
                        </div>
                        <div className="text-sm text-theme-gray-dark capitalize">
                          {predictiveAnalytics.teamProductivity.trend}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-theme-dark text-sm">Key Insights:</h5>
                        {predictiveAnalytics.teamProductivity.insights.map((insight, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-theme-gray-dark">
                            <TrendingUp className="w-3 h-3 text-theme-primary" />
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}