import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  showCoordinates?: boolean;
}

// Liste de suggestions de villes françaises et internationales
const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  { id: '1', name: 'Paris', city: 'Paris', country: 'France', fullAddress: 'Paris, France', coordinates: { lat: 48.8566, lng: 2.3522 } },
  { id: '2', name: 'Lyon', city: 'Lyon', country: 'France', fullAddress: 'Lyon, France', coordinates: { lat: 45.7640, lng: 4.8357 } },
  { id: '3', name: 'Marseille', city: 'Marseille', country: 'France', fullAddress: 'Marseille, France', coordinates: { lat: 43.2965, lng: 5.3698 } },
  { id: '4', name: 'Toulouse', city: 'Toulouse', country: 'France', fullAddress: 'Toulouse, France', coordinates: { lat: 43.6047, lng: 1.4442 } },
  { id: '5', name: 'Nice', city: 'Nice', country: 'France', fullAddress: 'Nice, France', coordinates: { lat: 43.7102, lng: 7.2620 } },
  { id: '6', name: 'Bordeaux', city: 'Bordeaux', country: 'France', fullAddress: 'Bordeaux, France', coordinates: { lat: 44.8378, lng: -0.5792 } },
  { id: '7', name: 'Lille', city: 'Lille', country: 'France', fullAddress: 'Lille, France', coordinates: { lat: 50.6292, lng: 3.0573 } },
  { id: '8', name: 'Strasbourg', city: 'Strasbourg', country: 'France', fullAddress: 'Strasbourg, France', coordinates: { lat: 48.5846, lng: 7.7507 } },
  { id: '9', name: 'Bruxelles', city: 'Bruxelles', country: 'Belgique', fullAddress: 'Bruxelles, Belgique', coordinates: { lat: 50.8503, lng: 4.3517 } },
  { id: '10', name: 'Genève', city: 'Genève', country: 'Suisse', fullAddress: 'Genève, Suisse', coordinates: { lat: 46.2044, lng: 6.1432 } },
  { id: '11', name: 'Montréal', city: 'Montréal', country: 'Canada', fullAddress: 'Montréal, Canada', coordinates: { lat: 45.5017, lng: -73.5673 } },
  { id: '12', name: 'Londres', city: 'Londres', country: 'Royaume-Uni', fullAddress: 'Londres, Royaume-Uni', coordinates: { lat: 51.5074, lng: -0.1278 } },
  { id: '13', name: 'Barcelone', city: 'Barcelone', country: 'Espagne', fullAddress: 'Barcelone, Espagne', coordinates: { lat: 41.3851, lng: 2.1734 } },
  { id: '14', name: 'Milan', city: 'Milan', country: 'Italie', fullAddress: 'Milan, Italie', coordinates: { lat: 45.4642, lng: 9.1900 } },
  { id: '15', name: 'Amsterdam', city: 'Amsterdam', country: 'Pays-Bas', fullAddress: 'Amsterdam, Pays-Bas', coordinates: { lat: 52.3676, lng: 4.9041 } }
];

export const LocationField: React.FC<LocationFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'Entrez une adresse ou une ville',
  showCoordinates = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrer les suggestions selon la recherche
  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(suggestion =>
    suggestion.fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  // Gérer la sélection d'une suggestion
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setSearchTerm(suggestion.fullAddress);
    onChange(suggestion.fullAddress);
    setShowSuggestions(false);
  };

  // Gérer la géolocalisation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Simuler une recherche inverse (dans une vraie app, vous utiliseriez une API)
        const nearestLocation = LOCATION_SUGGESTIONS.reduce((nearest, suggestion) => {
          if (!suggestion.coordinates) return nearest;

          const distance = Math.sqrt(
            Math.pow(suggestion.coordinates.lat - latitude, 2) +
            Math.pow(suggestion.coordinates.lng - longitude, 2)
          );

          if (!nearest || distance < nearest.distance) {
            return { suggestion, distance };
          }
          return nearest;
        }, null as { suggestion: LocationSuggestion; distance: number } | null);

        if (nearestLocation) {
          handleSuggestionSelect(nearestLocation.suggestion);
        }

        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position');
        setIsLoadingLocation(false);
      }
    );
  };

  // Gérer le clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchroniser le terme de recherche avec la valeur
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const containerClasses = `
    relative transition-all duration-300 ease-in-out
    ${isFocused ? 'z-50' : 'z-10'}
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

  const wrapperClasses = `
    relative cursor-text transition-all duration-300
    ${isFocused
      ? 'scale-[1.02] shadow-xl'
      : isHovered
      ? 'scale-[1.01] shadow-md bg-gray-50/30'
      : 'bg-gray-50/20 rounded-xl'
    }
  `;

  const inputClasses = `
    w-full px-4 py-3 pl-12 pr-24 border rounded-xl transition-all duration-300
    ${isFocused
      ? 'border-violet-500 bg-white ring-2 ring-violet-500/20'
      : isHovered
      ? 'border-gray-300 bg-gray-50/50'
      : 'border-gray-200 bg-transparent'
    }
    text-gray-900 focus:outline-none
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
          {/* Icône map-pin */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none z-10">
            <MapPin size={18} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleChange}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(searchTerm.length > 0);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            className={inputClasses}
            placeholder={placeholder}
            required={required}
          />

          {/* Bouton de géolocalisation */}
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={isLoadingLocation}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Utiliser ma position actuelle"
          >
            {isLoadingLocation ? (
              <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation size={16} />
            )}
          </button>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-hidden z-50">
              <div className="max-h-60 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full px-4 py-3 flex items-start space-x-3 hover:bg-violet-50 transition-colors duration-150 text-left border-b border-gray-50 last:border-b-0"
                  >
                    <MapPin size={16} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.fullAddress}
                      </div>
                      {showCoordinates && suggestion.coordinates && (
                        <div className="text-xs text-gray-400 mt-1">
                          {suggestion.coordinates.lat.toFixed(4)}, {suggestion.coordinates.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indicateur visuel discret */}
          {!isFocused && !isHovered && !value && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-200"></div>
            </div>
          )}
        </div>
      </div>      

      {/* Affichage des coordonnées si activé */}
      {showCoordinates && userLocation && (
        <div className="absolute -bottom-6 left-0 right-0">
          <p className="text-xs text-gray-500">
            Position: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};