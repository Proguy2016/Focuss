import React, { useState } from 'react';
import { ChevronDown, Plus, Search, Folder, Users, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useCompanyWorkspace } from '@/hooks/useCompanyWorkspace';
import { cn } from '@/lib/utils';

export function ProjectSwitcher() {
  const { 
    currentProject, 
    projects, 
    departments, 
    employees, 
    switchProject, 
    getCurrentProject, 
    getProjectTeam 
  } = useCompanyWorkspace();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentProj = getCurrentProject();
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      case 'on-hold': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'completed': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'archived': return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
      default: return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'high': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'medium': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'low': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      default: return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
    }
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'No budget';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-64 justify-between bg-white/90 backdrop-blur-glass border-theme-primary/30 hover:bg-theme-primary/5 hover:border-theme-primary"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentProj?.color }}
            />
            <span className="font-semibold text-theme-dark truncate">
              {currentProj?.name || 'Select Project'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-theme-gray-dark" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0 bg-white/95 backdrop-blur-glass border-theme-primary/20 shadow-custom-lg">
        {/* Header */}
        <div className="p-4 border-b border-gray-200/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-theme-dark">Switch Project</h3>
            <Button size="sm" className="gap-2 bg-theme-primary hover:bg-theme-primary-dark text-white">
              <Plus className="w-3 h-3" />
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-theme-primary/30 focus:border-theme-primary"
            />
          </div>
        </div>

        {/* Current Project Info */}
        {currentProj && (
          <div className="p-4 border-b border-gray-200/60 bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentProj.color }}
              />
              <span className="font-bold text-theme-dark">{currentProj.name}</span>
              <Badge variant="secondary" className={cn("text-xs", getStatusColor(currentProj.status))}>
                {currentProj.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-theme-gray-dark">Progress:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={currentProj.progress} className="h-2 flex-1" />
                  <span className="font-semibold text-theme-dark">{currentProj.progress}%</span>
                </div>
              </div>
              <div>
                <span className="text-theme-gray-dark">Team:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-theme-primary" />
                  <span className="font-semibold text-theme-dark">{currentProj.teamMembers.length} members</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredProjects.map((project) => {
            const team = getProjectTeam(project.id);
            const isActive = project.id === currentProject;
            
            return (
              <button
                key={project.id}
                onClick={() => {
                  switchProject(project.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full p-4 text-left hover:bg-theme-primary/5 transition-colors border-l-4",
                  isActive 
                    ? "bg-theme-primary/10 border-theme-primary" 
                    : "border-transparent hover:border-theme-primary/50"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-theme-dark truncate">{project.name}</h4>
                      <p className="text-xs text-theme-gray-dark truncate">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className={cn("text-xs", getStatusColor(project.status))}>
                      {project.status}
                    </Badge>
                    <Badge variant="secondary" className={cn("text-xs", getPriorityColor(project.priority))}>
                      {project.priority}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                  <div>
                    <span className="text-theme-gray-dark">Progress:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={project.progress} className="h-1.5 flex-1" />
                      <span className="font-semibold text-theme-dark">{project.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-theme-gray-dark">Budget:</span>
                    <div className="font-semibold text-theme-dark mt-1">{formatBudget(project.budget)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {team.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="w-5 h-5 border border-white ring-1 ring-theme-primary/20">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {team.length > 3 && (
                        <div className="w-5 h-5 bg-theme-gray/20 border border-white rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-theme-gray-dark">+{team.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-theme-gray-dark">{team.length} members</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {project.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="p-8 text-center">
            <Folder className="w-12 h-12 mx-auto mb-4 text-theme-gray" />
            <h3 className="font-semibold text-theme-dark mb-2">No projects found</h3>
            <p className="text-theme-gray-dark text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}