import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Mic, MicOff, Settings, Download,
  Lightbulb, Target, TrendingUp, Calendar, Clock,
  User, Bot, Zap, Star, BookOpen, MessageCircle, BrainCircuit, Sparkles, ChevronRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { generateGeminiResponse, generateGeminiChatResponse } from '../services/gemini.service';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface Insight {
  id: string;
  type: 'productivity' | 'habit' | 'focus' | 'goal';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  icon: React.ComponentType<{ className?: string }>;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
}

interface ChatHistory {
  role: 'user' | 'model';
  content: string;
}

const suggestionPrompts = [
  "Analyze my productivity from last week",
  "Help me break down my 'Finals Study' project",
  "What's a good study schedule for tomorrow?",
  "Suggest a new habit for me to try"
];

const AICoach: React.FC = () => {
  const { state } = useApp();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [coachSettings, setCoachSettings] = useState({
    personality: 'encouraging',
    responseStyle: 'detailed',
    voiceEnabled: false,
    proactiveInsights: true,
    dailyCheckins: true,
  });

  // MOCK DATA - This should be moved inside the component
  const mockGoals = [
    { id: '1', title: 'Complete 100 Focus Sessions', progress: 87, target: 100 },
    { id: '2', title: 'Read 12 Books This Year', progress: 3, target: 12 },
  ];
  const mockInsights = [
    { id: '1', title: 'Peak Performance Window', description: 'Focus is strongest between 9-11 AM.', icon: TrendingUp },
    { id: '2', title: 'Habit Opportunity', description: 'Meditation drops on weekends.', icon: Target },
  ];

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const initialPrompt = `You are an AI productivity coach. Introduce yourself to ${state.user?.name || 'the user'} and ask how you can help them with their productivity, focus, and goals today. Be friendly and encouraging. Offer 3-4 helpful suggestions.`;
      
      setIsTyping(true);
      
      // Get initial AI response from Gemini
      generateGeminiResponse(initialPrompt)
        .then(response => {
          const welcomeMessage: Message = {
            id: '1',
            type: 'ai',
            content: response,
            timestamp: new Date(),
            suggestions: [
              'Analyze my productivity patterns',
              'Help me set a new goal',
              'Review my habit consistency',
              'Suggest focus techniques',
            ],
          };
          setMessages([welcomeMessage]);
          
          // Add to chat history with proper typing
          setChatHistory([
            { role: 'user' as const, content: initialPrompt },
            { role: 'model' as const, content: response }
          ]);
          
          setIsTyping(false);
        })
        .catch(err => {
          console.error('Error getting initial AI response:', err);
          setError('Failed to connect to AI coach. Please try again later.');
          setIsTyping(false);
        });
    }
  }, [state.user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Add to chat history with proper typing
    const updatedHistory = [
      ...chatHistory,
      { role: 'user' as const, content: input }
    ];
    setChatHistory(updatedHistory);
    
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Get AI response from Gemini API
      const aiResponseText = await generateGeminiChatResponse(chatHistory, input);
      
      // Create AI message
      const aiResponse: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date(),
        // Extract suggestions based on the content
        suggestions: extractSuggestions(aiResponseText),
      };
      
      // Add AI message to chat
      setMessages(prev => [...prev, aiResponse]);
      
      // Add to chat history with proper typing
      setChatHistory([
        ...updatedHistory,
        { role: 'model' as const, content: aiResponseText }
      ]);
      
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      setError('Failed to get a response from the AI coach. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  // Helper function to extract suggestions from AI response
  const extractSuggestions = (response: string): string[] => {
    // Look for bulleted lists, numbered lists, or suggestions in the AI response
    const suggestions: string[] = [];
    
    // Extract bulleted items (• Item or - Item)
    const bulletedItems = response.match(/[•\-]\s*([^\n•\-]+)/g);
    if (bulletedItems) {
      bulletedItems.forEach(item => {
        const text = item.replace(/^[•\-]\s*/, '').trim();
        if (text && text.length > 0 && text.length < 50) {
          suggestions.push(text);
        }
      });
    }
    
    // If no bulleted items, try to extract short sentences or phrases
    if (suggestions.length === 0) {
      const sentences = response.split(/[.!?]/).filter(s => s.trim().length > 0 && s.trim().length < 50);
      suggestions.push(...sentences.slice(0, 3).map(s => s.trim()));
    }
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Optional: Auto-send the suggestion
    // setTimeout(() => handleSendMessage(), 100);
  };

  // Toggle voice input function
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // Stop speech recognition here if we had an active instance
    } else {
      setIsListening(true);
      try {
        // TypeScript workaround for Speech Recognition API
        const SpeechRecognition = (window as any).SpeechRecognition || 
                                 (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          
          recognition.onstart = () => {
            setIsListening(true);
          };
          
          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join('');
              
            setInput(transcript);
          };
          
          recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
          };
          
          recognition.onend = () => {
            setIsListening(false);
          };
          
          recognition.start();
        } else {
          throw new Error('Speech recognition not supported');
        }
      } catch (err) {
        console.error('Speech recognition error:', err);
        setError('Speech recognition not supported in this browser');
        setIsListening(false);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error-400 bg-error-500/20';
      case 'medium': return 'text-warning-400 bg-warning-500/20';
      case 'low': return 'text-success-400 bg-success-500/20';
      default: return 'text-primary-400 bg-primary-500/20';
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return 'Overdue';
    if (diffInDays === 0) return 'Due today';
    if (diffInDays === 1) return 'Due tomorrow';
    if (diffInDays < 7) return `${diffInDays} days left`;
    if (diffInDays < 30) return `${Math.ceil(diffInDays / 7)} weeks left`;
    return `${Math.ceil(diffInDays / 30)} months left`;
  };

  return (
    <div className="flex h-[calc(100vh-theme(space.16))] bg-gray-900 text-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence>
          {messages.length > 0 ? (
            <ChatMessages messages={messages} ref={messagesEndRef} />
          ) : (
            <EmptyState onPromptClick={handleSuggestionClick} />
          )}
        </AnimatePresence>
        <ChatInput
          input={input}
          setInput={setInput}
          isTyping={isTyping}
          onSend={handleSendMessage}
        />
      </div>

      {/* Context Sidebar */}
      <ContextSidebar goals={mockGoals} insights={mockInsights} />
    </div>
  );
};

// --- Subcomponents --- //

const EmptyState: React.FC<{onPromptClick: (prompt: string) => void}> = ({onPromptClick}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex-1 flex flex-col items-center justify-center text-center p-8"
  >
    <div className="p-4 bg-primary-500/20 rounded-full mb-4">
      <BrainCircuit className="w-12 h-12 text-primary-300" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Your Personal AI Coach</h2>
    <p className="text-white/60 max-w-md mb-8">Ready to help you focus, plan, and achieve your goals. What's on your mind?</p>
    <div className="grid grid-cols-2 gap-3 max-w-lg">
      {suggestionPrompts.map(prompt => (
        <button
          key={prompt}
          onClick={() => onPromptClick(prompt)}
          className="glass p-4 rounded-lg text-left hover:bg-white/10 transition-colors"
        >
          <p className="font-semibold text-white/90">{prompt}</p>
        </button>
      ))}
    </div>
  </motion.div>
);

const ChatMessages = React.forwardRef<HTMLDivElement, { messages: Message[] }>(({ messages }, ref) => (
  <div className="flex-1 overflow-y-auto p-6 space-y-6">
    {messages.map((msg) => (
      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`flex items-start gap-4 ${msg.type === 'user' ? 'justify-end' : ''}`}>
          {msg.type === 'ai' && (
            <div className="w-8 h-8 rounded-full bg-primary-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-300" />
            </div>
          )}
          <div className={`max-w-xl p-4 rounded-2xl ${msg.type === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'glass rounded-bl-none'}`}>
            {typeof msg.content === 'string' ? <p>{msg.content}</p> : msg.content}
          </div>
        </div>
      </motion.div>
    ))}
    <div ref={ref} />
  </div>
));

const ChatInput: React.FC<{ input: string, setInput: (val: string) => void, isTyping: boolean, onSend: () => void }> = ({ input, setInput, isTyping, onSend }) => (
  <div className="p-4 border-t border-white/10">
    <div className="relative glass rounded-xl">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && !isTyping && onSend()}
        placeholder="Ask your AI Coach anything..."
        className="w-full h-12 bg-transparent pl-4 pr-12 text-white placeholder:text-white/40 focus:outline-none"
        disabled={isTyping}
      />
      <Button
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={onSend}
        disabled={isTyping || !input.trim()}
      >
        {isTyping ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
      </Button>
    </div>
  </div>
);

const ContextSidebar: React.FC<{ goals: any[], insights: any[] }> = ({ goals, insights }) => (
  <div className="w-96 border-l border-white/10 p-6 space-y-8 overflow-y-auto">
    <SidebarSection title="Your Goals" icon={Target}>
      {goals.map(goal => (
        <div key={goal.id} className="text-sm">
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold text-white/90">{goal.title}</p>
            <p className="text-white/60">{goal.progress}/{goal.target}</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-primary-500 h-1.5 rounded-full" style={{width: `${(goal.progress / goal.target) * 100}%`}}/>
          </div>
        </div>
      ))}
    </SidebarSection>
    <SidebarSection title="Recent Insights" icon={BookOpen}>
      {insights.map(insight => (
        <div key={insight.id} className="flex items-start gap-3 text-sm p-3 rounded-lg hover:bg-white/5">
          <div className="p-1.5 bg-secondary-500/20 text-secondary-300 rounded-md mt-1">
            <insight.icon className="w-4 h-4"/>
          </div>
          <div>
            <p className="font-semibold text-white/90">{insight.title}</p>
            <p className="text-white/60">{insight.description}</p>
          </div>
        </div>
      ))}
    </SidebarSection>
  </div>
);

const SidebarSection: React.FC<{title: string, icon: React.FC<any>, children: React.ReactNode}> = ({title, icon: Icon, children}) => (
  <div>
    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
      <Icon className="w-5 h-5 mr-3 text-primary-400"/>
      {title}
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export default AICoach;