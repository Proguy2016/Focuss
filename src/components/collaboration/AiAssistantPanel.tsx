import React, { useState, useEffect, useRef } from "react";
import { Bot, BookOpen, Send, Lightbulb, BrainCircuit } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "./Input";
import { useCollaboration } from "../../contexts/CollaborationContext";
import { AiInteraction } from "../../contexts/CollaborationContext";
import { cn } from "../../lib/utils";


const AiInteractionBubble: React.FC<{ interaction: AiInteraction }> = ({ interaction }) => {
    const isUser = interaction.type === 'user_query';
    return (
        <div className={cn(
            "text-sm text-white/80 bg-white/5 p-3 rounded-lg w-fit max-w-sm",
            isUser ? "bg-primary-500/20 self-end" : "self-start"
        )}>
            {isUser && <p className="font-semibold mb-1 text-primary-300">You</p>}
            <p className="text-white/80">{interaction.text}</p>
        </div>
    )
}

export const AiAssistantPanel: React.FC = () => {
    const { aiInteractions, summarizeChat, askAi } = useCollaboration();
    const [query, setQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [aiInteractions]);
    
    const handleAskAi = () => {
        if (!query.trim()) return;
        askAi(query);
        setQuery("");
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-2 text-white flex items-center gap-2 flex-shrink-0">
                <Bot className="text-primary-300" /> AI Assistant
            </h3>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-2 my-4 flex flex-col">
                {aiInteractions.length === 0 ? (
                    <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                        <BrainCircuit className="mx-auto h-12 w-12 text-white/20" />
                        <p className="mt-4 text-sm text-white/60">AI Assistant is ready.</p>
                        <p className="text-xs text-white/40">Ask a question or use a suggestion.</p>
                    </div>
                ) : (
                    aiInteractions.map(interaction => (
                        <AiInteractionBubble key={interaction.id} interaction={interaction} />
                    ))
                )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/10 flex-shrink-0">
                <div className="space-y-2 mb-4">
                    <Button variant="secondary" size="sm" className="w-full justify-start" onClick={summarizeChat}>
                        <BookOpen className="mr-2 h-4 w-4" /> Summarize Chat
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => askAi("Generate ideas based on the brief")}>
                        <Lightbulb className="mr-2 h-4 w-4" /> Generate Ideas
                    </Button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAskAi(); }} className="relative">
                    <Input
                        placeholder="Ask AI..."
                        className="pr-10"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}; 