import React from 'react';
import { Lightbulb, Check, X, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { cn } from '@/lib/utils';

interface SmartSuggestionsPanelProps {
  context: string;
  content: string;
  className?: string;
}

export function SmartSuggestionsPanel({ context, content, className }: SmartSuggestionsPanelProps) {
  const { 
    suggestions, 
    insights,
    generateSmartSuggestions, 
    acceptSuggestion, 
    dismissSuggestion 
  } = useAdvancedAI();

  React.useEffect(() => {
    if (content) {
      generateSmartSuggestions(context, content);
    }
  }, [content, context, generateSmartSuggestions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'template': return <Lightbulb className="w-4 h-4" />;
      case 'optimization': return <Sparkles className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30';
      case 'template': return 'bg-theme-primary/10 text-theme-primary border-theme-primary/30';
      case 'optimization': return 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30';
      default: return 'bg-theme-gray/10 text-theme-gray-dark border-theme-gray/30';
    }
  };

  const activeSuggestions = suggestions.filter(s => !s.accepted);
  const recentInsights = insights.filter(i => i.actionable).slice(0, 2);

  if (activeSuggestions.length === 0 && recentInsights.length === 0) return null;

  return (
    <div className={cn(
      "bg-white/95 backdrop-blur-glass border border-theme-primary/20 rounded-xl shadow-custom p-4 space-y-4",
      className
    )}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-theme-primary" />
        <span className="font-semibold text-theme-dark text-sm">Smart Suggestions</span>
      </div>

      <ScrollArea className="max-h-64">
        <div className="space-y-3">
          {/* AI Suggestions */}
          {activeSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-3 border border-gray-200/60 rounded-lg bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/5 rounded-lg">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={cn("text-xs", getTypeColor(suggestion.type))}>
                      {suggestion.type}
                    </Badge>
                    <span className="text-xs text-theme-gray-dark">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-theme-dark leading-relaxed mb-3">
                    {suggestion.suggestion}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptSuggestion(suggestion.id)}
                      className="h-7 px-3 text-xs bg-gradient-to-r from-theme-emerald to-theme-emerald/80 hover:from-theme-emerald/80 hover:to-theme-emerald text-white"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="h-7 px-3 text-xs hover:bg-theme-red/10 text-theme-gray-dark hover:text-theme-red"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Actionable Insights */}
          {recentInsights.map((insight) => (
            <div key={insight.id} className="p-3 border border-theme-primary/20 rounded-lg bg-gradient-to-r from-theme-primary/5 to-theme-secondary/5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gradient-to-br from-theme-primary/20 to-theme-secondary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-theme-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border-theme-primary/30">
                      {insight.type}
                    </Badge>
                    <Badge variant="secondary" className={cn(
                      "text-xs",
                      insight.impact === 'high' ? 'bg-theme-red/10 text-theme-red border-theme-red/30' :
                      insight.impact === 'medium' ? 'bg-theme-yellow/10 text-theme-yellow border-theme-yellow/30' :
                      'bg-theme-emerald/10 text-theme-emerald border-theme-emerald/30'
                    )}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-theme-dark text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-theme-gray-dark leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-theme-dark mb-1">Suggested Actions:</p>
                      <ul className="text-xs text-theme-gray-dark space-y-1">
                        {insight.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="w-1 h-1 bg-theme-primary rounded-full mt-1.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}