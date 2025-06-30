// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, CheckSquare, Folder, BookOpen, Users, Settings, ChevronLeft, ChevronRight, Video, VideoOff, Timer, Search, Sparkles, Bot, BarChart3, Shield, Brain, Database, Layout, Plus, Calendar, Target } from 'lucide-react';

import { useRoom } from '@/hooks/useRoom';
import { useLiveCursors } from '@/hooks/useLiveCursors';
import { usePermissions } from '@/hooks/usePermissions';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { useCompanyWorkspace } from '@/hooks/useCompanyWorkspace';
import { useVideoConference } from '@/hooks/useVideoConference';

import { SidebarItem } from '@/components/common/SidebarItem';
import { SidebarSection } from '@/components/common/SidebarSection';
import { PresenceAvatarGroup } from '@/components/common/PresenceAvatarGroup';
import { CommandPalette } from '@/components/common/CommandPalette';
import { LiveCursor } from '@/components/common/LiveCursor';
import { AIAssistant } from '@/components/common/AIAssistant';
import { AnalyticsDashboard } from '@/components/common/AnalyticsDashboard';
import { AdvancedAnalyticsDashboard } from '@/components/common/AdvancedAnalyticsDashboard';
import { PermissionsManager } from '@/components/common/PermissionsManager';
import { DatabaseView } from '@/components/common/DatabaseView';
import { TemplateGallery } from '@/components/common/TemplateGallery';

import { ProjectSwitcher } from '@/components/workspace/ProjectSwitcher';
import { ConferencePanel } from '@/components/workspace/ConferencePanel';
import { CompanyDashboard } from '@/components/workspace/CompanyDashboard';
import { AssignTaskModal } from '@/components/modals/AssignTaskModal';
import { AddProjectModal } from '@/components/modals/AddProjectModal';
import { UpcomingMeetingsModal } from '@/components/modals/UpcomingMeetingsModal';

import { ChatTab } from '@/components/tabs/ChatTab';
import { TasksTab } from '@/components/tabs/TasksTab';
import { FilesTab } from '@/components/tabs/FilesTab';
import { WhiteboardTab } from '@/components/tabs/WhiteboardTab';
import { SharedLibraryTab } from '@/components/tabs/SharedLibraryTab';
import { SharedAIChatTab } from '@/components/tabs/SharedAIChatTab';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { CollaborationProvider } from "@/contexts/CollaborationContext";

export function CollaborationRoom() {
  const [activeTab, setActiveTab] = useState('room-hub');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConferencePanelOpen, setIsConferencePanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdvancedAnalyticsOpen, setIsAdvancedAnalyticsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isUpcomingMeetingsOpen, setIsUpcomingMeetingsOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('STU-2024-A7X9');

  const { room, sendMessage, updateTask, toggleRecording } = useRoom('room-1');
  const { cursors, updateCursor } = useLiveCursors();
  const { hasPermission, getCurrentUserPermissions } = usePermissions();
  const { generateInsights } = useAdvancedAI();
  const { getCurrentProject, getUpcomingMeetings } = useCompanyWorkspace();
  const { isInConference, startConference, joinConference } = useVideoConference();

  const currentUser = getCurrentUserPermissions();
  const currentProject = getCurrentProject();
  const upcomingMeetings = getUpcomingMeetings();

  // Enhanced mock database items for project tracking with detailed task assignments
  const [databaseItems, setDatabaseItems] = useState([
    {
      id: '1',
      title: 'Frontend Component Library',
      status: 'In Progress' as const,
      priority: 'High' as const,
      assignee: 'Sarah Chen',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['frontend', 'components', 'react'],
      type: 'Task' as const,
      description: 'Build reusable React components for the design system',
      subtasks: [
        { id: '1a', title: 'Button Component', assignee: 'Sarah Chen', status: 'completed', progress: 100 },
        { id: '1b', title: 'Input Component', assignee: 'Sarah Chen', status: 'in-progress', progress: 70 },
        { id: '1c', title: 'Modal Component', assignee: 'Marcus Johnson', status: 'todo', progress: 0 },
      ],
      estimatedHours: 40,
      actualHours: 28,
      blockers: ['Waiting for design approval'],
    },
    {
      id: '2',
      title: 'API Documentation',
      status: 'Not Started' as const,
      priority: 'Medium' as const,
      assignee: 'Marcus Johnson',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: ['documentation', 'api', 'backend'],
      type: 'Feature' as const,
      description: 'Complete API documentation for all endpoints',
      subtasks: [
        { id: '2a', title: 'Authentication Endpoints', assignee: 'Marcus Johnson', status: 'todo', progress: 0 },
        { id: '2b', title: 'User Management APIs', assignee: 'Elena Rodriguez', status: 'todo', progress: 0 },
        { id: '2c', title: 'Data Export APIs', assignee: 'David Kim', status: 'todo', progress: 0 },
      ],
      estimatedHours: 24,
      actualHours: 0,
      blockers: [],
    },
    {
      id: '3',
      title: 'User Testing Results Analysis',
      status: 'Done' as const,
      priority: 'High' as const,
      assignee: 'Elena Rodriguez',
      tags: ['testing', 'ux', 'research'],
      type: 'Task' as const,
      description: 'Analyze user testing feedback and create improvement recommendations',
      subtasks: [
        { id: '3a', title: 'Data Collection', assignee: 'Elena Rodriguez', status: 'completed', progress: 100 },
        { id: '3b', title: 'Analysis Report', assignee: 'Elena Rodriguez', status: 'completed', progress: 100 },
        { id: '3c', title: 'Recommendations', assignee: 'Elena Rodriguez', status: 'completed', progress: 100 },
      ],
      estimatedHours: 16,
      actualHours: 18,
      blockers: [],
    },
    {
      id: '4',
      title: 'Mobile App Performance Optimization',
      status: 'In Progress' as const,
      priority: 'Critical' as const,
      assignee: 'David Kim',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      tags: ['mobile', 'performance', 'optimization'],
      type: 'Bug' as const,
      description: 'Optimize app performance to reduce load times by 50%',
      subtasks: [
        { id: '4a', title: 'Image Optimization', assignee: 'David Kim', status: 'completed', progress: 100 },
        { id: '4b', title: 'Code Splitting', assignee: 'Priya Patel', status: 'in-progress', progress: 60 },
        { id: '4c', title: 'Caching Strategy', assignee: 'Alex Thompson', status: 'todo', progress: 0 },
      ],
      estimatedHours: 32,
      actualHours: 20,
      blockers: ['Need approval for caching infrastructure'],
    },
  ]);

  // Auto-generate insights periodically
  useEffect(() => {
    const interval = setInterval(() => {
      generateInsights(room);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [room, generateInsights]);

  // Handle mouse movement for live cursors
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [updateCursor]);

  // Format session timer
  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsAIAssistantOpen(false);
        setIsAnalyticsOpen(false);
        setIsAdvancedAnalyticsOpen(false);
        setIsPermissionsOpen(false);
        setIsTemplateGalleryOpen(false);
        setIsAssignTaskOpen(false);
        setIsAddProjectOpen(false);
        setIsUpcomingMeetingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandNavigation = (destination: string) => {
    if (['room-hub', 'chat', 'ai-chat', 'whiteboard', 'tasks', 'library', 'tracker'].includes(destination)) {
      setActiveTab(destination);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setDatabaseItems(prev => prev.filter(item => item.id !== projectId));
  };

  const handleAddProject = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      subtasks: [],
      estimatedHours: 0,
      actualHours: 0,
      blockers: [],
    };
    setDatabaseItems(prev => [...prev, newProject]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'room-hub':
        return <CompanyDashboard />;
      case 'chat':
        return <ChatTab messages={room.messages} onSendMessage={sendMessage} />;
      case 'ai-chat':
        return <SharedAIChatTab participants={room.participants} />;
      case 'whiteboard':
        return <WhiteboardTab />;
      case 'tasks':
        return (
          <TasksTab 
            tasks={room.tasks} 
            onUpdateTask={updateTask}
            onAssignTask={() => setIsAssignTaskOpen(true)}
          />
        );
      case 'library':
        return <SharedLibraryTab files={room.files} />;
      case 'tracker':
        return (
          <div className="h-full p-6 bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-theme-dark">Project Tracker</h3>
                <p className="text-theme-gray-dark">Detailed view of all project tasks and assignments</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsAddProjectOpen(true)}
                  className="gap-2 bg-theme-primary hover:bg-theme-primary-dark text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </Button>
                <Button 
                  onClick={() => setIsTemplateGalleryOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Layout className="w-4 h-4" />
                  Templates
                </Button>
              </div>
            </div>
            <DatabaseView 
              items={databaseItems}
              onItemDelete={handleDeleteProject}
              className="h-[calc(100%-120px)]"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const canManageMeetings = hasPermission(currentUser.userId, 'manage_participants') || 
                           currentUser.role === 'admin' || 
                           currentUser.role === 'moderator';

  return (
    <div className="flex flex-col h-screen animated-bg relative">
      {/* Live Cursors */}
      {cursors.map((cursor) => (
        <LiveCursor
          key={cursor.userId}
          userName={cursor.userName}
          x={cursor.x}
          y={cursor.y}
        />
      ))}

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-glass border-b border-gray-200/60 shadow-custom z-10">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow animate-glow-pulse flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <ProjectSwitcher />
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {room.isRecording && (
              <Badge className="gap-2 bg-theme-red/10 text-theme-red border-theme-red/30 hover:bg-theme-red/20">
                <div className="w-2 h-2 bg-theme-red rounded-full animate-pulse" />
                Recording
              </Badge>
            )}
            <Badge variant="secondary" className="gap-2 bg-theme-primary/10 text-theme-primary-dark border-theme-primary/30">
              <Timer className="w-3 h-3" />
              {formatTimer(room.sessionTimer)}
            </Badge>
            <Badge variant="secondary" className="gap-2 bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30">
              <Users className="w-3 h-3" />
              {room.participants.filter(p => p.status === 'online').length} Online
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-theme-gray-dark">Room Code:</span>
              <Badge variant="outline" className="font-mono text-theme-dark border-theme-primary/30">
                {roomCode}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <PresenceAvatarGroup participants={room.participants} />
          </div>
          
          <div className="flex items-center gap-2">
            {/* AI Assistant */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAIAssistantOpen(true)}
              className="gap-2 text-theme-gray-dark hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">AI Assistant</span>
            </Button>

            {/* Analytics */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
              className="gap-2 text-theme-gray-dark hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Analytics</span>
            </Button>

            {/* Advanced Analytics */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdvancedAnalyticsOpen(true)}
              className="gap-2 text-theme-gray-dark hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden md:inline">AI Insights</span>
            </Button>

            {/* Permissions */}
            {hasPermission(currentUser.userId, 'manage_participants') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPermissionsOpen(true)}
                className="gap-2 text-theme-gray-dark hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Permissions</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="gap-2 text-theme-gray-dark hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-theme-primary/10 px-1.5 font-mono text-xs font-medium text-theme-primary-dark">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            
            <Button
              variant={isInConference ? "default" : "outline"}
              size="sm"
              onClick={() => setIsConferencePanelOpen(!isConferencePanelOpen)}
              className={cn(
                "gap-2 shadow-custom",
                isInConference 
                  ? "bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow" 
                  : "border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
              )}
            >
              {isInConference ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isInConference ? 'Conference' : 'Join Conference'}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "border-r border-gray-200/60 bg-white/80 backdrop-blur-glass shadow-custom transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-72",
          "hidden lg:block"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
            {!isSidebarCollapsed && (
              <span className="font-bold text-theme-dark">Room Workspace</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-8 h-8 p-0 text-theme-gray-dark hover:text-theme-primary hover:bg-theme-primary/10"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>

          {!isSidebarCollapsed && (
            <div className="p-4 space-y-6">
              <SidebarSection title="Room Overview">
                <SidebarItem
                  icon={<Layout className="w-4 h-4" />}
                  label="Room Hub"
                  isActive={activeTab === 'room-hub'}
                  onClick={() => setActiveTab('room-hub')}
                />
                <SidebarItem
                  icon={<CheckSquare className="w-4 h-4" />}
                  label="Tasks & Milestones"
                  isActive={activeTab === 'tasks'}
                  onClick={() => setActiveTab('tasks')}
                />
                <SidebarItem
                  icon={<Database className="w-4 h-4" />}
                  label="Project Tracker"
                  isActive={activeTab === 'tracker'}
                  onClick={() => setActiveTab('tracker')}
                />
              </SidebarSection>

              <SidebarSection title="Collaboration">
                <SidebarItem
                  icon={<MessageSquare className="w-4 h-4" />}
                  label="Team Chat"
                  isActive={activeTab === 'chat'}
                  onClick={() => setActiveTab('chat')}
                />
                <SidebarItem
                  icon={<Brain className="w-4 h-4" />}
                  label="Shared AI Chat"
                  isActive={activeTab === 'ai-chat'}
                  onClick={() => setActiveTab('ai-chat')}
                />
                <SidebarItem
                  icon={<FileText className="w-4 h-4" />}
                  label="Whiteboard"
                  isActive={activeTab === 'whiteboard'}
                  onClick={() => setActiveTab('whiteboard')}
                />
                <SidebarItem
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Shared Library"
                  isActive={activeTab === 'library'}
                  onClick={() => setActiveTab('library')}
                />
                <SidebarItem
                  icon={<Video className="w-4 h-4" />}
                  label="Video Conference"
                  onClick={() => setIsConferencePanelOpen(true)}
                />
              </SidebarSection>

              <SidebarSection title="Upcoming Meetings">
                {canManageMeetings && (
                  <SidebarItem
                    icon={<Plus className="w-4 h-4" />}
                    label="Schedule Meeting"
                    onClick={() => setIsUpcomingMeetingsOpen(true)}
                  />
                )}
                {upcomingMeetings.slice(0, 3).map(meeting => (
                  <SidebarItem
                    key={meeting.id}
                    icon={<Calendar className="w-4 h-4" />}
                    label={meeting.title}
                    onClick={() => {
                      if (meeting.status === 'scheduled') {
                        startConference(meeting.id);
                        setIsConferencePanelOpen(true);
                      }
                    }}
                  />
                ))}
              </SidebarSection>

              <SidebarSection title="AI & Analytics">
                <SidebarItem
                  icon={<Bot className="w-4 h-4" />}
                  label="AI Assistant"
                  onClick={() => setIsAIAssistantOpen(true)}
                />
                <SidebarItem
                  icon={<BarChart3 className="w-4 h-4" />}
                  label="Room Analytics"
                  onClick={() => setIsAnalyticsOpen(true)}
                />
                <SidebarItem
                  icon={<Brain className="w-4 h-4" />}
                  label="AI Insights"
                  onClick={() => setIsAdvancedAnalyticsOpen(true)}
                />
                {hasPermission(currentUser.userId, 'manage_participants') && (
                  <SidebarItem
                    icon={<Shield className="w-4 h-4" />}
                    label="Team Permissions"
                    onClick={() => setIsPermissionsOpen(true)}
                  />
                )}
              </SidebarSection>

              <SidebarSection title="Room Settings">
                <SidebarItem
                  icon={<Layout className="w-4 h-4" />}
                  label="Templates"
                  onClick={() => setIsTemplateGalleryOpen(true)}
                />
                <SidebarItem
                  icon={<Settings className="w-4 h-4" />}
                  label="Room Settings"
                />
              </SidebarSection>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden bg-white shadow-custom">
          <div className="flex-1 overflow-hidden">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Conference Panel */}
      <ConferencePanel
        isOpen={isConferencePanelOpen}
        onClose={() => setIsConferencePanelOpen(false)}
      />

      {/* Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleCommandNavigation}
      />

      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        roomData={room}
      />

      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        roomData={room}
      />

      <AdvancedAnalyticsDashboard
        isOpen={isAdvancedAnalyticsOpen}
        onClose={() => setIsAdvancedAnalyticsOpen(false)}
        roomData={room}
      />

      <PermissionsManager
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        participants={room.participants}
      />

      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={(template) => {
          console.log('Selected template:', template);
          setIsTemplateGalleryOpen(false);
        }}
      />

      <AssignTaskModal
        isOpen={isAssignTaskOpen}
        onClose={() => setIsAssignTaskOpen(false)}
        participants={room.participants}
        onAssignTask={(taskData) => {
          console.log('Assigned task:', taskData);
          setIsAssignTaskOpen(false);
        }}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onAddProject={handleAddProject}
      />

      <UpcomingMeetingsModal
        isOpen={isUpcomingMeetingsOpen}
        onClose={() => setIsUpcomingMeetingsOpen(false)}
        meetings={upcomingMeetings}
        canManage={canManageMeetings}
      />
    </div>
  );
}

// Default export page wrapper to supply context
export default function CollaborationRoomPage() {
  return (
    <CollaborationProvider>
      <CollaborationRoom />
    </CollaborationProvider>
  );
}