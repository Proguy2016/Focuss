import React from 'react';
import { Users, FileText, Bot, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../common/Card';
import { ParticipantsPanel } from './ParticipantsPanel';
import { SharedFilesPanel } from './SharedFilesPanel';
import { Timer } from './Timer';
import { AiAssistantPanel } from './AiAssistantPanel';

interface SidebarTabsProps {
    roomCode: string;
    onInvite: () => void;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({ roomCode, onInvite }) => {
    return (
        <Card variant="glass" className="h-full w-full flex flex-col">
            <Tabs defaultValue="participants" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 bg-black/30">
                    <TabsTrigger value="participants" className="text-xs">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Participants</span>
                    </TabsTrigger>
                    <TabsTrigger value="files" className="text-xs">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>Files</span>
                    </TabsTrigger>
                    <TabsTrigger value="timer" className="text-xs">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Timer</span>
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="text-xs">
                        <Bot className="h-4 w-4 mr-1" />
                        <span>AI</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="participants" className="flex-1 overflow-hidden">
                    <ParticipantsPanel roomCode={roomCode} onInvite={onInvite} />
                </TabsContent>
                <TabsContent value="files" className="flex-1 overflow-hidden">
                    <SharedFilesPanel />
                </TabsContent>
                <TabsContent value="timer" className="flex-1 overflow-hidden p-4">
                    <Timer />
                </TabsContent>
                <TabsContent value="ai" className="flex-1 overflow-hidden">
                    <AiAssistantPanel />
                </TabsContent>
            </Tabs>
        </Card>
    );
}; 
