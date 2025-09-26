import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import { useAppStore } from '../../store/useAppStore';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Download,
  Eye,
  Save,
  Undo2,
  Redo2,
  Type,
  Palette,
  FileText,
  Printer,
  Menu,
  X,
  
  
  
} from 'lucide-react';

interface LetterEditorProps {
  onSave?: (content: string) => void;
  onExport?: (content: string, format: 'pdf' | 'docx' | 'html') => void;
  initialContent?: string;
  formData?: {
    poste: string;
    entreprise: string;
    secteur: string;
    experience: string;
    motivation: string;
    competences: string;
  };
  onBack?: () => void;
}

export const LetterEditor: React.FC<LetterEditorProps> = ({
  onSave,
  onExport,
  initialContent = '',
  formData,
  
}) => {
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const [content, setContent] = useState(initialContent);
  const [showSidebar, setShowSidebar] = useState(false);

  // Charger le contenu sauvegardé au démarrage avec préservation des styles
  useEffect(() => {
    if (!initialContent) {
      try {
        const savedData = localStorage.getItem('letter-editor-content');
        if (savedData) {
          const { content: savedContent, template } = JSON.parse(savedData);
          if (savedContent && editorRef.current) {
            // Préserver le HTML complet avec tous les styles inline
            editorRef.current.innerHTML = savedContent;
            setContent(savedContent);
            if (template) {
              setCurrentTemplate(template);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      }
    }
  }, [initialContent]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('12pt');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');
  const [currentTemplate, setCurrentTemplate] = useState('moderne');
  const [isPreview, setIsPreview] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });
  
  const editorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const fontFamilyRef = useRef<HTMLDivElement>(null);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setShowFontSize(false);
      }
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(event.target as Node)) {
        setShowFontFamily(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour afficher les notifications
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  // Commandes de formatage
  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Fonction spécifique pour la taille de police
  const changeFontSize = useCallback((size: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('fontSize', false, '7'); // Utilise une taille temporaire
      
      // Ensuite applique la vraie taille via CSS
      const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
      fontElements.forEach(element => {
        element.removeAttribute('size');
        (element as HTMLElement).style.fontSize = size;
      });
      
      setCurrentFontSize(size);
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Fonction spécifique pour la famille de police
  const changeFontFamily = useCallback((family: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('fontName', false, family);
      setCurrentFontFamily(family);
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Fonction spécifique pour la couleur
  const changeTextColor = useCallback((color: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('foreColor', false, color);
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Fonction d'export PDF
  const exportToPDF = useCallback(async () => {
    if (!editorRef.current) return;

    try {
      // Créer un conteneur avec dimensions exactes A4
      const container = document.createElement('div');
      container.style.cssText = `
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        background: white;
        position: relative;
        overflow: hidden;
      `;

      // Créer le contenu avec marges internes
      const content = document.createElement('div');
      content.style.cssText = `
        width: 170mm;
        margin: 20mm auto;
        padding: 0;
        font-family: Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #333;
        background: white;
      `;
      content.innerHTML = editorRef.current.innerHTML;
      container.appendChild(content);

      // Configuration pour une seule page
      const options = {
        margin: [0, 0, 0, 0],
        filename: 'lettre-motivation.pdf',
        image: { 
          type: 'jpeg', 
          quality: 0.95 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,  // 210mm en pixels
          height: 1123, // 297mm en pixels
          x: 0,
          y: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          putOnlyUsedFonts: true,
          compress: false
        }
      };

      // Générer et télécharger le PDF
      await html2pdf().set(options).from(container).save();
      
      if (onExport) {
        onExport(editorRef.current.innerHTML, 'pdf');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    }
  }, [onExport]);

  // Templates de lettres
  const templates = useMemo(() => ({
    moderne: {
      name: "Moderne",
      preview: "Design épuré et contemporain",
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12pt',
        lineHeight: '1.6',
        color: '#333',
      },
      template: `
        <div style="max-width: 210mm; margin: 0 auto; padding: 20mm; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6;">
          <div style="text-align: right; margin-bottom: 30px;">
            <strong>[Votre Prénom Nom]</strong><br>
            [Votre adresse]<br>
            [Code postal] [Ville]<br>
            [Téléphone]<br>
            [Email]
          </div>
          
          <div style="margin-bottom: 30px;">
            <strong>[Nom de l'entreprise]</strong><br>
            [Adresse de l'entreprise]<br>
            [Code postal] [Ville]
          </div>
          
          <div style="text-align: right; margin-bottom: 30px;">
            [Ville], le [Date]
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong>Objet :</strong> Candidature au poste de <strong>${formData?.poste || '[Intitulé du poste]'}</strong>
          </div>
          
          <div style="margin-bottom: 20px;">
            Madame, Monsieur,
          </div>
          
          <p>
            Actuellement à la recherche d'un nouveau défi professionnel, je me permets de vous adresser ma candidature pour le poste de <strong>${formData?.poste || '[Intitulé du poste]'}</strong> au sein de <strong>${formData?.entreprise || '[Nom de l\'entreprise]'}</strong>.
          </p>
          
          <p>
            ${formData?.experience || 'Fort(e) de [X années] d\'expérience dans [votre domaine], j\'ai développé une expertise solide qui me permettra de contribuer efficacement à vos objectifs.'}
          </p>
          
          <p>
            ${formData?.motivation || 'Votre entreprise m\'attire particulièrement par [mentionner ce qui vous motive chez cette entreprise]. Je suis convaincu(e) que mes compétences et mon parcours correspondent parfaitement à vos attentes.'}
          </p>
          
          <p>
            Mes principales compétences incluent : ${formData?.competences || '[lister vos compétences clés]'}.
          </p>
          
          <p>
            Je serais ravi(e) de vous rencontrer pour discuter de ma candidature et vous démontrer ma motivation lors d'un entretien.
          </p>
          
          <p>
            Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.
          </p>
          
          <div style="text-align: right; margin-top: 40px;">
            [Votre signature]<br>
            <strong>[Votre Prénom Nom]</strong>
          </div>
        </div>
      `
    },
    classique: {
      name: "Classique",
      preview: "Style traditionnel et formel",
      style: {
        fontFamily: 'Times New Roman, serif',
        fontSize: '12pt',
        lineHeight: '1.8',
        color: '#000',
      },
      template: `
        <div style="max-width: 210mm; margin: 0 auto; padding: 25mm; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.8;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <h1 style="font-size: 16pt; margin: 0;">LETTRE DE MOTIVATION</h1>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div>
              <strong>[Votre Prénom Nom]</strong><br>
              [Votre adresse]<br>
              [Code postal] [Ville]<br>
              [Téléphone] | [Email]
            </div>
            <div style="text-align: right;">
              <strong>[Nom de l'entreprise]</strong><br>
              [Service RH]<br>
              [Adresse de l'entreprise]<br>
              [Code postal] [Ville]
            </div>
          </div>
          
          <div style="text-align: right; margin-bottom: 30px; font-style: italic;">
            [Ville], le [Date]
          </div>
          
          <div style="margin-bottom: 25px; text-decoration: underline;">
            <strong>Objet :</strong> Candidature au poste de ${formData?.poste || '[Intitulé du poste]'}
          </div>
          
          <div style="margin-bottom: 25px;">
            Madame, Monsieur,
          </div>
          
          <p style="text-align: justify; text-indent: 20px;">
            J'ai l'honneur de vous présenter ma candidature pour le poste de <strong>${formData?.poste || '[Intitulé du poste]'}</strong> proposé au sein de votre établissement <strong>${formData?.entreprise || '[Nom de l\'entreprise]'}</strong>.
          </p>
          
          <p style="text-align: justify; text-indent: 20px;">
            ${formData?.experience || 'Diplômé(e) de [formation] et fort(e) de [X années] d\'expérience professionnelle dans le domaine de [secteur], j\'ai acquis les compétences nécessaires pour exercer ce poste avec succès.'}
          </p>
          
          <p style="text-align: justify; text-indent: 20px;">
            ${formData?.motivation || 'Votre entreprise, reconnue pour [points forts de l\'entreprise], représente pour moi l\'opportunité idéale de mettre mes compétences au service d\'une organisation dynamique et innovante.'}
          </p>
          
          <p style="text-align: justify; text-indent: 20px;">
            Mes qualités principales sont : ${formData?.competences || '[énumérer vos principales qualités et compétences]'}.
          </p>
          
          <p style="text-align: justify; text-indent: 20px;">
            Je reste à votre disposition pour tout complément d'information et serais honoré(e) de vous rencontrer lors d'un entretien à votre convenance.
          </p>
          
          <p style="text-align: justify; text-indent: 20px;">
            Veuillez agréer, Madame, Monsieur, l'assurance de ma parfaite considération.
          </p>
          
          <div style="text-align: right; margin-top: 50px;">
            <div style="border-top: 1px solid #ccc; padding-top: 20px; display: inline-block;">
              [Signature manuscrite]<br><br>
              <strong>[Votre Prénom Nom]</strong>
            </div>
          </div>
        </div>
      `
    },
    creatif: {
      name: "Créatif",
      preview: "Design coloré et original",
      style: {
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.5',
        color: '#2c3e50',
      },
      template: `
        <div style="max-width: 210mm; margin: 0 auto; padding: 15mm; font-family: Helvetica, sans-serif; font-size: 11pt; line-height: 1.5; color: #2c3e50;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 18pt; font-weight: 300;">Lettre de Motivation</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Candidature au poste de <strong>${formData?.poste || '[Intitulé du poste]'}</strong></p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div style="background: #f8f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin: 0 0 10px 0; font-size: 12pt;">Candidat</h3>
              <strong>[Votre Prénom Nom]</strong><br>
              [Votre adresse]<br>
              [Code postal] [Ville]<br>
              <span style="color: #667eea;">[Téléphone]</span><br>
              <span style="color: #667eea;">[Email]</span>
            </div>
            <div style="background: #f8f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #764ba2;">
              <h3 style="color: #764ba2; margin: 0 0 10px 0; font-size: 12pt;">Destinataire</h3>
              <strong>${formData?.entreprise || '[Nom de l\'entreprise]'}</strong><br>
              [Service Recrutement]<br>
              [Adresse de l'entreprise]<br>
              [Code postal] [Ville]
            </div>
          </div>
          
          <div style="text-align: right; margin-bottom: 25px; color: #7f8c8d; font-style: italic;">
            [Ville], le [Date]
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="margin-bottom: 20px;">
              <strong>Madame, Monsieur,</strong>
            </p>
            
            <p style="margin-bottom: 20px;">
              🎯 Je souhaite rejoindre <strong>${formData?.entreprise || '[Nom de l\'entreprise]'}</strong> en tant que <strong>${formData?.poste || '[Intitulé du poste]'}</strong>, un poste qui correspond parfaitement à mes aspirations professionnelles.
            </p>
            
            <p style="margin-bottom: 20px;">
              💼 <strong>Mon expérience :</strong><br>
              ${formData?.experience || '[Décrivez votre expérience pertinente et vos réalisations clés]'}
            </p>
            
            <p style="margin-bottom: 20px;">
              🚀 <strong>Ma motivation :</strong><br>
              ${formData?.motivation || '[Expliquez pourquoi cette entreprise vous attire et comment vous pouvez contribuer à ses objectifs]'}
            </p>
            
            <div style="background: #f1f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0;"><strong>🎖️ Mes atouts :</strong></p>
              <p style="margin: 10px 0 0 0;">${formData?.competences || '[Listez vos compétences et qualités principales avec des exemples concrets]'}</p>
            </div>
            
            <p style="margin-bottom: 20px;">
              Je serais ravi(e) d'échanger avec vous sur ma candidature et de vous démontrer ma motivation lors d'un entretien.
            </p>
            
            <p>
              Cordialement,
            </p>
          </div>
          
          <div style="text-align: right; margin-top: 30px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; display: inline-block;">
              [Signature numérique]<br>
              <strong>[Votre Prénom Nom]</strong>
            </div>
          </div>
        </div>
      `
    },
    minimaliste: {
      name: "Minimaliste",
      preview: "Simplicité et élégance",
      style: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.7',
        color: '#444'
      },
      template: `
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 0;">
          <div style="text-align: center; margin-bottom: 50px;">
            <h1 style="font-size: 24pt; font-weight: 300; margin: 0; color: #333; letter-spacing: 2px;">[VOTRE NOM]</h1>
            <div style="width: 60px; height: 2px; background: #333; margin: 15px auto;"></div>
            <p style="margin: 10px 0; color: #666; font-size: 10pt;">[Email] • [Téléphone] • [Ville]</p>
          </div>
          
          <div style="margin-bottom: 40px; font-size: 10pt; color: #888;">
            [Date]
          </div>
          
          <div style="margin-bottom: 30px;">
            <div style="font-weight: 600; color: #333;">${formData?.entreprise || '[Nom de l\'entreprise]'}</div>
            <div style="color: #666; font-size: 10pt; margin-top: 5px;">[Adresse complète]</div>
          </div>
          
          <div style="margin-bottom: 40px;">
            <div style="font-size: 10pt; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Objet</div>
            <div style="font-weight: 500; color: #333;">Candidature pour le poste de ${formData?.poste || '[Intitulé du poste]'}</div>
          </div>
          
          <div style="margin-bottom: 30px; color: #333;">
            Madame, Monsieur,
          </div>
          
          <div style="margin-bottom: 25px; text-align: justify;">
            ${formData?.motivation || '[Introduction concise sur votre profil et votre intérêt pour le poste]'}
          </div>
          
          <div style="margin-bottom: 25px; text-align: justify;">
            ${formData?.experience || '[Vos compétences et expériences pertinentes]'}
          </div>
          
          <div style="margin-bottom: 25px; text-align: justify;">
            ${formData?.competences || '[Votre motivation et connaissance de l\'entreprise]'}
          </div>
          
          <div style="margin-bottom: 40px; text-align: justify;">
            Je reste disponible pour échanger sur ma candidature et vous remercie de l'attention portée à celle-ci.
          </div>
          
          <div style="text-align: center; margin-top: 50px;">
            <div style="color: #666; font-size: 10pt; margin-bottom: 5px;">Cordialement,</div>
            <div style="font-weight: 500; color: #333;">[Votre Nom]</div>
          </div>
        </div>
      `
    },
    startup: {
      name: "Startup",
      preview: "Dynamique et moderne",
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.6',
        color: '#1a202c'
      },
      template: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1px; border-radius: 12px; margin-bottom: 30px;">
          <div style="background: white; border-radius: 11px; padding: 30px;">
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18pt; margin-right: 15px;">
                [I]
              </div>
              <div>
                <h2 style="margin: 0; font-size: 16pt; color: #1a202c;">[Votre Nom]</h2>
                <p style="margin: 2px 0 0 0; color: #718096; font-size: 10pt;">[Votre expertise] • [Ville] • [Date]</p>
              </div>
            </div>
            
            <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; margin-right: 10px;">TO</span>
                <strong style="color: #2d3748;">${formData?.entreprise || '[Nom de l\'entreprise]'}</strong>
              </div>
              <div style="color: #4a5568; font-size: 10pt;">[Service/Équipe] • [Adresse]</div>
            </div>
            
            <div style="border-left: 4px solid #667eea; padding-left: 15px; margin-bottom: 25px;">
              <div style="color: #667eea; font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Mission</div>
              <div style="color: #2d3748; font-weight: 600;">${formData?.poste || '[Intitulé du poste]'}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <span style="color: #2d3748;">Hey there! 👋</span>
            </div>
            
            <div style="margin-bottom: 20px; color: #4a5568;">
              🚀 ${formData?.motivation || 'Je suis [votre profil] et je suis super motivé(e) à l\'idée de rejoindre [entreprise] pour [mission/objectif].'}
            </div>
            
            <div style="margin-bottom: 20px; color: #4a5568;">
              💪 ${formData?.experience || '[Vos super-pouvoirs : compétences et réalisations]'}
            </div>
            
            <div style="margin-bottom: 20px; color: #4a5568;">
              🎯 ${formData?.competences || '[Pourquoi cette entreprise vous fait vibrer]'}
            </div>
            
            <div style="margin-bottom: 25px; color: #4a5568;">
              Let's talk! Je serais ravi(e) de discuter de cette opportunité avec vous.
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <div style="display: inline-flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; border-radius: 25px; font-weight: 600;">
                <span style="margin-right: 8px;">✨</span>
                Best regards, [Votre Nom]
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; font-size: 9pt; color: #a0aec0;">
              📧 [Email] • 📱 [Téléphone] • 💼 [LinkedIn/Portfolio]
            </div>
          </div>
        </div>
      `
    },
    executive: {
      name: "Executive",
      preview: "Prestige et leadership",
      style: {
        fontFamily: 'Georgia, serif',
        fontSize: '12pt',
        lineHeight: '1.8',
        color: '#2c3e50'
      },
      template: `
        <div style="border: 2px solid #34495e; padding: 40px; margin-bottom: 30px;">
          <div style="text-align: center; border-bottom: 1px solid #bdc3c7; padding-bottom: 25px; margin-bottom: 35px;">
            <h1 style="font-size: 20pt; font-weight: bold; margin: 0; color: #2c3e50; letter-spacing: 1px;">[VOTRE NOM]</h1>
            <div style="font-size: 11pt; color: #7f8c8d; margin-top: 8px; font-style: italic;">[Votre Titre Exécutif]</div>
            <div style="font-size: 10pt; color: #95a5a6; margin-top: 10px;">
              [Email] | [Téléphone] | [Ville]
            </div>
          </div>
          
          <div style="text-align: right; margin-bottom: 30px; font-size: 11pt; color: #7f8c8d;">
            [Ville], le [Date]
          </div>
          
          <div style="margin-bottom: 35px;">
            <div style="font-weight: bold; color: #2c3e50; font-size: 13pt; margin-bottom: 8px;">${formData?.entreprise || '[Nom de l\'entreprise]'}</div>
            <div style="color: #7f8c8d; font-size: 11pt;">
              À l'attention de [Nom du Dirigeant/DRH]<br>
              [Fonction]<br>
              [Adresse complète]
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 35px; padding: 15px; background: #ecf0f1; border-left: 4px solid #34495e;">
            <strong style="color: #2c3e50; font-size: 12pt;">CANDIDATURE POUR LE POSTE DE ${formData?.poste || '[INTITULÉ DU POSTE]'}</strong>
          </div>
          
          <div style="margin-bottom: 25px; color: #2c3e50;">
            Madame, Monsieur [Nom si connu],
          </div>
          
          <div style="margin-bottom: 25px; text-align: justify; text-indent: 30px;">
            ${formData?.experience || 'Fort(e) de [X années] d\'expérience en [domaine] et ayant dirigé [réalisations marquantes], je souhaite mettre mon expertise au service de [entreprise] en tant que [poste].'}
          </div>
          
          <div style="margin-bottom: 25px; text-align: justify; text-indent: 30px;">
            ${formData?.competences || '[Vos réalisations stratégiques et leadership]'}
          </div>
          
          <div style="margin-bottom: 25px; text-align: justify; text-indent: 30px;">
            ${formData?.motivation || '[Vision et contribution à l\'entreprise]'}
          </div>
          
          <div style="margin-bottom: 35px; text-align: justify; text-indent: 30px;">
            Je serais honoré(e) de pouvoir échanger avec vous sur les enjeux stratégiques de ce poste et la valeur ajoutée que je peux apporter à votre organisation.
          </div>
          
          <div style="margin-bottom: 15px;">
            Je vous prie d'agréer, Madame, Monsieur, l'expression de ma haute considération.
          </div>
          
          <div style="text-align: right; margin-top: 50px;">
            <div style="border-top: 1px solid #bdc3c7; padding-top: 15px; display: inline-block;">
              <strong style="color: #2c3e50;">[Votre Nom]</strong><br>
              <em style="color: #7f8c8d; font-size: 10pt;">[Votre Titre]</em>
            </div>
          </div>
        </div>
      `
    }
  }), [formData]);

  // Couleurs prédéfinies
  const colors = [
    '#000000', '#333333', '#666666', '#999999',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#800000', '#000080', '#808000'
  ];

  // Tailles de police
  const fontSizes = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt'];

  // Familles de police
  const fontFamilies = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Calibri', value: 'Calibri, sans-serif' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' }
  ];

  // Obtenir les clés des templates comme array
  const templateKeys = Object.keys(templates) as (keyof typeof templates)[];

  // Charger un template
  const loadTemplate = useCallback((templateKey: keyof typeof templates) => {
    setCurrentTemplate(templateKey);
    if (editorRef.current) {
      editorRef.current.innerHTML = templates[templateKey].template;
      setContent(templates[templateKey].template);
    }
  }, [templates]);


  // Sauvegarder
  const handleSave = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const content = editorRef.current.innerHTML;
      
      // Sauvegarder dans localStorage
      const saveData = {
        content,
        timestamp: new Date().toISOString(),
        template: currentTemplate
      };
      
      localStorage.setItem('letter-editor-content', JSON.stringify(saveData));
      
      // Créer un fichier HTML pour téléchargement avec styles préservés
      const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lettre de Motivation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
        }
        
        /* Préservation des styles de formatage */
        b, strong { font-weight: bold; }
        i, em { font-style: italic; }
        u { text-decoration: underline; }
        
        /* Styles d'alignement */
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-justify { text-align: justify; }
        
        /* Styles de liste */
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin: 0.5em 0; }
        
        /* Styles de lien */
        a { color: #0066cc; text-decoration: underline; }
        a:hover { color: #004499; }
        
        /* Styles d'image */
        img { max-width: 100%; height: auto; margin: 10px 0; }
        
        /* Préservation des couleurs personnalisées */
        [style*="color"] { /* Garde les couleurs inline */ }
        [style*="font-size"] { /* Garde les tailles inline */ }
        [style*="font-family"] { /* Garde les polices inline */ }
        [style*="background"] { /* Garde les arrière-plans inline */ }
        
        @media print {
            body { margin: 0; padding: 20mm; }
            a { color: inherit; text-decoration: none; }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

      // Télécharger le fichier HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lettre-motivation-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Appeler la prop onSave si elle existe
      if (onSave) {
        onSave(content);
      }

      showNotification('Lettre sauvegardée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
    }
  }, [onSave, currentTemplate, showNotification]);

  // Exporter
  const handleExport = useCallback((format: 'pdf' | 'docx' | 'html') => {
    if (onExport && editorRef.current) {
      onExport(editorRef.current.innerHTML, format);
    }
  }, [onExport]);

  // Basculer prévisualisation
  const togglePreview = useCallback(() => {
    setIsPreview(!isPreview);
  }, [isPreview]);

  // Insérer un lien
  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    
    if (selectedText) {
      setLinkText(selectedText);
    } else {
      setLinkText('');
    }
    setLinkUrl('');
    setShowLinkDialog(true);
  }, []);

  // Confirmer l'insertion du lien
  const confirmLink = useCallback(() => {
    if (linkUrl) {
      const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
      execCommand('insertHTML', link);
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText, execCommand]);

  // Insérer une image
  const insertImage = useCallback(() => {
    const imageUrl = prompt('URL de l\'image:');
    if (imageUrl) {
      const altText = prompt('Texte alternatif (optionnel):') || 'Image';
      const img = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      execCommand('insertHTML', img);
    }
  }, [execCommand]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Notification Toast */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
          notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="max-w-full mx-auto px-4 py-2">
        <BreadcrumbNavigation
          items={[
            {
              label: 'Accueil',
              icon: NavigationIcons.Home,
              onClick: () => setActiveTab('dashboard')
            },
            {
              label: 'Lettre',
              onClick: () => setActiveTab('letter-editor')
            },
            { label: 'Éditeur de Lettre', current: true }
          ]}
          showHome={false}
          animated={true}
          className="mb-4"
        />
      </div>

      <div className="max-w-full mx-auto h-screen flex flex-col lg:flex-row gap-4">
          {/* Éditeur */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Barre d'outils */}
            <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-2 lg:p-3">
              <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                {/* Bouton sidebar mobile */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Afficher les templates"
                  >
                    {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </button>
                </div>
                {/* Section Fichier */}
                <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
              <button
                onClick={handleSave}
                className="p-1.5 lg:p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Sauvegarder"
              >
                <Save className="w-4 h-4" />
              </button>
              <div className="relative">
                <button
                  onClick={exportToPDF}
                  className="p-1.5 lg:p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Exporter PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section Édition */}
            <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
              <button
                onClick={() => document.execCommand('undo')}
                className="p-1.5 lg:p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                title="Annuler"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('redo')}
                className="p-1.5 lg:p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                title="Rétablir"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Section Formatage */}
            <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
              <button
                onClick={() => execCommand('bold')}
                className="p-1.5 lg:p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors font-bold"
                title="Gras"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('italic')}
                className="p-1.5 lg:p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors italic"
                title="Italique"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('underline')}
                className="p-1.5 lg:p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors underline"
                title="Souligné"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            {/* Section Police et taille */}
            <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
              {/* Menu famille de police */}
              <div className="relative" ref={fontFamilyRef}>
                <button
                  onClick={() => setShowFontFamily(!showFontFamily)}
                  className="p-1.5 lg:p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center gap-1 min-w-[80px] lg:min-w-[100px]"
                  title="Police"
                >
                  <Type className="w-4 h-4" />
                  <span className="text-xs truncate hidden sm:inline">{currentFontFamily}</span>
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFontFamily && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-20 min-w-[180px] max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {fontFamilies.map((font) => (
                        <button
                          key={font.name}
                          onClick={() => {
                            changeFontFamily(font.value);
                            setShowFontFamily(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                          style={{ fontFamily: font.value }}
                        >
                          <span>{font.name}</span>
                          {currentFontFamily === font.name && (
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Menu taille de police */}
              <div className="relative" ref={fontSizeRef}>
                <button
                  onClick={() => setShowFontSize(!showFontSize)}
                  className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center gap-1"
                  title="Taille"
                >
                  <span className="text-xs font-mono">{currentFontSize}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFontSize && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-20 min-w-[120px] max-h-48 overflow-y-auto">
                    <div className="py-1">
                      {fontSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            changeFontSize(size);
                            setShowFontSize(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between font-mono"
                        >
                          <span>{size}</span>
                          {currentFontSize === size && (
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={colorPickerRef}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  title="Couleur du texte"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-20 min-w-[200px]">
                    <div className="p-3">
                      <div className="grid grid-cols-8 gap-2 mb-3">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              changeTextColor(color);
                              setShowColorPicker(false);
                            }}
                            className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Cliquez sur une couleur pour l'appliquer
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Alignement */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
              <button
                onClick={() => execCommand('justifyLeft')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Aligner à gauche"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('justifyCenter')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Centrer"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('justifyRight')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Aligner à droite"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('justifyFull')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Justifier"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            {/* Section Listes */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
              <button
                onClick={() => execCommand('insertUnorderedList')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Liste à puces"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('insertOrderedList')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Liste numérotée"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            {/* Section Liens et Images */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
              <button
                onClick={insertLink}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Insérer un lien"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                onClick={insertImage}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Insérer une image"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
            
            {/* Section Aperçu */}
            <div className="flex items-center gap-1">
              <button
                onClick={togglePreview}
                className={`p-2 rounded transition-colors ${
                  isPreview 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title="Aperçu"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                title="Imprimer"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

            {/* Link Dialog */}
            {showLinkDialog && (
              <div className="mt-3 p-4 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Link className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Insérer un lien</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL du lien
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://exemple.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texte du lien
                    </label>
                    <input
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Texte à afficher"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Insérer
                    </button>
                    <button
                      onClick={() => setShowLinkDialog(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Éditeur */}
            <div className="bg-white border-l border-r border-gray-200 relative flex-1 overflow-auto" style={{
              width: '100%',
              minHeight: '400px',
              maxWidth: '210mm',
              margin: '0 auto'
            }}>
              {isPreview ? (
                <div
                  className="outline-none"
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '10mm',
                    fontFamily: templates[currentTemplate as keyof typeof templates].style.fontFamily,
                    fontSize: templates[currentTemplate as keyof typeof templates].style.fontSize,
                    lineHeight: templates[currentTemplate as keyof typeof templates].style.lineHeight,
                    color: templates[currentTemplate as keyof typeof templates].style.color
                  }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="outline-none"
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '10mm',
                    fontFamily: templates[currentTemplate as keyof typeof templates].style.fontFamily,
                    fontSize: templates[currentTemplate as keyof typeof templates].style.fontSize,
                    lineHeight: templates[currentTemplate as keyof typeof templates].style.lineHeight,
                    color: templates[currentTemplate as keyof typeof templates].style.color
                  }}
                  onInput={(e) => {
                    setContent((e.target as HTMLDivElement).innerHTML);
                  }}
                  dangerouslySetInnerHTML={{ __html: content || templates[currentTemplate as keyof typeof templates].template }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-100 rounded-b-lg border border-gray-200 border-t-0 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>Template: {templates[currentTemplate as keyof typeof templates].name}</span>
                <span>|</span>
                <span>{content.length} caractères</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓ Sauvegarde automatique</span>
              </div>
            </div>
          </div>

          {/* Sidebar - Templates */}
          <div className={`w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 lg:h-screen overflow-hidden order-first lg:order-last transition-all duration-300 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Templates de lettres</span>
              </div>
            </div>

            {/* Container des templates avec scroll vertical */}
            <div className="overflow-y-auto h-full pb-4">
              <div className="p-2 lg:p-4 space-y-3 lg:space-y-4">
                {templateKeys.map((key) => (
                  <div
                    key={key}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      loadTemplate(key);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`w-full p-3 lg:p-4 bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 select-none ${
                      currentTemplate === key
                        ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-md'
                    }`}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
                  >
                    {/* En-tête du template */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-3 h-3 rounded-full ${
                        currentTemplate === key ? 'bg-purple-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-xs text-gray-400" style={{ fontFamily: templates[key].style.fontFamily.split(',')[0] }}>
                        {templates[key].style.fontFamily.split(',')[0]}
                      </span>
                    </div>

                    {/* Contenu du template */}
                    <div className="mb-3">
                      <h3 className={`font-semibold text-sm mb-1 ${
                        currentTemplate === key ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {templates[key].name}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {templates[key].preview}
                      </p>
                    </div>

                    {/* Aperçu miniature */}
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-400 overflow-hidden" style={{ height: '60px' }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: templates[key].template.substring(0, 100) + '...' }}
                        style={{
                          fontSize: '8px',
                          lineHeight: '1.2',
                          fontFamily: templates[key].style.fontFamily.split(',')[0]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
