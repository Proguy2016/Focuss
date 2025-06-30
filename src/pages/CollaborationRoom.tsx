// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, CheckSquare, Folder, BookOpen, Users, Settings, ChevronLeft, ChevronRight, Video, VideoOff, Timer, Search, Sparkles, Bot, BarChart3, Shield, Brain, Database, Layout, Plus, Calendar, Target } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

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

import { ChatTab } from '@/components/collabUI/tabs/ChatTab';
import { TasksTab } from '@/components/collabUI/tabs/TasksTab';
import { FilesTab } from '@/components/collabUI/tabs/FilesTab';
import { WhiteboardTab } from '@/components/collabUI/tabs/WhiteboardTab';
import { SharedLibraryTab } from '@/components/collabUI/tabs/SharedLibraryTab';
import { SharedAIChatTab } from '@/components/collabUI/tabs/SharedAIChatTab';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { CollaborationProvider } from "@/contexts/CollaborationContext";
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { CreateRoom } from '@/components/collabUI/modals/CreateRoom';

export function CollaborationRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
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

  const { room, isLoading, error, sendMessage, updateTask, addTask, deleteTask, toggleRecording, updateWhiteboard, setTypingStatus, uploadFile, createRoom } = useRoom(roomId);
  const { cursors, updateCursor } = useLiveCursors(roomId);
  const { hasPermission, getCurrentUserPermissions } = usePermissions();
  const { generateInsights } = useAdvancedAI();
  const { getCurrentProject, getUpcomingMeetings } = useCompanyWorkspace();
  const { isInConference, startConference, joinConference } = useVideoConference();

  const currentUser = getCurrentUserPermissions();
  const currentProject = getCurrentProject();
  const upcomingMeetings = getUpcomingMeetings();

  // Auto-generate insights periodically
  useEffect(() => {
    if (room) {
      const interval = setInterval(() => {
        generateInsights(room);
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [room, generateInsights]);

  // Handle mouse movement for live cursors
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [updateCursor]);

  const handleCreateRoom = async (roomDetails: { name: string; description: string; type: string; members: any[] }) => {
    if (!authUser) {
      console.error("User is not authenticated.");
      // Optionally, show an error to the user
      return;
    }

    try {
      const fullRoomDetails = {
        ...roomDetails,
        userId: authUser._id,
        userName: authUser.firstName,
      };
      const newRoom = await createRoom(fullRoomDetails);
      if (newRoom && newRoom.roomId) {
        navigate(`/collaboration/${newRoom.roomId}`);
        setIsCreateRoomOpen(false);
      }
    } catch (err) {
      console.error("Failed to create room:", err);
      // Handle error in UI
    }
  };

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

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <Spinner size="lg" />
          <span className="ml-2 text-white">Loading room data...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-theme-red">
          <span className="text-lg font-semibold">Error loading room</span>
          <span className="text-sm">{error}</span>
          <Button onClick={() => navigate('/collaboration')} className="mt-4">Back to Lobby</Button>
        </div>
      );
    }

    switch (activeTab) {
      case 'room-hub':
        return <CompanyDashboard />;
      case 'chat':
        return <ChatTab messages={room.messages} onSendMessage={sendMessage} onTyping={(isTyping) => setTypingStatus(isTyping, 'chat')} />;
      case 'ai-chat':
        return <SharedAIChatTab participants={room.participants} />;
      case 'whiteboard':
        return <WhiteboardTab elements={room.whiteboard?.elements || []} onUpdateElements={updateWhiteboard} />;
      case 'tasks':
        return (
          <TasksTab 
            tasks={room.tasks} 
            onUpdateTask={updateTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onAssignTask={() => setIsAssignTaskOpen(true)}
            participants={room.participants}
          />
        );
      case 'library':
        return <SharedLibraryTab files={room.files} />;
      case 'files':
        return <FilesTab files={room.files} onUploadFile={uploadFile} />;
      case 'tracker':
        return (
          <div className="h-full flex items-center justify-center text-gray text-lg">
            <div className="max-w-md text-center">
              <h3 className="text-xl font-bold text-white mb-2">Project Tracker</h3>
              <p>Connect to your project management system to see live project data here.</p>
              <Button className="mt-4 gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow">
                <Plus className="w-4 h-4" />
                Connect Project Management
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const canManageMeetings = hasPermission(currentUser.userId, 'manage_participants') || 
                           currentUser.role === 'admin' || 
                           currentUser.role === 'moderator';

  if (!roomId) {
    return (
      <div className="flex flex-col h-screen animated-bg items-center justify-center">
        <div className="text-center p-8 bg-dark/80 backdrop-blur-glass rounded-xl shadow-custom border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-2">Collaboration Hub</h1>
          <p className="text-lg text-gray mb-8">Create a new room or join an existing one.</p>
          <Button onClick={() => setIsCreateRoomOpen(true)} size="lg" className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow">
            <Plus className="w-5 h-5" />
            Create New Room
          </Button>
          {/* TODO: Add a list of existing/public rooms to join */}
        </div>
        {isCreateRoomOpen && (
          <CreateRoom
            onCreateRoom={handleCreateRoom}
            onCancel={() => setIsCreateRoomOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen animated-bg relative">
      {isCreateRoomOpen && (
        <CreateRoom
          onCreateRoom={handleCreateRoom}
          onCancel={() => setIsCreateRoomOpen(false)}
        />
      )}
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
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-dark/80 backdrop-blur-glass border-b border-white/10 shadow-custom z-10">
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
            <Badge variant="secondary" className="gap-2 bg-theme-primary/10 text-theme-primary border-theme-primary/30">
              <Timer className="w-3 h-3" />
              {formatTimer(room.sessionTimer)}
            </Badge>
            <Badge variant="secondary" className="gap-2 bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30">
              <Users className="w-3 h-3" />
              {room.participants.filter(p => p.status === 'online').length} Online
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray">Room Code:</span>
              <Badge variant="outline" className="font-mono text-white border-theme-primary/30">
                {roomId}
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
              className="gap-2 text-gray hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">AI Assistant</span>
            </Button>

            {/* Analytics */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
              className="gap-2 text-gray hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Analytics</span>
            </Button>

            {/* Advanced Analytics */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdvancedAnalyticsOpen(true)}
              className="gap-2 text-gray hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
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
                className="gap-2 text-gray hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Permissions</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="gap-2 text-gray hover:text-theme-primary hover:bg-theme-primary/10 hidden sm:flex"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-theme-primary/10 px-1.5 font-mono text-xs font-medium text-theme-primary">
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
          "border-r border-white/10 bg-dark/50 backdrop-blur-glass shadow-custom transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-72",
          "hidden lg:block"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            {!isSidebarCollapsed && (
              <span className="font-bold text-white">Room Workspace</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-8 h-8 p-0 text-gray hover:text-theme-primary hover:bg-theme-primary/10"
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
                  icon={<Folder className="w-4 h-4" />}
                  label="Files"
                  isActive={activeTab === 'files'}
                  onClick={() => setActiveTab('files')}
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
        <main className="flex flex-1 flex-col overflow-hidden animated-bg shadow-custom">
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
          addTask({
            title: taskData.title,
            description: taskData.description,
            assigneeId: taskData.assigneeId,
            status: 'todo',
            priority: taskData.priority,
            dueDate: taskData.dueDate
          });
          setIsAssignTaskOpen(false);
        }}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onAddProject={(projectData) => {
          console.log('Added project:', projectData);
          setIsAddProjectOpen(false);
        }}
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