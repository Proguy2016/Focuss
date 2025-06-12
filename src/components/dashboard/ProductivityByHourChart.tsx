import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../common/Card';

export const ProductivityByHourChart: React.FC = () => {
    const { state } = useApp();
    const hourlyProductivity = state.analytics?.tasks.productivityByHour || [];

    return (
        <Card variant="glass" className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Productivity by Hour</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyProductivity.slice(6, 24)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                            tickFormatter={(value) => `${value}:00`}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                        <Bar dataKey="productivityScore" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}; 