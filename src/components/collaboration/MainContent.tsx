import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "./ChatBubble";
import { Input } from "./Input";
import { Button } from "../common/Button";
import { Send, MessageSquare, ListTodo, Clipboard, Smile, Reply, FileText, X } from "lucide-react";
import { useCollaboration } from "../../contexts/CollaborationContext";
import { SharedFilesPanel } from "./SharedFilesPanel";
import { WhiteboardWithPDF } from "./WhiteboardWithPDF";
import { SharedTasks } from "./SharedTasks";

// Helper to parse mentions
const parseMentions = (text: string, participants: any[], currentUser: any) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        const preMention = text.slice(lastIndex, match.index);
        if (preMention) parts.push(<span key={lastIndex}>{preMention}</span>);

        const username = match[1];
        const participant = participants.find(p => p.name.replace(/\s/g, '') === username);
        const isCurrentUser = currentUser && currentUser.name.replace(/\s/g, '') === username;

        if (participant) {
            parts.push(
                <span key={match.index} className={`font-bold rounded px-1 ${isCurrentUser ? 'bg-primary text-black' : 'bg-primary/20 text-primary-300'}`}>
                    @{username}
                </span>
            );
        } else {
            parts.push(<span key={match.index}>@{username}</span>);
        }
        lastIndex = mentionRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }

    return parts;
};

export const MainContent: React.FC = () => {
    const { messages, participants, currentUser, sendMessage, addReaction, setTyping } = useCollaboration();
    const [newMessage, setNewMessage] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [mentionQuery, setMentionQuery] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = () => {
        sendMessage(newMessage, replyingTo);
        setNewMessage("");
        setTyping(false);
        setReplyingTo(null);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setNewMessage(text);
        
        const mentionMatch = text.match(/@(\w*)$/);
        if (mentionMatch) {
            setShowMentions(true);
            setMentionQuery(mentionMatch[1]);
        } else {
            setShowMentions(false);
        }
        
        setTyping(text.length > 0);
    };

    const handleSelectMention = (participantName: string) => {
        const text = newMessage;
        const mentionReplaced = text.replace(/@(\w*)$/, `@${participantName.replace(/\s/g, '')} `);
        setNewMessage(mentionReplaced);
        setShowMentions(false);
        inputRef.current?.focus();
    };
    
    const filteredParticipants = participants.filter(p => p.name.toLowerCase().includes(mentionQuery.toLowerCase()));

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
                                        {msg.replyTo && (
                                            <div className="text-xs p-2 rounded-md bg-black/20 mb-2 border-l-2 border-primary">
                                                <p className="font-bold">Replying to {messages.find(m => m.id === msg.replyTo)?.name}</p>
                                                <p className="opacity-70 truncate">{messages.find(m => m.id === msg.replyTo)?.message}</p>
                                            </div>
                                        )}
                                        <p>{parseMentions(msg.message, participants, currentUser)}</p>
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
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setReplyingTo(msg.id)}><Reply className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                {isSent && <ChatBubbleAvatar src={participant?.avatar} fallback={participant?.name.charAt(0)} />}
                            </ChatBubble>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-white/10 bg-black/20">
                    {replyingTo && (
                        <div className="flex items-center justify-between text-xs p-2 rounded-md bg-black/30 mb-2">
                            <div>
                                <p className="font-bold">Replying to {messages.find(m => m.id === replyingTo)?.name}</p>
                                <p className="opacity-70 truncate">{messages.find(m => m.id === replyingTo)?.message}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <div className="relative">
                        {showMentions && filteredParticipants.length > 0 && (
                             <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 max-h-48 overflow-y-auto">
                                {filteredParticipants.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                                        onClick={() => handleSelectMention(p.name)}
                                    >
                                        <div className="h-6 w-6">
                                            <ChatBubbleAvatar src={p.avatar} fallback={p.name.charAt(0)} />
                                        </div>
                                        <span className="font-semibold">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                            <Input 
                                ref={inputRef}
                                placeholder="Type your message..." 
                                className="pr-12 bg-transparent"
                                value={newMessage}
                                onChange={handleTyping}
                                onBlur={() => {
                                    setTyping(false);
                                    // Delay hiding mentions to allow click
                                    setTimeout(() => setShowMentions(false), 200);
                                }}
                            />
                            <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary-300 hover:text-primary-400">
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
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