import React, { useState, useRef } from 'react';
import { Link, Linkedin, Globe, Github, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  baseUrl: string;
  pattern: RegExp;
  placeholder: string;
  example: string;
  description: string;
}

// Configuration des plateformes sociales
const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  linkedin: {
    name: 'LinkedIn',
    icon: <Linkedin size={18} className="text-blue-600" />,
    baseUrl: 'https://linkedin.com/in/',
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    placeholder: 'jean-dupont',
    example: 'https://linkedin.com/in/jean-dupont',
    description: 'Profil LinkedIn'
  },
  github: {
    name: 'GitHub',
    icon: <Github size={18} className="text-gray-800" />,
    baseUrl: 'https://github.com/',
    pattern: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
    placeholder: 'jdupont',
    example: 'https://github.com/jdupont',
    description: 'Profil GitHub'
  },
  twitter: {
    name: 'Twitter/X',
    icon: <Twitter size={18} className="text-blue-400" />,
    baseUrl: 'https://twitter.com/',
    pattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w-]+\/?$/,
    placeholder: '@jeandupont',
    example: 'https://twitter.com/jeandupont',
    description: 'Profil Twitter/X'
  },
  instagram: {
    name: 'Instagram',
    icon: <Instagram size={18} className="text-pink-600" />,
    baseUrl: 'https://instagram.com/',
    pattern: /^https?:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/,
    placeholder: '@jeandupont',
    example: 'https://instagram.com/jeandupont',
    description: 'Profil Instagram'
  },
  facebook: {
    name: 'Facebook',
    icon: <Facebook size={18} className="text-blue-600" />,
    baseUrl: 'https://facebook.com/',
    pattern: /^https?:\/\/(www\.)?facebook\.com\/[\w.]+\/?$/,
    placeholder: 'jean.dupont',
    example: 'https://facebook.com/jean.dupont',
    description: 'Profil Facebook'
  },
  youtube: {
    name: 'YouTube',
    icon: <Youtube size={18} className="text-red-600" />,
    baseUrl: 'https://youtube.com/',
    pattern: /^https?:\/\/(www\.)?(youtube\.com\/(c\/|@|channel\/)?[\w-]+|youtu\.be\/[\w-]+)\/?$/,
    placeholder: '@jdupont',
    example: 'https://youtube.com/@jdupont',
    description: 'Chaîne YouTube'
  },
  website: {
    name: 'Site web',
    icon: <Globe size={18} className="text-green-600" />,
    baseUrl: '',
    pattern: /^https?:\/\/(www\.)?[\w-]+\.[\w-]+(\/[\w-./?%&=]*)?$/,
    placeholder: 'https://jeandupont.dev',
    example: 'https://jeandupont.dev',
    description: 'Site web personnel ou portfolio'
  }
};

interface SocialFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  platform?: keyof typeof SOCIAL_PLATFORMS;
  required?: boolean;
  className?: string;
  placeholder?: string;
  showValidation?: boolean;
}

export const SocialField: React.FC<SocialFieldProps> = ({
  label,
  value,
  onChange,
  platform = 'linkedin',
  required = false,
  className = '',
  placeholder,
  showValidation = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const socialPlatform = SOCIAL_PLATFORMS[platform];

  // Formater l'URL automatiquement
  const formatUrl = (input: string) => {
    if (!input) return '';

    // Si c'est déjà une URL complète, la retourner
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }

    // Ajouter l'@ pour les plateformes qui l'utilisent si nécessaire
    if ((platform === 'twitter' || platform === 'instagram') && !input.startsWith('@') && !input.includes('/')) {
      return `@${input}`;
    }

    // Construire l'URL complète pour les plateformes spécifiques
    if (platform !== 'website' && socialPlatform.baseUrl && !input.includes('/')) {
      return socialPlatform.baseUrl + input.replace(/^@/, '');
    }

    // Pour les sites web, ajouter https:// si nécessaire
    if (platform === 'website' && !input.startsWith('http')) {
      return `https://${input}`;
    }

    return input;
  };

  // Valider l'URL selon la plateforme
  const isValidUrl = () => {
    if (!value) return true; // Champ vide est valide si non requis

    const formattedValue = formatUrl(value);

    // Validation spéciale pour website (plus permissive)
    if (platform === 'website') {
      return /^https?:\/\/.+/.test(formattedValue);
    }

    return socialPlatform.pattern.test(formattedValue);
  };

  // Gérer le changement avec formatage automatique
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
  };

  // Gérer la perte de focus pour formater
  const handleBlur = () => {
    setIsFocused(false);
    if (value) {
      const formattedValue = formatUrl(value);
      if (formattedValue !== value) {
        onChange(formattedValue);
      }
    }
  };

  // Obtenir l'URL d'affichage (formatée)
  const getDisplayValue = () => {
    if (!value) return '';

    // En focus, montrer la valeur brute
    if (isFocused) return value;

    // Sinon, montrer la valeur formatée
    return formatUrl(value);
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
    ${value && showValidation && !isValidUrl() ? 'border-orange-500 ring-2 ring-orange-500/20' : ''}
    text-gray-900 focus:outline-none
  `;

  const wrapperClasses = `
    relative cursor-text transition-all duration-300
    ${isFocused
      ? 'scale-[1.02]'
      : isHovered
      ? 'scale-[1.01] bg-gray-50/30'
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
          {/* Icône spécifique à la plateforme */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            {socialPlatform.icon}
          </div>

          <input
            ref={inputRef}
            type="url"
            value={getDisplayValue()}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className={inputClasses}
            placeholder={placeholder || socialPlatform.placeholder}
            required={required}
          />

          {/* Indicateur de validation */}
          {!isFocused && value && showValidation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isValidUrl() ? 'bg-green-500' : 'bg-orange-500'
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
            {socialPlatform.description} • Ex: {socialPlatform.example}
          </p>
        </div>
      )}

      {/* Message d'erreur si invalide */}
      {!isFocused && value && showValidation && !isValidUrl() && (
        <div className="absolute -bottom-5 left-0 right-0">
          <p className="text-xs text-orange-600">
            Format invalide pour {socialPlatform.name}
          </p>
        </div>
      )}

      {/* Bouton pour ouvrir le lien (si valide) */}
      {value && isValidUrl() && !isFocused && (
        <button
          type="button"
          onClick={() => window.open(getDisplayValue(), '_blank')}
          className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors duration-200"
          title={`Ouvrir ${socialPlatform.name}`}
        >
          <Link size={16} />
        </button>
      )}
    </div>
  );
};