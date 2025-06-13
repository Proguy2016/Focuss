import * as React from "react";
import { cn } from "@/lib/utils";

interface ColoredGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    borderColor?: string; // Tailwind class or custom style
    children: React.ReactNode;
}

const ColoredGlassCard = React.forwardRef<HTMLDivElement, ColoredGlassCardProps>(
    ({ className, borderColor = "border-[#00a8a8]/40", children, ...props }, ref) => (
        <div
            ref={ref}
            style={{ background: 'linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 100%)' }}
            className={cn(
                "rounded-xl border shadow backdrop-blur-md",
                borderColor,
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);
ColoredGlassCard.displayName = "ColoredGlassCard";

export { ColoredGlassCard };
export default ColoredGlassCard; 