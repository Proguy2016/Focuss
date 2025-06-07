import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600';
      case 'secondary':
        return 'glass text-white hover:bg-white/20';
      case 'ghost':
        return 'text-white hover:bg-white/10';
      case 'danger':
        return 'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700';
      case 'success':
        return 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700';
      default:
        return 'glass text-white hover:bg-white/20';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-xl font-semibold
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${glow ? 'hover:shadow-lg' : ''}
  `;

  return (
    <motion.button
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
    </motion.button>
  );
};