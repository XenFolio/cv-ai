import React, { useState, useRef } from 'react';
import { Map } from 'lucide-react';

interface PostalCodeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  country?: string;
}

// Validation des codes postaux par pays
const POSTAL_CODE_PATTERNS = {
  FR: {
    pattern: /^\d{5}$/,
    format: 'XXXXX',
    example: '75001',
    description: 'Code postal français à 5 chiffres'
  },
  BE: {
    pattern: /^\d{4}$/,
    format: 'XXXX',
    example: '1000',
    description: 'Code postal belge à 4 chiffres'
  },
  CH: {
    pattern: /^\d{4}$/,
    format: 'XXXX',
    example: '1201',
    description: 'Code postal suisse à 4 chiffres'
  },
  CA: {
    pattern: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
    format: 'X0X 0X0',
    example: 'H3B 1J4',
    description: 'Code postal canadien (lettre-chiffre-lettre espace chiffre-lettre-chiffre)'
  },
  LU: {
    pattern: /^\d{4}$/,
    format: 'XXXX',
    example: '1234',
    description: 'Code postal luxembourgeois à 4 chiffres'
  },
  DE: {
    pattern: /^\d{5}$/,
    format: 'XXXXX',
    example: '10115',
    description: 'Code postal allemand à 5 chiffres'
  },
  IT: {
    pattern: /^\d{5}$/,
    format: 'XXXXX',
    example: '00100',
    description: 'Code postal italien à 5 chiffres'
  },
  ES: {
    pattern: /^\d{5}$/,
    format: 'XXXXX',
    example: '28001',
    description: 'Code postal espagnol à 5 chiffres'
  },
  GB: {
    pattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/,
    format: 'XX0X 0XX',
    example: 'SW1A 0AA',
    description: 'Code postal britannique'
  },
  NL: {
    pattern: /^\d{4} [A-Za-z]{2}$/,
    format: 'XXXX XX',
    example: '1012 JS',
    description: 'Code postal néerlandais (4 chiffres + 2 lettres)'
  }
};

export const PostalCodeField: React.FC<PostalCodeFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'Code postal',
  country = 'FR'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Obtenir les règles de validation pour le pays
  const validationRules = POSTAL_CODE_PATTERNS[country as keyof typeof POSTAL_CODE_PATTERNS] || POSTAL_CODE_PATTERNS.FR;

  // Formater le code postal selon le pays
  const formatPostalCode = (input: string) => {
    let formatted = input;

    // Formatage spécial pour le Canada (X0X 0X0)
    if (country === 'CA') {
      formatted = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (formatted.length > 3) {
        formatted = formatted.slice(0, 3) + ' ' + formatted.slice(3, 6);
      }
    }
    // Formatage pour les Pays-Bas (XXXX XX)
    else if (country === 'NL') {
      formatted = input.replace(/[^A-Z0-9]/g, '').toUpperCase();
      if (formatted.length > 4) {
        formatted = formatted.slice(0, 4) + ' ' + formatted.slice(4, 6);
      }
    }
    // Formatage pour le Royaume-Uni
    else if (country === 'GB') {
      formatted = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
      // Ajouter un espace après 3 ou 4 caractères
      if (formatted.length >= 3) {
        const spaceIndex = formatted.length > 4 ? 4 : 3;
        formatted = formatted.slice(0, spaceIndex) + ' ' + formatted.slice(spaceIndex, 7);
      }
    }
    // Formatage pour les autres pays (uniquement des chiffres)
    else {
      formatted = input.replace(/\D/g, '');
    }

    return formatted;
  };

  // Gérer le changement avec formatage automatique
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatPostalCode(inputValue);
    onChange(formattedValue);
  };

  // Valider le code postal
  const isValidPostalCode = () => {
    if (!value) return true; // Champ vide est considéré comme valide (non requis)
    return validationRules.pattern.test(value);
  };

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
    ${value && !isValidPostalCode() ? 'border-orange-500 ring-2 ring-orange-500/20' : ''}
    text-gray-900 focus:outline-none tracking-wider
  `;

  const wrapperClasses = `
    relative cursor-text transition-all duration-300
    ${isFocused
      ? 'scale-[1.02] '
      : isHovered
      ? 'scale-[1.01] bg-gray-50/30'
      : 'bg-gray-50/20 rounded-xl'
    }
  `;

  // Définir la longueur maximale selon le pays
  const getMaxLength = () => {
    switch (country) {
      case 'BE':
      case 'CH':
      case 'LU':
        return 4;
      case 'NL':
        return 7; // XXXX XX
      case 'CA':
        return 7; // X0X 0X0
      case 'GB':
        return 8; // XX0X 0XX
      default:
        return 5;
    }
  };

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
          {/* Icône map */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none z-10">
            <Map size={18} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={inputClasses}
            placeholder={isFocused ? validationRules.format : placeholder}
            maxLength={getMaxLength()}
            required={required}
          />

          {/* Indicateur de validation */}
          {!isFocused && value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isValidPostalCode() ? 'bg-green-500' : 'bg-orange-500'
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

     

      {/* Aide contextuelle */}
      {isFocused && (
        <div className="absolute -bottom-6 left-0 right-0">
          <p className="text-xs text-gray-500">
            {validationRules.description} • Ex: {validationRules.example}
          </p>
        </div>
      )}

      {/* Message d'erreur si invalide */}
      {!isFocused && value && !isValidPostalCode() && (
        <div className="absolute -bottom-5 left-0 right-0">
          <p className="text-xs text-orange-600">
            Format invalide pour {country === 'FR' ? 'la France' : country}
          </p>
        </div>
      )}
    </div>
  );
};