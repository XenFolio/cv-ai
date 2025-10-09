import React, { useState, useRef } from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'date';
  placeholder?: string;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className = '',
  icon
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Styles discrets par défaut
  const containerClasses = `
    relative transition-all duration-300 ease-in-out
    ${isFocused ? 'z-10' : ''}
    ${className}
  `;

  const labelClasses = `
    absolute left-4 transition-all duration-200 pointer-events-none
    ${isFocused || value
      ? 'text-xs text-violet-600 -top-4 bg-white -ml-3 px-1 rounded-sm'
      : 'text-sm text-gray-500 top-3 left-4 ml-5 mt-1'
    }
    ${!isFocused && !value && isHovered ? 'text-gray-700' : ''}
  `;

  const inputClasses = `
    w-full px-4 py-3 border rounded-xl transition-all duration-300
    ${isFocused
      ? 'border-violet-500 bg-white ring-2 ring-violet-500/20'
      : isHovered
      ? 'border-gray-300 bg-gray-50/50'
      : 'border-gray-200 bg-transparent'
    }
    ${!isFocused && !value ? 'text-transparent' : 'text-gray-900'}
    focus:outline-none
  `;

  const wrapperClasses = `
    relative cursor-text transition-all duration-300
    ${isFocused
      ? 'scale-[1.02]'
      : isHovered
      ? 'scale-[1.01]  bg-gray-50/30'
      : 'bg-gray-50/20 rounded-xl'
    }
  `;

  // Gestion spéciale pour les champs de type date
  const formatDateDisplay = (dateString: string) => {
    if (!dateString || type !== 'date') return dateString;

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const displayValue = type === 'date'
    ? (isFocused || isHovered ? value : formatDateDisplay(value))
    : (isFocused || isHovered ? value : (value || placeholder || ''));

  return (
    <div className={containerClasses}>
      <div
        className={wrapperClasses}
        onClick={() => inputRef.current?.focus()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`${inputClasses} ${icon ? 'pl-10' : ''}`}
            placeholder=""
            required={required}
          />

          {/* Affichage discret quand non focalisé */}
          {!isFocused && !isHovered && value && (
            <div className={`absolute inset-0 flex items-center pointer-events-none ${icon ? 'pl-10' : 'pl-4'}`}>
              <span className="text-gray-700 truncate">
                {displayValue}
              </span>
            </div>
          )}

          {/* Indicateur visuel discret */}
          {!isFocused && !isHovered && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-200"></div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};