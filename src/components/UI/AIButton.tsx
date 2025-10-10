import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIButtonProps {
  isLoading?: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  title: string;
  className?: string;
  disabled?: boolean;
}

export const AIButton: React.FC<AIButtonProps> = ({
  isLoading = false,
  onClick,
  title,
  className = "",
  disabled = false
}) => {
  return (
    <div
      onClick={disabled || isLoading ? undefined : onClick}
      className={`p-1 text-violet-600 hover:text-violet-800 disabled:opacity-50 transition-colors duration-200 ${className}`}
      title={title}
    >
      {isLoading ? (
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-violet-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
    </div>
  );
};

export default AIButton;
