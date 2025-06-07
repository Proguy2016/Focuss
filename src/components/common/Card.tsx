import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'solid' | 'gradient';
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hover = true,
  glow = false,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'solid':
        return 'bg-slate-800 border border-slate-700';
      case 'gradient':
        return 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-white/20';
      default:
        return 'glass';
    }
  };

  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-2xl' : '';
  const glowClasses = glow ? 'hover:shadow-primary-500/25' : '';

  return (
    <motion.div
      className={`
        rounded-xl p-6 transition-all duration-300
        ${getVariantClasses()}
        ${hoverClasses}
        ${glowClasses}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};