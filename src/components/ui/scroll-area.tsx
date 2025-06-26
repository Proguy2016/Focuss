import * as React from "react"

interface ScrollAreaProps {
  className?: string;
  children: React.ReactNode;
}

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  ScrollAreaProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative overflow-auto ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea } 