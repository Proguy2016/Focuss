import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, Mic, MicOff, Settings, Download, 
  Lightbulb, Target, TrendingUp, Calendar, Clock,
  User, Bot, Zap, Star, BookOpen, MessageCircle
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

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

export const AICoach: React.FC = () => {
  const { state } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [coachSettings, setCoachSettings] = useState({
    personality: 'encouraging',
    responseStyle: 'detailed',
    voiceEnabled: false,
    proactiveInsights: true,
    dailyCheckins: true,
  });

  // Mock AI insights
  const insights: Insight[] = [
    {
      id: '1',
      type: 'productivity',
      title: 'Peak Performance Window',
      description: 'Your focus is strongest between 9-11 AM. Schedule your most important tasks during this time.',
      action: 'Block calendar for deep work',
      priority: 'high',
      icon: TrendingUp,
    },
    {
      id: '2',
      type: 'habit',
      title: 'Consistency Opportunity',
      description: 'Your meditation habit drops 40% on weekends. Try setting a weekend-specific reminder.',
      action: 'Set weekend reminder',
      priority: 'medium',
      icon: Target,
    },
    {
      id: '3',
      type: 'focus',
      title: 'Distraction Pattern',
      description: 'You check social media most often at 2 PM. Consider using website blockers during focus sessions.',
      action: 'Enable focus mode',
      priority: 'medium',
      icon: Zap,
    },
    {
      id: '4',
      type: 'goal',
      title: 'Goal Progress',
      description: 'You\'re 23% ahead of your monthly focus time goal. Great momentum!',
      priority: 'low',
      icon: Star,
    },
  ];

  // Mock goals
  const goals: Goal[] = [
    {
      id: '1',
      title: 'Complete 100 Focus Sessions',
      description: 'Build a consistent focus practice',
      target: 100,
      current: 87,
      unit: 'sessions',
      deadline: new Date('2024-03-31'),
      priority: 'high',
      status: 'active',
    },
    {
      id: '2',
      title: 'Read 12 Books This Year',
      description: 'Expand knowledge through reading',
      target: 12,
      current: 3,
      unit: 'books',
      deadline: new Date('2024-12-31'),
      priority: 'medium',
      status: 'active',
    },
    {
      id: '3',
      title: 'Maintain 30-Day Habit Streak',
      description: 'Build lasting habits through consistency',
      target: 30,
      current: 12,
      unit: 'days',
      deadline: new Date('2024-03-15'),
      priority: 'high',
      status: 'active',
    },
  ];

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: `Hello ${state.user?.name}! I'm your AI productivity coach. I've been analyzing your patterns and I'm here to help you optimize your focus and achieve your goals. What would you like to work on today?`,
        timestamp: new Date(),
        suggestions: [
          'Analyze my productivity patterns',
          'Help me set a new goal',
          'Review my habit consistency',
          'Suggest focus techniques',
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, [state.user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    let response = '';
    let suggestions: string[] = [];

    if (input.includes('productivity') || input.includes('pattern')) {
      response = `Based on your data, I've identified some key patterns:

• Your peak focus hours are 9-11 AM with 87% completion rate
• You're most productive on Tuesdays and Wednesdays
• Your focus sessions are 15% longer when you use ambient sounds
• You tend to get distracted around 2 PM - consider scheduling breaks then

Would you like me to create a personalized schedule based on these insights?`;
      suggestions = ['Create optimal schedule', 'Analyze distractions', 'Set focus reminders'];
    } else if (input.includes('goal') || input.includes('target')) {
      response = `Let's work on your goals! I see you're making great progress:

• Focus Sessions: 87/100 (87% complete) - You're ahead of schedule!
• Reading Goal: 3/12 books - Consider setting aside 30 minutes daily
• Habit Streak: 12/30 days - You're building momentum

Which goal would you like to focus on improving?`;
      suggestions = ['Boost reading habit', 'Optimize focus sessions', 'Strengthen habit streak'];
    } else if (input.includes('habit')) {
      response = `Your habit consistency is impressive! Here's what I've noticed:

• Morning meditation: 85% consistency (excellent!)
• Exercise: 68% consistency (room for improvement)
• Reading: 45% consistency (needs attention)

The key is starting small. For reading, try just 10 minutes before bed. For exercise, consider habit stacking - do 5 push-ups right after your meditation.`;
      suggestions = ['Create habit stack', 'Set micro-habits', 'Adjust reminders'];
    } else if (input.includes('focus') || input.includes('technique')) {
      response = `Here are some personalized focus techniques based on your preferences:

• **Pomodoro Plus**: Your sweet spot is 28-minute sessions (not 25)
• **Ambient Soundscapes**: Rain + binaural beats work best for you
• **Progressive Difficulty**: Start with easier tasks to build momentum
• **Energy Mapping**: Schedule creative work during your 9-11 AM peak

Try the 28-minute sessions with rain sounds for your next deep work block!`;
      suggestions = ['Start 28-min session', 'Set up soundscape', 'Plan energy-based schedule'];
    } else {
      response = `I understand you're looking for guidance. Based on your recent activity, I recommend focusing on:

1. **Consistency**: You've completed 87 focus sessions - just 13 more to hit your goal!
2. **Optimization**: Your afternoon productivity dips - try the 2 PM power break
3. **Growth**: Consider adding a learning habit to complement your focus practice

What area interests you most?`;
      suggestions = ['Improve consistency', 'Optimize schedule', 'Add new habits'];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      suggestions,
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real app, this would integrate with speech recognition
    if (!isListening) {
      console.log('Starting voice input...');
    } else {
      console.log('Stopping voice input...');
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">AI Coach</h1>
          <p className="text-white/60">
            Your personal productivity assistant powered by AI
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={Download}
          >
            Export Chat
          </Button>
          <Button
            variant="ghost"
            icon={Settings}
            onClick={() => setShowSettings(true)}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="p-6 h-96 flex flex-col">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Productivity Coach</h3>
                <p className="text-white/60 text-sm">Online • Ready to help</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md ${
                      message.type === 'user' 
                        ? 'bg-primary-500 text-white' 
                        : 'glass text-white'
                    } rounded-lg p-3`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything about productivity..."
                  className="w-full glass px-4 py-2 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button
                variant="ghost"
                icon={isListening ? MicOff : Mic}
                onClick={toggleVoiceInput}
                className={isListening ? 'text-error-400' : ''}
              />
              <Button
                variant="primary"
                icon={Send}
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-warning-400" />
              <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            </div>
            
            <div className="space-y-3">
              {insights.slice(0, 3).map(insight => {
                const IconComponent = insight.icon;
                return (
                  <div key={insight.id} className="p-3 glass rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(insight.priority)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                        <p className="text-white/70 text-xs mt-1">{insight.description}</p>
                        {insight.action && (
                          <button className="text-primary-400 text-xs mt-2 hover:text-primary-300">
                            {insight.action} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Goals Progress */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-success-400" />
              <h3 className="text-lg font-semibold text-white">Goal Progress</h3>
            </div>
            
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white text-sm">{goal.title}</h4>
                      <p className="text-white/60 text-xs">{formatDeadline(goal.deadline)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-success-500 to-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getGoalProgress(goal)}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-xs">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => handleSuggestionClick('Analyze my productivity patterns')}
              >
                Analyze Patterns
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => handleSuggestionClick('Help me set a new goal')}
              >
                Set New Goal
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => handleSuggestionClick('Suggest focus techniques')}
              >
                Focus Techniques
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => handleSuggestionClick('Review my habit consistency')}
              >
                Review Habits
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="AI Coach Settings"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Personality</h3>
            <select
              value={coachSettings.personality}
              onChange={(e) => setCoachSettings(prev => ({ ...prev, personality: e.target.value }))}
              className="input-field w-full"
            >
              <option value="encouraging">Encouraging & Supportive</option>
              <option value="direct">Direct & Focused</option>
              <option value="analytical">Analytical & Data-Driven</option>
              <option value="casual">Casual & Friendly</option>
            </select>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Response Style</h3>
            <select
              value={coachSettings.responseStyle}
              onChange={(e) => setCoachSettings(prev => ({ ...prev, responseStyle: e.target.value }))}
              className="input-field w-full"
            >
              <option value="detailed">Detailed Explanations</option>
              <option value="concise">Concise & Brief</option>
              <option value="actionable">Action-Focused</option>
            </select>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Features</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={coachSettings.voiceEnabled}
                  onChange={(e) => setCoachSettings(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Voice responses</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={coachSettings.proactiveInsights}
                  onChange={(e) => setCoachSettings(prev => ({ ...prev, proactiveInsights: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Proactive insights</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={coachSettings.dailyCheckins}
                  onChange={(e) => setCoachSettings(prev => ({ ...prev, dailyCheckins: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-white/80">Daily check-ins</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={() => setShowSettings(false)}
              fullWidth
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};