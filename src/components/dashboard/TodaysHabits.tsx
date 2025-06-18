import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { useApp } from '../../contexts/AppContext';
import { Habit } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';
import { isSameDay } from 'date-fns';

export const TodaysHabits: React.FC = () => {
    const { state } = useApp();

    const isHabitCompletedToday = (habit: Habit) => {
        if (!habit.completions) return false;
        return habit.completions.some(c => isSameDay(new Date(c.date), new Date()));
    };

    const dailyHabits = state.habits.filter(h => h.frequency.type === 'daily');

    if (dailyHabits.length === 0) {
        return null; // Don't show the card if there are no daily habits
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Card variant="glass" className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Today's Habits</h3>
                <div className="space-y-4">
                    {dailyHabits.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between">
                            <span className={`text-white/80 ${isHabitCompletedToday(habit) ? 'line-through' : ''}`}>
                                {habit.name}
                            </span>
                            {isHabitCompletedToday(habit) ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                                <Circle className="w-6 h-6 text-white/30" />
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );
}; 