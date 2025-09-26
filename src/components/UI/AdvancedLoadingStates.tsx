import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';

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

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] p-4 rounded-lg border shadow-lg animate-slideIn max-w-sm ${typeStyles[type]}`}>
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

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

// Hook pour gérer les notifications toast
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>>([]);

  const addToast = React.useCallback((
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

// Composant pour afficher les toasts
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};