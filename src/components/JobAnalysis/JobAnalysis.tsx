import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Bot,
  User,
  Briefcase,
  MapPin,
  Euro,
  Calendar,
  ExternalLink,
  Copy
} from 'lucide-react';
import { JobOffer } from '../../types/jobs';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface JobAnalysisProps {
  jobs: JobOffer[];
  jobId?: string;
  onBack?: () => void;
}

export const JobAnalysis: React.FC<JobAnalysisProps> = ({ jobs, jobId, onBack }) => {
  const [job, setJob] = useState<JobOffer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trouver l'offre d'emploi correspondante
    const foundJob = jobs.find(j => `${j.source}-${j.id}` === jobId);
    console.log('Recherche offre:', jobId, 'trouvée:', foundJob, 'jobs disponibles:', jobs.length);
    if (foundJob) {
      setJob(foundJob);
      // Ajouter le message de bienvenue avec les infos de l'offre
      addAssistantMessage(`Bonjour ! Je suis votre assistant IA spécialisé dans l'analyse d'offres d'emploi.

Je peux vous aider à analyser cette offre **${foundJob.title}** chez **${foundJob.company}**.

Voici les informations clés de l'offre :
- **Localisation** : ${foundJob.location}
- **Type de contrat** : ${foundJob.contractType}
- **Expérience requise** : ${foundJob.experience}
- **Salaire** : ${foundJob.salary ? `${foundJob.salary.min?.toLocaleString()} - ${foundJob.salary.max?.toLocaleString()} ${foundJob.salary.currency}/an` : 'Non spécifié'}
- **Télétravail** : ${foundJob.remote ? 'Oui' : 'Non'}

Posez-moi toutes vos questions sur cette annonce :
- Quelles sont les compétences requises ?
- Cette offre correspond-elle à mon profil ?
- Comment préparer ma candidature ?
- Quelles sont les responsabilités du poste ?
- etc.

Je suis là pour vous aider !`);
    } else {
      console.log('Offre non trouvée pour jobId:', jobId);
    }
  }, [jobId, jobs]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addAssistantMessage = (content: string) => {
    const message: ChatMessage = {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !job) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simuler une réponse IA (à remplacer par une vraie API)
      setTimeout(() => {
        const response = generateAIResponse(inputMessage, job);
        addAssistantMessage(response);
        setIsLoading(false);
      }, 1000 + Math.random() * 2000);
    } catch  {
      addAssistantMessage("Désolé, j'ai rencontré une erreur lors de l'analyse. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string, jobData: JobOffer): string => {
    const questionLower = question.toLowerCase();

    // Réponses basées sur les mots-clés dans la question
    if (questionLower.includes('compétence') || questionLower.includes('skill')) {
      const skillsText = jobData.tags.length > 0
        ? jobData.tags.slice(0, 8).map(tag => `- ${tag}`).join('\n')
        : 'Analysez la description de l\'offre pour identifier les compétences requises';

      const requirementsText = jobData.requirements.length > 0
        ? jobData.requirements.slice(0, 5).map(req => `- ${req}`).join('\n')
        : 'Consultez la description complète pour les exigences détaillées';

      return `D'après l'analyse de l'offre, voici les compétences clés recherchées :

**Compétences techniques identifiées :**
${skillsText}

**Exigences et qualifications :**
${requirementsText}

**Niveau d'expérience requis :** ${jobData.experience || 'Non spécifié'}

**Conseils pour votre candidature :**
- Mettez en avant les compétences correspondantes dans votre CV
- Préparez des exemples concrets de vos réalisations
- Adaptez votre lettre de motivation aux besoins spécifiques de l'offre
- Soyez prêt à discuter de ces compétences lors de l'entretien`;
    }

    if (questionLower.includes('salaire') || questionLower.includes('rémunération')) {
      return `**Analyse de la rémunération proposée :**

${jobData.salary ?
  `**Salaire indiqué :** ${jobData.salary.min?.toLocaleString()} - ${jobData.salary.max?.toLocaleString()} ${jobData.salary.currency}/an

**Analyse du marché :**
- Ce salaire est ${jobData.salary.min && jobData.salary.min > 45000 ? 'supérieur' : 'dans la moyenne'} du marché pour ce type de poste
- La fourchette suggère une possibilité de négociation basée sur l'expérience

**Conseils de négociation :**
- Préparez des arguments basés sur votre expérience
- Mettez en avant vos réalisations précédentes
- Considérez les avantages sociaux (télétravail, mutuelle, etc.)` :
  'Le salaire n\'est pas spécifié dans cette offre. Je vous recommande :\\n\\n- De rechercher les salaires moyens pour ce type de poste sur Glassdoor ou RegionsJob\\n- De préparer votre fourchette de salaire attendue\\n- D\'être prêt à en discuter lors de l\'entretien'
}`;
    }

    if (questionLower.includes('postule') || questionLower.includes('candidature')) {
      return `**Stratégie de candidature pour cette offre :**

**1. Préparation du CV :**
- Adaptez votre CV aux mots-clés de l'offre : ${jobData.tags.slice(0, 3).join(', ')}
- Mettez en avant votre expérience ${jobData.experience.toLowerCase()}
- Quantifiez vos réalisations avec des chiffres

**2. Lettre de motivation :**
- Personnalisez-la pour ${jobData.company}
- Expliquez pourquoi vous êtes intéressé par ce poste spécifique
- Reliez votre expérience aux exigences de l'offre

**3. Processus de candidature :**
- Postulez via [le lien de l'offre](${jobData.url})
- Suivez votre candidature dans 7-10 jours si pas de réponse
- Préparez-vous pour un entretien technique

**4. Questions à préparer :**
- Quels sont les projets actuels de l'équipe ?
- Quelles sont les opportunités de formation ?
- Comment est évaluée la performance ?`;
    }

    if (questionLower.includes('entreprise') || questionLower.includes('société') || questionLower.includes('company')) {
      return `**Informations sur ${jobData.company} :**

Malheureusement, je n'ai pas d'informations détaillées sur l'entreprise dans cette annonce. Voici ce que je vous recommande de rechercher :

**À vérifier avant de postuler :**
- Site web de l'entreprise et son actualité
- Avis des employés sur Glassdoor ou Indeed
- Taille de l'entreprise et sa culture
- Secteur d'activité et positionnement marché
- Stabilité financière et récente actualité

**Questions à poser en entretien :**
- Quelle est la culture d'entreprise ?
- Comment se déroule l'intégration des nouveaux employés ?
- Quels sont les projets actuels et futurs de l'équipe ?
- Quelles sont les opportunités d'évolution ?`;
    }

    // Réponse générique
    return `Merci pour votre question sur l'offre **${jobData.title}** chez **${jobData.company}**.

Voici une analyse complète basée sur les informations disponibles :

**Points forts de cette offre :**
- **Type de contrat :** ${jobData.contractType}
- **Localisation :** ${jobData.location} ${jobData.remote ? '(avec télétravail)' : ''}
- **Niveau d'expérience :** ${jobData.experience}
- **Date de publication :** ${new Date(jobData.publishedAt).toLocaleDateString('fr-FR')}

**Compétences clés recherchées :**
${jobData.tags.length > 0 ? jobData.tags.slice(0, 5).map(tag => `- ${tag}`).join('\n') : 'Analysez la description pour identifier les compétences requises'}

**Conseils pour votre candidature :**
1. Adaptez votre CV avec les mots-clés de l'offre
2. Préparez des exemples concrets de vos réalisations
3. Entraînez-vous aux questions d'entretien techniques
4. Préparez des questions pertinentes sur le poste

N'hésitez pas à me poser des questions plus spécifiques sur les compétences, la préparation de candidature, ou l'entreprise !`;
  };

  const formatJobDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCopyJobInfo = () => {
    if (!job) return;

    const jobInfo = `${job.title} chez ${job.company}
Localisation: ${job.location}
Type de contrat: ${job.contractType}
Expérience: ${job.experience}
${job.salary ? `Salaire: ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} ${job.salary.currency}/an` : ''}
Publié le: ${formatJobDate(job.publishedAt)}
Lien: ${job.url}`;

    navigator.clipboard.writeText(jobInfo);
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de l'offre d'emploi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analyse d'offre - {job.title} chez {job.company}</title>
        <meta name="description" content={`Analyse détaillée de l'offre d'emploi ${job.title} chez ${job.company} avec assistant IA`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/30 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack || (() => {})}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Analyse d'offre d'emploi</h1>
                  <p className="text-sm text-gray-600">Assistant IA pour décrypter les annonces</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJobInfo}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copier les infos"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(job.url, '_blank')}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Voir l'offre originale"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
            {/* Panneau gauche - Infos de l'offre */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 p-6 sticky top-24">
                <div className="flex items-start gap-3 mb-4">
                  {job.companyLogo && (
                    <img
                      src={job.companyLogo}
                      alt={`Logo ${job.company}`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.contractType}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{job.experience}</span>
                  </div>

                  {job.salary && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Euro className="w-4 h-4" />
                      <span>{job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency}/an</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Publié le {formatJobDate(job.publishedAt)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => window.open(job.url, '_blank')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-lg hover:from-violet-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Postuler
                  </button>
                </div>

                {/* Tags */}
                {job.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Compétences clés</h3>
                    <div className="flex flex-wrap gap-1">
                      {job.tags.slice(0, 8).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 8 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{job.tags.length - 8}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panneau central - Chat */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 h-[calc(100vh-200px)] flex flex-col">
                {/* Header du chat */}
                <div className="p-4 border-b border-gray-200/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Assistant IA d'analyse</h3>
                      <p className="text-sm text-gray-600">Posez-moi toutes vos questions sur cette offre</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul:last-child]:mb-0 [&_ol]:mb-2 [&_ol:last-child]:mb-0 [&_li]:mb-1 [&_li:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mb-1 [&_a]:text-blue-600 [&_a]:hover:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:border-collapse [&_table]:w-full [&_table]:mb-2 [&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-50 [&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1">
                          {message.type === 'assistant' ? (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                                code: ({ className, children }) => {
                                  return !className ? (
                                    <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs mb-2 last:mb-0">
                                      <code className={className}>{children}</code>
                                    </pre>
                                  )
                                },
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2 last:mb-0">{children}</blockquote>,
                                table: ({ children }) => <table className="border-collapse w-full mb-2 last:mb-0 text-xs">{children}</table>,
                                th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">{children}</th>,
                                td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-violet-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-violet-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Posez votre question sur cette offre d'emploi..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="px-4 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:from-violet-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panneau droit - Questions suggérées */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-violet-500" />
                  Questions suggérées
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Cliquez sur une question pour l'envoyer à l'assistant IA
                </p>

                <div className="space-y-2">
                  {[
                    'Quelles sont les compétences requises ?',
                    'Cette offre correspond-elle à mon profil ?',
                    'Comment préparer ma candidature ?',
                    'Quelles sont les missions du poste ?',
                    'Quel est le salaire pour ce poste ?',
                    'Quels sont les avantages proposés ?',
                    'Cette entreprise est-elle fiable ?',
                    'Comment se préparer à l\'entretien ?',
                    'Quels sont les outils techniques utilisés ?',
                    'Y a-t-il des opportunités de télétravail ?',
                    'Quelle est la culture d\'entreprise ?',
                    'Comment évoluer dans cette entreprise ?',
                    'Quels sont les projets en cours ?',
                    'Quelle est l\'équipe comme ?',
                    'Quelles sont les horaires de travail ?',
                    'Y a-t-il une période d\'essai ?',
                    'Quelles sont les formations proposées ?',
                    'Comment est la rémunération variable ?',
                    'Quels sont les avantages sociaux ?',
                    'Quel est le processus de recrutement ?'
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs hover:bg-violet-50 hover:text-violet-700 transition-colors text-left border border-gray-200 hover:border-violet-300 leading-relaxed"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
