import React from 'react';
import { Plus, Circle, Clock, AlertCircle, Users, Target, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Task } from '@/hooks/useRoom';
import { cn } from '@/lib/utils';

interface TasksTabProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAssignTask?: () => void;
}

export function TasksTab({ tasks, onUpdateTask, onAssignTask }: TasksTabProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'medium':
        return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'low':
        return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      default:
        return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Circle className="w-5 h-5 text-theme-emerald fill-current" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-theme-primary" />;
      default:
        return <Circle className="w-5 h-5 text-theme-gray" />;
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 
                     task.status === 'todo' ? 'in-progress' : 'completed';
    onUpdateTask(task.id, { status: newStatus });
  };

  // Mock user data
  const users = {
    '1': { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    '2': { name: 'Marcus Johnson', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    '3': { name: 'Elena Rodriguez', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Enhanced tasks with milestone information
  const enhancedTasks = tasks.map(task => ({
    ...task,
    milestone: task.priority === 'high' ? 'Sprint 1 Milestone' : 'General Tasks',
    assignedBy: 'Room Admin',
    estimatedHours: Math.floor(Math.random() * 20) + 5,
    actualHours: task.status === 'completed' ? Math.floor(Math.random() * 15) + 3 : 0,
  }));

  // Group tasks by milestone
  const tasksByMilestone = enhancedTasks.reduce((acc, task) => {
    if (!acc[task.milestone]) {
      acc[task.milestone] = [];
    }
    acc[task.milestone].push(task);
    return acc;
  }, {} as Record<string, typeof enhancedTasks>);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50/50">
      <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
        <div>
          <h3 className="font-bold text-theme-dark">Tasks & Milestones</h3>
          <p className="text-sm text-theme-gray-dark">Tasks assigned by moderators and room admins</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-2 bg-theme-primary/10 text-theme-primary border-theme-primary/30">
            <Target className="w-3 h-3" />
            {Object.keys(tasksByMilestone).length} Milestones
          </Badge>
          {onAssignTask && (
            <Button 
              onClick={onAssignTask}
              size="sm" 
              className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
            >
              <UserPlus className="w-4 h-4" />
              Assign Task
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {Object.entries(tasksByMilestone).map(([milestone, milestoneTasks]) => (
            <div key={milestone} className="space-y-4">
              {/* Milestone Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-primary/10 to-theme-secondary/5 rounded-xl border border-theme-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center shadow-glow">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-theme-dark">{milestone}</h4>
                    <p className="text-sm text-theme-gray-dark">
                      {milestoneTasks.filter(t => t.status === 'completed').length} of {milestoneTasks.length} tasks completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-theme-dark">
                      {Math.round((milestoneTasks.filter(t => t.status === 'completed').length / milestoneTasks.length) * 100)}%
                    </div>
                    <div className="text-xs text-theme-gray-dark">Complete</div>
                  </div>
                  <Progress 
                    value={(milestoneTasks.filter(t => t.status === 'completed').length / milestoneTasks.length) * 100} 
                    className="w-24 h-2"
                  />
                </div>
              </div>

              {/* Tasks in Milestone */}
              <div className="space-y-3 ml-4">
                {milestoneTasks.map((task) => {
                  const assignee = task.assigneeId ? users[task.assigneeId as keyof typeof users] : null;
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "p-5 border border-gray-200/60 rounded-xl hover:shadow-custom transition-all duration-200 bg-white/80 backdrop-blur-glass",
                        task.status === 'completed' && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className="mt-1 hover:scale-110 transition-transform"
                        >
                          {getStatusIcon(task.status)}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h4 className={cn(
                                "font-bold text-theme-dark",
                                task.status === 'completed' && "line-through text-theme-gray"
                              )}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-theme-gray-dark mt-1 leading-relaxed">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Badge variant="secondary" className={cn("shadow-custom", getPriorityColor(task.priority))}>
                                {task.priority}
                              </Badge>
                              {assignee && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-7 h-7 ring-1 ring-theme-primary/20 shadow-custom">
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                                      {getInitials(assignee.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="text-xs">
                                    <div className="font-semibold text-theme-dark">{assignee.name}</div>
                                    <div className="text-theme-gray-dark">Assignee</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Task Metadata */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-xs">
                            <div>
                              <span className="text-theme-gray-dark">Assigned by:</span>
                              <div className="font-semibold text-theme-dark">{task.assignedBy}</div>
                            </div>
                            <div>
                              <span className="text-theme-gray-dark">Estimated:</span>
                              <div className="font-semibold text-theme-dark">{task.estimatedHours}h</div>
                            </div>
                            <div>
                              <span className="text-theme-gray-dark">Actual:</span>
                              <div className="font-semibold text-theme-dark">{task.actualHours}h</div>
                            </div>
                            <div>
                              <span className="text-theme-gray-dark">Status:</span>
                              <div className="font-semibold text-theme-dark capitalize">
                                {task.status.replace('-', ' ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-theme-gray-dark">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>Room Task</span>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Due {task.dueDate.toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-theme-primary font-semibold">
                              Milestone: {milestone}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {enhancedTasks.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-theme-gray" />
              <h3 className="font-semibold text-theme-dark mb-2">No tasks assigned yet</h3>
              <p className="text-theme-gray-dark mb-6">
                Room moderators and admins can assign tasks to team members
              </p>
              {onAssignTask && (
                <Button 
                  onClick={onAssignTask}
                  className="gap-2 bg-theme-primary hover:bg-theme-primary-dark text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign First Task
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}