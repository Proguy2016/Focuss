import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, FileText, BarChart3, Languages, X, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAI, AIResponse } from '@/hooks/useAI';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: any;
}

export function AIAssistant({ isOpen, onClose, roomData }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'analytics'>('suggestions');
  const [chatInput, setChatInput] = useState('');
  const { isProcessing, responses, generateSuggestion, summarizeSession, translateMessage, analyzeContent } = useAI();

  const handleGenerateSuggestion = async () => {
    await generateSuggestion(roomData);
  };

  const handleSummarizeSession = async () => {
    await summarizeSession(roomData);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    await analyzeContent(chatInput);
    setChatInput('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-theme-emerald';
    if (confidence >= 0.6) return 'text-theme-yellow';
    return 'text-theme-red';
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 bg-white border-theme-primary/20 shadow-custom-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-bold text-theme-dark">AI Assistant</DialogTitle>
              <p className="text-sm text-theme-gray-dark">Intelligent collaboration insights</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200/60">
          <nav className="flex px-6">
            {[
              { id: 'suggestions', label: 'Suggestions', icon: Sparkles },
              { id: 'chat', label: 'AI Chat', icon: MessageSquare },
              { id: 'analytics', label: 'Insights', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200",
                  activeTab === tab.id
                    ? "border-theme-primary text-theme-primary"
                    : "border-transparent text-theme-gray-dark hover:text-theme-dark hover:border-theme-primary/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'suggestions' && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Button
                  onClick={handleGenerateSuggestion}
                  disabled={isProcessing}
                  className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessing ? 'Generating...' : 'Generate Suggestion'}
                </Button>
                <Button
                  onClick={handleSummarizeSession}
                  disabled={isProcessing}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Summarize Session
                </Button>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {responses.filter(r => r.type === 'suggestion' || r.type === 'summary').map((response) => (
                    <div key={response.id} className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="capitalize">
                          {response.type}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-theme-gray-dark">
                          <span className={getConfidenceColor(response.confidence)}>
                            {Math.round(response.confidence * 100)}% confidence
                          </span>
                          <span>{formatTimestamp(response.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-theme-dark leading-relaxed">{response.content}</p>
                    </div>
                  ))}
                  {responses.filter(r => r.type === 'suggestion' || r.type === 'summary').length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-theme-gray" />
                      <p className="text-theme-gray-dark">No suggestions yet. Click "Generate Suggestion" to get AI insights.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-96">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {responses.filter(r => r.type === 'analysis' || r.type === 'translation').map((response) => (
                    <div key={response.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-theme-dark">AI Assistant</span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {response.type}
                          </Badge>
                          <span className="text-xs text-theme-gray-dark">
                            {formatTimestamp(response.timestamp)}
                          </span>
                        </div>
                        <p className="text-theme-gray-dark leading-relaxed">{response.content}</p>
                      </div>
                    </div>
                  ))}
                  {responses.filter(r => r.type === 'analysis' || r.type === 'translation').length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-theme-gray" />
                      <p className="text-theme-gray-dark">Start a conversation with the AI assistant.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="border-t border-gray-200/60 p-4">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask the AI assistant anything..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isProcessing}
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-theme-primary to-theme-secondary hover:from-theme-primary-dark hover:to-theme-primary text-white shadow-glow"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {roomData.messages?.length || 0}
                  </div>
                  <div className="text-sm text-theme-gray-dark">Messages Sent</div>
                </div>
                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="text-2xl font-bold text-theme-emerald mb-1">
                    {Math.round(((roomData.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (roomData.tasks?.length || 1)) * 100)}%
                  </div>
                  <div className="text-sm text-theme-gray-dark">Task Completion</div>
                </div>
                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="text-2xl font-bold text-theme-yellow mb-1">
                    {roomData.files?.length || 0}
                  </div>
                  <div className="text-sm text-theme-gray-dark">Files Shared</div>
                </div>
                <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                  <div className="text-2xl font-bold text-theme-secondary mb-1">
                    {roomData.participants?.length || 0}
                  </div>
                  <div className="text-sm text-theme-gray-dark">Active Participants</div>
                </div>
              </div>

              <div className="p-4 border border-gray-200/60 rounded-xl bg-gradient-to-r from-white to-gray-50/50">
                <h4 className="font-semibold text-theme-dark mb-3">AI Insights</h4>
                <div className="space-y-2">
                  <p className="text-sm text-theme-gray-dark">
                    • High engagement detected with balanced participation across team members
                  </p>
                  <p className="text-sm text-theme-gray-dark">
                    • Task completion rate is above average for similar sessions
                  </p>
                  <p className="text-sm text-theme-gray-dark">
                    • Communication patterns suggest effective collaboration
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}