import React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                'flex h-10 w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                className
            )}
            {...props}
        />
    )
);
Input.displayName = "Input"; 