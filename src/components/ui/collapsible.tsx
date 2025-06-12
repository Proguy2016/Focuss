import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CollapsibleContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined);

interface CollapsibleProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ open: controlledOpen, onOpenChange, children }) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const setOpen = (value: boolean) => {
        if (onOpenChange) onOpenChange(value);
        if (controlledOpen === undefined) setUncontrolledOpen(value);
    };
    return (
        <CollapsibleContext.Provider value={{ open, setOpen }}>
            <div>{children}</div>
        </CollapsibleContext.Provider>
    );
};

interface CollapsibleTriggerProps {
    asChild?: boolean;
    children: ReactNode;
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ asChild, children }) => {
    const ctx = useContext(CollapsibleContext);
    if (!ctx) throw new Error('CollapsibleTrigger must be used within a Collapsible');
    const { open, setOpen } = ctx;
    const child = React.Children.only(children);
    if (asChild && React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
            onClick: (e: any) => {
                child.props.onClick?.(e);
                setOpen(!open);
            },
            'aria-expanded': open,
            'aria-controls': 'collapsible-content',
        });
    }
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="collapsible-content"
            className="w-full text-left"
        >
            {children}
        </button>
    );
};

interface CollapsibleContentProps {
    children: ReactNode;
    className?: string;
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ children, className = '' }) => {
    const ctx = useContext(CollapsibleContext);
    if (!ctx) throw new Error('CollapsibleContent must be used within a Collapsible');
    const { open } = ctx;
    return open ? (
        <div id="collapsible-content" className={className}>
            {children}
        </div>
    ) : null;
}; 