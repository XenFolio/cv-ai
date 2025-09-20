import React from 'react';

interface SectionConfig {
  id: string;
  name: string;
  component: string;
  visible: boolean;
  layer?: number;
  order?: number;
  width?: "full" | "half";
}

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  image: string;
  category: string;
  atsScore: number;
  theme: { primaryColor: string; font: string };
  layoutColumns: number;
  sectionTitles: {
    profileTitle: string;
    experienceTitle: string;
    educationTitle: string;
    skillsTitle: string;
    languagesTitle: string;
    contactTitle: string;
  };
  sectionsOrder: SectionConfig[];
}

interface CVTemplateCarouselProps {
  templates: Template[];
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string, templateName: string) => void;
  onDownloadTemplate: (template: Template) => void;
}

export const CVTemplateCarousel: React.FC<CVTemplateCarouselProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onDownloadTemplate
}) => {
  return (
    <div className="w-full bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 rounded-xl border border-violet-200 shadow-lg overflow-hidden">
      {/* Header du carousel avec contrôles */}
      <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-bold">Modèles de CV</h3>
          </div>

          {/* Contrôles de navigation du carousel */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const container = document.querySelector('.carousel-container');
                if (container) {
                  container.scrollBy({ top: -200, behavior: 'smooth' });
                }
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
              title="Modèle précédent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                const container = document.querySelector('.carousel-container');
                if (container) {
                  container.scrollBy({ top: 200, behavior: 'smooth' });
                }
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
              title="Modèle suivant"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm opacity-90 mt-2 text-center">Choisissez votre style préféré</p>
      </div>

      {/* Carousel vertical avec scroll personnalisé */}
      <div className="carousel-container h-[calc(100vh)] overflow-y-auto scrollbar-thin scrollbar-thumb-violet-300 scrollbar-track-violet-100 hover:scrollbar-thumb-violet-400 p-3 space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            title={`Template ${template.name} - ${template.description}`}
            onClick={() => onTemplateSelect(template.id, template.name)}
            className={`
              group relative rounded-xl border-2 shadow-lg transition-all duration-500 ease-out cursor-pointer overflow-hidden
              transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl
              ${selectedTemplate === template.id
                ? 'border-violet-500 ring-4 ring-violet-200 bg-gradient-to-br from-violet-100 to-pink-100'
                : 'border-gray-200 bg-white hover:border-violet-500 hover:ring-2 hover:ring-violet-300'}
            `}
            style={{
              backgroundImage: `url(${template.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              aspectRatio: '1 / 1.414'
            }}
          >
            {/* Overlay avec effet glassmorphism - disparaît au hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-transparent backdrop-blur-[1px] group-hover:opacity-0 transition-all duration-500 z-0"></div>

            {/* Badge ATS Score */}
            <div className="absolute top-2 right-2 z-20">
              <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-md ${
                template.atsScore >= 90 ? 'bg-green-500 text-white' :
                template.atsScore >= 80 ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                ATS {template.atsScore}%
              </div>
            </div>

            {/* Badge de sélection */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 left-2 z-20">
                <div className="bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full p-1.5 shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* Contenu principal */}
            <div className="relative z-10 p-4 h-full flex flex-col justify-between">
              {/* Bandeau en travers sur toute la largeur */}
              <div className="absolute top-6 left-0 right-0 z-20 transform -rotate-12 origin-left">
                <div className={`py-2 px-6 shadow-lg ${
                  template.name === "Minimaliste" ? "bg-gradient-to-r from-gray-600 to-gray-800" :
                  template.name === "Créatif" ? "bg-gradient-to-r from-pink-500 to-rose-600" :
                  template.name === "Corporate" ? "bg-gradient-to-r from-violet-600 to-purple-700" :
                  template.name === "Moderne Coloré" ? "bg-gradient-to-r from-purple-500 to-indigo-600" :
                  template.name === "Élégant B&W" ? "bg-gradient-to-r from-slate-700 to-black" :
                  template.name === "Émeraude" ? "bg-gradient-to-r from-emerald-500 to-green-600" :
                  "bg-gradient-to-r from-violet-600 to-purple-700"
                }`}>
                  <h4 className="text-lg font-bold text-white drop-shadow-lg">
                    {template.name}
                  </h4>
                </div>
              </div>

              {/* En-tête avec catégorie */}
              <div className="text-center mt-12">
                <span className="inline-block px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">
                  {template.category}
                </span>
              </div>

              {/* Actions en bas */}
              <div className="flex justify-center gap-2">
                <button
                  className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 relative z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadTemplate(template);
                  }}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger
                </button>
              </div>
            </div>

            {/* Bordure violette animée au hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 pointer-events-none">
              <div className="absolute inset-0 rounded-xl border-2 border-violet-400 shadow-lg shadow-violet-400/50"></div>
              <div className="absolute inset-1 rounded-xl border border-violet-300 shadow-inner"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
