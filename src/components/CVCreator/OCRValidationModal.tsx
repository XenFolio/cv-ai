/**
 * Modal de validation et correction manuelle des données OCR extraites
 * Permet à l'utilisateur de vérifier et corriger les données avant import
 */
import React, { useState } from 'react';
import { X, Check, AlertTriangle, Edit, Eye, EyeOff, RefreshCw, Wand2 } from 'lucide-react';
import { StructuredCVData, PersonalInfo, Experience, Education, Skills } from '../../services/OCRClassificationService';
import Button from '../UI/Button';

export interface OCRValidationResult {
  data: StructuredCVData;
  needsManualReview: boolean;
  correctionsMade: number;
}

interface OCRValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: StructuredCVData;
  confidence: number;
  issues: Array<{
    field: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  onValidate: (result: OCRValidationResult) => void;
  onRetry?: () => void;
}

interface ValidationSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hasIssues?: boolean;
  confidence?: number;
}

const ValidationSection: React.FC<ValidationSectionProps> = ({
  title,
  icon,
  children,
  hasIssues = false,
  confidence
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-600';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return '';
    if (confidence >= 0.8) return 'Excellente';
    if (confidence >= 0.6) return 'Bonne';
    if (confidence >= 0.4) return 'Moyenne';
    return 'Faible';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
          hasIssues ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
        }`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasIssues ? 'bg-yellow-100' : 'bg-white'}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {confidence && (
              <p className={`text-sm ${getConfidenceColor(confidence)}`}>
                Confiance: {getConfidenceText(confidence)} ({(confidence * 100).toFixed(0)}%)
              </p>
            )}
          </div>
          {hasIssues && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">À vérifier</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {confidence && (
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  confidence >= 0.8 ? 'bg-green-600' :
                  confidence >= 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          )}
          {isCollapsed ? (
            <Eye className="w-5 h-5 text-gray-400" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  hasIssue?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  hasIssue = false
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {hasIssue && <span className="text-yellow-600 ml-2 text-xs">(À vérifier)</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
          hasIssue ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
        }`}
      />
    </div>
  );
};

interface EditableTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hasIssue?: boolean;
}

const EditableTextArea: React.FC<EditableTextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  hasIssue = false
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {hasIssue && <span className="text-yellow-600 ml-2 text-xs">(À vérifier)</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
          hasIssue ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
        }`}
      />
    </div>
  );
};

export const OCRValidationModal: React.FC<OCRValidationModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  confidence,
  issues,
  onValidate,
  onRetry
}) => {
  const [editedData, setEditedData] = useState<StructuredCVData>(extractedData);
  const [correctionsMade, setCorrectionsMade] = useState(0);

  // Réinitialiser les données quand extractedData change
  React.useEffect(() => {
    setEditedData(extractedData);
    setCorrectionsMade(0);
  }, [extractedData]);

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setEditedData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
    setCorrectionsMade(prev => prev + 1);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    setEditedData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
    setCorrectionsMade(prev => prev + 1);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
    setCorrectionsMade(prev => prev + 1);
  };

  const updateSkills = (field: keyof Skills, value: string[]) => {
    setEditedData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value
      }
    }));
    setCorrectionsMade(prev => prev + 1);
  };

  const updateSummary = (value: string) => {
    setEditedData(prev => ({
      ...prev,
      summary: value
    }));
    setCorrectionsMade(prev => prev + 1);
  };

  const hasFieldIssue = (fieldName: string): boolean => {
    return issues.some(issue => issue.field === fieldName);
  };

  const getSectionIssues = (sectionPrefix: string): boolean => {
    return issues.some(issue => issue.field.startsWith(sectionPrefix));
  };

  const handleValidate = () => {
    const result: OCRValidationResult = {
      data: editedData,
      needsManualReview: correctionsMade > 0,
      correctionsMade
    };
    onValidate(result);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Validation des données extraites
                </h2>
                <p className="text-sm text-gray-600">
                  Vérifiez et corrigez les informations détectées avant l'import
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Confiance globale */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Confiance globale:</span>
              <span className={`font-semibold ${
                confidence >= 0.8 ? 'text-green-600' :
                confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {confidence >= 0.8 ? 'Excellente' :
                 confidence >= 0.6 ? 'Bonne' :
                 confidence >= 0.4 ? 'Moyenne' : 'Faible'}
                ({(confidence * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  confidence >= 0.8 ? 'bg-green-600' :
                  confidence >= 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>

          {issues.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {issues.length} problème(s) détecté(s) nécessitant votre attention
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="px-6 py-6 space-y-4">
          {/* Informations personnelles */}
          <ValidationSection
            title="Informations personnelles"
            icon={<Check className="w-5 h-5 text-violet-600" />}
            hasIssues={getSectionIssues('personal')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField
                label="Nom complet"
                value={editedData.personal.name || ''}
                onChange={(value) => updatePersonalInfo('name', value)}
                placeholder="Prénom NOM"
                required
                hasIssue={hasFieldIssue('personal.name')}
              />
              <EditableField
                label="Email"
                value={editedData.personal.email || ''}
                onChange={(value) => updatePersonalInfo('email', value)}
                placeholder="email@exemple.com"
                hasIssue={hasFieldIssue('personal.email')}
              />
              <EditableField
                label="Téléphone"
                value={editedData.personal.phone || ''}
                onChange={(value) => updatePersonalInfo('phone', value)}
                placeholder="06 12 34 56 78"
                hasIssue={hasFieldIssue('personal.phone')}
              />
              <EditableField
                label="Adresse"
                value={editedData.personal.address || ''}
                onChange={(value) => updatePersonalInfo('address', value)}
                placeholder="123 rue de la paix, 75000 Paris"
              />
              <EditableField
                label="LinkedIn"
                value={editedData.personal.linkedin || ''}
                onChange={(value) => updatePersonalInfo('linkedin', value)}
                placeholder="linkedin.com/in/votreprofil"
              />
              <EditableField
                label="Site web"
                value={editedData.personal.website || ''}
                onChange={(value) => updatePersonalInfo('website', value)}
                placeholder="www.votresite.com"
              />
            </div>
          </ValidationSection>

          {/* Résumé professionnel */}
          {editedData.summary && (
            <ValidationSection
              title="Résumé professionnel"
              icon={<Edit className="w-5 h-5 text-blue-600" />}
            >
              <EditableTextArea
                label="Résumé"
                value={editedData.summary}
                onChange={updateSummary}
                rows={4}
                placeholder="Décrivez brièvement votre profil professionnel..."
              />
            </ValidationSection>
          )}

          {/* Expérience professionnelle */}
          {editedData.experience.length > 0 && (
            <ValidationSection
              title={`Expérience professionnelle (${editedData.experience.length})`}
              icon={<Check className="w-5 h-5 text-green-600" />}
              hasIssues={getSectionIssues('experience')}
            >
              <div className="space-y-4">
                {editedData.experience.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EditableField
                        label="Poste occupé"
                        value={exp.position}
                        onChange={(value) => updateExperience(index, 'position', value)}
                        required
                        hasIssue={hasFieldIssue('experience.position')}
                      />
                      <EditableField
                        label="Entreprise"
                        value={exp.company}
                        onChange={(value) => updateExperience(index, 'company', value)}
                        hasIssue={hasFieldIssue('experience.company')}
                      />
                      <EditableField
                        label="Période"
                        value={exp.period}
                        onChange={(value) => updateExperience(index, 'period', value)}
                        placeholder="2020 - 2022"
                        hasIssue={hasFieldIssue('experience.period')}
                      />
                    </div>
                    {exp.description && (
                      <div className="mt-4">
                        <EditableTextArea
                          label="Description"
                          value={exp.description}
                          onChange={(value) => updateExperience(index, 'description', value)}
                          rows={3}
                        />
                      </div>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Technologies utilisées
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ValidationSection>
          )}

          {/* Formation */}
          {editedData.education.length > 0 && (
            <ValidationSection
              title={`Formation (${editedData.education.length})`}
              icon={<Check className="w-5 h-5 text-purple-600" />}
              hasIssues={getSectionIssues('education')}
            >
              <div className="space-y-4">
                {editedData.education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EditableField
                        label="Diplôme"
                        value={edu.degree}
                        onChange={(value) => updateEducation(index, 'degree', value)}
                        required
                        hasIssue={hasFieldIssue('education.degree')}
                      />
                      <EditableField
                        label="Institution"
                        value={edu.institution}
                        onChange={(value) => updateEducation(index, 'institution', value)}
                        hasIssue={hasFieldIssue('education.institution')}
                      />
                      <EditableField
                        label="Période"
                        value={edu.period}
                        onChange={(value) => updateEducation(index, 'period', value)}
                        placeholder="2018 - 2020"
                      />
                    </div>
                    {edu.description && (
                      <div className="mt-4">
                        <EditableTextArea
                          label="Description"
                          value={edu.description}
                          onChange={(value) => updateEducation(index, 'description', value)}
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ValidationSection>
          )}

          {/* Compétences */}
          {(editedData.skills.technical.length > 0 || editedData.skills.soft.length > 0 || editedData.skills.languages.length > 0) && (
            <ValidationSection
              title="Compétences"
              icon={<Check className="w-5 h-5 text-orange-600" />}
              hasIssues={getSectionIssues('skills')}
            >
              <div className="space-y-4">
                {editedData.skills.technical.length > 0 && (
                  <EditableTextArea
                    label="Compétences techniques"
                    value={editedData.skills.technical.join(', ')}
                    onChange={(value) => updateSkills('technical', value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="JavaScript, React, Node.js"
                    rows={2}
                    hasIssue={hasFieldIssue('skills.technical')}
                  />
                )}

                {(editedData.skills.technical.length === 0) && (
                  <EditableTextArea
                    label="Compétences techniques"
                    value=""
                    onChange={(value) => updateSkills('technical', value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="JavaScript, React, Node.js"
                    rows={2}
                    hasIssue={hasFieldIssue('skills.technical')}
                  />
                )}

                {(editedData.skills.soft.length > 0 || editedData.skills.languages.length > 0) && (
                  <>
                    {editedData.skills.soft.length > 0 && (
                      <EditableTextArea
                        label="Compétences personnelles"
                        value={editedData.skills.soft.join(', ')}
                        onChange={(value) => updateSkills('soft', value.split(',').map(s => s.trim()).filter(s => s))}
                        placeholder="Communication, Gestion de projet, Travail en équipe"
                        rows={2}
                        hasIssue={hasFieldIssue('skills.soft')}
                      />
                    )}

                    {(editedData.skills.soft.length === 0) && (
                      <EditableTextArea
                        label="Compétences personnelles"
                        value=""
                        onChange={(value) => updateSkills('soft', value.split(',').map(s => s.trim()).filter(s => s))}
                        placeholder="Communication, Gestion de projet, Travail en équipe"
                        rows={2}
                        hasIssue={hasFieldIssue('skills.soft')}
                      />
                    )}

                    {editedData.skills.languages.length > 0 && (
                      <EditableTextArea
                        label="Langues"
                        value={editedData.skills.languages.join(', ')}
                        onChange={(value) => updateSkills('languages', value.split(',').map(s => s.trim()).filter(s => s))}
                        placeholder="Français (courant), Anglais (courant), Espagnol (intermédiaire)"
                        rows={2}
                        hasIssue={hasFieldIssue('skills.languages')}
                      />
                    )}

                    {(editedData.skills.languages.length === 0) && (
                      <EditableTextArea
                        label="Langues"
                        value=""
                        onChange={(value) => updateSkills('languages', value.split(',').map(s => s.trim()).filter(s => s))}
                        placeholder="Français (courant), Anglais (courant), Espagnol (intermédiaire)"
                        rows={2}
                        hasIssue={hasFieldIssue('skills.languages')}
                      />
                    )}
                  </>
                )}
              </div>
            </ValidationSection>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {correctionsMade > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {correctionsMade} correction(s) apportée(s)
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {onRetry && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer l'extraction
                </Button>
              )}

              <Button
                onClick={handleValidate}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                Importer dans le créateur CV
                {correctionsMade > 0 && ` (${correctionsMade} corrections)`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
