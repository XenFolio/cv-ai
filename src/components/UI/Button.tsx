import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { colors, spacing, borderRadius, transitions } from '../../styles/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${transitions.base}
  `;

  const sizeStyles = {
    sm: `px-3 py-2 text-sm ${spacing[2]} ${spacing[3]}`,
    md: `px-4 py-2.5 text-sm ${spacing[3]} ${spacing[4]}`,
    lg: `px-6 py-3 text-base ${spacing[4]} ${spacing[6]}`,
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-indigo-600 to-purple-600
      text-white shadow-lg hover:shadow-xl
      hover:from-indigo-700 hover:to-purple-700
      focus:ring-indigo-500
      transform hover:scale-[1.02] active:scale-[0.98]
    `,
    secondary: `
      bg-gradient-to-r from-blue-500 to-indigo-500
      text-white shadow-md hover:shadow-lg
      hover:from-blue-600 hover:to-indigo-600
      focus:ring-blue-500
      transform hover:scale-[1.02] active:scale-[0.98]
    `,
    outline: `
      border border-gray-300 bg-white
      text-gray-700 hover:bg-gray-50
      focus:ring-indigo-500 focus:border-indigo-500
      hover:border-gray-400
    `,
    ghost: `
      text-gray-600 hover:text-indigo-600
      hover:bg-gray-50 focus:ring-indigo-500
      focus:bg-gray-50
    `,
    destructive: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500 shadow-md hover:shadow-lg
      transform hover:scale-[1.02] active:scale-[0.98]
    `,
    success: `
      bg-green-600 text-white hover:bg-green-700
      focus:ring-green-500 shadow-md hover:shadow-lg
      transform hover:scale-[1.02] active:scale-[0.98]
    `,
  };

  const loadingStyles = loading ? 'cursor-not-allowed opacity-75' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  const classes = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${loadingStyles}
    ${widthStyles}
    ${borderRadius.md}
    ${className}
  `;

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return icon;
  };

  const renderContent = () => {
    if (!children && !icon) return null;

    const iconElement = renderIcon();
    if (!iconElement) return children;

    return (
      <>
        {iconPosition === 'left' && iconElement && (
          <span className={children ? 'mr-2' : ''}>
            {iconElement}
          </span>
        )}
        {children}
        {iconPosition === 'right' && iconElement && (
          <span className={children ? 'ml-2' : ''}>
            {iconElement}
          </span>
        )}
      </>
    );
  };

  return (
    <button
      className={classes.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;