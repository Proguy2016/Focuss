import React from "react";
import { Share2, Mic, Hand } from "lucide-react";
import { Button } from "../common/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";
import { useCollaboration } from "../../contexts/CollaborationContext";

export const ParticipantsPanel: React.FC<{ roomCode: string, onInvite: () => void }> = ({ roomCode, onInvite }) => {
    const { participants, currentUser, toggleHandRaised } = useCollaboration();

    const isMyHandRaised = participants.find(p => p.id === currentUser?.id)?.handRaised ?? false;

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white flex-shrink-0">Participants ({participants.length})</h3>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors">
                        <Avatar className={cn("h-10 w-10 border-2 transition-all", p.isSpeaking ? "border-green-400 shadow-[0_0_10px_theme(colors.green.400)]" : "border-transparent")}>
                            <AvatarImage src={p.avatar} />
                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold text-white/90">{p.name}</p>
                            <p className={cn("text-xs transition-colors", p.isTyping ? "text-primary-300 italic" : "text-white/60")}>
                                {p.isTyping ? "typing..." : "Online"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {p.isSpeaking && <Mic className="h-4 w-4 text-green-400 animate-pulse" />}
                            {p.handRaised && <Hand className="h-4 w-4 text-yellow-400" />}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-4 border-t border-white/10 space-y-2 flex-shrink-0">
                <Button 
                    variant={isMyHandRaised ? "primary" : "secondary"} 
                    className="w-full" 
                    onClick={toggleHandRaised}
                >
                    <Hand className="mr-2 h-4 w-4" /> 
                    {isMyHandRaised ? 'Lower Hand' : 'Raise Hand'}
                </Button>
                <Button variant="outline" className="w-full" onClick={onInvite}>
                    <Share2 className="mr-2 h-4 w-4" /> Invite
                </Button>
            </div>
        </div>
    );
}; 