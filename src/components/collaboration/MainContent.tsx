import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "./ChatBubble";
import { Input } from "./Input";
import { Button } from "../common/Button";
import { Send, MessageSquare, ListTodo, Clipboard, Smile, Reply, FileText } from "lucide-react";
import { useCollaboration } from "../../contexts/CollaborationContext";
import { SharedFilesPanel } from "./SharedFilesPanel";
import { WhiteboardWithPDF } from "./WhiteboardWithPDF";

export const MainContent: React.FC = () => {
    const { messages, participants, currentUser, sendMessage, addReaction, setTyping } = useCollaboration();
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = () => {
        sendMessage(newMessage);
        setNewMessage("");
        setTyping(false);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (e.target.value.length > 0) {
            setTyping(true);
        } else {
            setTyping(false);
        }
    };

    return (
        <Tabs defaultValue="whiteboard" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/60">
                <TabsTrigger value="chat"><MessageSquare className="mr-2 h-4 w-4" />Chat</TabsTrigger>
                <TabsTrigger value="tasks"><ListTodo className="mr-2 h-4 w-4" />Tasks</TabsTrigger>
                <TabsTrigger value="whiteboard"><Clipboard className="mr-2 h-4 w-4" />Whiteboard & PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 flex flex-col glass rounded-b-lg overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map(msg => {
                        const participant = participants.find(p => p.id === msg.userId);
                        const isSent = currentUser && msg.userId === currentUser.id;
                        
                        return (
                            <ChatBubble key={msg.id} variant={isSent ? 'sent' : 'received'}>
                                {!isSent && <ChatBubbleAvatar src={participant?.avatar} fallback={participant?.name.charAt(0)} />}
                                <div className="group relative">
                                    <ChatBubbleMessage variant={isSent ? 'sent' : 'received'}>
                                        {!isSent && <p className="font-bold text-sm mb-1 text-primary-300">{participant?.name}</p>}
                                        <p>{msg.message}</p>
                                        <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                                        <div className="flex gap-1 mt-1">
                                            {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                                userIds.length > 0 && (
                                                    <div key={emoji} className="bg-white/10 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                                        <span>{emoji}</span>
                                                        <span>{userIds.length}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </ChatBubbleMessage>
                                    <div className={`absolute top-0 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isSent ? 'left-0 -ml-2' : 'right-0 -mr-2'}`}>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addReaction(msg.id, '👍')}><Smile className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6"><Reply className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                {isSent && <ChatBubbleAvatar src={participant?.avatar} fallback={participant?.name.charAt(0)} />}
                            </ChatBubble>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                        <Input 
                            placeholder="Type your message..." 
                            className="pr-12 bg-transparent"
                            value={newMessage}
                            onChange={handleTyping}
                            onBlur={() => setTyping(false)}
                        />
                        <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary-300 hover:text-primary-400">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </TabsContent>
            <TabsContent value="tasks" className="flex-1 p-6 glass rounded-b-lg">
                <h3 className="text-xl font-bold text-white">Shared Task Board</h3>
            </TabsContent>
            <TabsContent value="whiteboard" className="flex-1 glass rounded-b-lg overflow-hidden">
                <WhiteboardWithPDF />
            </TabsContent>
        </Tabs>
    );
} 