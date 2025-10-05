import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ArrowLeft, Download, FileText } from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onBack: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Bonjour ! Je suis votre assistant IA personnel pour créer un CV optimisé ATS. Je vais vous poser quelques questions pour comprendre votre profil professionnel et générer un CV parfaitement adapté à vos objectifs. Commençons par le commencement : quel est votre prénom ?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationFlow = [
    {
      question: "Parfait ! Et votre nom de famille ?",
      field: 'lastName',
      type: 'text'
    },
    {
      question: "Excellent ! Maintenant, quel est votre métier ou poste actuel ?",
      field: 'currentRole',
      type: 'text'
    },
    {
      question: "Dans quelle entreprise travaillez-vous actuellement ?",
      field: 'currentCompany',
      type: 'text'
    },
    {
      question: "Depuis combien d'années exercez-vous dans ce domaine ?",
      field: 'experience',
      type: 'number'
    },
    {
      question: "Quelles sont vos 3 principales compétences techniques ? (séparez-les par des virgules)",
      field: 'skills',
      type: 'list'
    },
    {
      question: "Quel type de poste recherchez-vous ?",
      field: 'targetRole',
      type: 'text'
    },
    {
      question: "Quelle est votre plus grande réalisation professionnelle ?",
      field: 'achievement',
      type: 'text'
    },
    {
      question: "Parfait ! J'ai toutes les informations nécessaires. Voulez-vous que je génère votre CV optimisé maintenant ?",
      field: 'generate',
      type: 'confirm'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (content: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    addMessage(content, 'bot');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');

    // Generate AI response
    if (currentStep < conversationFlow.length) {
      await simulateTyping(conversationFlow[currentStep].question);
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === conversationFlow.length) {
      if (userMessage.toLowerCase().includes('oui') || userMessage.toLowerCase().includes('yes')) {
        await simulateTyping("Excellent ! Je génère votre CV optimisé avec toutes vos informations. Cela ne prendra que quelques secondes...");
        
        setTimeout(async () => {
          await simulateTyping("🎉 Votre CV a été généré avec succès ! Il a obtenu un score ATS de 94% et est parfaitement optimisé pour votre secteur d'activité. Vous pouvez maintenant le télécharger ou le modifier selon vos préférences.");
        }, 3000);
      } else {
        await simulateTyping("Pas de problème ! Souhaitez-vous modifier certaines informations ou avez-vous des questions spécifiques ?");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-pink-400 to-purple-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Assistant IA CV</h3>
              <p className="text-xs text-white/80">Powered by OpenAI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm">En ligne</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'bot'
                ? 'bg-gradient-to-br from-violet-500 to-pink-500'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }`}>
              {message.type === 'bot' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
              message.type === 'bot'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-gradient-to-r from-violet-600 to-pink-600 text-white'
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.type === 'bot' ? 'text-gray-500' : 'text-white/70'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200/30">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre réponse..."
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:from-violet-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Appuyez sur Entrée pour envoyer</span>
          <div className="flex items-center space-x-4">
            {currentStep > conversationFlow.length && (
              <>
                <button className="flex items-center space-x-1 text-violet-600 hover:text-violet-700 font-medium">
                  <Download className="w-3 h-3" />
                  <span>Télécharger CV</span>
                </button>
                <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium">
                  <FileText className="w-3 h-3" />
                  <span>Modifier</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
