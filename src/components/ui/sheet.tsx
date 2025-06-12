import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SheetContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open: controlledOpen, onOpenChange, children }) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const setOpen = (value: boolean) => {
        if (onOpenChange) onOpenChange(value);
        if (controlledOpen === undefined) setUncontrolledOpen(value);
    };
    return (
        <SheetContext.Provider value={{ open, setOpen }}>
            {children}
        </SheetContext.Provider>
    );
};

interface SheetTriggerProps {
    asChild?: boolean;
    children: ReactNode;
}

export const SheetTrigger: React.FC<SheetTriggerProps> = ({ asChild, children }) => {
    const ctx = useContext(SheetContext);
    if (!ctx) throw new Error('SheetTrigger must be used within a Sheet');
    const { open, setOpen } = ctx;
    const child = React.Children.only(children);
    if (asChild && React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
            onClick: (e: any) => {
                child.props.onClick?.(e);
                setOpen(true);
            },
            'aria-expanded': open,
            'aria-controls': 'sheet-content',
        });
    }
    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="sheet-content"
        >
            {children}
        </button>
    );
};

interface SheetContentProps {
    side?: 'left' | 'right' | 'top' | 'bottom';
    className?: string;
    children: ReactNode;
}

export const SheetContent: React.FC<SheetContentProps> = ({ side = 'right', className = '', children }) => {
    const ctx = useContext(SheetContext);
    if (!ctx) throw new Error('SheetContent must be used within a Sheet');
    const { open, setOpen } = ctx;
    if (!open) return null;
    let positionClass = '';
    switch (side) {
        case 'left':
            positionClass = 'left-0 top-0 h-full';
            break;
        case 'right':
            positionClass = 'right-0 top-0 h-full';
            break;
        case 'top':
            positionClass = 'top-0 left-0 w-full';
            break;
        case 'bottom':
            positionClass = 'bottom-0 left-0 w-full';
            break;
        default:
            positionClass = 'right-0 top-0 h-full';
    }
    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            {/* Sheet Panel */}
            <div
                id="sheet-content"
                className={`fixed z-50 bg-card shadow-lg transition-transform duration-300 ${positionClass} ${side === 'left' || side === 'right' ? 'w-64 sm:w-80' : 'h-64'} ${className}`}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        </>
    );
}; 