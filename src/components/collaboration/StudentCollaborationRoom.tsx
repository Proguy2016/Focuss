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
  Play
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useCollaboration } from '../../contexts/CollaborationContext';

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  isTyping?: boolean;
}

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
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
    if (!isInCall) {
      setIsMuted(false);
    }
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

  // --- RENDER ---
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="p-4 bg-background flex-grow">
          {/* Header */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Study Room Alpha</h1>
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
            <div className="flex items-center space-x-2">
              {/* Voice Controls */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
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
                    variant={isInCall ? "destructive" : "default"}
                    size="sm"
                    onClick={toggleCall}
                  >
                    {isInCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isInCall ? 'Leave Call' : 'Join Call'}
                </TooltipContent>
              </Tooltip>
              {/* Notifications */}
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {/* Online Users */}
          <div className="bg-card border-y border-border py-2 -mx-4 px-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {participants.map(user => (
                <div key={user.id} className="flex items-center space-x-2 whitespace-nowrap px-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                      user.status === 'online' ? 'bg-primary' :
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-muted'
                    }`} />
                  </div>
                  <span className="text-sm text-foreground">{user.name}</span>
                  {user.isTyping && (
                    <span className="text-xs text-primary animate-pulse">typing...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 gap-2 p-0 bg-transparent">
                <TabsTrigger value="chat" className="relative text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-10">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                  {notifications > 0 && (
                    <Badge className="ml-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                      {notifications}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="whiteboard" className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-10">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-10">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="tasks" className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-10">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-10">
                  <Folder className="h-4 w-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="library" className="text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-10">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Library
                </TabsTrigger>
              </TabsList>
              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-250px)]">
                  <Card className="lg:col-span-3 bg-card shadow-sm">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="flex items-center justify-between text-base font-semibold text-foreground">
                        <span>Team Chat</span>
                        <Button variant="outline" size="sm">
                          <Bot className="h-4 w-4 mr-2" />
                          AI Assistant
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-[calc(100%-60px)] p-0">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {messages.map(message => (
                            <div key={message.id} className={`flex ${message.type === 'ai' ? 'justify-start' : 'justify-start'}`}>
                              <div className="flex space-x-2 max-w-[80%]">
                                <Avatar className="h-8 w-8">
                                  {message.type === 'ai' ? (
                                    <div className="bg-primary text-primary-foreground rounded-full flex items-center justify-center h-full">
                                      <Bot className="h-4 w-4" />
                                    </div>
                                  ) : (
                                    <>
                                      <AvatarImage src={participants.find(u => u.id === message.userId)?.avatar} />
                                      <AvatarFallback>
                                        {participants.find(u => u.id === message.userId)?.name.split(' ').map(n => n[0]).join('') || 'U'}
                                      </AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-foreground">
                                      {message.type === 'ai' ? 'AI Assistant' : participants.find(u => u.id === message.userId)?.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {message.timestamp.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className={`p-3 rounded-lg ${
                                    message.type === 'ai' 
                                      ? 'bg-primary/10 text-primary' 
                                      : 'bg-muted text-foreground'
                                  }`}>
                                    {message.content}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t border-border">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-muted border-border"
                          />
                          <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card shadow-sm">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="text-base font-semibold text-foreground">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                      <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Screen
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">AI Suggestions</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• Summarize recent messages</p>
                          <p>• Generate meeting notes</p>
                          <p>• Create task from discussion</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              {/* Whiteboard Tab */}
              <TabsContent value="whiteboard" className="mt-4 space-y-4">
                <Card className="bg-card shadow-sm">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center justify-between text-base font-semibold text-foreground">
                      <span>Interactive Whiteboard</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {['pen', 'highlighter', 'eraser'].map((tool) => (
                            <Button
                              key={tool}
                              variant={currentTool === tool ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentTool(tool as any)}
                            >
                              {tool === 'pen' && <Edit3 className="h-4 w-4" />}
                              {tool === 'highlighter' && <Palette className="h-4 w-4" />}
                              {tool === 'eraser' && <Eraser className="h-4 w-4" />}
                            </Button>
                          ))}
                        </div>
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => setCurrentColor(e.target.value)}
                          className="w-8 h-8 rounded border border-border"
                        />
                        <Button variant="outline" size="sm" onClick={() => setDrawingPaths([])}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="w-full h-[600px] cursor-crosshair bg-muted"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Brush Size:</span>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm w-8">{brushSize}px</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {participants.filter(u => u.status === 'online').length} collaborators
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Shared Documents</h2>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
                {isLoading && (
                  <Card className="bg-card shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Uploading document...</span>
                          <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects[0]?.files.map(file => (
                    <Card key={file.id} className="bg-card hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-medium text-foreground">{file.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                v{file.version} • {(file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Uploaded by</span>
                            <span className="text-foreground">{file.uploadedBy}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Modified</span>
                            <span className="text-foreground">{file.uploadedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Task Management</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['todo', 'in-progress', 'completed'].map(status => (
                    <div key={status} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium capitalize text-foreground">{status.replace('-', ' ')}</h3>
                        <Badge variant="secondary">
                          {tasks.filter(task => task.status === status).length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {tasks.filter(task => task.status === status).map(task => (
                          <Card key={task.id} className="bg-card hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(task.status)}
                                  <h4 className="font-medium text-foreground">{task.title}</h4>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}/>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Assignee</span>
                                  <span className="text-foreground">{task.assignee}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Due Date</span>
                                  <span className="text-foreground">{task.dueDate.toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex space-x-2 mt-3">
                                <Select
                                  value={task.status}
                                  onValueChange={(value) => updateTaskStatus(task.id, value as Task['status'])}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm">
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              {/* Projects Tab */}
              <TabsContent value="projects" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Project Organization</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projects.map(project => (
                    <Card key={project.id} className="bg-card hover:shadow-md transition-shadow">
                      <CardHeader className="border-b border-border">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-foreground">{project.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created</span>
                            <span className="text-foreground">{project.createdAt.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Modified</span>
                            <span className="text-foreground">{project.lastModified.toLocaleDateString()}</span>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2 text-foreground">Files ({project.files.length})</h4>
                            <div className="space-y-2">
                              {project.files.slice(0, 3).map(file => (
                                <div key={file.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">{file.name}</span>
                                  </div>
                                  <Badge variant="outline">v{file.version}</Badge>
                                </div>
                              ))}
                              {project.files.length > 3 && (
                                <p className="text-sm text-muted-foreground">
                                  +{project.files.length - 3} more files
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              {/* Library Tab */}
              <TabsContent value="library" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Resource Library</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 bg-muted border-border"
                      />
                    </div>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="pdf">PDFs</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="article">Articles</SelectItem>
                        <SelectItem value="book">Books</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {filteredLibraryItems.length === 0 ? (
                  <Card className="bg-card shadow-sm">
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-foreground">No resources found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or filters
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLibraryItems.map(item => (
                      <Card key={item.id} className="bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {item.type === 'pdf' && <FileText className="h-6 w-6 text-primary" />}
                                {item.type === 'video' && <Play className="h-6 w-6 text-primary" />}
                                {item.type === 'article' && <BookOpen className="h-6 w-6 text-primary" />}
                                {item.type === 'book' && <BookOpen className="h-6 w-6 text-primary" />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">by {item.author}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Star className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(item.rating) 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                {item.rating}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StudentCollaborationRoom; 