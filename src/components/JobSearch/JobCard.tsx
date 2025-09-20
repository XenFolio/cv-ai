import React, { useState } from 'react';
import { 
  MapPin, 
  Euro,
  ExternalLink, 
  Building, 
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2
} from 'lucide-react';
import { JobOffer } from '../../types/jobs';

interface JobCardProps {
  job: JobOffer;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Formatage de la date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR');
  };

  // Formatage du salaire
  const formatSalary = (salary: JobOffer['salary']) => {
    if (!salary) return null;
    
    const { min, max, currency, period } = salary;
    const periodText = period === 'year' ? '/an' : period === 'month' ? '/mois' : '/h';
    
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}${periodText}`;
    }
    if (min) {
      return `À partir de ${min.toLocaleString()} ${currency}${periodText}`;
    }
    if (max) {
      return `Jusqu'à ${max.toLocaleString()} ${currency}${periodText}`;
    }
    return null;
  };

  // Couleur du badge selon le type de contrat
  const getContractBadgeColor = (contractType: JobOffer['contractType']) => {
    const colors = {
      'CDI': 'bg-green-100 text-green-700',
      'CDD': 'bg-blue-100 text-blue-700',
      'Stage': 'bg-purple-100 text-purple-700',
      'Freelance': 'bg-orange-100 text-orange-700',
      'Alternance': 'bg-pink-100 text-pink-700'
    };
    return colors[contractType] || 'bg-gray-100 text-gray-700';
  };

  // Couleur du badge selon la source
  const getSourceBadgeColor = (source: JobOffer['source']) => {
    const colors = {
      'indeed': 'bg-blue-100 text-blue-700',
      'linkedin': 'bg-blue-100 text-blue-700',
      'welcometothejungle': 'bg-green-100 text-green-700',
      'apec': 'bg-red-100 text-red-700',
      'pole-emploi': 'bg-yellow-100 text-yellow-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  // Gestion de la sauvegarde
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    // TODO: Implémenter la sauvegarde dans le localStorage ou une base de données
  };

  // Gestion du partage
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `${job.title} chez ${job.company} - ${job.location}`,
          url: job.url
        });
      } catch (err) {
        // Fallback si le partage échoue
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(job.url);
    // TODO: Afficher une notification de succès
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header de la carte */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {job.companyLogo && (
                <img 
                  src={job.companyLogo} 
                  alt={`Logo ${job.company}`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-violet-600 transition-colors">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-violet-100 text-violet-600' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informations principales */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(job.publishedAt)}</span>
          </div>
          
          {job.salary && (
            <div className="flex items-center gap-1">
              <Euro className="w-4 h-4" />
              <span>{formatSalary(job.salary)}</span>
            </div>
          )}
          
          {job.remote && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              Télétravail
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs ${getContractBadgeColor(job.contractType)}`}>
            {job.contractType}
          </span>
          
          <span className={`px-2 py-1 rounded-full text-xs ${getSourceBadgeColor(job.source)}`}>
            {job.source}
          </span>
          
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {job.experience}
          </span>
        </div>

        {/* Tags */}
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {job.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-violet-50 text-violet-600 rounded text-xs flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs">
                +{job.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description courte */}
        <p className="text-gray-700 text-sm line-clamp-2 mb-4">
          {job.description.length > 150 
            ? `${job.description.substring(0, 150)}...`
            : job.description
          }
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors text-sm"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Voir plus
              </>
            )}
          </button>

          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-lg hover:from-violet-600 hover:to-pink-600 transition-all duration-200 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Postuler
          </a>
        </div>
      </div>

      {/* Contenu étendu */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4 space-y-4">
            {/* Description complète */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description du poste</h4>
              <div className="text-gray-700 text-sm whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Exigences */}
            {job.requirements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Exigences</h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-violet-500 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Publié le</span>
                <p className="text-sm text-gray-900">{job.publishedAt.toLocaleDateString('fr-FR')}</p>
              </div>
              
              {job.applicationCount && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Candidatures</span>
                  <p className="text-sm text-gray-900">{job.applicationCount} candidats</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
