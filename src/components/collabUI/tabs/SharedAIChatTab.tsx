import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Brain, Lightbulb, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { Participant } from '@/hooks/useRoom';
import { cn } from '@/lib/utils';

interface AIMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  avatar?: string;
  aiModel?: string;
  confidence?: number;
  helpful?: boolean | null;
}

interface SharedAIChatTabProps {
  participants: Participant[];
  onSendAIMessage?: (message: string, model: string) => Promise<string>;
}

export function SharedAIChatTab({ participants, onSendAIMessage }: SharedAIChatTabProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to the shared AI assistant! I can help with project planning, code review, research, and collaborative problem-solving. Ask me anything!',
      timestamp: new Date(),
      aiModel: 'GPT-4',
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isTyping, setIsTyping] = useState(false);
  const { isProcessing } = useAdvancedAI();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex reasoning' },
    { id: 'claude-3', name: 'Claude 3', description: 'Excellent for analysis and writing' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Great for code and technical tasks' },
  ];

  const quickPrompts = [
    'Help us review this code for best practices',
    'Suggest improvements for our project timeline',
    'Explain this concept in simple terms',
    'Generate test cases for our feature',
    'Help brainstorm solutions for this problem',
    'Review our documentation for clarity',
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate a response locally if no server function is provided
  const generateResponse = async (message: string, model: string): Promise<string> => {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = [
      `Great question! Based on your project context, I'd recommend the following approach:\n\n1. **Analysis**: First, let's break down the requirements\n2. **Planning**: Create a structured timeline\n3. **Implementation**: Start with core features\n4. **Testing**: Implement comprehensive testing\n\nWould you like me to elaborate on any of these steps?`,
      `I can help you with that! Here are some key considerations:\n\n• **Best Practices**: Follow established patterns\n• **Performance**: Optimize for speed and efficiency\n• **Maintainability**: Write clean, documented code\n• **Scalability**: Plan for future growth\n\nWhat specific aspect would you like to focus on?`,
      `Excellent point! Let me provide some insights:\n\n**Pros:**\n- Improved user experience\n- Better performance\n- Easier maintenance\n\n**Cons:**\n- Initial complexity\n- Learning curve\n- Resource requirements\n\nI'd recommend starting with a proof of concept to validate the approach.`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;

    const currentUserId = localStorage.getItem('userId') || 'current-user';
    const currentUser = participants.find(p => p.id === currentUserId) || { 
      id: currentUserId, 
      name: 'You',
      status: 'online' as const
    };

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
      userId: currentUserId,
      userName: currentUser.name,
      avatar: currentUser.avatar,
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      let aiResponse: string;
      
      // Use the provided onSendAIMessage function if available
      if (onSendAIMessage) {
        aiResponse = await onSendAIMessage(newMessage, selectedModel);
      } else {
        // Fallback to local generateResponse
        aiResponse = await generateResponse(newMessage, selectedModel);
      }

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        aiModel: selectedModel,
        confidence: 0.95,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Handle error
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, there was an error generating a response. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setNewMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date instanceof Date ? date : new Date(date));
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const markHelpful = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getParticipantById = (userId: string) => {
    return participants.find(p => p.id === userId);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full animated-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-dark/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Shared AI Assistant</h3>
            <p className="text-sm text-gray">Collaborative AI chat for the entire team</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-40 bg-dark/50 border-white/10 text-gray">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark border-white/10">
              {aiModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray">{model.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="gap-2 bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30">
            <Bot className="w-3 h-3" />
            Active
          </Badge>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-b border-white/10 bg-dark/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-theme-yellow" />
          <span className="text-sm font-medium text-white">Quick Prompts</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt(prompt)}
              className="text-xs border-white/10 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message) => {
            const participant = message.userId ? getParticipantById(message.userId) : null;
            
            return (
              <div key={message.id} className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.type === 'ai' ? (
                    <div className="w-9 h-9 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  ) : message.type === 'system' ? (
                    <div className="w-9 h-9 bg-gradient-to-br from-theme-yellow to-theme-yellow/80 rounded-xl flex items-center justify-center shadow-custom">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <Avatar className="w-9 h-9 ring-1 ring-theme-primary/20 shadow-custom">
                      <AvatarImage src={participant?.avatar || message.avatar} alt={participant?.name || message.userName} />
                      <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                        {(participant?.name || message.userName) ? getInitials(participant?.name || message.userName || '') : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-white">
                      {message.type === 'ai' ? 'AI Assistant' : 
                       message.type === 'system' ? 'System' : 
                       participant?.name || message.userName || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray">{formatTime(message.timestamp)}</span>
                    {message.type === 'ai' && message.aiModel && (
                      <Badge variant="outline" className="text-xs border-white/10 text-gray">
                        {message.aiModel}
                      </Badge>
                    )}
                    {message.type === 'ai' && message.confidence && (
                      <Badge variant="outline" className={cn(
                        "text-xs border-theme-primary/20",
                        message.confidence > 0.9 ? "text-theme-emerald" : 
                        message.confidence > 0.7 ? "text-theme-yellow" : "text-theme-red"
                      )}>
                        {Math.round(message.confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                  
                  <div className={cn(
                    "text-gray leading-relaxed whitespace-pre-wrap",
                    message.type === 'system' && "italic"
                  )}>
                    {message.content}
                  </div>
                  
                  {/* Message Actions */}
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-8 px-2 text-xs border-white/10 hover:bg-theme-primary/10 text-gray hover:text-theme-primary"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpful(message.id, true)}
                        className={cn(
                          "h-8 px-2 text-xs border-white/10 hover:bg-theme-emerald/10",
                          message.helpful === true ? "bg-theme-emerald/10 text-theme-emerald" : "text-gray hover:text-theme-emerald"
                        )}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpful(message.id, false)}
                        className={cn(
                          "h-8 px-2 text-xs border-white/10 hover:bg-theme-red/10",
                          message.helpful === false ? "bg-theme-red/10 text-theme-red" : "text-gray hover:text-theme-red"
                        )}
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Not helpful
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewMessage(`Please regenerate your last response with more details.`);
                        }}
                        className="h-8 px-2 text-xs border-white/10 hover:bg-theme-primary/10 text-gray hover:text-theme-primary"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-white">AI Assistant</span>
                  <span className="text-xs text-theme-primary">Thinking...</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-theme-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-theme-primary animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-theme-primary animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-white/10 p-6 bg-dark/30 backdrop-blur-glass">
        <div className="flex flex-col gap-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask the AI assistant..."
            className="min-h-24 border-white/10 focus:border-theme-primary focus:ring-theme-primary/20 bg-dark/50 text-white shadow-custom"
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray">
              <span className="text-theme-primary font-semibold">Tip:</span> Ask specific questions for better answers
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className={cn(
                "gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow",
                (!newMessage.trim() || isTyping) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isTyping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}