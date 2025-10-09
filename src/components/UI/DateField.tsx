import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'jj/mm/aaaa'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Formatage de l'affichage
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';

    try {
      // Format ISO: YYYY-MM-DD vers format français: DD/MM/YYYY
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }

      // Déjà au format français
      if (dateString.includes('/')) {
        return dateString;
      }

      // Tentative de parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      return dateString;
    } catch {
      return dateString;
    }
  };

  // Conversion du format français vers ISO
  const convertToISO = (inputValue: string) => {
    // Si le format est déjà ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
      return inputValue;
    }

    // Si le format est français (DD/MM/YYYY)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(inputValue)) {
      const [day, month, year] = inputValue.split('/');
      return `${year}-${month}-${day}`;
    }

    return inputValue;
  };

  // Gestion du changement avec masquage
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Supprimer tous les caractères non numériques
    let numericValue = inputValue.replace(/\D/g, '');

    // Limiter à 8 chiffres
    if (numericValue.length > 8) {
      numericValue = numericValue.slice(0, 8);
    }

    // Appliquer le masque DD/MM/YYYY
    let formattedValue = numericValue;
    if (numericValue.length >= 2) {
      formattedValue = numericValue.slice(0, 2);
      if (numericValue.length > 2) {
        formattedValue += '/' + numericValue.slice(2, 4);
      }
      if (numericValue.length > 4) {
        formattedValue += '/' + numericValue.slice(4, 8);
      }
    }

    // Convertir en format ISO pour le stockage
    const isoValue = convertToISO(formattedValue);
    onChange(isoValue);
  };

  // Valeur à afficher dans l'input
  const displayValue = value ? (isFocused ? value : formatDateDisplay(value)) : '';

  const containerClasses = `
    relative transition-all duration-300 ease-in-out
    ${isFocused ? 'z-10' : ''}
    ${className}
  `;

  const labelClasses = `
    absolute left-12 transition-all duration-200 pointer-events-none
    ${isFocused || value
      ? 'text-xs text-violet-600 -top-4 bg-white -left-2 px-1 ml-2 rounded-sm z-9999'
      : 'text-sm text-gray-500 top-3 hidden'
    }
    ${!isFocused && !value && isHovered ? 'text-gray-700' : ''}
  `;

  const inputClasses = `
    w-full px-4 py-3 pl-12 border rounded-xl transition-all duration-300
    ${isFocused
      ? 'border-violet-500 bg-white ring-2 ring-violet-500/20'
      : isHovered
      ? 'border-gray-300 bg-gray-50/50'
      : 'border-gray-200 bg-transparent'
    }
    text-gray-900 focus:outline-none
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
          {/* Icône calendrier */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none z-10">
            <Calendar size={18} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={inputClasses}
            placeholder={placeholder}
            maxLength={10}
            required={required}
          />

          {/* Indicateur visuel discret */}
          {!isFocused && !isHovered && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-violet-300 rounded-full transition-all duration-200"></div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};
