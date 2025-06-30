import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Clock, Calendar, MoreHorizontal, User, Tag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Task } from '@/hooks/useRoom';
import { cn } from '@/lib/utils';

interface TasksTabProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAssignTask: () => void;
}

export function TasksTab({ tasks, onUpdateTask, onAssignTask }: TasksTabProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    onUpdateTask(taskId, { completed });
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'low': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'medium': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'urgent': return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      default: return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full animated-bg">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Tasks & Milestones</h3>
            <p className="text-gray">Track and manage team tasks and project milestones</p>
          </div>
          <Button 
            onClick={onAssignTask}
            className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Assign Task
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-full max-w-md" onValueChange={(value) => setActiveFilter(value as any)}>
            <TabsList className="bg-dark/30">
              <TabsTrigger value="all" className="data-[state=active]:bg-theme-primary data-[state=active]:text-white">All Tasks</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-theme-primary data-[state=active]:text-white">Active</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-theme-primary data-[state=active]:text-white">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-white/10 text-gray hover:text-white">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-dark border-white/10" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Filter Tasks</h4>
                  <div className="space-y-2">
                    {/* Filter options would go here */}
                    <div className="text-gray">Filter options coming soon</div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-theme-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-theme-primary" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No tasks found</h4>
              <p className="text-gray max-w-sm">
                {activeFilter === 'completed' 
                  ? "No completed tasks yet. Mark tasks as done to see them here."
                  : activeFilter === 'active'
                  ? "No active tasks. Create a new task to get started."
                  : "No tasks have been created yet. Create your first task to get started."}
              </p>
              <Button 
                onClick={onAssignTask}
                className="mt-6 gap-2 bg-theme-primary/10 text-theme-primary hover:bg-theme-primary/20"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-5 border rounded-xl shadow-custom transition-all duration-200 ${
                  task.completed 
                    ? 'bg-dark/20 border-white/5' 
                    : 'bg-dark/30 border-white/10 hover:border-theme-primary/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(task.id, !task.completed)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-theme-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${task.completed ? 'text-gray line-through' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-dark border-white/10" align="end">
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-white hover:bg-theme-primary/10"
                            >
                              Edit Task
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-theme-red hover:bg-theme-red/10"
                            >
                              Delete Task
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <p className="text-gray text-sm mb-4">
                      {task.description}
                    </p>
                    
                    {task.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray">Progress</span>
                          <span className="text-white font-medium">{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1.5" />
                      </div>
                    )}
                    
                    <div className="flex items-center flex-wrap gap-3 mt-3">
                      {task.dueDate && (
                        <Badge variant="outline" className="gap-1.5 border-white/10 text-gray">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </Badge>
                      )}
                      
                      {task.priority && (
                        <Badge className={`gap-1.5 ${getPriorityColor(task.priority)}`}>
                          <Clock className="w-3 h-3" />
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      )}
                      
                      {task.tags && task.tags.length > 0 && (
                        <Badge variant="outline" className="gap-1.5 border-white/10 text-gray">
                          <Tag className="w-3 h-3" />
                          {task.tags[0]}{task.tags.length > 1 ? ` +${task.tags.length - 1}` : ''}
                        </Badge>
                      )}
                      
                      <div className="ml-auto flex items-center">
                        {task.assignee && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-gray" />
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-theme-primary text-white">
                                {getAvatarFallback(task.assignee)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}