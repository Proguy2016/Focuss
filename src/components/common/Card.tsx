import React, { useRef } from 'react';
import { motion, HTMLMotionProps, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children' | 'style'> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'solid';
  className?: string;
  interactive?: boolean;
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  interactive = false,
  hover,
  glow,
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

  const springConfig = { damping: 15, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [0, 300], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [0, 400], [-10, 10]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg';
      case 'solid':
        return 'bg-gray-800/80 border border-gray-700/80';
      default:
        return 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg';
    }
  };

  const interactiveStyle = interactive ? {
    rotateX,
    rotateY,
    transformStyle: 'preserve-3d' as 'preserve-3d',
  } : {};

  return (
    <motion.div
      ref={cardRef}
      className={`
        rounded-2xl p-6 transition-all duration-300 relative overflow-hidden
        ${getVariantClasses()}
        ${className}
      `}
      style={interactiveStyle}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={() => {
        mouseX.set(200);
        mouseY.set(150);
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      {...props}
    >
      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
      {interactive && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: useTransform(
              smoothMouseY,
              [0, 300],
              [
                `radial-gradient(circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(255, 255, 255, 0.1), transparent 60%)`,
                `radial-gradient(circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(255, 255, 255, 0), transparent 80%)`
              ]
            ),
          }}
        />
      )}
    </motion.div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-bold ${className}`}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};