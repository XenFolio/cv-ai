import React from 'react';
import { X, Euro, Clock, MapPin, Briefcase, Filter } from 'lucide-react';
import { JobSearchFilters, JobOffer } from '../../types/jobs';

interface JobFiltersProps {
  filters: JobSearchFilters;
  onChange: (filters: Partial<JobSearchFilters>) => void;
  onApply: () => void;
  onClose: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onClose
}) => {
  const contractTypes: JobOffer['contractType'][] = ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'];
  const experienceLevels: JobOffer['experience'][] = ['Débutant', 'Junior', 'Confirmé', 'Senior', 'Expert'];
  const sources: JobOffer['source'][] = ['indeed', 'linkedin', 'welcometothejungle', 'apec', 'pole-emploi'];
  const publishedOptions = [
    { value: 1, label: 'Aujourd\'hui' },
    { value: 3, label: '3 derniers jours' },
    { value: 7, label: 'Cette semaine' },
    { value: 14, label: '2 dernières semaines' },
    { value: 30, label: 'Ce mois' }
  ];

  const handleContractTypeChange = (contractType: JobOffer['contractType'], checked: boolean) => {
    const current = filters.contractType || [];
    const updated = checked
      ? [...current, contractType]
      : current.filter(type => type !== contractType);
    onChange({ contractType: updated });
  };

  const handleExperienceChange = (experience: JobOffer['experience'], checked: boolean) => {
    const current = filters.experience || [];
    const updated = checked
      ? [...current, experience]
      : current.filter(exp => exp !== experience);
    onChange({ experience: updated });
  };

  const handleSourceChange = (source: JobOffer['source'], checked: boolean) => {
    const current = filters.source || [];
    const updated = checked
      ? [...current, source]
      : current.filter(src => src !== source);
    onChange({ source: updated });
  };

  const clearAllFilters = () => {
    onChange({
      contractType: [],
      experience: [],
      source: [],
      remote: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      publishedSince: 30
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.contractType?.length) count++;
    if (filters.experience?.length) count++;
    if (filters.source?.length) count++;
    if (filters.remote !== undefined) count++;
    if (filters.salaryMin || filters.salaryMax) count++;
    if (filters.publishedSince && filters.publishedSince !== 30) count++;
    return count;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/30 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Filtres avancés
          </h3>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 bg-violet-100 text-violet-600 rounded-full text-xs">
              {getActiveFiltersCount()} actifs
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Tout effacer
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Type de contrat */}
        <div>
          <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
            <Briefcase className="w-4 h-4" />
            Type de contrat
          </h4>
          <div className="space-y-2">
            {contractTypes.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.contractType?.includes(type) || false}
                  onChange={(e) => handleContractTypeChange(type, e.target.checked)}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Niveau d'expérience */}
        <div>
          <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
            <Clock className="w-4 h-4" />
            Expérience
          </h4>
          <div className="space-y-2">
            {experienceLevels.map(level => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.experience?.includes(level) || false}
                  onChange={(e) => handleExperienceChange(level, e.target.checked)}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salaire */}
        <div>
          <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
            <Euro className="w-4 h-4" />
            Salaire (€/an)
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Minimum</label>
              <input
                type="number"
                placeholder="30000"
                value={filters.salaryMin || ''}
                onChange={(e) => onChange({ salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Maximum</label>
              <input
                type="number"
                placeholder="80000"
                value={filters.salaryMax || ''}
                onChange={(e) => onChange({ salaryMax: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Date de publication */}
        <div>
          <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
            <Clock className="w-4 h-4" />
            Publié depuis
          </h4>
          <select
            value={filters.publishedSince || 30}
            onChange={(e) => onChange({ publishedSince: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          >
            {publishedOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Télétravail */}
        <div>
          <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
            <MapPin className="w-4 h-4" />
            Modalités
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.remote || false}
              onChange={(e) => onChange({ remote: e.target.checked })}
              className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">Télétravail possible</span>
          </label>
        </div>

        {/* Sources */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Sources</h4>
          <div className="space-y-2">
            {sources.map(source => (
              <label key={source} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.source?.includes(source) || false}
                  onChange={(e) => handleSourceChange(source, e.target.checked)}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700 capitalize">{source}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onApply}
          className="px-6 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-lg hover:from-violet-600 hover:to-pink-600 transition-all duration-200"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
};
