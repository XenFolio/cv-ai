import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Search } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

// Liste des pays avec leurs drapeaux (emojis)
const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'AU', name: 'Australie', flag: '🇦🇺' },
  { code: 'JP', name: 'Japon', flag: '🇯🇵' },
  { code: 'CN', name: 'Chine', flag: '🇨🇳' },
  { code: 'IN', name: 'Inde', flag: '🇮🇳' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexique', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
  { code: 'RU', name: 'Russie', flag: '🇷🇺' },
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
  { code: 'SE', name: 'Suède', flag: '🇸🇪' },
  { code: 'NO', name: 'Norvège', flag: '🇳🇴' },
  { code: 'DK', name: 'Danemark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlande', flag: '🇫🇮' },
  { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
  { code: 'CZ', name: 'République Tchèque', flag: '🇨🇿' },
  { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
  { code: 'GR', name: 'Grèce', flag: '🇬🇷' },
  { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
  { code: 'IL', name: 'Israël', flag: '🇮🇱' },
  { code: 'SA', name: 'Arabie Saoudite', flag: '🇸🇦' },
  { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪' },
  { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapour', flag: '🇸🇬' },
  { code: 'TH', name: 'Thaïlande', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaisie', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonésie', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿' },
  { code: 'IS', name: 'Islande', flag: '🇮🇸' }
];

export const CountryField: React.FC<CountryFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'Sélectionner un pays'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trouver le pays sélectionné
  const selectedCountry = COUNTRIES.find(country => country.code === value || country.name === value);

  // Filtrer les pays selon la recherche
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le clic sur un pays
  const handleCountrySelect = (country: Country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Gérer le clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerClasses = `
    relative transition-all duration-300 ease-in-out
    ${isOpen ? 'z-50' : 'z-10'}
    ${className}
  `;

  const labelClasses = `
    absolute left-12 transition-all duration-200 pointer-events-none
    ${isOpen || selectedCountry
      ? 'text-xs text-violet-600 -top-4 bg-white -left-2 px-1 ml-2 rounded-sm z-9999'
      : 'text-sm text-gray-500 top-3 hidden'
    }
    ${!isOpen && !selectedCountry && isHovered ? 'text-gray-700' : ''}
  `;

  const wrapperClasses = `
    relative cursor-pointer transition-all duration-300
    ${isOpen
      ? 'scale-[1.02] shadow-xl'
      : isHovered
      ? 'scale-[1.01] shadow-md bg-gray-50/30'
      : 'bg-gray-50/20 rounded-xl'
    }
  `;

  const buttonClasses = `
    w-full px-4 py-3 pl-12 border rounded-xl transition-all duration-300
    text-left flex items-center justify-between
    ${isOpen
      ? 'border-violet-500 bg-white ring-2 ring-violet-500/20'
      : isHovered
      ? 'border-gray-300 bg-gray-50/50'
      : 'border-gray-200 bg-transparent'
    }
    ${selectedCountry ? 'text-gray-900' : 'text-gray-500'}
    focus:outline-none
  `;

  return (
    <div className={containerClasses}>
      <div
        className={wrapperClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative" ref={dropdownRef}>
          {/* Icône globe */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none z-10">
            <Globe size={18} />
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={buttonClasses}
          >
            <div className="flex items-center space-x-3">
              {selectedCountry ? (
                <>
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                </>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-400`}
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-hidden z-50">
              {/* Barre de recherche */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un pays..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Liste des pays */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-violet-50 transition-colors duration-150 text-left
                        ${selectedCountry?.code === country.code ? 'bg-violet-100 text-violet-900' : 'text-gray-900'}
                      `}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium">{country.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">{country.code}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Aucun pays trouvé
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicateur visuel discret */}
          {!isOpen && !isHovered && !selectedCountry && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-200"></div>
            </div>
          )}
        </div>
      </div>

      {/* Ligne subtile quand ouvert */}
      {isOpen && (
        <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"></div>
      )}
    </div>
  );
};