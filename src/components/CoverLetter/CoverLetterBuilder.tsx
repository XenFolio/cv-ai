import React, { useState, useEffect } from 'react';
import { CVData, ExperienceItem, PersonalSection, SkillsSection } from '../../types/cv';
import {
  FileText,
  Save,
  Eye,
  Edit3,
  Sparkles,
  Target,
  Briefcase,
  Building,
} from 'lucide-react';
import { useOpenAI } from '../../hooks/useOpenAI';
import { useProfile } from '../../hooks/useProfile';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface CoverLetterData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  companyInfo: {
    companyName: string;
    hiringManager: string;
    companyAddress: string;
    position: string;
  };
  content: {
    introduction: string;
    body: string;
    conclusion: string;
    skillsHighlight: string[];
  };
  template: string;
}

interface CoverLetterBuilderProps {
  cvData?: CVData;
  jobDescription?: string;
  onSave?: (data: CoverLetterData) => void;
}

const CoverLetterBuilder: React.FC<CoverLetterBuilderProps> = ({
  cvData,
  jobDescription,
  onSave
}) => {
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: ''
    },
    companyInfo: {
      companyName: '',
      hiringManager: '',
      companyAddress: '',
      position: ''
    },
    content: {
      introduction: '',
      body: '',
      conclusion: '',
      skillsHighlight: []
    },
    template: 'professional'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');

  const { generateCoverLetter } = useOpenAI();
  const { profile, getFullName, profileLoading, loadProfile } = useProfile();

  // Debug: Vérifier l'état de l'authentification au montage
  useEffect(() => {
    console.log('CoverLetterBuilder - Initialisation du composant');
    console.log('CoverLetterBuilder - profileLoading initial:', profileLoading);
    console.log('CoverLetterBuilder - profil initial:', profile);
  }, [profile, profileLoading]);

  // Initialize with CV data if available
  useEffect(() => {
    if (cvData) {
      const personal = (cvData.sections.find((s) => s.type === 'personal')?.content as PersonalSection) || {};
      setCoverLetterData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          name: personal.name || '',
          title: personal.title || '',
          email: personal.email || '',
          phone: personal.phone || '',
          location: personal.location || '',
          linkedin: personal.linkedin || '' // linkedin now in PersonalSection type
        }
      }));
    }
  }, [cvData]);

  // Compléter avec les infos du profil si elles sont manquantes
  useEffect(() => {
    console.log('CoverLetterBuilder - profileLoading:', profileLoading);
    console.log('CoverLetterBuilder - Profil:', profile);
    console.log('CoverLetterBuilder - getFullName():', getFullName());

    // Wait until profile is loaded before using it
    if (!profileLoading && profile) {
      const profileName = getFullName() || '';
      const profileEmail = profile.email || '';
      const profilePhone = profile.phone || '';
      const profileLocation = [profile.city, profile.postal_code, profile.country].filter(Boolean).join(', ') || '';
      const profileTitle = profile.profession || '';
      const profileLinkedin = profile.linkedin || '';

      console.log('CoverLetterBuilder - Infos profil extraites:', {
        profileName,
        profileEmail,
        profilePhone,
        profileLocation,
        profileTitle,
        profileLinkedin
      });

      setCoverLetterData(prev => {
        console.log('CoverLetterBuilder - Avant mise à jour:', prev.personalInfo);

        const updatedData = {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            // Utiliser les infos du profil comme fallback
            name: prev.personalInfo.name || profileName,
            email: prev.personalInfo.email || profileEmail,
            title: prev.personalInfo.title || profileTitle,
            location: prev.personalInfo.location || profileLocation,
            phone: prev.personalInfo.phone || profilePhone,
            linkedin: prev.personalInfo.linkedin || profileLinkedin
          }
        };

        console.log('CoverLetterBuilder - Après mise à jour:', updatedData.personalInfo);
        return updatedData;
      });
    } else if (profileLoading) {
      console.log('CoverLetterBuilder - Profil en cours de chargement...');
    } else {
      console.log('CoverLetterBuilder - Aucun profil disponible (profile null)');
    }
  }, [profile, getFullName, profileLoading]);

  const templates = [
    {
      id: 'professional',
      name: 'Professionnel',
      description: 'Formel et structuré, idéal pour entreprises traditionnelles',
      preview: 'border-l-4 border-blue-500',
      colorScheme: 'text-blue-600'
    },
    {
      id: 'modern',
      name: 'Moderne',
      description: 'Design épuré avec touche personnelle',
      preview: 'border-l-4 border-purple-500',
      colorScheme: 'text-purple-600'
    },
    {
      id: 'creative',
      name: 'Créatif',
      description: 'Style dynamique pour industries créatives',
      preview: 'border-l-4 border-pink-500',
      colorScheme: 'text-pink-600'
    },
    {
      id: 'executive',
      name: 'Exécutif',
      description: 'Premium et sophistiqué pour postes de direction',
      preview: 'border-l-4 border-gray-700',
      colorScheme: 'text-gray-700'
    }
  ];

  const generateAILetter = async () => {
    if (!coverLetterData.companyInfo.companyName || !coverLetterData.companyInfo.position) {
      alert('Veuillez remplir les informations de l\'entreprise avant de générer la lettre');
      return;
    }

    setIsGenerating(true);
    try {
      const skillsSection = (cvData?.sections.find((s) => s.type === 'skills')?.content as SkillsSection) || {};
      const skills = [
        ...(skillsSection.technical || []),
        ...(skillsSection.soft || [])
      ];

      const experience = (cvData?.sections.find((s) => s.type === 'experience')?.content as ExperienceItem[]) || [];

      const cvContent = `
        Candidat: ${coverLetterData.personalInfo.name}
        Titre: ${coverLetterData.personalInfo.title}

        Compétences: ${skills.slice(0, 5).join(', ')}
        Expériences: ${experience.slice(0, 2).map((exp: ExperienceItem) => exp.title + ' - ' + (exp.company || '')).join(', ')}
      `.trim();

      const companyInfo = `${coverLetterData.companyInfo.companyName} - ${coverLetterData.companyInfo.hiringManager || 'Responsable du recrutement'}`;

      const generatedContent = await generateCoverLetter({
        cvContent,
        jobDescription: jobDescription || '',
        companyInfo,
        tone: selectedTemplate,
        profileInfo: {
          name: coverLetterData.personalInfo.name,
          title: coverLetterData.personalInfo.title,
          email: coverLetterData.personalInfo.email,
          phone: coverLetterData.personalInfo.phone,
          location: coverLetterData.personalInfo.location,
          linkedin: coverLetterData.personalInfo.linkedin
        }
      });

      if (generatedContent) {
        setCoverLetterData(prev => ({
          ...prev,
          content: {
            ...prev.content,
            introduction: generatedContent.introduction || '',
            body: generatedContent.body || '',
            conclusion: generatedContent.conclusion || '',
            skillsHighlight: generatedContent.skillsHighlight || skills.slice(0, 3)
          }
        }));
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Erreur lors de la génération de la lettre. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value }
    }));
  };

  const handleContentChange = (field: string, value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      content: { ...prev.content, [field]: value }
    }));
  };

  const handleSave = () => {
    const finalData = {
      ...coverLetterData,
      template: selectedTemplate
    };
    onSave?.(finalData);
  };

  const handleDebugProfileReload = async () => {
    console.log('CoverLetterBuilder - Rechargement manuel du profil demandé');
    try {
      await loadProfile();
      console.log('CoverLetterBuilder - Profil rechargé avec succès');
    } catch (error) {
      console.error('CoverLetterBuilder - Erreur lors du rechargement du profil:', error);
    }
  };

  const renderPersonalInfoForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>

      {/* Debug Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-yellow-800">Debug Profile</span>
          <div className="flex space-x-2">
            <button
              onClick={handleDebugProfileReload}
              className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
            >
              Recharger Profil
            </button>
          </div>
        </div>
        <div className="text-xs text-yellow-700 space-y-1">
          <div>Profile Loading: {profileLoading ? 'Oui' : 'Non'}</div>
          <div>Profile Available: {profile ? 'Oui' : 'Non'}</div>
          <div>Profile Name: {profile ? getFullName() : 'N/A'}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
          <input
            type="text"
            value={coverLetterData.personalInfo.name}
            onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre professionnel</label>
          <input
            type="text"
            value={coverLetterData.personalInfo.title}
            onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={coverLetterData.personalInfo.email}
            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            type="tel"
            value={coverLetterData.personalInfo.phone}
            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
          <input
            type="text"
            value={coverLetterData.personalInfo.location}
            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <input
            type="url"
            value={coverLetterData.personalInfo.linkedin}
            onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderCompanyInfoForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Entreprise</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
          <input
            type="text"
            value={coverLetterData.companyInfo.companyName}
            onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poste visé *</label>
          <input
            type="text"
            value={coverLetterData.companyInfo.position}
            onChange={(e) => handleCompanyInfoChange('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable du recrutement</label>
          <input
            type="text"
            value={coverLetterData.companyInfo.hiringManager}
            onChange={(e) => handleCompanyInfoChange('hiringManager', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Nom du contact si connu"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de l'entreprise</label>
          <input
            type="text"
            value={coverLetterData.companyInfo.companyAddress}
            onChange={(e) => handleCompanyInfoChange('companyAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderContentForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Contenu de la lettre</h3>
        <button
          onClick={generateAILetter}
          disabled={isGenerating || !coverLetterData.companyInfo.companyName}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Génération...' : 'Générer avec IA'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
          <textarea
            value={coverLetterData.content.introduction}
            onChange={(e) => handleContentChange('introduction', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Commencez par une accroche percutante..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Corps du texte</label>
          <textarea
            value={coverLetterData.content.body}
            onChange={(e) => handleContentChange('body', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Développez vos motivations et qualifications..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion</label>
          <textarea
            value={coverLetterData.content.conclusion}
            onChange={(e) => handleContentChange('conclusion', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Terminez par un appel à l'action..."
          />
        </div>

        {coverLetterData.content.skillsHighlight.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compétences mises en avant</label>
            <div className="flex flex-wrap gap-2">
              {coverLetterData.content.skillsHighlight.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choisissez un template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-4 h-4 ${template.preview}`}></div>
              <h4 className={`font-semibold ${template.colorScheme}`}>{template.name}</h4>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
      <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
        <div className="space-y-4 text-sm">
          {/* Header avec coordonnées complètes */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              {/* Coordonnées du candidat (gauche) */}
              <div className="text-left space-y-1">
                <div className="font-semibold">{coverLetterData.personalInfo.name || 'Votre nom'}</div>
                <div>{coverLetterData.personalInfo.title || 'Votre profession'}</div>
                <div>{coverLetterData.personalInfo.email || 'email@example.com'}</div>
                <div>{coverLetterData.personalInfo.phone || 'Votre téléphone'}</div>
                <div>{coverLetterData.personalInfo.location || 'Votre ville'}</div>
                {coverLetterData.personalInfo.linkedin && (
                  <div>{coverLetterData.personalInfo.linkedin}</div>
                )}
              </div>

              {/* Coordonnées de l'entreprise (droite) */}
              <div className="text-right space-y-1">
                <div className="font-semibold">{coverLetterData.companyInfo.companyName || 'Nom de l\'entreprise'}</div>
                {coverLetterData.companyInfo.hiringManager && (
                  <div>À l'attention de {coverLetterData.companyInfo.hiringManager}</div>
                )}
                <div>{coverLetterData.companyInfo.companyAddress || 'Adresse de l\'entreprise'}</div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="text-gray-600">
            {new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>

          {/* Company Info (si pas déjà affiché dans l'en-tête) */}
          {(!coverLetterData.personalInfo.name || !coverLetterData.companyInfo.companyName) && (
            <div>
              <div className="font-semibold">
                {coverLetterData.companyInfo.hiringManager || 'Responsable du recrutement'}
              </div>
              <div>{coverLetterData.companyInfo.companyName}</div>
              <div>{coverLetterData.companyInfo.companyAddress}</div>
            </div>
          )}

          {/* Subject */}
          <div className="font-semibold">
            Objet: Candidature au poste de {coverLetterData.companyInfo.position}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {coverLetterData.content.introduction && (
              <p>{coverLetterData.content.introduction}</p>
            )}
            {coverLetterData.content.body && (
              <p>{coverLetterData.content.body}</p>
            )}
            {coverLetterData.content.conclusion && (
              <p>{coverLetterData.content.conclusion}</p>
            )}
          </div>

          {/* Closing */}
          <div className="pt-4">
            <div>Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</div>
            <div className="mt-8">
              <div>{coverLetterData.personalInfo.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card variant="elevated" className="p-4">
          <nav className="space-y-2">
            {[
              { id: 'personal', label: 'Infos personnelles', icon: Briefcase },
              { id: 'company', label: 'Entreprise', icon: Building },
              { id: 'content', label: 'Contenu', icon: Edit3 },
              { id: 'template', label: 'Template', icon: Target },
              { id: 'preview', label: 'Aperçu', icon: Eye }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2">
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              <span>Lettre de Motivation IA</span>
            </h2>
            <Button onClick={handleSave} className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </Button>
          </div>

          <div className="space-y-6">
            {activeSection === 'personal' && renderPersonalInfoForm()}
            {activeSection === 'company' && renderCompanyInfoForm()}
            {activeSection === 'content' && renderContentForm()}
            {activeSection === 'template' && renderTemplateSelection()}
            {activeSection === 'preview' && renderPreview()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CoverLetterBuilder;
