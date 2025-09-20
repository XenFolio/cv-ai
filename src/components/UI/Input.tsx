import React from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { spacing, borderRadius, transitions } from '../../styles/theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helper,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  required = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseStyles = `
    w-full border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    ${transitions.base}
  `;

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const variantStyles = {
    default: `
      bg-white border-gray-300
      focus:border-indigo-500 focus:ring-indigo-500/20
      hover:border-gray-400
    `,
    filled: `
      bg-gray-50 border-transparent
      focus:border-indigo-500 focus:ring-indigo-500/20
      hover:bg-gray-100
    `,
    outlined: `
      bg-transparent border-2 border-gray-300
      focus:border-indigo-500 focus:ring-indigo-500/20
      hover:border-gray-400
    `,
  };

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : success
    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
    : '';

  const classes = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${stateStyles}
    ${borderRadius.md}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `;

  const togglePassword = () => {
    if (type === 'password') {
      setShowPassword(!showPassword);
    }
  };

  const getRightIcon = () => {
    if (type === 'password') {
      return (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      );
    }

    if (error) {
      return <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />;
    }

    if (success) {
      return <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />;
    }

    if (rightIcon) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          type={inputType}
          className={classes.trim()}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {getRightIcon()}
      </div>

      {(error || success || helper) && (
        <div className="mt-1.5 text-sm">
          {error && (
            <span className="text-red-600 flex items-center">
              {error}
            </span>
          )}
          {success && (
            <span className="text-green-600 flex items-center">
              {success}
            </span>
          )}
          {helper && !error && !success && (
            <span className="text-gray-500">
              {helper}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Input;