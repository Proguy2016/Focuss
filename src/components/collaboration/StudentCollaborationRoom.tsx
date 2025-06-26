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
import { AnimatedBackground } from "../common/AnimatedBackground";

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
    toggleTask,
    deleteTask,
    uploadFile,
    askAi,
    summarizeChat,
    setTyping,
    toggleHandRaised,
    addReaction,
    files,
    currentUser,
    timer,
    startTimer,
    pauseTimer,
    resetTimer,
    handleTldrawMount,
    tldrawStore,
    joinRoom,
    leaveRoom,
  } = useCollaboration();

  // Sample data for library items
  const libraryItems: LibraryItem[] = [
    {
      id: '1',
      title: 'Advanced Calculus: Theory and Practice',
      type: 'pdf',
      author: 'Dr. Sarah Johnson',
      tags: ['calculus', 'mathematics', 'advanced'],
      rating: 4.7,
      description: 'A comprehensive guide to advanced calculus concepts including limits, derivatives, and complex integrations.'
    },
    {
      id: '2',
      title: 'Introduction to Machine Learning',
      type: 'video',
      author: 'Prof. Michael Chen',
      tags: ['AI', 'machine learning', 'data science'],
      rating: 4.9,
      description: 'A video series covering the fundamentals of machine learning algorithms and applications.',
      url: 'https://example.com/videos/ml-intro'
    },
    {
      id: '3',
      title: 'Modern Physics: Quantum Mechanics',
      type: 'article',
      author: 'Dr. Robert Feynman',
      tags: ['physics', 'quantum', 'mechanics'],
      rating: 4.5,
      description: 'An in-depth look at the principles of quantum mechanics and their implications for modern physics.'
    },
    {
      id: '4',
      title: 'Biology Fundamentals',
      type: 'book',
      author: 'Emily Watson, Ph.D.',
      tags: ['biology', 'science', 'textbook'],
      rating: 4.2,
      description: 'A comprehensive textbook covering all essential aspects of modern biology for undergraduate students.'
    },
    {
      id: '5',
      title: 'The History of Ancient Civilizations',
      type: 'pdf',
      author: 'Prof. James Anderson',
      tags: ['history', 'archaeology', 'civilization'],
      rating: 4.4,
      description: 'A detailed examination of ancient civilizations from Mesopotamia to the Roman Empire.'
    },
    {
      id: '6',
      title: 'Programming in Python: From Basics to Advanced',
      type: 'video',
      author: 'Coding Academy',
      tags: ['programming', 'python', 'computer science'],
      rating: 4.8,
      description: 'A step-by-step video course teaching Python programming for beginners and intermediate learners.',
      url: 'https://example.com/videos/python-course'
    }
  ];
  
  // Sample projects data
  const projects: Project[] = [
    {
      id: '1',
      name: 'Machine Learning Project',
      description: 'A collaborative research project on neural networks and deep learning applications.',
      files: [
        { id: 'f1', name: 'dataset.csv', type: 'csv', size: 15000, version: 1, uploadedBy: 'User1', uploadedAt: new Date('2023-03-15') },
        { id: 'f2', name: 'model.py', type: 'python', size: 8200, version: 3, uploadedBy: 'User2', uploadedAt: new Date('2023-03-20') },
        { id: 'f3', name: 'results.pdf', type: 'pdf', size: 4500, version: 1, uploadedBy: 'User3', uploadedAt: new Date('2023-03-22') },
        { id: 'f4', name: 'presentation.pptx', type: 'powerpoint', size: 12800, version: 2, uploadedBy: 'User1', uploadedAt: new Date('2023-03-25') }
      ],
      createdAt: new Date('2023-03-10'),
      lastModified: new Date('2023-03-25')
    },
    {
      id: '2',
      name: 'Physics Simulation',
      description: 'A project simulating particle physics in a virtual environment.',
      files: [
        { id: 'f5', name: 'simulation.js', type: 'javascript', size: 6300, version: 2, uploadedBy: 'User2', uploadedAt: new Date('2023-04-05') },
        { id: 'f6', name: 'physics-formulas.md', type: 'markdown', size: 2100, version: 1, uploadedBy: 'User3', uploadedAt: new Date('2023-04-10') }
      ],
      createdAt: new Date('2023-04-01'),
      lastModified: new Date('2023-04-10')
    }
  ];

  // --- EFFECTS ---
  // No need to join the room here since it's handled by the parent component
  useEffect(() => {
    console.log(`[StudentCollaborationRoom] Initialized with connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    if (participants.length > 0) {
      console.log(`[StudentCollaborationRoom] Current participants: ${participants.length}`);
    }
    
    // Just cleanup logging when unmounting
    return () => {
      console.log(`[StudentCollaborationRoom] Component unmounting`);
    };
  }, [isConnected, participants.length]);

  // Subscribe to connection status changes
  useEffect(() => {
    console.log(`[StudentCollaborationRoom] Connection status changed: ${isConnected ? 'Connected' : 'Disconnected'}`);
    if (isConnected) {
      setNotifications(1); // Show a notification when connected
    }
  }, [isConnected]);

  // Subscribe to new messages
  useEffect(() => {
    if (messages.length > 0) {
      console.log(`[StudentCollaborationRoom] Messages updated: ${messages.length} total messages`);
    }
  }, [messages]);

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

  // --- useEffect hooks for real-time features ---
  useEffect(() => {
    // Setup for detecting typing status
    let typingTimeout: NodeJS.Timeout;
    
    const handleTextChange = (e: any) => {
      if (!typingTimeout) {
        setTyping(true);
      }
      
      clearTimeout(typingTimeout);
      
      typingTimeout = setTimeout(() => {
        setTyping(false);
      }, 1500); // Stop typing indication after 1.5s of inactivity
    };
    
    document.addEventListener('keydown', handleTextChange);
    
    return () => {
      document.removeEventListener('keydown', handleTextChange);
      clearTimeout(typingTimeout);
      setTyping(false);
    };
  }, [setTyping]);

  // --- HANDLERS ---
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageReal(newMessage);
    setNewMessage('');
  };

  const toggleCall = () => {
    setIsInCall(!isInCall);
    // In a real app, you'd emit socket events for voice/video calls
    // socketRef.current.emit('toggleCall', { userId: currentUser.id, isInCall: !isInCall });
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      if (newStatus === 'completed') {
        toggleTask(taskId);
      } else {
        // For other status changes, you'd need a separate API/socket call
        // The context only has toggleTask for completion status
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      // Set up a mock progress tracker
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      await uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleAddTask = () => {
    // In a real implementation, you'd show a modal to get task details
    const taskText = prompt('Enter task description:');
    if (taskText && taskText.trim()) {
      addTask(taskText.trim());
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  const handleAskAi = (query: string) => {
    askAi(query);
  };

  // Utility functions
  const formatTimestamp = (timestamp: string | Date) => {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

  // For filtering library items
  const filteredLibraryItems = libraryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // For whiteboard tab
  const setupWhiteboard = (canvasElement: HTMLCanvasElement | null) => {
    if (!canvasElement) return;
    
    // Connect to tldraw
    if (handleTldrawMount) {
      // This would normally use the actual tldraw component
      // For now, we'll use our simple canvas
      handleTldrawMount({
        store: tldrawStore,
        on: (event: string, callback: any) => {
          // Mock implementation
          canvasElement.addEventListener('mousemove', callback);
          return () => canvasElement.removeEventListener('mousemove', callback);
        }
      });
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      setupWhiteboard(canvasRef.current);
    }
  }, [canvasRef, handleTldrawMount]);

  // --- RENDER ---
  return (
    <TooltipProvider>
      <div className="relative min-h-screen text-foreground flex flex-col">
        <AnimatedBackground variant="particles" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="p-6 glass-pane border-b border-white/10 shadow-lg">
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
                        size="icon"
                        glow={isMuted || isInCall}
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
                        size="icon"
                        glow
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
                    <Button variant="outline" size="icon">
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
                      size="icon"
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

          <div className="p-4 bg-transparent flex-grow">
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
                          <span className="text-white">Team Chat</span>
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
                            <div key={message.id} className="flex justify-start">
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
                                      ? 'bg-primary/10 !text-white font-semibold italic text-base md:text-lg border border-primary/20' 
                                      : 'bg-black/30 !text-white font-medium text-base md:text-lg border border-white/10 shadow-sm'
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
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              // No need to call setTyping here, the global keydown handler does it
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-black/30 border-white/10 rounded-full px-4 text-white placeholder-white/70"
                          />
                          <Button onClick={handleSendMessage} variant="primary" size="icon" glow>
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
                      <Button variant="primary" fullWidth glow onClick={() => {
                        // Create hidden file input and trigger it
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.onchange = handleFileUpload as any;
                        fileInput.click();
                      }}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                      <Button variant="outline" fullWidth>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Screen
                      </Button>
                      <Button variant="outline" fullWidth>
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
                          <Button variant="ghost" size="sm" fullWidth onClick={summarizeChat}>
                            <div className="flex-1">
                              <p className="font-medium">Summarize recent messages</p>
                              <p className="text-muted-foreground">Get a quick overview of the conversation</p>
                        </div>
                            </Button>
                          <Button variant="ghost" size="sm" fullWidth onClick={() => handleAskAi("Generate meeting notes from our discussion")}>
                            <div className="flex-1">
                              <p className="font-medium">Generate meeting notes</p>
                              <p className="text-muted-foreground">Create structured notes from discussion</p>
                        </div>
                        </Button>
                          <Button variant="ghost" size="sm" fullWidth onClick={() => handleAskAi("Create tasks based on our conversation")}>
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

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-4">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <CardHeader className="border-b border-white/10 bg-black/30 p-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2" />
                        <span className="text-white">Tasks</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleAddTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                    </CardTitle>
                  </CardHeader>
                            <CardContent className="p-4">
                    <div className="space-y-4">
                      {tasks.length === 0 ? (
                        <div className="text-center p-6 text-white/60">
                          <p>No tasks yet. Create one to get started.</p>
                                </div>
                      ) : (
                        tasks.map(task => (
                          <div key={task.id} className="flex items-center p-3 bg-black/30 rounded-lg border border-white/5">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 mr-3"
                              onClick={() => toggleTask(task.id)}
                            >
                              {task.completed ? 
                                <CheckCircle className="h-5 w-5 text-primary" /> : 
                                <Circle className="h-5 w-5 text-white/40" />
                              }
                            </Button>
                            <div className="flex-1">
                              <p className={`text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                                {task.text || task.title}
                              </p>
                              </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-white/40 hover:text-white hover:bg-white/10"
                              onClick={() => deleteTask(task.id)}
                                >
                              <Trash2 className="h-4 w-4" />
                                </Button>
                          </div>
                        ))
                      )}
                              </div>
                            </CardContent>
                          </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-4">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <CardHeader className="border-b border-white/10 bg-black/30 p-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-primary mr-2" />
                        <span className="text-white">Shared Documents</span>
                </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.onchange = handleFileUpload as any;
                        fileInput.click();
                      }}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                          </Button>
                    </CardTitle>
                      </CardHeader>
                  <CardContent className="p-4">
                        <div className="space-y-4">
                      {files.length === 0 ? (
                        <div className="text-center p-6 text-white/60">
                          <p>No shared documents yet. Upload one to get started.</p>
                          </div>
                      ) : (
                        files.map(file => (
                          <div key={file.id} className="flex items-center p-3 bg-black/30 rounded-lg border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-primary" />
                          </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{file.name}</p>
                              <div className="flex items-center text-white/60 text-xs">
                                <span>{file.size}</span>
                                <span className="mx-2">•</span>
                                <span>Shared by {file.user.name}</span>
                                  </div>
                                </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-white/40 hover:text-white hover:bg-white/10"
                              onClick={() => {
                                if (file.downloadUrl) {
                                  window.open(file.downloadUrl, '_blank');
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                              )}
                            </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Whiteboard Tab */}
              <TabsContent value="whiteboard" className="mt-4">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl h-[calc(100vh-250px)]">
                  <CardHeader className="border-b border-white/10 bg-black/30 p-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Edit3 className="h-5 w-5 text-primary mr-2" />
                        <span className="text-white">Collaborative Whiteboard</span>
                          </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentTool('pen')}>
                          <Type className="h-4 w-4" />
                            </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentTool('highlighter')}>
                          <Palette className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentTool('eraser')}>
                          <Eraser className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDrawingPaths([])}>
                          <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-full">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-[calc(100%-70px)] bg-gray-900/50"
                      width={1200}
                      height={800}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                      </CardContent>
                    </Card>
              </TabsContent>

              {/* Library Tab Content */}
              <TabsContent value="library" className="mt-4">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <CardHeader className="border-b border-white/10 bg-black/30 p-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-primary mr-2" />
                        <span className="text-white">Study Resources</span>
                      </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                      <Input
                            type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64 bg-black/30 border-white/10 text-white placeholder-white/40"
                      />
                    </div>
                        <div>
                          <Select
                            value={selectedFilter}
                            onValueChange={(value) => setSelectedFilter(value)}
                          >
                            <SelectTrigger className="bg-black/30 border-white/10 text-white w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="book">Book</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLibraryItems.length === 0 ? (
                        <div className="col-span-full text-center p-6 text-white/60">
                          <p>No resources found. Try adjusting your search.</p>
                        </div>
                ) : (
                        filteredLibraryItems.map(item => (
                          <Card key={item.id} className="bg-black/30 border border-white/10 overflow-hidden">
                            <div className={`h-2 ${item.type === 'pdf' ? 'bg-red-500' : item.type === 'video' ? 'bg-blue-500' : item.type === 'article' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  item.type === 'pdf' ? 'bg-red-500/20' : 
                                  item.type === 'video' ? 'bg-blue-500/20' : 
                                  item.type === 'article' ? 'bg-green-500/20' : 
                                  'bg-yellow-500/20'
                                }`}>
                                  {item.type === 'pdf' ? <FileText className="h-5 w-5 text-red-500" /> : 
                                   item.type === 'video' ? <Play className="h-5 w-5 text-blue-500" /> : 
                                   item.type === 'article' ? <FileText className="h-5 w-5 text-green-500" /> : 
                                   <BookOpen className="h-5 w-5 text-yellow-500" />}
                              </div>
                              <div className="flex-1">
                                  <h3 className="text-white font-medium">{item.title}</h3>
                                  <p className="text-white/60 text-sm">by {item.author}</p>
                                  <div className="flex items-center mt-2 space-x-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                        className={`h-3 w-3 ${i < Math.floor(item.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-white/20'}`} 
                                />
                              ))}
                                    <span className="text-white/60 text-xs ml-1">{item.rating.toFixed(1)}</span>
                            </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="bg-white/10 text-white/80 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                                </div>
                              </div>
                              <p className="text-white/60 text-sm mt-3 line-clamp-2">{item.description}</p>
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-white"
                                  onClick={() => {
                                    if (item.url) {
                                      window.open(item.url, '_blank');
                                    }
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects Tab Content */}
              <TabsContent value="projects" className="mt-4">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <CardHeader className="border-b border-white/10 bg-black/30 p-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Folder className="h-5 w-5 text-primary mr-2" />
                        <span className="text-white">Projects</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {projects.length === 0 ? (
                        <div className="text-center p-6 text-white/60">
                          <p>No projects yet. Create one to get started.</p>
                        </div>
                      ) : (
                        projects.map(project => (
                          <Card key={project.id} className="bg-black/30 border border-white/10">
                            <CardHeader className="p-4">
                              <CardTitle className="text-lg font-semibold text-white">{project.name}</CardTitle>
                              <p className="text-white/60 mt-1">{project.description}</p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-white/60 text-sm">
                                  <span>{project.files.length} files</span>
                                  <span>Last modified: {new Date(project.lastModified).toLocaleDateString()}</span>
                                </div>
                                <div className="flex overflow-x-auto py-2 -mx-2 px-2 space-x-2">
                                  {project.files.slice(0, 3).map(file => (
                                    <div key={file.id} className="flex-shrink-0 bg-black/20 rounded-lg p-2 flex items-center space-x-2 border border-white/5">
                                      <FileText className="h-4 w-4 text-primary" />
                                      <div>
                                        <p className="text-white text-sm">{file.name}</p>
                                        <p className="text-white/40 text-xs">{Math.round(file.size / 1000)} KB</p>
                                      </div>
                                    </div>
                                  ))}
                                  {project.files.length > 3 && (
                                    <div className="flex-shrink-0 bg-black/20 rounded-lg p-2 flex items-center justify-center border border-white/5 h-full px-3">
                                      <span className="text-white/60 text-sm">+{project.files.length - 3} more</span>
                  </div>
                )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StudentCollaborationRoom; 