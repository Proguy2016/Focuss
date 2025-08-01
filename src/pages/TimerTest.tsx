import React, { useState } from 'react';
import { FloatingTimer } from '../components/common/FloatingTimer';

const TimerTest: React.FC = () => {
    const [showTimer, setShowTimer] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-dark p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Floating Timer Test Page</h1>

            <div className="flex flex-col gap-4 items-center">
                <button
                    onClick={() => setShowTimer(true)}
                    className="bg-primary hover:bg-primary-light text-dark font-medium py-3 px-6 rounded-md transition-all duration-300"
                >
                    Show Direct Timer
                </button>

                {showTimer && (
                    <FloatingTimer
                        sessionName="Test Timer"
                        initialDuration={25 * 60}
                        onClose={() => setShowTimer(false)}
                    />
                )}

                <div className="mt-8 p-6 bg-dark-light/30 rounded-lg max-w-md">
                    <h2 className="text-xl text-white mb-4">Instructions</h2>
                    <ul className="list-disc text-white/70 space-y-2 pl-5">
                        <li>Click the button above to show the timer</li>
                        <li>The timer should appear at the top-left corner</li>
                        <li>You should be able to drag it around</li>
                        <li>The controls should work (start, pause, reset)</li>
                        <li>Click the X to close the timer</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TimerTest; 