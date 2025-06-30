import React, { useState, useEffect } from 'react';
import { Send, Bot, Sparkles, Brain, Lightbulb, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
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
  participants: any[];
}

export function SharedAIChatTab({ participants }: SharedAIChatTabProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to the shared AI assistant! I can help with project planning, code review, research, and collaborative problem-solving. Ask me anything!',
      timestamp: new Date(Date.now() - 300000),
      aiModel: 'GPT-4',
    },
    {
      id: '2',
      type: 'user',
      content: 'Can you help us plan the architecture for our web application project?',
      timestamp: new Date(Date.now() - 240000),
      userId: '1',
      userName: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    },
    {
      id: '3',
      type: 'ai',
      content: 'I\'d be happy to help you plan your web application architecture! Here\'s a recommended approach:\n\n**Frontend:**\n- React with TypeScript for type safety\n- Component library (like the one you\'re building)\n- State management with Redux Toolkit or Zustand\n\n**Backend:**\n- Node.js with Express or Fastify\n- Database: PostgreSQL for relational data\n- Authentication: JWT with refresh tokens\n\n**Infrastructure:**\n- Containerization with Docker\n- CI/CD pipeline\n- Cloud deployment (AWS/Vercel)\n\nWould you like me to elaborate on any of these components?',
      timestamp: new Date(Date.now() - 180000),
      aiModel: 'GPT-4',
      confidence: 0.92,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isTyping, setIsTyping] = useState(false);
  const { isProcessing } = useAdvancedAI();

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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
      userId: 'current',
      userName: 'You',
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(newMessage),
        timestamp: new Date(),
        aiModel: selectedModel,
        confidence: 0.85 + Math.random() * 0.1,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000 + Math.random() * 2000);
  };

  const generateAIResponse = (prompt: string) => {
    const responses = [
      `Great question! Based on your project context, I'd recommend the following approach:\n\n1. **Analysis**: First, let's break down the requirements\n2. **Planning**: Create a structured timeline\n3. **Implementation**: Start with core features\n4. **Testing**: Implement comprehensive testing\n\nWould you like me to elaborate on any of these steps?`,
      `I can help you with that! Here are some key considerations:\n\n• **Best Practices**: Follow established patterns\n• **Performance**: Optimize for speed and efficiency\n• **Maintainability**: Write clean, documented code\n• **Scalability**: Plan for future growth\n\nWhat specific aspect would you like to focus on?`,
      `Excellent point! Let me provide some insights:\n\n**Pros:**\n- Improved user experience\n- Better performance\n- Easier maintenance\n\n**Cons:**\n- Initial complexity\n- Learning curve\n- Resource requirements\n\nI'd recommend starting with a proof of concept to validate the approach.`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
    }).format(date);
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-theme-dark">Shared AI Assistant</h3>
            <p className="text-sm text-theme-gray-dark">Collaborative AI chat for the entire team</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aiModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-theme-gray-dark">{model.description}</div>
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
      <div className="p-4 border-b border-gray-200/60 bg-white/50">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-theme-yellow" />
          <span className="text-sm font-medium text-theme-dark">Quick Prompts</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt(prompt)}
              className="text-xs border-theme-primary/30 hover:bg-theme-primary/10 text-theme-primary hover:border-theme-primary"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message) => (
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
                    <AvatarImage src={message.avatar} alt={message.userName} />
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                      {message.userName ? getInitials(message.userName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-theme-dark">
                    {message.type === 'ai' ? 'AI Assistant' : 
                     message.type === 'system' ? 'System' : 
                     message.userName}
                  </span>
                  {message.aiModel && (
                    <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border-theme-primary/30">
                      {message.aiModel}
                    </Badge>
                  )}
                  {message.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(message.confidence * 100)}% confidence
                    </Badge>
                  )}
                  <span className="text-xs text-theme-gray-dark">{formatTime(message.timestamp)}</span>
                </div>
                
                <div className={cn(
                  "text-theme-gray-dark leading-relaxed whitespace-pre-wrap",
                  message.type === 'ai' && "bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5 p-4 rounded-xl border border-theme-primary/20",
                  message.type === 'system' && "bg-gradient-to-r from-theme-yellow/5 to-theme-yellow/10 p-4 rounded-xl border border-theme-yellow/20 text-theme-dark"
                )}>
                  {message.content}
                </div>

                {/* AI Message Actions */}
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content)}
                      className="gap-2 text-xs text-theme-gray-dark hover:text-theme-primary"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(message.id, true)}
                      className={cn(
                        "gap-2 text-xs",
                        message.helpful === true 
                          ? "text-theme-emerald bg-theme-emerald/10" 
                          : "text-theme-gray-dark hover:text-theme-emerald"
                      )}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      Helpful
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(message.id, false)}
                      className={cn(
                        "gap-2 text-xs",
                        message.helpful === false 
                          ? "text-theme-red bg-theme-red/10" 
                          : "text-theme-gray-dark hover:text-theme-red"
                      )}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      Not helpful
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-theme-dark">AI Assistant</span>
                  <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border-theme-primary/30">
                    {selectedModel.toUpperCase()}
                  </Badge>
                </div>
                <div className="bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5 p-4 rounded-xl border border-theme-primary/20">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-theme-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-theme-gray-dark italic">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200/60 p-6 bg-gradient-to-r from-white to-gray-50/50 backdrop-blur-glass">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the AI assistant anything... (Shift+Enter for new line)"
              className="min-h-[60px] max-h-32 border-theme-primary/30 focus:border-theme-primary focus:ring-theme-primary/20 bg-white shadow-custom resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages(prev => prev.slice(0, 1))}
              className="gap-2 text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Clear
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-theme-gray-dark">
          <div className="flex items-center gap-4">
            <span>Model: {aiModels.find(m => m.id === selectedModel)?.name}</span>
            <span>•</span>
            <span>{messages.filter(m => m.type === 'ai').length} AI responses</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-2 py-1 bg-theme-primary/10 border border-theme-primary/30 rounded text-theme-primary font-mono">
              Enter
            </kbd>
            <span>to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}