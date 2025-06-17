import React from 'react';
import { Card } from '../common/Card';
import { Brain } from 'lucide-react';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const AiInsights: React.FC = () => {
    const navigate = useNavigate();
    // Placeholder for AI insights logic
    const insights = [
        "You're most productive in the late afternoon. Consider scheduling your most important tasks then.",
        "Your focus session completion rate has increased by 15% this week. Keep up the great work!",
        "Consider breaking down the 'Project Phoenix' task into smaller subtasks to make it more manageable."
    ];

    return (
        <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-semibold text-white">AI Insights</h2>
            </div>
            <ul className="space-y-3 list-disc list-inside text-white/70">
                {insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-white/10">
                <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary-400 hover:text-primary-300"
                    onClick={() => navigate('/ai-coach')}
                >
                    Get more insights from AI Coach →
                </Button>
            </div>
        </Card>
    );
}; 