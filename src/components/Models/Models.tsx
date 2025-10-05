import React, { useState } from 'react';
import { Download, Star, Eye, Copy, Sparkles, Award, TrendingUp } from 'lucide-react';

interface CVModel {
  id: string;
  name: string;
  category: string;
  rating: number;
  downloads: string;
  preview: string;
  tags: string[];
  description: string;
  atsScore: number;
  aiOptimized: boolean;
}

export const Models: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const models: CVModel[] = [
    {
      id: '1',
      name: 'CV Tech Senior',
      category: 'Développement',
      rating: 4.9,
      downloads: '2.3k',
      preview: 'bg-gradient-to-br from-blue-100 to-indigo-100',
      tags: ['Senior', 'Full Stack', 'ATS Optimisé'],
      description: 'Modèle professionnel pour développeurs expérimentés avec compétences techniques avancées.',
      atsScore: 96,
      aiOptimized: true
    },
    {
      id: '2',
      name: 'CV Marketing Digital',
      category: 'Marketing',
      rating: 4.8,
      downloads: '1.8k',
      preview: 'bg-gradient-to-br from-pink-100 to-rose-100',
      tags: ['Marketing', 'Digital', 'Créatif'],
      description: 'Template créatif et moderne pour les professionnels du marketing digital et des réseaux sociaux.',
      atsScore: 92,
      aiOptimized: true
    },
    {
      id: '3',
      name: 'CV Executive Premium',
      category: 'Management',
      rating: 4.9,
      downloads: '1.2k',
      preview: 'bg-gradient-to-br from-gray-100 to-slate-100',
      tags: ['Executive', 'Leadership', 'Premium'],
      description: 'Modèle haut de gamme pour cadres dirigeants avec mise en valeur des compétences en leadership.',
      atsScore: 94,
      aiOptimized: true
    },
    {
      id: '4',
      name: 'CV Designer UX/UI',
      category: 'Design',
      rating: 4.7,
      downloads: '3.1k',
      preview: 'bg-gradient-to-br from-violet-100 to-purple-100',
      tags: ['UX/UI', 'Portfolio', 'Créatif'],
      description: 'Design moderne et visuellement attrayant pour concepteurs UX/UI avec mise en avant du portfolio.',
      atsScore: 89,
      aiOptimized: true
    },
    {
      id: '5',
      name: 'CV Data Scientist',
      category: 'Data',
      rating: 4.8,
      downloads: '987',
      preview: 'bg-gradient-to-br from-emerald-100 to-teal-100',
      tags: ['Data Science', 'Analytics', 'Python'],
      description: 'Modèle technique idéal pour data scientists avec emphasis sur les compétences analytiques et outils modernes.',
      atsScore: 95,
      aiOptimized: true
    },
    {
      id: '6',
      name: 'CV Finance Analyst',
      category: 'Finance',
      rating: 4.6,
      downloads: '765',
      preview: 'bg-gradient-to-br from-amber-100 to-orange-100',
      tags: ['Finance', 'Corporate', 'Analytique'],
      description: 'Modèle traditionnel et rigoureux pour professionnels de la finance avec accent sur l\'analyse et la précision.',
      atsScore: 91,
      aiOptimized: false
    }
  ];

  const categories = ['Tous', 'Développement', 'Marketing', 'Design', 'Management', 'Data', 'Finance'];

  const filteredModels = selectedCategory === 'Tous' 
    ? models 
    : models.filter(model => model.category === selectedCategory);

  const topModels = models.filter(model => model.rating >= 4.8).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="heading-gradient">
          Modèles de CV Premium
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Collection exclusive de modèles conçus par des experts RH et optimisés par notre IA pour maximiser votre taux de passage ATS
        </p>
      </div>

      {/* Featured Models */}
      <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 rounded-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-3 flex items-center justify-center space-x-2">
              <TrendingUp className="w-6 h-6" />
              <span>Modèles les Plus Populaires</span>
            </h3>
            <p className="text-white/90">
              Les templates préférés de notre communauté avec les meilleurs scores ATS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topModels.map((model) => (
              <div key={model.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="w-16 h-20 bg-white/20 rounded-lg mx-auto mb-3 relative">
                  <div className="absolute inset-2 bg-white/30 rounded-sm" />
                  <div className="absolute top-3 left-3 right-3 space-y-1">
                    <div className="h-0.5 bg-white/60 rounded" />
                    <div className="h-0.5 bg-white/40 rounded w-3/4" />
                    <div className="h-0.5 bg-white/40 rounded w-1/2" />
                  </div>
                </div>
                
                <h4 className="font-semibold text-sm mb-1">{model.name}</h4>
                <div className="flex items-center justify-center space-x-1 text-xs">
                  <Star className="w-3 h-3 text-yellow-300 fill-current" />
                  <span>{model.rating}</span>
                  <span className="text-white/60">•</span>
                  <span>{model.downloads} DL</span>
                </div>
                
                <div className="mt-3 flex items-center justify-center space-x-1 text-xs">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span>{model.atsScore}% ATS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-white/70 text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-gray-200/30 hover:scale-105'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/30 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
          >
            {/* Preview */}
            <div className={`h-56 ${model.preview} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              
              {/* AI Badge */}
              {model.aiOptimized && (
                <div className="absolute top-4 left-4">
                  <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>IA Optimisé</span>
                  </div>
                </div>
              )}

              {/* ATS Score */}
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    model.atsScore >= 95 ? 'bg-emerald-500' : 
                    model.atsScore >= 90 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-xs font-bold text-gray-800">{model.atsScore}%</span>
                </div>
              </div>
              
              {/* Mock CV Content */}
              <div className="absolute top-16 left-6 right-6">
                <div className="w-24 h-3 bg-white/60 rounded-full mb-2" />
                <div className="w-20 h-2 bg-white/40 rounded-full mb-6" />
                
                <div className="space-y-3">
                  <div>
                    <div className="w-16 h-2 bg-white/50 rounded-full mb-2" />
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-white/50 rounded-full" />
                      <div className="w-4/5 h-1 bg-white/40 rounded-full" />
                      <div className="w-3/5 h-1 bg-white/40 rounded-full" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="w-20 h-2 bg-white/50 rounded-full mb-2" />
                    <div className="grid grid-cols-3 gap-1">
                      <div className="h-1 bg-white/40 rounded-full" />
                      <div className="h-1 bg-white/40 rounded-full" />
                      <div className="h-1 bg-white/40 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4">
                <button className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors hover:scale-110">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors hover:scale-110">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Model Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900">{model.name}</h4>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{model.rating}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{model.description}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {model.tags.map((tag) => (
                  <span key={tag} className="text-xs font-medium px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Download className="w-3 h-3" />
                  <span>{model.downloads}</span>
                </span>
                
                <span className={`font-semibold ${
                  model.atsScore >= 95 ? 'text-emerald-600' : 
                  model.atsScore >= 90 ? 'text-amber-600' : 'text-orange-600'
                }`}>
                  {model.atsScore}% ATS
                </span>
              </div>
              
              {/* Action Button */}
              <button className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white py-3 rounded-xl text-sm font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Utiliser ce modèle</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Enhancement Banner */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Tous nos modèles sont optimisés par IA
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Chaque template est continuellement amélioré grâce aux données de performance de milliers de candidatures réussies
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600 mb-1">94%</div>
              <p className="text-sm text-gray-600">Taux de passage ATS moyen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 mb-1">2.3x</div>
              <p className="text-sm text-gray-600">Plus de réponses positives</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">48h</div>
              <p className="text-sm text-gray-600">Délai moyen de retour</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
