import React, { useState } from 'react';
import { 
  Building2, Users, Briefcase, Calendar, TrendingUp, 
  Clock, Target, Award, AlertCircle, Plus, Filter, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanyWorkspace } from '@/hooks/useCompanyWorkspace';
import { cn } from '@/lib/utils';

export function CompanyDashboard() {
  const { 
    projects, 
    departments, 
    employees, 
    meetings, 
    sharedResources,
    getUpcomingMeetings,
    getAvailableResources 
  } = useCompanyWorkspace();

  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const upcomingMeetings = getUpcomingMeetings();
  const availableResources = getAvailableResources();
  
  // Calculate company metrics
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalEmployees = employees.length;
  const onlineEmployees = employees.filter(e => e.status === 'online').length;
  const averageWorkload = employees.reduce((sum, emp) => sum + emp.workload, 0) / employees.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      case 'on-hold': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'completed': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'archived': return 'bg-gray/10 text-gray border-gray/30';
      default: return 'bg-gray/10 text-gray border-gray/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-theme-red/10 text-theme-red border-theme-red/30';
      case 'high': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      case 'medium': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'low': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      default: return 'bg-gray/10 text-gray border-gray/30';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6 animated-bg min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Room Hub</h1>
          <p className="text-gray">Overview of projects, teams, and resources</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-dark/30 border border-white/10 rounded-xl shadow-custom">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeProjects}</div>
              <div className="text-sm text-gray">Active Projects</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-dark/30 border border-white/10 rounded-xl shadow-custom">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-emerald/10 rounded-lg">
              <Users className="w-6 h-6 text-theme-emerald" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{onlineEmployees}</div>
              <div className="text-sm text-gray">Online</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-dark/30 border border-white/10 rounded-xl shadow-custom">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-yellow/10 rounded-lg">
              <Target className="w-6 h-6 text-theme-yellow" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{Math.round(averageWorkload)}%</div>
              <div className="text-sm text-gray">Avg Workload</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark/30 border border-white/10 rounded-xl shadow-custom p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white">Active Projects</h3>
              <div className="flex items-center gap-3">
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-40 bg-dark/50 border-white/10 text-gray">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark border-white/10">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {projects.filter(p => p.status === 'active').map(project => (
                <div key={project.id} className="p-4 border border-white/10 rounded-lg bg-dark/20 hover:bg-theme-primary/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-white">{project.name}</h4>
                        <p className="text-sm text-gray">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn("text-xs", getPriorityColor(project.priority))}>
                        {project.priority}
                      </Badge>
                      <Badge variant="secondary" className={cn("text-xs", getStatusColor(project.status))}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-gray">Progress</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={project.progress} className="h-2 flex-1" />
                        <span className="text-sm font-semibold text-white">{project.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray">Due Date</span>
                      <div className="text-sm font-semibold text-white mt-1">
                        {project.dueDate ? formatDate(project.dueDate) : 'No deadline'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.teamMembers.slice(0, 4).map(memberId => {
                        const member = employees.find(e => e.id === memberId);
                        return member ? (
                          <Avatar key={member.id} className="w-6 h-6 border-2 border-dark ring-1 ring-theme-primary/20">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ) : null;
                      })}
                      {project.teamMembers.length > 4 && (
                        <div className="w-6 h-6 bg-dark/50 border-2 border-dark rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray">+{project.teamMembers.length - 4}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {project.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs border-white/10 text-gray">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="bg-dark/30 border border-white/10 rounded-xl shadow-custom p-6">
            <h3 className="font-bold text-white mb-6">Departments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="p-4 border border-white/10 rounded-lg bg-dark/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <div>
                      <h4 className="font-semibold text-white">{dept.name}</h4>
                      <p className="text-xs text-gray">{dept.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray">Members:</span>
                      <div className="font-semibold text-white">{dept.members.length}</div>
                    </div>
                    <div>
                      <span className="text-gray">Projects:</span>
                      <div className="font-semibold text-white">{dept.projects.length}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Meetings */}
          <div className="bg-dark/30 border border-white/10 rounded-xl shadow-custom p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-theme-primary" />
              <h3 className="font-bold text-white">Upcoming Meetings</h3>
            </div>
            <div className="space-y-3">
              {upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="p-3 border border-white/10 rounded-lg bg-dark/20">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm">{meeting.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {meeting.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(meeting.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray mt-1">
                    <Users className="w-3 h-3" />
                    <span>{meeting.participants.length} participants</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Resources */}
          <div className="bg-dark/30 border border-white/10 rounded-xl shadow-custom p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-theme-secondary" />
              <h3 className="font-bold text-white">Available Resources</h3>
            </div>
            <div className="space-y-3">
              {availableResources.slice(0, 5).map(resource => (
                <div key={resource.id} className="p-3 border border-white/10 rounded-lg bg-dark/20">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm">{resource.name}</h4>
                    <Badge variant="secondary" className="text-xs bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30">
                      Available
                    </Badge>
                  </div>
                  <p className="text-xs text-gray mb-2">{resource.description}</p>
                  {resource.location && (
                    <div className="text-xs text-gray">
                      📍 {resource.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team Status */}
          <div className="bg-dark/30 border border-white/10 rounded-xl shadow-custom p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-theme-emerald" />
              <h3 className="font-bold text-white">Team Status</h3>
            </div>
            <div className="space-y-3">
              {employees.filter(e => e.status === 'online').slice(0, 5).map(employee => (
                <div key={employee.id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 ring-1 ring-theme-primary/20">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{employee.name}</div>
                    <div className="text-xs text-gray">{employee.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-emerald rounded-full" />
                    <span className="text-xs text-theme-emerald">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}