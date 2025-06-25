import React, { useRef } from 'react';
import { motion, HTMLMotionProps, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils'; // Import cn utility

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children' | 'style'> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'solid';
  className?: string;
  interactive?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  interactive = false,
  glow = false,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const springConfig = { damping: 20, stiffness: 300 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 300], [7, -7]);
  const rotateY = useTransform(smoothMouseX, [0, 400], [-7, 7]);

  const baseClasses = "rounded-2xl p-6 transition-all duration-300 relative overflow-hidden";
  
  const variantClasses = {
      glass: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg",
      solid: "bg-gray-900/80 border border-gray-700/80",
      default: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg"
  };

  const glowClasses = glow ? "shadow-primary/20 shadow-[0_0_15px] border-primary/20" : "";
  
  const interactiveStyle = interactive ? {
    rotateX,
    rotateY,
    transformStyle: 'preserve-3d' as const,
  } : {};

  return (
    <motion.div
      ref={cardRef}
      className={cn(baseClasses, variantClasses[variant], glowClasses, className)}
      style={interactiveStyle}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={() => {
        if(interactive) {
            mouseX.set(200);
            mouseY.set(150);
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      {...props}
    >
      <div className="relative z-10" style={interactive ? { transform: 'translateZ(30px)' } : {}}>{children}</div>
      {interactive && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: useTransform(
              smoothMouseY,
              [0, 300],
              [
                `radial-gradient(circle at ${smoothMouseX}px ${smoothMouseY}px, hsla(0, 0%, 100%, 0.1), transparent 40%)`,
                `radial-gradient(circle at ${smoothMouseX}px ${smoothMouseY}px, hsla(0, 0%, 100%, 0), transparent 60%)`
              ]
            ),
          }}
        />
      )}
    </motion.div>
  );
};