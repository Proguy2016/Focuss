import React, { useState } from 'react';
import { Table, Grid, Calendar, List, Filter, SortAsc as Sort, Plus, Search, MoreHorizontal, ChevronDown, ChevronRight, Users, Clock, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface Subtask {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'completed';
  progress: number;
}

interface DatabaseItem {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee?: string;
  dueDate?: Date;
  tags: string[];
  type: 'Task' | 'Bug' | 'Feature' | 'Research';
  description?: string;
  subtasks?: Subtask[];
  estimatedHours?: number;
  actualHours?: number;
  blockers?: string[];
}

interface DatabaseViewProps {
  items: DatabaseItem[];
  onItemUpdate?: (id: string, updates: Partial<DatabaseItem>) => void;
  onItemAdd?: (item: Omit<DatabaseItem, 'id'>) => void;
  onItemDelete?: (id: string) => void;
  className?: string;
}

export function DatabaseView({ items, onItemUpdate, onItemAdd, onItemDelete, className }: DatabaseViewProps) {
  const [viewType, setViewType] = useState<'table' | 'board' | 'calendar' | 'list'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const views = [
    { id: 'table', label: 'Table', icon: Table },
    { id: 'board', label: 'Board', icon: Grid },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'list', label: 'List', icon: List },
  ];

  const statusColors = {
    'Not Started': 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30',
    'In Progress': 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30',
    'Done': 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30',
  };

  const priorityColors = {
    'Low': 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30',
    'Medium': 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30',
    'High': 'bg-theme-red/10 text-theme-red border-theme-red/30',
    'Critical': 'bg-theme-red text-white border-theme-red',
  };

  const typeColors = {
    'Task': 'bg-theme-primary/10 text-theme-primary border-theme-primary/30',
    'Bug': 'bg-theme-red/10 text-theme-red border-theme-red/30',
    'Feature': 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30',
    'Research': 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30',
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'priority':
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      default:
        return 0;
    }
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getOverallProgress = (item: DatabaseItem) => {
    if (!item.subtasks || item.subtasks.length === 0) {
      return item.status === 'Done' ? 100 : item.status === 'In Progress' ? 50 : 0;
    }
    const totalProgress = item.subtasks.reduce((sum, subtask) => sum + subtask.progress, 0);
    return Math.round(totalProgress / item.subtasks.length);
  };

  const getAssigneeList = (item: DatabaseItem) => {
    const assignees = new Set([item.assignee]);
    if (item.subtasks) {
      item.subtasks.forEach(subtask => assignees.add(subtask.assignee));
    }
    return Array.from(assignees).filter(Boolean);
  };

  const handleDeleteProject = (itemId: string) => {
    if (onItemDelete) {
      onItemDelete(itemId);
    }
  };

  const renderExpandedView = (item: DatabaseItem) => (
    <div className="mt-4 p-4 bg-gray-50/50 rounded-lg border border-gray-200/60">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Details */}
        <div>
          <h4 className="font-semibold text-theme-dark mb-3">Project Details</h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-theme-gray-dark">Description:</span>
              <p className="text-sm text-theme-dark mt-1">{item.description || 'No description provided'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-theme-gray-dark">Estimated Hours:</span>
                <div className="text-sm font-semibold text-theme-dark">{item.estimatedHours || 0}h</div>
              </div>
              <div>
                <span className="text-sm text-theme-gray-dark">Actual Hours:</span>
                <div className="text-sm font-semibold text-theme-dark">{item.actualHours || 0}h</div>
              </div>
            </div>
            {item.blockers && item.blockers.length > 0 && (
              <div>
                <span className="text-sm text-theme-gray-dark">Blockers:</span>
                <div className="mt-1 space-y-1">
                  {item.blockers.map((blocker, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-theme-red">
                      <AlertTriangle className="w-3 h-3" />
                      {blocker}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Assignments */}
        <div>
          <h4 className="font-semibold text-theme-dark mb-3">Task Assignments</h4>
          {item.subtasks && item.subtasks.length > 0 ? (
            <div className="space-y-3">
              {item.subtasks.map((subtask) => (
                <div key={subtask.id} className="p-3 bg-white rounded-lg border border-gray-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-theme-dark text-sm">{subtask.title}</h5>
                    <Badge variant="secondary" className={cn("text-xs", statusColors[subtask.status === 'todo' ? 'Not Started' : subtask.status === 'in-progress' ? 'In Progress' : 'Done'])}>
                      {subtask.status === 'todo' ? 'Not Started' : subtask.status === 'in-progress' ? 'In Progress' : 'Done'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                          {subtask.assignee.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-theme-gray-dark">{subtask.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={subtask.progress} className="w-16 h-1.5" />
                      <span className="text-xs font-semibold text-theme-dark">{subtask.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-theme-gray-dark">
              <Users className="w-8 h-8 mx-auto mb-2 text-theme-gray" />
              <p className="text-sm">No subtasks assigned yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="border border-gray-200/60 rounded-xl overflow-hidden bg-white">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5 border-b border-gray-200/60">
          <tr>
            <th className="text-left p-4 font-semibold text-theme-dark w-8"></th>
            <th className="text-left p-4 font-semibold text-theme-dark">Title</th>
            <th className="text-left p-4 font-semibold text-theme-dark">Status</th>
            <th className="text-left p-4 font-semibold text-theme-dark">Priority</th>
            <th className="text-left p-4 font-semibold text-theme-dark">Progress</th>
            <th className="text-left p-4 font-semibold text-theme-dark">Team</th>
            <th className="text-left p-4 font-semibold text-theme-dark">Due Date</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            const progress = getOverallProgress(item);
            const assignees = getAssigneeList(item);
            
            return (
              <React.Fragment key={item.id}>
                <tr className={cn(
                  "border-b border-gray-200/60 hover:bg-theme-primary/5 transition-colors",
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                      className="w-6 h-6 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </Button>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-theme-dark">{item.title}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className={cn("text-xs", typeColors[item.type])}>
                        {item.type}
                      </Badge>
                      {item.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className={cn("text-xs", statusColors[item.status])}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className={cn("text-xs", priorityColors[item.priority])}>
                      {item.priority}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="w-16 h-2" />
                      <span className="text-sm font-semibold text-theme-dark">{progress}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-1">
                      {assignees.slice(0, 3).map(assignee => (
                        <Avatar key={assignee} className="w-6 h-6 border border-white ring-1 ring-theme-primary/20">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                            {assignee?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {assignees.length > 3 && (
                        <div className="w-6 h-6 bg-theme-gray/20 border border-white rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-theme-gray-dark">+{assignees.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {item.dueDate && (
                      <div className="flex items-center gap-1 text-sm text-theme-gray-dark">
                        <Clock className="w-3 h-3" />
                        <span>{item.dueDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48" align="end">
                        <div className="space-y-1">
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                            <Users className="w-4 h-4" />
                            Assign Tasks
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                            <Plus className="w-4 h-4" />
                            Duplicate
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start gap-2 text-theme-red hover:text-theme-red"
                            onClick={() => handleDeleteProject(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={8} className="p-0">
                      {renderExpandedView(item)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderBoardView = () => {
    const columns = ['Not Started', 'In Progress', 'Done'];
    
    return (
      <div className="grid grid-cols-3 gap-6">
        {columns.map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-theme-dark">{status}</h3>
              <Badge variant="secondary" className="text-xs">
                {sortedItems.filter(item => item.status === status).length}
              </Badge>
            </div>
            <div className="space-y-3">
              {sortedItems
                .filter(item => item.status === status)
                .map(item => {
                  const progress = getOverallProgress(item);
                  const assignees = getAssigneeList(item);
                  
                  return (
                    <div key={item.id} className="p-4 bg-white border border-gray-200/60 rounded-xl hover:shadow-custom transition-all notion-hover">
                      <div className="font-medium text-theme-dark mb-2">{item.title}</div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className={cn("text-xs", priorityColors[item.priority])}>
                          {item.priority}
                        </Badge>
                        <Badge variant="secondary" className={cn("text-xs", typeColors[item.type])}>
                          {item.type}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-theme-gray-dark">Progress:</span>
                          <span className="text-xs font-semibold text-theme-dark">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {item.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex -space-x-1">
                          {assignees.slice(0, 2).map(assignee => (
                            <Avatar key={assignee} className="w-5 h-5 border border-white">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                                {assignee?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-2">
      {sortedItems.map(item => {
        const progress = getOverallProgress(item);
        const assignees = getAssigneeList(item);
        
        return (
          <Collapsible key={item.id}>
            <div className="flex items-center gap-4 p-4 bg-white border border-gray-200/60 rounded-xl hover:bg-theme-primary/5 transition-colors notion-hover">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </CollapsibleTrigger>
              <div className="flex-1">
                <div className="font-medium text-theme-dark">{item.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={progress} className="w-20 h-1.5" />
                  <span className="text-xs text-theme-gray-dark">{progress}%</span>
                </div>
              </div>
              <Badge variant="secondary" className={cn("text-xs", statusColors[item.status])}>
                {item.status}
              </Badge>
              <Badge variant="secondary" className={cn("text-xs", priorityColors[item.priority])}>
                {item.priority}
              </Badge>
              <div className="flex -space-x-1">
                {assignees.slice(0, 2).map(assignee => (
                  <Avatar key={assignee} className="w-6 h-6 border border-white">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                      {assignee?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2 text-theme-red hover:text-theme-red"
                      onClick={() => handleDeleteProject(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <CollapsibleContent>
              {renderExpandedView(item)}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );

  const renderCurrentView = () => {
    switch (viewType) {
      case 'table': return renderTableView();
      case 'board': return renderBoardView();
      case 'list': return renderListView();
      case 'calendar': 
        return (
          <div className="flex items-center justify-center h-64 bg-white border border-gray-200/60 rounded-xl">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-theme-gray" />
              <p className="text-theme-gray-dark">Calendar view coming soon</p>
            </div>
          </div>
        );
      default: return renderTableView();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white border border-gray-200/60 rounded-lg p-1">
            {views.map(view => (
              <Button
                key={view.id}
                variant={viewType === view.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType(view.id as any)}
                className={cn(
                  "gap-2 h-8",
                  viewType === view.id 
                    ? "bg-theme-primary text-white shadow-glow" 
                    : "text-theme-gray-dark hover:text-theme-dark hover:bg-theme-primary/10"
                )}
              >
                <view.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{view.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-gray-dark" />
            <Input
              placeholder="Search projects and tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-theme-primary/30 focus:border-theme-primary"
            />
          </div>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <Sort className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="notion-fade-in">
        {renderCurrentView()}
      </div>
    </div>
  );
}