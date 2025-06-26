import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  Circle, 
  MoreHorizontal,
  Send,
  Bot,
  User,
  Palette,
  Square,
  MousePointer,
  Type,
  Eraser,
  RotateCcw,
  Save,
  Share2,
  Eye,
  EyeOff,
  Star,
  BookOpen,
  Folder,
  Calendar,
  Tag,
  AlertCircle,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  Maximize2,
  Minimize2,
  Play,
  Reply,
  Smile
} from 'lucide-react';
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../common/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../common/Select";
import { Switch } from "../common/Switch";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../common/Tooltip";
import { useCollaboration } from '../../contexts/CollaborationContext';

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  isTyping?: boolean;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  isTyping?: boolean;
  isSpeaking?: boolean;
  handRaised?: boolean;
}

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'ai';
}

interface ChatMessage {
  id: string;
  userId: string;
  avatar: string;
  name: string;
  message: string;
  timestamp: string;
  reactions: { [emoji: string]: string[] };
  replyTo?: string;
  type: 'user' | 'ai';
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  createdAt: Date;
  lastModified: Date;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  version: number;
  uploadedBy: string;
  uploadedAt: Date;
}

interface LibraryItem {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article' | 'book';
  author: string;
  tags: string[];
  rating: number;
  description: string;
  url?: string;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  author: string;
  type: 'highlight' | 'note' | 'drawing';
}

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

const StudentCollaborationRoom: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('chat');
  const [isMuted, setIsMuted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notifications, setNotifications] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- REAL DATA ---
  const {
    participants,
    messages,
    tasks,
    isConnected,
    sendMessage: sendMessageReal,
    addTask,
    // ...add more as needed
  } = useCollaboration();

  // Sample library items for the Library tab
  const libraryItems: LibraryItem[] = [
    {
      id: '1',
      title: 'Introduction to React',
      type: 'pdf',
      author: 'John Doe',
      tags: ['react', 'frontend'],
      rating: 4.5,
      description: 'A comprehensive introduction to React.js for beginners'
    },
    {
      id: '2',
      title: 'Advanced TypeScript Patterns',
      type: 'video',
      author: 'Jane Smith',
      tags: ['typescript', 'advanced'],
      rating: 4.8,
      description: 'Learn advanced TypeScript patterns and techniques'
    },
    {
      id: '3',
      title: 'CSS Grid Layout',
      type: 'article',
      author: 'Mike Johnson',
      tags: ['css', 'layout'],
      rating: 4.2,
      description: 'Master CSS Grid Layout for modern web design'
    }
  ];
  
  // Sample projects data
  const projects: Project[] = [
    {
      id: '1',
      name: 'Study Group Project',
      description: 'Collaborative research on machine learning algorithms',
      createdAt: new Date(),
      lastModified: new Date(),
      files: [
        {
          id: 'f1',
          name: 'Research Notes.pdf',
          type: 'pdf',
          size: 2500000,
          version: 2,
          uploadedBy: 'Jane Smith',
          uploadedAt: new Date()
        },
        {
          id: 'f2',
          name: 'Data Analysis.xlsx',
          type: 'excel',
          size: 1800000,
          version: 1,
          uploadedBy: 'John Doe',
          uploadedAt: new Date()
        },
        {
          id: 'f3',
          name: 'Presentation.pptx',
          type: 'powerpoint',
          size: 3200000,
          version: 3,
          uploadedBy: 'Mike Johnson',
          uploadedAt: new Date()
        }
      ]
    }
  ];

  // --- DRAWING FUNCTIONS ---
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPath: DrawingPath = {
      id: Date.now().toString(),
      points: [{ x, y }],
      color: currentColor,
      width: brushSize,
      tool: currentTool
    };
    setDrawingPaths(prev => [...prev, newPath]);
  }, [currentColor, brushSize, currentTool]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawingPaths(prev => {
      const newPaths = [...prev];
      const currentPath = newPaths[newPaths.length - 1];
      if (currentPath) {
        currentPath.points.push({ x, y });
      }
      return newPaths;
    });
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingPaths.forEach(path => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  }, [drawingPaths]);

  // --- HANDLERS ---
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageReal(newMessage);
    setNewMessage('');
  };

  const toggleCall = () => {
    setIsInCall(!isInCall);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    // Implementation of updateTaskStatus
  };

  const filteredLibraryItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- RENDER ---
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-foreground flex flex-col">
        <div className="p-6 bg-black/20 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
                  Study Room Alpha
                </h1>
                <div className="flex items-center mt-1 space-x-2">
                  <div className="flex -space-x-2">
                    {participants.slice(0, 3).map(user => (
                      <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    ))}
                    {participants.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs border-2 border-background">
                        +{participants.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-primary" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {participants.filter(u => u.status === 'online').length} online
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Voice Controls with improved styling */}
              <div className="bg-black/30 backdrop-blur-md rounded-full p-1 flex items-center space-x-1 border border-white/10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isMuted ? "danger" : "outline"}
                      size="sm"
                      className="rounded-full w-9 h-9 p-0"
                      onClick={() => setIsMuted(!isMuted)}
                      disabled={!isInCall}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isInCall ? "danger" : "primary"}
                      size="sm"
                      className="rounded-full w-9 h-9 p-0"
                      onClick={toggleCall}
                    >
                      {isInCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isInCall ? 'Leave Call' : 'Join Call'}
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Notifications */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="relative rounded-full w-9 h-9 p-0">
                    <Bell className="h-4 w-4" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              
              {/* Fullscreen Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-9 h-9 p-0"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="p-4 bg-background flex-grow">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6 gap-2 p-2 bg-black/20 backdrop-blur-md rounded-xl mb-6">
              <TabsTrigger 
                value="chat" 
                className="relative text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-lg h-10 transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
                {notifications > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="whiteboard" 
                className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-lg h-10 transition-all duration-200"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Whiteboard
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-lg h-10 transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-lg h-10 transition-all duration-200"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-lg h-10 transition-all duration-200"
              >
                <Folder className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="library" 
                className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-lg h-10 transition-all duration-200"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Library
              </TabsTrigger>
            </TabsList>
            
            {/* Chat Tab Content */}
            <TabsContent value="chat" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                <Card className="lg:col-span-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <CardHeader className="border-b border-white/10 bg-black/30 p-4">
                    <CardTitle className="flex items-center justify-between text-base font-semibold text-foreground">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <span>Team Chat</span>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Bot className="h-4 w-4 mr-2" />
                        AI Assistant
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[calc(100%-60px)] p-0">
                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-6">
                        {messages.map(message => (
                          <div key={message.id} className={`flex ${message.type === 'ai' ? 'justify-start' : 'justify-start'}`}>
                            <div className="flex space-x-3 max-w-[80%] group">
                              <Avatar className="h-9 w-9 mt-1">
                                {message.type === 'ai' ? (
                                  <div className="bg-gradient-to-br from-primary-400 to-primary-600 text-primary-foreground rounded-full flex items-center justify-center h-full">
                                    <Bot className="h-5 w-5" />
                                  </div>
                                ) : (
                                  <>
                                    <AvatarImage src={participants.find(u => u.id === message.userId)?.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800">
                                      {participants.find(u => u.id === message.userId)?.name.split(' ').map(n => n[0]).join('') || 'U'}
                                    </AvatarFallback>
                                  </>
                                )}
                              </Avatar>
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {message.type === 'ai' ? 'AI Assistant' : participants.find(u => u.id === message.userId)?.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimestamp(message.timestamp)}
                                  </span>
                                </div>
                                <div className={`p-4 rounded-2xl ${
                                  message.type === 'ai' 
                                    ? 'bg-primary/10 text-primary border border-primary/20' 
                                    : 'bg-black/30 text-foreground border border-white/5'
                                }`}>
                                  {message.content}
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                    <Reply className="h-3 w-3 mr-1" />
                                    Reply
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                    <Smile className="h-3 w-3 mr-1" />
                                    React
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 bg-black/30 border-white/10 rounded-full px-4"
                        />
                        <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-10 h-10 p-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-xl">
                  <CardHeader className="border-b border-white/10 bg-black/30 p-4">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center">
                      <span className="text-primary mr-2">⚡</span>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4">
                    <Button className="w-full justify-start bg-gradient-to-r from-primary-500 to-primary-600 text-primary-foreground hover:from-primary-600 hover:to-primary-700 rounded-lg">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 rounded-lg">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Screen
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5 rounded-lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Separator className="bg-white/10" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center">
                        <Bot className="h-4 w-4 mr-2 text-primary" />
                        AI Suggestions
                      </h4>
                      <div className="space-y-2">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-left h-auto py-2 hover:bg-white/5">
                          <div className="flex-1">
                            <p className="font-medium">Summarize recent messages</p>
                            <p className="text-muted-foreground">Get a quick overview of the conversation</p>
                          </div>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-left h-auto py-2 hover:bg-white/5">
                          <div className="flex-1">
                            <p className="font-medium">Generate meeting notes</p>
                            <p className="text-muted-foreground">Create structured notes from discussion</p>
                          </div>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-left h-auto py-2 hover:bg-white/5">
                          <div className="flex-1">
                            <p className="font-medium">Create task from discussion</p>
                            <p className="text-muted-foreground">Convert conversation into actionable tasks</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Other tab contents remain the same */}
            {/* ... existing code ... */}
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StudentCollaborationRoom; 