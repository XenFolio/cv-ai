import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  success?: boolean;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  success,
  children,
  className = '',
  size = 'md',
  variant = 'spinner'
}) => {
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 ${className}`}>
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
        <p className="text-sm text-red-700 dark:text-red-300 text-center">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 ${className}`}>
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-2 animate-scaleIn" />
        <p className="text-sm text-green-700 dark:text-green-300 text-center">Opération réussie !</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        {variant === 'spinner' && (
          <Loader2 className={`animate-spin text-indigo-600 dark:text-indigo-400 ${
            size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
          }`} />
        )}

        {variant === 'skeleton' && (
          <div className="space-y-3 w-full">
            <div className="skeleton h-4 rounded"></div>
            <div className="skeleton h-4 rounded w-3/4"></div>
            <div className="skeleton h-4 rounded w-1/2"></div>
          </div>
        )}

        {variant === 'pulse' && (
          <div className={`animate-pulse bg-indigo-600 dark:bg-indigo-400 rounded-full ${
            size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
          }`} />
        )}

        {variant === 'dots' && (
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce ${
                  size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
                }`}
                style={{ animationDelay: `${(i - 1) * 0.1}s` }}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Chargement en cours...</p>
      </div>
    );
  }

  return <>{children}</>;
};

interface ProgressIndicatorProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  label = 'Progression',
  showPercentage = true,
  className = '',
  size = 'md'
}) => {
  const height = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
        )}
      </div>
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out ${height}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Toast functionality moved to ToastSystem.tsx to fix fast refresh warning

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-indigo-500'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm space-x-2',
    md: 'px-4 py-2 text-sm space-x-2',
    lg: 'px-6 py-3 text-base space-x-3'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className={`animate-spin ${iconSize[size]}`} />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSize[size]}>{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSize[size]}>{icon}</span>
      )}
    </button>
  );
};
