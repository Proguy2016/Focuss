import React from "react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ChatBubbleProps {
    variant?: "sent" | "received";
    children: React.ReactNode;
}

export function ChatBubble({ variant = "received", children }: ChatBubbleProps) {
    return (
        <div className={cn("flex items-start gap-2 mb-4", variant === "sent" && "flex-row-reverse")}>
            {children}
        </div>
    );
}

export function ChatBubbleMessage({ variant = "received", children }: { variant?: "sent" | "received", children: React.ReactNode }) {
    return (
        <div className={cn("rounded-lg p-3", variant === "sent" ? "bg-primary-500 text-white" : "bg-white/10")}>
            {children}
        </div>
    );
}

export function ChatBubbleAvatar({ src, fallback = "AI" }: { src?: string, fallback?: string }) {
    return (
        <Avatar className="h-8 w-8">
            {src && <AvatarImage src={src} />}
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    );
} 