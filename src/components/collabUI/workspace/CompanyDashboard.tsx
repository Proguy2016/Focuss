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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-white to-gray-50/50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-dark">Room Hub</h1>
          <p className="text-theme-gray-dark">Overview of projects, teams, and resources</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2 bg-theme-primary hover:bg-theme-primary-dark text-white">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-200/60 rounded-xl shadow-custom">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-theme-dark">{activeProjects}</div>
              <div className="text-sm text-theme-gray-dark">Active Projects</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200/60 rounded-xl shadow-custom">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-emerald/10 rounded-lg">
              <Users className="w-6 h-6 text-theme-emerald" />
            </div>
            <div>
              <div className="text-2xl font-bold text-theme-dark">{onlineEmployees}</div>
              <div className="text-sm text-theme-gray-dark">Online</div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200/60 rounded-xl shadow-custom">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-theme-yellow/10 rounded-lg">
              <Target className="w-6 h-6 text-theme-yellow" />
            </div>
            <div>
              <div className="text-2xl font-bold text-theme-dark">{Math.round(averageWorkload)}%</div>
              <div className="text-sm text-theme-gray-dark">Avg Workload</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200/60 rounded-xl shadow-custom p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-theme-dark">Active Projects</h3>
              <div className="flex items-center gap-3">
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <div key={project.id} className="p-4 border border-gray-200/60 rounded-lg hover:bg-theme-primary/5 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-theme-dark">{project.name}</h4>
                        <p className="text-sm text-theme-gray-dark">{project.description}</p>
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
                      <span className="text-xs text-theme-gray-dark">Progress</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={project.progress} className="h-2 flex-1" />
                        <span className="text-sm font-semibold text-theme-dark">{project.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-theme-gray-dark">Due Date</span>
                      <div className="text-sm font-semibold text-theme-dark mt-1">
                        {project.dueDate ? formatDate(project.dueDate) : 'No deadline'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.teamMembers.slice(0, 4).map(memberId => {
                        const member = employees.find(e => e.id === memberId);
                        return member ? (
                          <Avatar key={member.id} className="w-6 h-6 border-2 border-white ring-1 ring-theme-primary/20">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ) : null;
                      })}
                      {project.teamMembers.length > 4 && (
                        <div className="w-6 h-6 bg-theme-gray/20 border-2 border-white rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-theme-gray-dark">+{project.teamMembers.length - 4}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {project.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
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
          <div className="bg-white border border-gray-200/60 rounded-xl shadow-custom p-6">
            <h3 className="font-bold text-theme-dark mb-6">Departments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="p-4 border border-gray-200/60 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <div>
                      <h4 className="font-semibold text-theme-dark">{dept.name}</h4>
                      <p className="text-xs text-theme-gray-dark">{dept.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-theme-gray-dark">Members:</span>
                      <div className="font-semibold text-theme-dark">{dept.members.length}</div>
                    </div>
                    <div>
                      <span className="text-theme-gray-dark">Projects:</span>
                      <div className="font-semibold text-theme-dark">{dept.projects.length}</div>
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
          <div className="bg-white border border-gray-200/60 rounded-xl shadow-custom p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-theme-primary" />
              <h3 className="font-bold text-theme-dark">Upcoming Meetings</h3>
            </div>
            <div className="space-y-3">
              {upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="p-3 border border-gray-200/60 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-theme-dark text-sm">{meeting.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {meeting.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-theme-gray-dark">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(meeting.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-theme-gray-dark mt-1">
                    <Users className="w-3 h-3" />
                    <span>{meeting.participants.length} participants</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Resources */}
          <div className="bg-white border border-gray-200/60 rounded-xl shadow-custom p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-theme-secondary" />
              <h3 className="font-bold text-theme-dark">Available Resources</h3>
            </div>
            <div className="space-y-3">
              {availableResources.slice(0, 5).map(resource => (
                <div key={resource.id} className="p-3 border border-gray-200/60 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-theme-dark text-sm">{resource.name}</h4>
                    <Badge variant="secondary" className="text-xs bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30">
                      Available
                    </Badge>
                  </div>
                  <p className="text-xs text-theme-gray-dark mb-2">{resource.description}</p>
                  {resource.location && (
                    <div className="text-xs text-theme-gray-dark">
                      📍 {resource.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team Status */}
          <div className="bg-white border border-gray-200/60 rounded-xl shadow-custom p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-theme-emerald" />
              <h3 className="font-bold text-theme-dark">Team Status</h3>
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
                    <div className="font-semibold text-theme-dark text-sm">{employee.name}</div>
                    <div className="text-xs text-theme-gray-dark">{employee.role}</div>
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