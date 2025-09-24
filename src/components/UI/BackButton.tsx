import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  text?: string;
  className?: string;
  ariaLabel?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  text = 'Retour',
  className = '',
  ariaLabel
}) => {
  const defaultAriaLabel = ariaLabel || `Retour ${text !== 'Retour' ? `au ${text}` : ''}`;

  return (
    <button
      onClick={onClick}
      className={`border rounded-lg border-transparent p-2 flex items-center space-x-2 text-violet-600 hover:text-violet-700 font-medium transition-colors hover:border-violet-400 ${className}`}
      aria-label={defaultAriaLabel}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{text}</span>
    </button>
  );
};

export default BackButton;