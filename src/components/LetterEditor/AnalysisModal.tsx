import React from 'react';
import { X, Copy, Check, Wand2, AlertCircle, CheckCircle, Move } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GrammarError {
  position: {
    start: number;
    end: number;
  };
  original: string;
  correction: string;
  type: 'orthographe' | 'grammaire' | 'conjugaison' | 'accord' | 'ponctuation' | 'style' | 'professionnel';
  explanation: string;
  severity?: 'critique' | 'majeure' | 'mineure';
}

interface AnalysisModalProps {
  isVisible: boolean;
  onClose: () => void;
  analysis: string;
  isGrammarCheck?: boolean;
  onApplyCorrections?: () => void;
  originalText?: string;
  grammarErrors?: GrammarError[];
  onApplySingleCorrection?: (error: GrammarError) => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isVisible,
  onClose,
  analysis,
  isGrammarCheck = false,
  onApplyCorrections,
  originalText,
  grammarErrors = [],
  onApplySingleCorrection
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showOriginalText, setShowOriginalText] = React.useState(true);

  // Fonction pour colorer le texte avec les erreurs
  const renderTextWithErrors = (text: string, errors: GrammarError[]) => {
    if (errors.length === 0) return text;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Trier les erreurs par position
    const sortedErrors = [...errors].sort((a, b) => a.position.start - b.position.start);

    sortedErrors.forEach((error, index) => {
      // Ajouter le texte avant l'erreur
      if (error.position.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>{text.substring(lastIndex, error.position.start)}</span>
        );
      }

      // Ajouter le texte avec l'erreur
      elements.push(
        <span
          key={`error-${index}`}
          className={`relative inline-block border-b-2 cursor-help group ${
            error.severity === 'critique' ? 'border-red-500 bg-red-50' :
            error.severity === 'majeure' ? 'border-orange-400 bg-orange-50' :
            'border-blue-400 bg-blue-50'
          }`}
          title={`${error.type}: ${error.explanation}`}
        >
          {error.original}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 max-w-xs">
            <div className="font-semibold text-yellow-300">{error.type}</div>
            <div className="mt-1 text-xs">{error.explanation}</div>
            <div className="mt-1 text-green-300 font-semibold">→ {error.correction}</div>
            {onApplySingleCorrection && (
              <button
                onClick={() => onApplySingleCorrection(error)}
                className="mt-2 w-full px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                title="Appliquer cette correction"
              >
                Appliquer
              </button>
            )}
          </div>
        </span>
      );

      lastIndex = error.position.end;
    });

    // Ajouter le reste du texte
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return elements;
  };

  // Fonction pour obtenir la couleur du type d'erreur
  const getErrorTypeColor = (type: string, severity?: string) => {
    if (severity === 'critique') {
      return 'bg-red-100 text-red-800 border-red-300 border-2';
    } else if (severity === 'majeure') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    } else if (severity === 'mineure') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }

    switch (type) {
      case 'orthographe': return 'bg-red-100 text-red-800 border-red-200';
      case 'grammaire': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'conjugaison': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accord': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ponctuation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'style': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'professionnel': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fonction pour obtenir l'icône selon la sévérité
  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critique': return '🚨';
      case 'majeure': return '⚠️';
      case 'mineure': return '💡';
      default: return '📝';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[80vh] flex flex-col absolute left-2 top-1/2 transform -translate-y-1/2 lg:left-1 lg:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span title="Correction">
              <Move className="w-4 h-4 text-gray-400" />
            </span>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {isGrammarCheck ? (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Analyse grammaticale
                </>
              ) : (
                <>
                  📊 Analyse de votre lettre
                </>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isGrammarCheck && originalText && grammarErrors.length > 0 ? (
            <div className="space-y-4">
              {/* Onglets pour basculer entre les vues */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setShowOriginalText(true)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    showOriginalText
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📝 Texte complet ({grammarErrors.length} erreur{grammarErrors.length > 1 ? 's' : ''})
                </button>
                <button
                  onClick={() => setShowOriginalText(false)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    !showOriginalText
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📋 Liste des erreurs
                </button>
              </div>

              {/* Texte avec erreurs surlignées - VUE PRINCIPALE */}
              {showOriginalText && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">📄 Votre lettre avec les erreurs identifiées</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 border-2 border-red-500 rounded"></div>
                        <span className="text-gray-600">Critique</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-100 border border-orange-400 rounded"></div>
                        <span className="text-gray-600">Majeure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded"></div>
                        <span className="text-gray-600">Mineure</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-base p-4 bg-gray-50 rounded border border-gray-100">
                    {renderTextWithErrors(originalText, grammarErrors)}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">💡 Comment utiliser :</span>
                      Passez votre souris sur les textes surlignés pour voir les erreurs et cliquez sur "Appliquer" pour corriger directement dans votre lettre.
                    </p>
                  </div>
                </div>
              )}

              {/* Liste des erreurs */}
              {!showOriginalText && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    {grammarErrors.length} erreur{grammarErrors.length > 1 ? 's' : ''} détectée{grammarErrors.length > 1 ? 's' : ''}
                    {grammarErrors.some((e) => e.severity === 'critique') && (
                      <span className="text-red-600 text-sm font-normal">
                        • dont {grammarErrors.filter((e) => e.severity === 'critique').length} critique{grammarErrors.filter((e) => e.severity === 'critique').length > 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>

                  {/* Regrouper par sévérité */}
                  {['critique', 'majeure', 'mineure'].map((severity) => {
                    const filteredErrors = grammarErrors.filter((e) => e.severity === severity);
                    if (filteredErrors.length === 0) return null;

                    return (
                      <div key={severity} className="space-y-2">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                          <span>{getSeverityIcon(severity)}</span>
                          {severity === 'critique' ? 'Critique - À corriger immédiatement' :
                           severity === 'majeure' ? 'Important - Nuira à votre crédibilité' :
                           'Améliorations - Suggestions'}
                          <span className="text-sm text-gray-500">({filteredErrors.length})</span>
                        </h4>
                        {filteredErrors.map((error, index) => (
                          <div
                            key={`${severity}-${index}`}
                            className={`border rounded-lg p-3 ${getErrorTypeColor(error.type, error.severity)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold uppercase px-2 py-1 bg-white bg-opacity-70 rounded">
                                    {error.type}
                                  </span>
                                  <span className="text-sm">
                                    <span className="line-through text-red-600">{error.original}</span>
                                    <span className="mx-1">→</span>
                                    <span className="text-green-700 font-medium">{error.correction}</span>
                                  </span>
                                </div>
                                <p className="text-sm opacity-80">{error.explanation}</p>
                              </div>
                              {onApplySingleCorrection && (
                                <button
                                  onClick={() => onApplySingleCorrection(error)}
                                  className="ml-3 p-2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded transition-colors shadow-sm"
                                  title="Appliquer cette correction"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 prose prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            
          </div>
          <div className="flex items-center gap-2">
            {isGrammarCheck && onApplyCorrections && (
              <button
                onClick={onApplyCorrections}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Appliquer les corrections suggérées"
              >
                <Wand2 className="w-4 h-4" />
                Appliquer les corrections
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier l'analyse
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
