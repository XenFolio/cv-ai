import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronUp, CaseSensitive, Type, Move } from 'lucide-react';
// 🖱️ Déplacement du modal
interface SearchReplaceModalProps {
  isVisible: boolean;
  onClose: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
  onContentChange: (content: string) => void;
}

interface SearchResult {
  startNode: Node;
  startOffset: number;
  endNode: Node;
  endOffset: number;
}

export const SearchReplaceModal: React.FC<SearchReplaceModalProps> = ({
  isVisible,
  onClose,
  editorRef,
  onContentChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);





  /** 🎯 Drag start */
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  /** 🎯 Drag move */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [isDragging]);

  /** 🎯 Drag stop */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  /** 🔧 Supprime tous les anciens surlignages */
  const clearHighlights = useCallback(() => {
    if (!editorRef.current) return;
    const marks = editorRef.current.querySelectorAll<HTMLElement>(
      'mark.search-highlight, mark.search-current'
    );
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    editorRef.current.normalize();
  }, [editorRef]);

  /** 🔍 Recherche DOM-safe */
  const performSearch = useCallback(() => {
    if (!editorRef.current || !searchTerm.trim()) {
      clearHighlights();
      setSearchResults([]);
      setCurrentIndex(0);
      return;
    }

    clearHighlights();

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    const results: SearchResult[] = [];
    const flags = isCaseSensitive ? 'g' : 'gi';
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = isWholeWord ? `\\b${escaped}\\b` : escaped;
    const regex = new RegExp(pattern, flags);

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const text = node.textContent || '';
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (start >= 0 && end <= text.length && start < end) {
          results.push({
            startNode: node,
            endNode: node,
            startOffset: start,
            endOffset: end,
          });
        }
      }
    }

    // Surlignage DOM-safe
    results.forEach((res, idx) => {
      try {
        const len = res.startNode.textContent?.length || 0;
        if (res.startOffset < 0 || res.endOffset > len) return;

        const range = document.createRange();
        range.setStart(res.startNode, res.startOffset);
        range.setEnd(res.endNode, res.endOffset);
        const mark = document.createElement('mark');
        mark.className = idx === 0 ? 'search-current' : 'search-highlight';
        mark.style.cssText =
          idx === 0
            ? 'background-color:#9b5de5;color:white;padding:1px 3px;border-radius:3px;'
          : 'background-color:#cda9f9;color:white;padding:1px 3px;border-radius:3px;';
        range.surroundContents(mark);
      } catch (err) {
        console.warn('Erreur de surlignage ignorée:', err);
      }
    });

    setSearchResults(results);
    setCurrentIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0) {
      const first = editorRef.current.querySelector<HTMLElement>('mark.search-current');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editorRef, searchTerm, isCaseSensitive, isWholeWord, clearHighlights]);

  /** 🧭 Navigation suivante */
  const navigateNext = useCallback(() => {
    if (searchResults.length === 0) return;

    const next = (currentIndex + 1) % searchResults.length;
    setCurrentIndex(next);

    const marks = editorRef.current?.querySelectorAll<HTMLElement>(
      'mark.search-highlight, mark.search-current'
    );
    if (!marks) return;

    marks.forEach((mark, idx) => {
      mark.className = idx === next ? 'search-current' : 'search-highlight';
      mark.style.cssText =
        idx === next
          ? 'background-color:#9b5de5;color:white;padding:1px 3px;border-radius:3px;'
        : 'background-color:#cda9f9;color:white;padding:1px 3px;border-radius:3px;';
    });

    marks[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [editorRef, searchResults, currentIndex]);

  /** 🧭 Navigation précédente */
  const navigatePrev = useCallback(() => {
    if (searchResults.length === 0) return;

    const prev = currentIndex === 0 ? searchResults.length - 1 : currentIndex - 1;
    setCurrentIndex(prev);

    const marks = editorRef.current?.querySelectorAll<HTMLElement>(
      'mark.search-highlight, mark.search-current'
    );
    if (!marks) return;

    marks.forEach((mark, idx) => {
      mark.className = idx === prev ? 'search-current' : 'search-highlight';
      mark.style.cssText =
        idx === prev
          ? 'background-color:#9b5de5;color:white;padding:1px 3px;border-radius:3px;'
        : 'background-color:#cda9f9;color:white;padding:1px 3px;border-radius:3px;';
    });

    marks[prev]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [editorRef, searchResults, currentIndex]);

  /** 🔄 Remplacement courant */
  const replaceCurrent = useCallback(() => {
    if (!editorRef.current || currentIndex === -1 || !replaceTerm) return;

    const marks = editorRef.current.querySelectorAll<HTMLElement>(
      'mark.search-highlight, mark.search-current'
    );
    const mark = marks[currentIndex];
    if (!mark) return;

    const node = document.createTextNode(replaceTerm);
    mark.parentNode?.replaceChild(node, mark);
    editorRef.current.normalize();

    onContentChange(editorRef.current.innerHTML);
    performSearch();
  }, [editorRef, currentIndex, replaceTerm, onContentChange, performSearch]);

  /** 🔄 Remplacement global */
  const replaceAll = useCallback(() => {
    if (!editorRef.current || !replaceTerm) return;
    const marks = editorRef.current.querySelectorAll<HTMLElement>(
      'mark.search-highlight, mark.search-current'
    );
    marks.forEach((mark) => {
      const node = document.createTextNode(replaceTerm);
      mark.parentNode?.replaceChild(node, mark);
    });
    editorRef.current.normalize();
    onContentChange(editorRef.current.innerHTML);
    performSearch();
  }, [editorRef, replaceTerm, onContentChange, performSearch]);

  /** 🎹 Raccourcis clavier */
  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F3' && !e.shiftKey) {
        e.preventDefault();
        navigateNext();
      } else if (e.key === 'F3' && e.shiftKey) {
        e.preventDefault();
        navigatePrev();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        replaceAll();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        replaceCurrent();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isVisible, navigateNext, navigatePrev, replaceAll, replaceCurrent]);

  /** 🔁 Recherche auto */
  useEffect(() => {
    if (searchTerm.trim()) performSearch();
    else {
      clearHighlights();
      setSearchResults([]);
    }
  }, [searchTerm, isCaseSensitive, isWholeWord, performSearch, clearHighlights]);

  /** 🎯 Focus à l’ouverture */
  useEffect(() => {
    if (isVisible) searchInputRef.current?.focus();
  }, [isVisible]);

  /** ❌ Fermeture */
  const handleClose = () => {
    clearHighlights();
    setSearchTerm('');
    setReplaceTerm('');
    setSearchResults([]);
    setCurrentIndex(0);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start z-50 pl-8">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden cursor-default select-none"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(0, 0)',
        }}
      >


        {/* Header */}
        <div className="flex items-center justify-between px-4 py-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700
          text-white shadow-md ${
          isDragging ? 'cursor-grabbing' : 'cursor-move'
          }`"
          onMouseDown={handleMouseDown} >
          <div className="flex items-center gap-2">
            {isDragging ? (
              <Move className="w-4 h-4 text-white transition-transform rotate-45 opacity-90" />
            ) : (
              <Search className="w-4 h-4 text-white transition-transform opacity-90" />
            )}
            <span className="font-semibold">Rechercher</span>
            <span className="font-semibold">Rechercher</span>

          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-4 space-y-2">
          {/* Ligne recherche + options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReplace(!showReplace)}
              className={`p-1.5 rounded-lg transition ${showReplace ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showReplace ? 'rotate-180' : ''}`}
              />
            </button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-28 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm h-8"
              />
              {searchResults.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-600">
                  {currentIndex + 1}/{searchResults.length}
                </span>
              )}
            </div>

            {/* Navigation et options */}
            <div className="flex items-center gap-1">
              {searchResults.length > 0 && (
                <>
                  <button
                    onClick={navigatePrev}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Précédent (Shift+F3)"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={navigateNext}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Suivant (F3)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsCaseSensitive(!isCaseSensitive)}
                className={`p-1.5 rounded-lg border transition-all ${isCaseSensitive
                  ? 'bg-purple-100 border-purple-400 text-purple-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                title="Respecter la casse"
              >
                <CaseSensitive className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsWholeWord(!isWholeWord)}
                className={`p-1.5 rounded-lg border transition-all ${isWholeWord
                  ? 'bg-purple-100 border-purple-400 text-purple-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                title="Mot entier"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ligne remplacement compacte */}
          <div
            className={`transition-all duration-300 ${showReplace ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
          >
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6" />
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Remplacer par..."
                className="flex-1 h-8 ml-1 px-3 mr-3 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm placeholder-gray-400"
              />

            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={replaceCurrent}
              disabled={!replaceTerm || currentIndex === -1}
              className="flex-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 text-sm"
            >
              Remplacer
            </button>
            <button
              onClick={replaceAll}
              disabled={!replaceTerm || !searchTerm.trim()}
              className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 text-sm"
            >
              Remplacer tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
