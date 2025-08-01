import React from 'react';
import { FloatingTimer } from './FloatingTimer';

const FloatingTimerTest: React.FC = () => {
    console.log("FloatingTimerTest rendering");

    return (
        <FloatingTimer
            sessionName="Test Session"
            initialDuration={25 * 60}
            onClose={() => console.log("Timer closed")}
        />
    );
};

export default FloatingTimerTest; 