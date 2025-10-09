import React, { useState, useEffect } from 'react';
import { Save, User, MapPin, Briefcase, Globe, AlertCircle, CheckCircle, Mail, Building } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { UserProfile } from '../../hooks/useSupabase';
import { InputField } from '../UI/InputField';
import { DateField } from '../UI/DateField';
import { PhoneField } from '../UI/PhoneField';
import { CountryField } from '../UI/CountryField';
import { LocationField } from '../UI/LocationField';
import { PostalCodeField } from '../UI/PostalCodeField';
import { SocialField } from '../UI/SocialField';

interface ProfileFormProps {
  onSave?: (profile: UserProfile) => void;
  onCancel?: () => void;
  showActions?: boolean;
  className?: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSave,
  onCancel,
  showActions = true,
  className = ''
}) => {
  const {
    profile,
    profileLoading,
    saveProfile,
    validationErrors,
    isSaving,
    saveStatus,
    clearValidationErrors,
    getCompletionPercentage
  } = useProfile();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'France',
    date_of_birth: '',
    nationality: 'Française',
    linkedin: '',
    website: '',
    profession: '',
    company: ''
  });

  // Charger les données du profil dans le formulaire
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        postal_code: profile.postal_code || '',
        city: profile.city || '',
        country: profile.country || 'France',
        date_of_birth: profile.date_of_birth || '',
        nationality: profile.nationality || 'Française',
        linkedin: profile.linkedin || '',
        website: profile.website || '',
        profession: profile.profession || '',
        company: profile.company || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      clearValidationErrors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await saveProfile(formData);
    
    if (result.success && onSave && 'data' in result && result.data) {
      onSave(result.data as UserProfile);
    }
  };

  const completionPercentage = getCompletionPercentage();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <span className="ml-3 text-gray-600">Chargement du profil...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Indicateur de progression */}
      <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Profil complété à {completionPercentage}%</h3>
          <div className="text-sm text-gray-600">{completionPercentage}/100</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-violet-600 to-pink-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations personnelles */}
        <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200/30">
          <h4 className="font-semibold text-gray-900 mb-8 flex items-center space-x-2 ">
            <User className="w-5 h-5 text-violet-600" />
            <span>Informations personnelles</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Prénom"
              value={formData.first_name || ''}
              onChange={(value) => handleInputChange('first_name', value)}
              placeholder="Jean"
              required
              icon={<User className="w-4 h-4" />}
            />
            {validationErrors.first_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.first_name}</span>
              </p>
            )}

            <InputField
              label="Nom"
              value={formData.last_name || ''}
              onChange={(value) => handleInputChange('last_name', value)}
              placeholder="Dupont"
              required
              icon={<User className="w-4 h-4" />}
            />
            {validationErrors.last_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.last_name}</span>
              </p>
            )}

            <InputField
              label="Email"
              value={formData.email || ''}
              onChange={(value) => handleInputChange('email', value)}
              type="email"
              placeholder="jean.dupont@email.com"
              required
              icon={<Mail className="w-4 h-4" />}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.email}</span>
              </p>
            )}

            <PhoneField
              label="Téléphone"
              value={formData.phone || ''}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="06 12 34 56 78"
            />
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.phone}</span>
              </p>
            )}

            <DateField
              label="Date de naissance"
              value={formData.date_of_birth || ''}
              onChange={(value) => handleInputChange('date_of_birth', value)}
              placeholder="JJ/MM/AAAA"
            />
            {validationErrors.date_of_birth && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.date_of_birth}</span>
              </p>
            )}

            <CountryField
              label="Nationalité"
              value={formData.nationality || 'Française'}
              onChange={(value) => handleInputChange('nationality', value)}
              placeholder="Sélectionner une nationalité"
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/30">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Adresse</span>
          </h4>
          
          <div className="space-y-6">
            <LocationField
              label="Adresse complète"
              value={formData.address || ''}
              onChange={(value) => handleInputChange('address', value)}
              placeholder="123 Rue de la République"
              showCoordinates={false}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PostalCodeField
                label="Code postal"
                value={formData.postal_code || ''}
                onChange={(value) => handleInputChange('postal_code', value)}
                placeholder="75001"
                country={formData.country || 'France'}
              />
              {validationErrors.postal_code && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationErrors.postal_code}</span>
                </p>
              )}

              <LocationField
                label="Ville"
                value={formData.city || ''}
                onChange={(value) => handleInputChange('city', value)}
                placeholder="Paris"
              />

              <CountryField
                label="Pays"
                value={formData.country || 'France'}
                onChange={(value) => handleInputChange('country', value)}
                placeholder="Sélectionner un pays"
              />
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/30">
          <h4 className="font-semibold text-gray-900 mb-8 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>Informations professionnelles</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Profession actuelle"
              value={formData.profession || ''}
              onChange={(value) => handleInputChange('profession', value)}
              placeholder="Développeur Full Stack"
              icon={<Briefcase className="w-4 h-4" />}
            />

            <InputField
              label="Entreprise actuelle"
              value={formData.company || ''}
              onChange={(value) => handleInputChange('company', value)}
              placeholder="Tech Solutions SARL"
              icon={<Building className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Liens et réseaux sociaux */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/30 ">
          <h4 className="font-semibold text-gray-900 mb-8 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-purple-600" />
            <span>Liens et réseaux sociaux</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SocialField
              label="Profil LinkedIn"
              value={formData.linkedin || ''}
              onChange={(value) => handleInputChange('linkedin', value)}
              platform="linkedin"
              placeholder="jean-dupont"
            />
            {validationErrors.linkedin && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.linkedin}</span>
              </p>
            )}

            <SocialField
              label="Site web / Portfolio"
              value={formData.website || ''}
              onChange={(value) => handleInputChange('website', value)}
              platform="website"
              placeholder="https://jean-dupont.dev"
            />
            {validationErrors.website && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 md:col-span-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationErrors.website}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-4 pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 ${
                saveStatus === 'success'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  : saveStatus === 'error'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                  : 'bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-700 hover:to-pink-700'
              } ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Profil sauvegardé ✓</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Erreur de sauvegarde</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder le profil</span>
                </>
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
              >
                Annuler
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
