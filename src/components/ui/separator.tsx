import React from 'react';
import clsx from 'clsx';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
    orientation = 'horizontal',
    className = '',
    ...props
}) => {
    return (
        <div
            role="separator"
            className={clsx(
                orientation === 'horizontal'
                    ? 'w-full h-px my-2 bg-border'
                    : 'h-full w-px mx-2 bg-border',
                className
            )}
            {...props}
        />
    );
}; 