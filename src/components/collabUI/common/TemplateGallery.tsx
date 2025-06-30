import React, { useState } from 'react';
import { FileText, Briefcase, Calendar, Users, BookOpen, Target, Zap, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'project' | 'personal' | 'team' | 'education';
  icon: React.ComponentType<any>;
  preview: string;
  tags: string[];
  popular?: boolean;
  blocks: any[];
}

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export function TemplateGallery({ isOpen, onClose, onSelectTemplate }: TemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates: Template[] = [
    {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      description: 'Structured template for capturing meeting discussions, decisions, and action items.',
      category: 'productivity',
      icon: Users,
      preview: 'Meeting with [Team Name] - [Date]',
      tags: ['meetings', 'notes', 'collaboration'],
      popular: true,
      blocks: [
        { type: 'heading1', content: 'Meeting Notes' },
        { type: 'paragraph', content: 'Date: ' },
        { type: 'paragraph', content: 'Attendees: ' },
        { type: 'heading2', content: 'Agenda' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Discussion' },
        { type: 'paragraph', content: '' },
        { type: 'heading2', content: 'Action Items' },
        { type: 'todo', content: '' },
      ]
    },
    {
      id: 'project-brief',
      name: 'Project Brief',
      description: 'Comprehensive template for outlining project goals, scope, and requirements.',
      category: 'project',
      icon: Briefcase,
      preview: 'Project: [Project Name]',
      tags: ['project', 'planning', 'brief'],
      popular: true,
      blocks: [
        { type: 'heading1', content: 'Project Brief' },
        { type: 'heading2', content: 'Overview' },
        { type: 'paragraph', content: '' },
        { type: 'heading2', content: 'Objectives' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Scope' },
        { type: 'paragraph', content: '' },
        { type: 'heading2', content: 'Timeline' },
        { type: 'paragraph', content: '' },
      ]
    },
    {
      id: 'daily-standup',
      name: 'Daily Standup',
      description: 'Quick template for daily team check-ins and progress updates.',
      category: 'team',
      icon: Target,
      preview: 'Daily Standup - [Date]',
      tags: ['standup', 'daily', 'team'],
      blocks: [
        { type: 'heading1', content: 'Daily Standup' },
        { type: 'paragraph', content: 'Date: ' },
        { type: 'heading2', content: 'What I did yesterday' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'What I plan to do today' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Blockers' },
        { type: 'bullet', content: '' },
      ]
    },
    {
      id: 'retrospective',
      name: 'Sprint Retrospective',
      description: 'Template for team retrospectives to reflect on what went well and areas for improvement.',
      category: 'team',
      icon: Zap,
      preview: 'Sprint Retrospective - Sprint [Number]',
      tags: ['retrospective', 'sprint', 'improvement'],
      blocks: [
        { type: 'heading1', content: 'Sprint Retrospective' },
        { type: 'paragraph', content: 'Sprint: ' },
        { type: 'paragraph', content: 'Date: ' },
        { type: 'heading2', content: 'What went well?' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'What could be improved?' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Action items' },
        { type: 'todo', content: '' },
      ]
    },
    {
      id: 'weekly-review',
      name: 'Weekly Review',
      description: 'Personal template for weekly reflection and planning.',
      category: 'personal',
      icon: Calendar,
      preview: 'Week of [Date Range]',
      tags: ['weekly', 'review', 'personal'],
      blocks: [
        { type: 'heading1', content: 'Weekly Review' },
        { type: 'paragraph', content: 'Week of: ' },
        { type: 'heading2', content: 'Accomplishments' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Challenges' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Next week goals' },
        { type: 'todo', content: '' },
      ]
    },
    {
      id: 'lesson-plan',
      name: 'Lesson Plan',
      description: 'Educational template for structuring lessons and learning objectives.',
      category: 'education',
      icon: BookOpen,
      preview: 'Lesson: [Topic]',
      tags: ['education', 'lesson', 'teaching'],
      blocks: [
        { type: 'heading1', content: 'Lesson Plan' },
        { type: 'paragraph', content: 'Subject: ' },
        { type: 'paragraph', content: 'Duration: ' },
        { type: 'heading2', content: 'Learning Objectives' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Materials Needed' },
        { type: 'bullet', content: '' },
        { type: 'heading2', content: 'Lesson Structure' },
        { type: 'paragraph', content: '' },
      ]
    },
  ];

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'productivity', label: 'Productivity', count: templates.filter(t => t.category === 'productivity').length },
    { id: 'project', label: 'Project Management', count: templates.filter(t => t.category === 'project').length },
    { id: 'team', label: 'Team', count: templates.filter(t => t.category === 'team').length },
    { id: 'personal', label: 'Personal', count: templates.filter(t => t.category === 'personal').length },
    { id: 'education', label: 'Education', count: templates.filter(t => t.category === 'education').length },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTemplates = templates.filter(t => t.popular);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-white border-theme-primary/20 shadow-custom-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div>
            <DialogTitle className="text-xl font-bold text-theme-dark">Template Gallery</DialogTitle>
            <p className="text-sm text-theme-gray-dark">Choose from our collection of pre-built templates</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-theme-primary/30 focus:border-theme-primary"
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200/60 p-6 bg-gradient-to-b from-white to-gray-50/50">
            <h4 className="font-semibold text-theme-dark mb-4">Categories</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                    selectedCategory === category.id
                      ? "bg-theme-primary/10 text-theme-primary border border-theme-primary/30"
                      : "hover:bg-theme-primary/5 text-theme-gray-dark hover:text-theme-dark"
                  )}
                >
                  <span className="font-medium">{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>

            {/* Popular Templates */}
            {popularTemplates.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-theme-dark mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-theme-yellow" />
                  Popular
                </h4>
                <div className="space-y-2">
                  {popularTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className="w-full p-3 text-left rounded-lg hover:bg-theme-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <template.icon className="w-4 h-4 text-theme-primary" />
                        <span className="font-medium text-theme-dark text-sm">{template.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="group p-6 border border-gray-200/60 rounded-xl hover:shadow-custom transition-all notion-hover bg-white cursor-pointer"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5 rounded-lg">
                      <template.icon className="w-6 h-6 text-theme-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-theme-dark group-hover:text-theme-primary transition-colors">
                          {template.name}
                        </h3>
                        {template.popular && (
                          <Star className="w-4 h-4 text-theme-yellow fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-theme-gray-dark leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50/50 rounded-lg border border-gray-200/60">
                    <div className="text-xs text-theme-gray-dark mb-1">Preview:</div>
                    <div className="font-mono text-sm text-theme-dark">{template.preview}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-theme-primary hover:bg-theme-primary-dark text-white"
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-theme-gray" />
                <h3 className="font-semibold text-theme-dark mb-2">No templates found</h3>
                <p className="text-theme-gray-dark">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}