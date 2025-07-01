import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

export const DebugChat: React.FC = () => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [testMessage, setTestMessage] = useState('');
    const [recipientId, setRecipientId] = useState('');

    // Connect to socket
    useEffect(() => {
        addLog('Initializing socket connection...');

        const token = localStorage.getItem('token');
        addLog(`Using token: ${token ? 'Found' : 'Not found'}`);

        const socketInstance = io('http://localhost:5001', {
            withCredentials: true,
            transports: ['websocket'],
            auth: {
                token: token || undefined
            }
        });

        socketInstance.on('connect', () => {
            addLog(`Socket connected successfully with ID: ${socketInstance.id}`);
            setConnected(true);
        });

        socketInstance.on('connect_error', (error) => {
            addLog(`Socket connection error: ${error.message}`);
            setConnected(false);
        });

        socketInstance.on('disconnect', () => {
            addLog('Socket disconnected');
            setConnected(false);
        });

        socketInstance.on('new_private_message', (message: any) => {
            addLog(`Received message: ${JSON.stringify(message)}`);
        });

        socketInstance.on('seen_message', (data: any) => {
            addLog(`Message seen by: ${data.readerId}`);
        });

        socketInstance.on('notification:message', (notification: any) => {
            addLog(`Notification received: ${JSON.stringify(notification)}`);
        });

        setSocket(socketInstance);

        return () => {
            addLog('Cleaning up socket connection');
            socketInstance.disconnect();
        };
    }, []);

    const addLog = (message: string) => {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
    };

    const handleSendTestMessage = () => {
        if (!socket || !connected || !testMessage.trim() || !recipientId.trim()) {
            addLog('Cannot send message: Socket not connected or message/recipient empty');
            return;
        }

        addLog(`Sending test message to ${recipientId}: ${testMessage}`);

        socket.emit('private_message', {
            recipientId,
            content: testMessage
        });

        setTestMessage('');
    };

    const handleOpenChat = () => {
        if (!socket || !connected || !recipientId.trim()) {
            addLog('Cannot open chat: Socket not connected or recipient empty');
            return;
        }

        addLog(`Opening chat with ${recipientId}`);

        socket.emit('open chat', { friendId: recipientId });
    };

    const handleCloseChat = () => {
        if (!socket || !connected) {
            addLog('Cannot close chat: Socket not connected');
            return;
        }

        addLog('Closing chat');

        socket.emit('close chat');
    };

    return (
        <Card className="p-4 max-w-2xl mx-auto mt-8 bg-black/50 backdrop-blur-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">WebSocket Debug Console</h2>

            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-white">{connected ? 'Connected' : 'Disconnected'}</span>
                </div>

                <div className="text-sm text-white/70 mb-2">
                    <div>User ID: {user?._id || 'Not logged in'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Recipient ID</label>
                    <Input
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="Enter recipient user ID"
                        className="bg-white/10 border-white/20 text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Test Message</label>
                    <div className="flex gap-2">
                        <Input
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="Enter test message"
                            className="flex-1 bg-white/10 border-white/20 text-white"
                        />
                        <Button
                            onClick={handleSendTestMessage}
                            disabled={!connected || !testMessage.trim() || !recipientId.trim()}
                            className="bg-primary-500 hover:bg-primary-600"
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <Button
                    onClick={handleOpenChat}
                    disabled={!connected || !recipientId.trim()}
                    variant="outline"
                    className="border-white/20 text-white"
                >
                    Open Chat
                </Button>
                <Button
                    onClick={handleCloseChat}
                    disabled={!connected}
                    variant="outline"
                    className="border-white/20 text-white"
                >
                    Close Chat
                </Button>
            </div>

            <div>
                <h3 className="text-md font-semibold mb-2 text-white">Logs</h3>
                <div className="bg-black/30 rounded-md p-2 h-64 overflow-y-auto">
                    {logs.map((log, index) => (
                        <div key={index} className="text-xs text-white/80 font-mono mb-1">
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default DebugChat; 