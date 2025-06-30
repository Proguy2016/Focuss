import React, { useState } from 'react';
import { Plus, Circle, Clock, AlertCircle, Users, Target, UserPlus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Task, Participant } from '@/hooks/useRoom';
import { cn } from '@/lib/utils';

interface TasksTabProps {
  tasks: Task[];
  participants: Participant[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddTask?: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onDeleteTask?: (taskId: string) => void;
  onAssignTask?: () => void;
}

export function TasksTab({ 
  tasks, 
  participants, 
  onUpdateTask, 
  onAddTask, 
  onDeleteTask,
  onAssignTask 
}: TasksTabProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'medium':
        return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'low':
        return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      default:
        return 'bg-gray/10 text-gray border-gray/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Circle className="w-5 h-5 text-theme-emerald fill-current" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-theme-primary" />;
      default:
        return <Circle className="w-5 h-5 text-gray" />;
    }
  };

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 
                     task.status === 'todo' ? 'in-progress' : 'completed';
    onUpdateTask(task.id, { status: newStatus });
  };

  const handleDeleteTask = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
      setShowConfirmDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getParticipantById = (userId: string) => {
    return participants.find(p => p.id === userId) || null;
  };

  // Group tasks by priority (using priority as milestone)
  const tasksByMilestone = tasks.reduce((acc, task) => {
    const milestone = task.priority === 'high' ? 'Critical Tasks' : 
                      task.priority === 'medium' ? 'Important Tasks' : 'Regular Tasks';
    
    if (!acc[milestone]) {
      acc[milestone] = [];
    }
    acc[milestone].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="flex flex-col h-full animated-bg">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-dark/30">
        <div>
          <h3 className="font-bold text-white">Tasks & Milestones</h3>
          <p className="text-sm text-gray">Tasks assigned by moderators and room admins</p>
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
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-primary/10 to-theme-secondary/10 rounded-xl border border-theme-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center shadow-glow">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{milestone}</h4>
                    <p className="text-sm text-gray">
                      {milestoneTasks.filter(t => t.status === 'completed').length} of {milestoneTasks.length} tasks completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {Math.round((milestoneTasks.filter(t => t.status === 'completed').length / milestoneTasks.length) * 100)}%
                    </div>
                    <div className="text-xs text-gray">Complete</div>
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
                  const assignee = task.assigneeId ? getParticipantById(task.assigneeId) : null;
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "p-5 border border-white/10 rounded-xl hover:shadow-custom transition-all duration-200 bg-dark/30 backdrop-blur-glass",
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
                                "font-bold text-white",
                                task.status === 'completed' && "line-through text-gray"
                              )}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-gray mt-1 leading-relaxed">{task.description}</p>
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
                                    <div className="font-semibold text-white">{assignee.name}</div>
                                    <div className="text-gray">Assignee</div>
                                  </div>
                                </div>
                              )}
                              {onDeleteTask && (
                                showConfirmDelete === task.id ? (
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      Confirm
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setShowConfirmDelete(null)}
                                      className="h-7 px-2 text-xs border-white/10"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowConfirmDelete(task.id)}
                                    className="w-7 h-7 p-0 hover:bg-theme-red/10 text-gray hover:text-theme-red"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                          
                          {/* Task Metadata */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3 text-xs">
                            <div>
                              <span className="text-gray">Created:</span>
                              <div className="font-semibold text-white">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray">Priority:</span>
                              <div className="font-semibold text-white capitalize">{task.priority}</div>
                            </div>
                            <div>
                              <span className="text-gray">Status:</span>
                              <div className="font-semibold text-white capitalize">
                                {task.status.replace('-', ' ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>Room Task</span>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
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
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray" />
              <h3 className="font-semibold text-white mb-2">No tasks assigned yet</h3>
              <p className="text-gray mb-6">
                Room moderators and admins can assign tasks to team members
              </p>
              {onAssignTask && (
                <Button 
                  onClick={onAssignTask}
                  className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
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