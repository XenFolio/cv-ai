import React, { useState, useRef } from 'react';
import { Phone } from 'lucide-react';

interface PhoneFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = '06 12 34 56 78'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Formater le numéro de téléphone français
  const formatPhoneDisplay = (phoneString: string) => {
    if (!phoneString) return '';

    // Supprimer tous les caractères non numériques
    let numericValue = phoneString.replace(/\D/g, '');

    // Limiter à 10 chiffres pour les numéros français
    if (numericValue.length > 10) {
      numericValue = numericValue.slice(0, 10);
    }

    // Formater en français: XX XX XX XX XX
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 4) {
      return `${numericValue.slice(0, 2)} ${numericValue.slice(2)}`;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 2)} ${numericValue.slice(2, 4)} ${numericValue.slice(4)}`;
    } else if (numericValue.length <= 8) {
      return `${numericValue.slice(0, 2)} ${numericValue.slice(2, 4)} ${numericValue.slice(4, 6)} ${numericValue.slice(6)}`;
    } else {
      return `${numericValue.slice(0, 2)} ${numericValue.slice(2, 4)} ${numericValue.slice(4, 6)} ${numericValue.slice(6, 8)} ${numericValue.slice(8, 10)}`;
    }
  };

  // Gérer le changement avec formatage automatique
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Supprimer tous les caractères non numériques sauf les espaces pour le traitement
    let numericValue = inputValue.replace(/\D/g, '');

    // Limiter à 10 chiffres
    if (numericValue.length > 10) {
      numericValue = numericValue.slice(0, 10);
    }

    // Ne stocker que les chiffres (pas d'espaces)
    onChange(numericValue);
  };

  // Valeur à afficher dans l'input (formatée)
  const displayValue = isFocused ? value.replace(/\D/g, '') : formatPhoneDisplay(value);

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
    tracking-wider
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

  // Validation du format français
  const isValidFrenchPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^0[1-9]\d{8}$/.test(cleanPhone);
  };

  const isValid = isValidFrenchPhone(value);

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
          {/* Icône téléphone */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none z-10">
            <Phone size={17} />
          </div>

          <input
            ref={inputRef}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={inputClasses}
            placeholder={placeholder}
            maxLength={14} // XX XX XX XX XX = 14 caractères avec espaces
            required={required}
          />

          {/* Indicateur de validation */}
          {!isFocused && value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${isValid ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
            </div>
          )}

          {/* Indicateur visuel quand vide */}
          {!isFocused && !isHovered && !value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-200"></div>
            </div>
          )}
        </div>
      </div>




      {/* Message d'erreur si invalide */}
      {!isFocused && value && !isValid && (
        <div className="absolute -bottom-5 left-0 right-0">
          <p className="text-xs text-orange-600">
            Format invalide
          </p>
        </div>
      )}
    </div>
  );
};
