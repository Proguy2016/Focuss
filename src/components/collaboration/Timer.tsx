import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useCollaboration } from '../../contexts/CollaborationContext';

export const Timer: React.FC = () => {
    const { timer, startTimer, pauseTimer, resetTimer } = useCollaboration();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <Card variant="glass" className="p-4">
            <h3 className="text-lg font-bold text-white mb-2 text-center">Session Timer</h3>
            <div className="text-6xl font-mono font-bold text-center text-primary mb-4">
                {formatTime(timer.timeRemaining)}
            </div>
            <div className="text-center text-white/70 mb-4 capitalize">
                {timer.mode} Session
            </div>
            <div className="flex justify-center gap-2">
                {!timer.isRunning ? (
                    <Button onClick={startTimer} variant="primary" size="lg">
                        <Play className="mr-2 h-5 w-5" /> Start
                    </Button>
                ) : (
                    <Button onClick={pauseTimer} variant="secondary" size="lg">
                        <Pause className="mr-2 h-5 w-5" /> Pause
                    </Button>
                )}
                <Button onClick={resetTimer} variant="ghost" size="lg">
                    <RotateCcw className="mr-2 h-5 w-5" /> Reset
                </Button>
            </div>
        </Card>
    );
}; 