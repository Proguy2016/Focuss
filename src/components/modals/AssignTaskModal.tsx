import React, { useState } from 'react';
import { UserPlus, Calendar, Clock, AlertTriangle, Target, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  onAssignTask: (taskData: any) => void;
}

export function AssignTaskModal({ isOpen, onClose, participants, onAssignTask }: AssignTaskModalProps) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium',
    milestone: '',
    dueDate: '',
    estimatedHours: '',
  });

  const milestones = [
    'Sprint 1 Milestone',
    'Sprint 2 Milestone',
    'Final Project Milestone',
    'General Tasks',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title || !taskData.assigneeId) return;

    onAssignTask({
      ...taskData,
      id: Date.now().toString(),
      status: 'todo',
      createdAt: new Date(),
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      estimatedHours: taskData.estimatedHours ? parseInt(taskData.estimatedHours) : 0,
    });

    // Reset form
    setTaskData({
      title: '',
      description: '',
      assigneeId: '',
      priority: 'medium',
      milestone: '',
      dueDate: '',
      estimatedHours: '',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'medium': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'low': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      default: return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-theme-primary/20 shadow-custom-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">Assign Task</DialogTitle>
              <p className="text-sm text-theme-gray-dark">Create and assign a new task to team members</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-theme-dark">
              Task Title *
            </Label>
            <Input
              id="title"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="border-theme-primary/30 focus:border-theme-primary"
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-theme-dark">
              Description
            </Label>
            <Textarea
              id="description"
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the task requirements..."
              className="border-theme-primary/30 focus:border-theme-primary min-h-[100px]"
            />
          </div>

          {/* Assignee Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-theme-dark">
              Assign to *
            </Label>
            <Select 
              value={taskData.assigneeId} 
              onValueChange={(value) => setTaskData(prev => ({ ...prev, assigneeId: value }))}
            >
              <SelectTrigger className="border-theme-primary/30 focus:border-theme-primary">
                <SelectValue placeholder="Select team member..." />
              </SelectTrigger>
              <SelectContent>
                {participants.map(participant => (
                  <SelectItem key={participant.id} value={participant.id}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                          {getInitials(participant.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{participant.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={participant.status === 'online' ? 'bg-theme-emerald/10 text-theme-emerald' : 'bg-theme-gray/10 text-theme-gray-dark'}
                      >
                        {participant.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority and Milestone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-theme-dark">
                Priority
              </Label>
              <Select 
                value={taskData.priority} 
                onValueChange={(value) => setTaskData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="border-theme-primary/30 focus:border-theme-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-theme-emerald rounded-full" />
                      Low Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-theme-yellow rounded-full" />
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-theme-red rounded-full" />
                      High Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-theme-dark">
                Milestone
              </Label>
              <Select 
                value={taskData.milestone} 
                onValueChange={(value) => setTaskData(prev => ({ ...prev, milestone: value }))}
              >
                <SelectTrigger className="border-theme-primary/30 focus:border-theme-primary">
                  <SelectValue placeholder="Select milestone..." />
                </SelectTrigger>
                <SelectContent>
                  {milestones.map(milestone => (
                    <SelectItem key={milestone} value={milestone}>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-theme-primary" />
                        {milestone}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium text-theme-dark">
                Due Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
                <Input
                  id="dueDate"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="pl-10 border-theme-primary/30 focus:border-theme-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours" className="text-sm font-medium text-theme-dark">
                Estimated Hours
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  value={taskData.estimatedHours}
                  onChange={(e) => setTaskData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="0"
                  className="pl-10 border-theme-primary/30 focus:border-theme-primary"
                />
              </div>
            </div>
          </div>

          {/* Task Preview */}
          {taskData.title && (
            <div className="p-4 bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5 rounded-xl border border-theme-primary/20">
              <h4 className="font-semibold text-theme-dark mb-2">Task Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-theme-dark">{taskData.title}</span>
                  <Badge variant="secondary" className={getPriorityColor(taskData.priority)}>
                    {taskData.priority}
                  </Badge>
                </div>
                {taskData.description && (
                  <p className="text-sm text-theme-gray-dark">{taskData.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-theme-gray-dark">
                  {taskData.milestone && (
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{taskData.milestone}</span>
                    </div>
                  )}
                  {taskData.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due {new Date(taskData.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {taskData.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{taskData.estimatedHours}h estimated</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200/60">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
              disabled={!taskData.title || !taskData.assigneeId}
            >
              <UserPlus className="w-4 h-4" />
              Assign Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}