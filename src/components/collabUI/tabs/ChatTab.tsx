import React, { useState, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TypingIndicator } from '@/components/common/TypingIndicator';
import { RealtimeCollaborationIndicator } from '@/components/common/RealtimeCollaborationIndicator';
import { SmartSuggestionsPanel } from '@/components/common/SmartSuggestionsPanel';
import { useTypingIndicators } from '@/hooks/useTypingIndicators';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { Message } from '@/hooks/useRoom';

interface ChatTabProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatTab({ messages, onSendMessage }: ChatTabProps) {
  const [newMessage, setNewMessage] = useState('');
  const { startTyping, stopTyping, getTypingUsersForLocation } = useTypingIndicators();
  const { startEdit, endEdit } = useRealtimeCollaboration();
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const typingUsers = getTypingUsersForLocation('chat');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (newMessage && !isTyping) {
      setIsTyping(true);
      startTyping('chat');
      startEdit('text', 'chat-input', { content: newMessage });
    }

    if (newMessage) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsTyping(false);
        stopTyping('chat');
        endEdit('chat-input');
      }, 1000);
    } else if (isTyping) {
      setIsTyping(false);
      stopTyping('chat');
      endEdit('chat-input');
    }

    // Show suggestions for longer messages
    setShowSuggestions(newMessage.length > 20);

    return () => clearTimeout(timeout);
  }, [newMessage, isTyping, startTyping, stopTyping, startEdit, endEdit]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
      setIsTyping(false);
      stopTyping('chat');
      endEdit('chat-input');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Mock user data
  const users = {
    '1': { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    '2': { name: 'Marcus Johnson', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    '3': { name: 'Elena Rodriguez', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50/50 relative">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message) => {
            const user = users[message.userId as keyof typeof users] || { name: 'Unknown User' };
            return (
              <div key={message.id} className="flex items-start gap-4">
                <Avatar className="w-9 h-9 ring-1 ring-theme-primary/20 shadow-custom">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-theme-primary to-theme-secondary text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-theme-dark">{user.name}</span>
                    <span className="text-xs text-theme-gray-dark">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="text-theme-gray-dark leading-relaxed">
                    {message.type === 'file' ? (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-theme-primary/10 to-theme-secondary/5 rounded-xl border border-theme-primary/20 hover:bg-theme-primary/15 transition-colors shadow-custom">
                        <Paperclip className="w-4 h-4 text-theme-primary" />
                        <span className="font-semibold text-theme-dark">{message.content}</span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-start gap-4">
              <div className="w-9 h-9" /> {/* Spacer for alignment */}
              <TypingIndicator userNames={typingUsers.map(u => u.userName)} />
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Smart Suggestions Panel */}
      {showSuggestions && (
        <div className="absolute right-4 bottom-24 w-80 z-10">
          <SmartSuggestionsPanel 
            context="chat" 
            content={newMessage}
          />
        </div>
      )}
      
      <div className="border-t border-gray-200/60 p-6 bg-gradient-to-r from-white to-gray-50/50 backdrop-blur-glass">
        {/* Real-time Collaboration Indicator */}
        <div className="mb-3">
          <RealtimeCollaborationIndicator location="chat-input" />
        </div>
        
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="border-theme-primary/30 focus:border-theme-primary focus:ring-theme-primary/20 bg-white shadow-custom"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 hover:bg-theme-primary/10 text-theme-gray-dark hover:text-theme-primary">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 hover:bg-theme-primary/10 text-theme-gray-dark hover:text-theme-primary">
              <Smile className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleSend} 
              size="sm" 
              className="w-10 h-10 p-0 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}