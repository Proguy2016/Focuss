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

import { CollaborationProvider, useCollaboration } from "@/contexts/CollaborationContext";
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { CreateRoom } from '@/components/collabUI/modals/CreateRoom';

export function CollaborationRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { joinRoom, leaveRoom } = useCollaboration();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
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

  const { room, isLoading, error, sendMessage, updateTask, addTask, deleteTask, toggleRecording, updateWhiteboard, setTypingStatus, uploadFile, createRoom, getRooms } = useRoom(roomId);
  const { cursors, updateCursor } = useLiveCursors(roomId);
  const { hasPermission, getCurrentUserPermissions } = usePermissions();
  const { generateInsights } = useAdvancedAI();
  const { getCurrentProject, getUpcomingMeetings } = useCompanyWorkspace();
  const { isInConference, startConference, joinConference } = useVideoConference();

  const currentUser = getCurrentUserPermissions();
  const currentProject = getCurrentProject();
  const upcomingMeetings = getUpcomingMeetings();

  // Join room when roomId changes
  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      return () => {
        leaveRoom();
      };
    }
  }, [roomId, joinRoom, leaveRoom]);

  // Fetch available rooms when the component loads
  useEffect(() => {
    if (!roomId) {
      const fetchRooms = async () => {
        setIsLoadingRooms(true);
        try {
          const rooms = await getRooms();
          setAvailableRooms(rooms);
        } catch (err) {
          setRoomsError(err.message);
        } finally {
          setIsLoadingRooms(false);
        }
      };
      fetchRooms();
    }
  }, [roomId, getRooms]);

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
      return;
    }

    try {
      const fullRoomDetails = {
        ...roomDetails,
        userId: authUser._id,
        userName: authUser.firstName,
      };
      const newRoom = await createRoom(fullRoomDetails);
      if (newRoom && newRoom._id) {
        setIsCreateRoomOpen(false);
        // First navigate, then join room
        navigate(`/collaboration/${newRoom._id}`);
        joinRoom(newRoom._id);
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

    if (!room) {
      return (
        <div className="h-full flex items-center justify-center">
          <span className="text-white">No room data available</span>
        </div>
      );
    }

    switch (activeTab) {
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
      case 'files':
        return <FilesTab files={room.files} onUploadFile={uploadFile} />;
      case 'library':
        return <SharedLibraryTab files={room.files} />;
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

          {/* Available Rooms List */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Available Rooms</h2>
            {isLoadingRooms ? (
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : roomsError ? (
              <div className="text-theme-red text-center">
                <p>{roomsError}</p>
                <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
              </div>
            ) : availableRooms.length === 0 ? (
              <p className="text-gray text-center">No rooms available. Create one to get started!</p>
            ) : (
              <div className="grid gap-4 mt-4">
                {availableRooms.map((room) => (
                  <div
                    key={room._id}
                    className="p-4 bg-dark/50 backdrop-blur-glass rounded-lg border border-white/10 hover:border-theme-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/collaboration/${room._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                        {room.description && (
                          <p className="text-sm text-gray mt-1">{room.description}</p>
                        )}
                      </div>
                      <Badge variant={room.type === 'private' ? 'secondary' : 'default'}>
                        {room.type}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{room.participants?.length || 0} participants</span>
                      </div>
                      <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
      {/* Room Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-dark/80 backdrop-blur-glass border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/collaboration')} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Lobby
          </Button>
          <h1 className="text-xl font-semibold text-white">{room?.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          {room?.participants && <PresenceAvatarGroup users={room.participants} />}
        </div>
      </header>

      {/* Room Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className={cn("w-64 bg-dark/50 backdrop-blur-glass border-r border-white/10 flex flex-col", isSidebarCollapsed && "w-16")}>
          <div className="flex-1 p-2">
            <nav className="space-y-1">
              <SidebarItem
                icon={MessageSquare}
                label="Chat"
                isActive={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={Bot}
                label="AI Chat"
                isActive={activeTab === 'ai-chat'}
                onClick={() => setActiveTab('ai-chat')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={Layout}
                label="Whiteboard"
                isActive={activeTab === 'whiteboard'}
                onClick={() => setActiveTab('whiteboard')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={CheckSquare}
                label="Tasks"
                isActive={activeTab === 'tasks'}
                onClick={() => setActiveTab('tasks')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={FileText}
                label="Files"
                isActive={activeTab === 'files'}
                onClick={() => setActiveTab('files')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={BookOpen}
                label="Library"
                isActive={activeTab === 'library'}
                onClick={() => setActiveTab('library')}
                collapsed={isSidebarCollapsed}
              />
            </nav>
          </div>
          <Button
            variant="ghost"
            className="p-2 w-full flex justify-center"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      {isCreateRoomOpen && (
        <CreateRoom
          onCreateRoom={handleCreateRoom}
          onCancel={() => setIsCreateRoomOpen(false)}
        />
      )}
    </div>
  );
}

// Export the wrapped version as the default export
export default function CollaborationRoomApp() {
  return (
    <CollaborationProvider>
      <CollaborationRoom />
    </CollaborationProvider>
  );
}

// Export the unwrapped version as a named export
export function CollaborationRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { joinRoom, leaveRoom } = useCollaboration();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
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

  const { room, isLoading, error, sendMessage, updateTask, addTask, deleteTask, toggleRecording, updateWhiteboard, setTypingStatus, uploadFile, createRoom, getRooms } = useRoom(roomId);
  const { cursors, updateCursor } = useLiveCursors(roomId);
  const { hasPermission, getCurrentUserPermissions } = usePermissions();
  const { generateInsights } = useAdvancedAI();
  const { getCurrentProject, getUpcomingMeetings } = useCompanyWorkspace();
  const { isInConference, startConference, joinConference } = useVideoConference();

  const currentUser = getCurrentUserPermissions();
  const currentProject = getCurrentProject();
  const upcomingMeetings = getUpcomingMeetings();

  // Join room when roomId changes
  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      return () => {
        leaveRoom();
      };
    }
  }, [roomId, joinRoom, leaveRoom]);

  // Fetch available rooms when the component loads
  useEffect(() => {
    if (!roomId) {
      const fetchRooms = async () => {
        setIsLoadingRooms(true);
        try {
          const rooms = await getRooms();
          setAvailableRooms(rooms);
        } catch (err) {
          setRoomsError(err.message);
        } finally {
          setIsLoadingRooms(false);
        }
      };
      fetchRooms();
    }
  }, [roomId, getRooms]);

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
      return;
    }

    try {
      const fullRoomDetails = {
        ...roomDetails,
        userId: authUser._id,
        userName: authUser.firstName,
      };
      const newRoom = await createRoom(fullRoomDetails);
      if (newRoom && newRoom._id) {
        setIsCreateRoomOpen(false);
        // First navigate, then join room
        navigate(`/collaboration/${newRoom._id}`);
        joinRoom(newRoom._id);
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

    if (!room) {
      return (
        <div className="h-full flex items-center justify-center">
          <span className="text-white">No room data available</span>
        </div>
      );
    }

    switch (activeTab) {
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
      case 'files':
        return <FilesTab files={room.files} onUploadFile={uploadFile} />;
      case 'library':
        return <SharedLibraryTab files={room.files} />;
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

          {/* Available Rooms List */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Available Rooms</h2>
            {isLoadingRooms ? (
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : roomsError ? (
              <div className="text-theme-red text-center">
                <p>{roomsError}</p>
                <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
              </div>
            ) : availableRooms.length === 0 ? (
              <p className="text-gray text-center">No rooms available. Create one to get started!</p>
            ) : (
              <div className="grid gap-4 mt-4">
                {availableRooms.map((room) => (
                  <div
                    key={room._id}
                    className="p-4 bg-dark/50 backdrop-blur-glass rounded-lg border border-white/10 hover:border-theme-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/collaboration/${room._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                        {room.description && (
                          <p className="text-sm text-gray mt-1">{room.description}</p>
                        )}
                      </div>
                      <Badge variant={room.type === 'private' ? 'secondary' : 'default'}>
                        {room.type}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{room.participants?.length || 0} participants</span>
                      </div>
                      <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
      {/* Room Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-dark/80 backdrop-blur-glass border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/collaboration')} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Lobby
          </Button>
          <h1 className="text-xl font-semibold text-white">{room?.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          {room?.participants && <PresenceAvatarGroup users={room.participants} />}
        </div>
      </header>

      {/* Room Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className={cn("w-64 bg-dark/50 backdrop-blur-glass border-r border-white/10 flex flex-col", isSidebarCollapsed && "w-16")}>
          <div className="flex-1 p-2">
            <nav className="space-y-1">
              <SidebarItem
                icon={MessageSquare}
                label="Chat"
                isActive={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={Bot}
                label="AI Chat"
                isActive={activeTab === 'ai-chat'}
                onClick={() => setActiveTab('ai-chat')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={Layout}
                label="Whiteboard"
                isActive={activeTab === 'whiteboard'}
                onClick={() => setActiveTab('whiteboard')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={CheckSquare}
                label="Tasks"
                isActive={activeTab === 'tasks'}
                onClick={() => setActiveTab('tasks')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={FileText}
                label="Files"
                isActive={activeTab === 'files'}
                onClick={() => setActiveTab('files')}
                collapsed={isSidebarCollapsed}
              />
              <SidebarItem
                icon={BookOpen}
                label="Library"
                isActive={activeTab === 'library'}
                onClick={() => setActiveTab('library')}
                collapsed={isSidebarCollapsed}
              />
            </nav>
          </div>
          <Button
            variant="ghost"
            className="p-2 w-full flex justify-center"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      {isCreateRoomOpen && (
        <CreateRoom
          onCreateRoom={handleCreateRoom}
          onCancel={() => setIsCreateRoomOpen(false)}
        />
      )}
    </div>
  );
} 