import React, { useState } from 'react';
import { Plus, Calendar, Users, Tag, X, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: any) => void;
}

export function AddProjectModal({ isOpen, onClose, onAddProject }: AddProjectModalProps) {
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'Task',
    dueDate: '',
    tags: [] as string[],
    newTag: '',
  });

  const projectTypes = ['Task', 'Feature', 'Bug', 'Research'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData.title) return;

    onAddProject({
      title: projectData.title,
      description: projectData.description,
      status: 'Not Started',
      priority: projectData.priority,
      type: projectData.type,
      dueDate: projectData.dueDate ? new Date(projectData.dueDate) : undefined,
      tags: projectData.tags,
    });

    // Reset form
    setProjectData({
      title: '',
      description: '',
      priority: 'medium',
      type: 'Task',
      dueDate: '',
      tags: [],
      newTag: '',
    });
  };

  const addTag = () => {
    if (projectData.newTag && !projectData.tags.includes(projectData.newTag)) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag],
        newTag: '',
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'high': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'medium': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'low': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      default: return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Task': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'Bug': return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'Feature': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      case 'Research': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      default: return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-theme-primary/20 shadow-custom-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">Add New Project</DialogTitle>
              <p className="text-sm text-theme-gray-dark">Create a new project for the team to work on</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-theme-dark">
              Project Title *
            </Label>
            <Input
              id="title"
              value={projectData.title}
              onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter project title..."
              className="border-theme-primary/30 focus:border-theme-primary"
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-theme-dark">
              Description
            </Label>
            <Textarea
              id="description"
              value={projectData.description}
              onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project goals and requirements..."
              className="border-theme-primary/30 focus:border-theme-primary min-h-[100px]"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-theme-dark">
                Project Type
              </Label>
              <Select 
                value={projectData.type} 
                onValueChange={(value) => setProjectData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="border-theme-primary/30 focus:border-theme-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          type === 'Task' ? 'bg-theme-primary' :
                          type === 'Bug' ? 'bg-theme-red' :
                          type === 'Feature' ? 'bg-theme-emerald' :
                          'bg-theme-yellow'
                        }`} />
                        {type}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-theme-dark">
                Priority
              </Label>
              <Select 
                value={projectData.priority} 
                onValueChange={(value) => setProjectData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="border-theme-primary/30 focus:border-theme-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority.toLowerCase()}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          priority === 'Critical' ? 'bg-theme-red' :
                          priority === 'High' ? 'bg-theme-yellow' :
                          priority === 'Medium' ? 'bg-theme-primary' :
                          'bg-theme-emerald'
                        }`} />
                        {priority} Priority
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium text-theme-dark">
              Due Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
              <Input
                id="dueDate"
                type="date"
                value={projectData.dueDate}
                onChange={(e) => setProjectData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="pl-10 border-theme-primary/30 focus:border-theme-primary"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-theme-dark">
              Tags
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
                <Input
                  value={projectData.newTag}
                  onChange={(e) => setProjectData(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="pl-10 border-theme-primary/30 focus:border-theme-primary"
                />
              </div>
              <Button type="button" onClick={addTag} size="sm" variant="outline">
                Add
              </Button>
            </div>
            {projectData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {projectData.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="gap-1 bg-theme-primary/10 text-theme-primary border-theme-primary/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-theme-red"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Project Preview */}
          {projectData.title && (
            <div className="p-4 bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5 rounded-xl border border-theme-primary/20">
              <h4 className="font-semibold text-theme-dark mb-2">Project Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-theme-dark">{projectData.title}</span>
                  <Badge variant="secondary" className={getTypeColor(projectData.type)}>
                    {projectData.type}
                  </Badge>
                  <Badge variant="secondary" className={getPriorityColor(projectData.priority)}>
                    {projectData.priority}
                  </Badge>
                </div>
                {projectData.description && (
                  <p className="text-sm text-theme-gray-dark">{projectData.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-theme-gray-dark">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Status: Not Started</span>
                  </div>
                  {projectData.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due {new Date(projectData.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {projectData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {projectData.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
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
              disabled={!projectData.title}
            >
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}