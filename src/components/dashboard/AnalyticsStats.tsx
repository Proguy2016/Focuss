import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
        <div className="p-3 bg-primary-500/20 rounded-lg">
            <Icon className="w-6 h-6 text-primary-400" />
        </div>
        <div>
            <p className="text-white/60 text-sm">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export const AnalyticsStats: React.FC = () => {
    const { state } = useApp();

    const { focusSessions, tasks } = state.analytics || {};

    const sessionCompletion = focusSessions?.completionRate ?? 0;
    const avgSessionLength = focusSessions?.averageSessionLength ?? 0;
    const taskCompletion = tasks?.completionRate ?? 0;

    return (
        <div className="p-0">
            <h2 className="text-xl font-semibold text-white mb-4">Key Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Session Completion"
                    value={`${sessionCompletion.toFixed(0)}%`}
                    icon={CheckCircle}
                />
                <StatCard
                    title="Avg. Session Length"
                    value={`${avgSessionLength.toFixed(0)}m`}
                    icon={Clock}
                />
                <StatCard
                    title="Task Completion"
                    value={`${taskCompletion.toFixed(0)}%`}
                    icon={TrendingUp}
                />
            </div>
        </div>
    );
}; 