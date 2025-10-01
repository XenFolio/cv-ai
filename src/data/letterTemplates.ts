
export interface TemplateData {
  moderne: {
    name: string;
    preview: string;
    style: {
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
      color: string;
      padding: string;
    };
    template: string;
  };
  classique: {
    name: string;
    preview: string;
    style: {
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
      color: string;
      padding: string;
    };
    template: string;
  };
  creatif: {
    name: string;
    preview: string;
    style: {
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
      color: string;
      padding: string;
    };
    template: string;
  };
  minimaliste: {
    name: string;
    preview: string;
    style: {
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
      color: string;
      padding: string;
    };
    template: string;
  };
  startup: {
    name: string;
    preview: string;
    style: {
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
      color: string;
      padding: string;
    };
    template: string;
  };
  executive: {
    name: string;
    preview: string;
    style: {
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
      color: string;
      padding: string;
    };
    template: string;
  };
}

export const createTemplates = (formData?: {
  poste: string;
  entreprise: string;
  secteur: string;
  experience: string;
  motivation: string;
  competences: string;
}): TemplateData => ({
  moderne: {
    name: "Moderne",
    preview: "Design épuré et contemporain",
    style: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12pt',
      lineHeight: '1.6',
      color: '#333',
      padding: '20mm',
    },
    template: `
      <div class="letter-container letter-moderne">
        <div class="letter-content">
        <div style="text-align: right; margin-bottom: 30px;">
          <strong>[Votre Prénom Nom]</strong><br>
          [Votre adresse]<br>
          [Code postal] [Ville]<br>
          [Téléphone]<br>
          [Email]
        </div>

        <div style="margin-bottom: 30px;">
          <strong>${formData?.entreprise || '[Nom de l\'entreprise]'}</strong><br>
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
      padding: '25mm',
    },
    template: `
      <div class="letter-container letter-classique">
        <div class="letter-content">
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
      padding: '10mm',
    },
    template: `
      <div class="letter-container letter-creatif">
        <div class="letter-content">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 18pt; font-weight: 300;">Lettre de Motivation</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Candidature au poste de <strong>${formData?.poste || '[Intitulé du poste]'}</strong></p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
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
      color: '#444',
      padding: '40px 0'
    },
    template: `
      <div class="letter-container letter-minimaliste">
        <div class="letter-content">
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
      color: '#1a202c',
      padding: '30px'
    },
    template: `
      <div class="letter-container">
        <div class="letter-startup-card">
        <div class="letter-startup-content">
          <div class="letter-content">
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
      color: '#2c3e50',
      padding: '40px'
    },
    template: `
      <div class="letter-container letter-executive">
        <div class="letter-content">
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
      </div>
    `
  }
});
