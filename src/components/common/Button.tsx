import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideProps } from 'lucide-react';

type IconComponent = React.FC<LucideProps>;

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'glass' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: IconComponent;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
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
  onClick,
  type = 'button', // Set default type to 'button' to prevent form submission
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-500 via-emerald to-secondary-500 text-white shadow-lg hover:from-primary-400 hover:to-emerald focus:ring-2 focus:ring-primary-400';
      case 'secondary':
        return 'glass text-white hover:bg-white/20';
      case 'ghost':
        return 'text-white hover:bg-white/10';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 via-yellow-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-yellow-600 focus:ring-2 focus:ring-red-400';
      case 'success':
        return 'bg-gradient-to-r from-emerald to-primary-500 text-white shadow-lg hover:from-emerald/80 hover:to-primary-400 focus:ring-2 focus:ring-emerald';
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20';
      case 'outline':
        return 'bg-transparent border border-white/20 text-white hover:bg-white/10';
      case 'link':
        return 'bg-transparent text-primary-400 hover:underline';
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
      case 'icon':
        return 'p-2';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick && !disabled && !loading) {
      // Stop event propagation to prevent bubbling
      e.stopPropagation();

      // Prevent default action which might cause page refresh
      e.preventDefault();

      // Call the original onClick handler
      onClick(e);
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-xl font-semibold
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400/80
    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
    ${fullWidth ? 'w-full' : ''}
    ${glow ? 'hover:shadow-[0_0_16px_4px_var(--primary)] focus:shadow-[0_0_16px_4px_var(--primary)]' : ''}
  `;

  return (
    <motion.button
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
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
        <Icon size={variant === 'primary' ? (size === 'sm' ? 20 : size === 'lg' ? 28 : 24) : (size === 'sm' ? 16 : size === 'lg' ? 24 : 20)} />
      )}

      {children}

      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={variant === 'primary' ? (size === 'sm' ? 20 : size === 'lg' ? 28 : 24) : (size === 'sm' ? 16 : size === 'lg' ? 24 : 20)} />
      )}
    </motion.button>
  );
};