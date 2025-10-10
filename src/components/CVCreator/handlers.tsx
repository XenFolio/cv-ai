import { useCallback } from 'react';
import type { CVExperience, CVSkill, CVLanguage, CVEducation, CVContent } from './types';
import { useOpenAI } from '../../hooks/useOpenAI';

export const useCVHandlers = (
  experiences: CVExperience[],
  setExperiences: React.Dispatch<React.SetStateAction<CVExperience[]>>,
  skills: CVSkill[],
  setSkills: React.Dispatch<React.SetStateAction<CVSkill[]>>,
  languages: CVLanguage[],
  setLanguages: React.Dispatch<React.SetStateAction<CVLanguage[]>>,
  educations: CVEducation[],
  setEducations: React.Dispatch<React.SetStateAction<CVEducation[]>>,
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { editCVField, isLoading, error: openAIError } = useOpenAI();

  // Génération avec IA
  const generateWithAI = async (field: string, currentContent?: string) => {
    setError(null);

    try {
      let prompt = '';
      switch (field) {
        case 'name':
          prompt = "Génère un nom professionnel pour un CV. Réponds uniquement avec le nom, sans texte supplémentaire.";
          break;
        case 'contact':
          prompt = "Génère une ligne de contact professionnelle pour un CV au format '[Email] • [Téléphone] • [LinkedIn]'. Réponds uniquement avec la ligne de contact, sans texte supplémentaire.";
          break;
        case 'contactTitle':
          prompt = "Génère un titre de section pour les informations de contact dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'profileTitle':
          prompt = "Génère un titre de section pour le profil professionnel dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'profileContent':
          prompt = "Génère un résumé professionnel très concis en un seul paragraphe de maximum 2 phrases pour un CV. Le résumé doit être percutant et synthétique. Réponds uniquement avec le texte du résumé, sans balises HTML, sans <p>, sans texte supplémentaire.";
          break;
        case 'experienceTitle':
          prompt = "Génère un titre de section pour l'expérience professionnelle dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'experienceContent':
          prompt = "Génère une entrée d'expérience professionnelle au format '[Poste] - [Entreprise] (Dates)'. Réponds uniquement avec l'entrée, sans texte supplémentaire.";
          break;
        case 'experienceDetails':
          prompt = "Génère une réalisation clé ou un projet important pour une expérience professionnelle dans un CV. Commence avec '• '. Réponds uniquement avec la réalisation, sans texte supplémentaire.";
          break;
        case 'educationTitle':
          prompt = "Génère un titre de section pour la formation dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'educationDegree':
          prompt = "Génère un nom de diplôme pour un CV. Réponds uniquement avec le nom du diplôme, sans texte supplémentaire.";
          break;
        case 'educationSchool':
          prompt = "Génère un nom d'école ou d'université pour un CV. Réponds uniquement avec le nom de l'établissement, sans texte supplémentaire.";
          break;
        case 'educationYear':
          prompt = "Génère une année ou période d'études pour un CV (ex: 2020, 2018-2020). Réponds uniquement avec l'année, sans texte supplémentaire.";
          break;
        case 'skillsTitle':
          prompt = "Génère un titre de section pour les compétences techniques dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'languagesTitle':
          prompt = "Génère un titre de section pour les langues dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'skillContent':
          prompt = "Génère une compétence technique pertinente pour un CV. Réponds uniquement avec la compétence, sans texte supplémentaire.";
          break;
        default:
          if (field.startsWith('languageName-')) {
            prompt = "Génère le nom d'une langue étrangère pour un CV. Réponds uniquement avec le nom de la langue, sans texte supplémentaire.";
          } else if (field.startsWith('languageLevel-')) {
            prompt = "Génère un niveau de compétence pour une langue étrangère dans un CV. Réponds uniquement avec le niveau (par exemple: Courant, Intermédiaire, Débutant), sans texte supplémentaire.";
          } else {
            return;
          }
      }

      if (currentContent && currentContent.trim()) {
        prompt = `${prompt} Voici le contenu actuel à améliorer ou modifier : "${currentContent}"`;
      }

      const aiResponse = await editCVField({ prompt });

      if (aiResponse) {
        if (field === 'experienceContent' && currentContent) {
          const expToUpdate = experiences.find(exp => exp.content === currentContent);
          if (expToUpdate) {
            setExperiences(prev => prev.map(exp =>
              exp.id === expToUpdate.id ? { ...exp, content: aiResponse } : exp
            ));
          }
        } else if (field === 'experienceDetails' && currentContent) {
          const expToUpdate = experiences.find(exp => exp.details === currentContent);
          if (expToUpdate) {
            setExperiences(prev => prev.map(exp =>
              exp.id === expToUpdate.id ? { ...exp, details: aiResponse } : exp
            ));
          }
        } else if (field === 'skillContent' && currentContent) {
          const skillToUpdate = skills.find(skill => skill.content === currentContent);
          if (skillToUpdate) {
            setSkills(prev => prev.map(skill =>
              skill.id === skillToUpdate.id ? { ...skill, content: aiResponse } : skill
            ));
          }
        } else if (field.startsWith('languageLevel-') && currentContent) {
          const langId = parseInt(field.split('-')[1]);
          setLanguages(prev => prev.map(lang =>
            lang.id === langId ? { ...lang, level: aiResponse } : lang
          ));
        } else if (field === 'educationDegree' && currentContent) {
          const eduToUpdate = educations.find(edu => edu.degree === currentContent);
          if (eduToUpdate) {
            setEducations(prev => prev.map(edu =>
              edu.id === eduToUpdate.id ? { ...edu, degree: aiResponse } : edu
            ));
          }
        } else if (field === 'educationSchool' && currentContent) {
          const eduToUpdate = educations.find(edu => edu.school === currentContent);
          if (eduToUpdate) {
            setEducations(prev => prev.map(edu =>
              edu.id === eduToUpdate.id ? { ...edu, school: aiResponse } : edu
            ));
          }
        } else if (field === 'educationYear' && currentContent) {
          const eduToUpdate = educations.find(edu => edu.year === currentContent);
          if (eduToUpdate) {
            setEducations(prev => prev.map(edu =>
              edu.id === eduToUpdate.id ? { ...edu, year: aiResponse } : edu
            ));
          }
        } else {
          setEditableContent(prev => ({ ...prev, [field]: aiResponse }));
        }
      } else {
        setError('Erreur lors de la génération avec IA. Veuillez vérifier votre clé API OpenAI dans les paramètres.');
      }
    } catch (error) {
      console.error('Erreur lors de la génération avec IA:', error);
      setError('Erreur lors de la génération avec IA: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handlers pour les expériences
  const addExperience = useCallback(() => {
    const newId = experiences.length > 0 ? Math.max(...experiences.map(exp => exp.id)) + 1 : 1;
    setExperiences(prev => [...prev, {
      id: newId,
      content: '[Poste] - [Entreprise] (Dates)',
      details: '• Réalisation clé ou projet important.'
    }]);
  }, [experiences, setExperiences]);

  const removeExperience = useCallback((id: number) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  }, [setExperiences]);

  // Handlers pour les compétences
  const addSkill = useCallback(() => {
    const newId = skills.length > 0 ? Math.max(...skills.map(skill => skill.id)) + 1 : 1;
    setSkills(prev => [...prev, { id: newId, content: 'Nouvelle compétence' }]);
  }, [skills, setSkills]);

  const removeSkill = useCallback((id: number) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  }, [setSkills]);

  // Handlers pour les langues
  const addLanguage = useCallback(() => {
    const newId = languages.length > 0 ? Math.max(...languages.map(lang => lang.id)) + 1 : 1;
    setLanguages(prev => [...prev, { id: newId, name: 'Nouvelle langue', level: 'Niveau' }]);
  }, [languages, setLanguages]);

  const removeLanguage = useCallback((id: number) => {
    setLanguages(prev => prev.filter(lang => lang.id !== id));
  }, [setLanguages]);

  // Handlers pour les formations
  const addEducation = useCallback(() => {
    const newId = educations.length > 0 ? Math.max(...educations.map(edu => edu.id)) + 1 : 1;
    setEducations(prev => [...prev, {
      id: newId,
      degree: '[Diplôme]',
      school: '[École]',
      year: '[Année]'
    }]);
  }, [educations, setEducations]);

  const removeEducation = useCallback((id: number) => {
    setEducations(prev => prev.filter(edu => edu.id !== id));
  }, [setEducations]);

  return {
    generateWithAI,
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addEducation,
    removeEducation,
    isLoading,
    openAIError
  };
};
