import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'secondary' | 'outline';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'secondary',
    className = '',
    children,
    ...props
}) => {
    return (
        <span
            className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                variant === 'secondary' && 'bg-secondary text-secondary-foreground',
                variant === 'outline' && 'border border-border text-foreground',
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}; 