
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language, NotebookSource, NotebookChatMessage, NotebookSourceType } from '../types';
// Assuming S strings related to Notebook are passed via props (sApp from App.tsx)

interface AiNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: NotebookSource[];
  messages: NotebookChatMessage[];
  onSendMessage: (question: string) => void;
  onAddSource: (source: NotebookSource) => void;
  onRemoveSource: (sourceId: string) => void;
  isLoading: boolean;
  language: Language;
  sApp: { // Relevant S strings from App.tsx
    aiNotebookTitle: string;
    closeButtonLabel: string; // Assuming a generic close button label is available
    // Add more specific S strings as needed for the notebook modal itself
    notebookUnavailable: string;
    notebookError: string;
  };
}

const AiNotebookModal: React.FC<AiNotebookModalProps> = ({
  isOpen,
  onClose,
  sources,
  messages,
  onSendMessage,
  onAddSource,
  onRemoveSource,
  isLoading,
  language,
  sApp,
}) => {
  const [inputText, setInputText] = useState('');
  const [sourceInputText, setSourceInputText] = useState('');
  const [sourceInputType, setSourceInputType] = useState<'text' | 'url'>('text');
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);

  const S_Local = useMemo(() => ({
    modalTitle: sApp.aiNotebookTitle,
    closeButtonLabel: sApp.closeButtonLabel,
    sendMessageLabel: language === Language.Urdu ? "سوال پوچھیں" : "Ask Question",
    inputPlaceholder: language === Language.Urdu ? "اپنے ذرائع کے بارے میں سوال پوچھیں..." : "Ask a question about your sources...",
    addSourcePlaceholderText: language === Language.Urdu ? "متن یہاں چسپاں کریں..." : "Paste text here...",
    addSourcePlaceholderUrl: language === Language.Urdu ? "ویب یو آر ایل درج کریں..." : "Enter web URL...",
    addSourceButton: language === Language.Urdu ? "ذریعہ شامل کریں" : "Add Source",
    removeSourceButton: language === Language.Urdu ? "ذریعہ ہٹائیں" : "Remove Source",
    sourceTypeLabel: language === Language.Urdu ? "ذریعہ کی قسم:" : "Source Type:",
    textType: language === Language.Urdu ? "متن" : "Text",
    urlType: language === Language.Urdu ? "یو آر ایل" : "URL",
    sourcesSectionTitle: language === Language.Urdu ? "آپ کے ذرائع" : "Your Sources",
    noSourcesAdded: language === Language.Urdu ? "ابھی تک کوئی ذریعہ شامل نہیں کیا گیا۔" : "No sources added yet.",
    pastedTextSourceTitle: language === Language.Urdu ? "چسپاں شدہ متن" : "Pasted Text",
    urlSourceTitle: language === Language.Urdu ? "ویب یو آر ایل" : "Web URL",
    notebookLoading: language === Language.Urdu ? "نوٹ بک سوچ رہی ہے..." : "Notebook is thinking...",
  }), [language, sApp]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 100)}px`; // Max height 100px
    }
  }, [inputText]);
  
  useEffect(() => {
    if (sourceTextareaRef.current && sourceInputType === 'text') {
      sourceTextareaRef.current.style.height = 'auto';
      const scrollHeight = sourceTextareaRef.current.scrollHeight;
      sourceTextareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`; // Max height 120px for source input
    }
  }, [sourceInputText, sourceInputType]);


  const handleSendMessageClick = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageClick();
    }
  };

  const handleAddSourceClick = () => {
    if (sourceInputText.trim()) {
      const newSource: NotebookSource = {
        id: `nb-src-${Date.now()}`,
        type: sourceInputType === 'url' ? NotebookSourceType.URL : NotebookSourceType.TEXT,
        content: sourceInputText.trim(),
        title: sourceInputType === 'url' 
          ? sourceInputText.trim() 
          : `${S_Local.pastedTextSourceTitle} #${sources.filter(s => s.type === NotebookSourceType.TEXT).length + 1}`
      };
      onAddSource(newSource);
      setSourceInputText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assistant-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="notebook-modal-title">
      <div 
        className="assistant-modal-content" // Using similar styling for now, can be customized
        style={{ maxWidth: '800px', height: '90vh', maxHeight: '750px' }} // Larger modal
        onClick={(e) => e.stopPropagation()}
      >
        <header className="assistant-modal-header dark:border-gray-500">
          <h2 id="notebook-modal-title" className={`text-lg sm:text-xl font-semibold ${language === Language.Urdu ? 'urdu-text' : ''}`}>
            {S_Local.modalTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-600 focus:ring-secnto-blue"
            aria-label={S_Local.closeButtonLabel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          {/* Sources Panel */}
          <div className={`w-full md:w-1/3 p-2 sm:p-3 border-b md:border-b-0 ${language === Language.Urdu ? 'md:border-l' : 'md:border-r'} border-gray-200 dark:border-gray-500 flex flex-col overflow-y-auto`}>
            <h3 className={`text-sm sm:text-base font-semibold mb-2 ${language === Language.Urdu ? 'urdu-text' : ''}`}>{S_Local.sourcesSectionTitle}</h3>
            <div className="mb-3">
              <label className={`block text-xs text-gray-600 dark:text-gray-300 mb-1 ${language === Language.Urdu ? 'urdu-text' : ''}`}>{S_Local.sourceTypeLabel}</label>
              <select 
                value={sourceInputType} 
                onChange={(e) => setSourceInputType(e.target.value as 'text' | 'url')}
                className={`w-full p-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-secnto-blue ${language === Language.Urdu ? 'urdu-text' : ''}`}
              >
                <option value="text">{S_Local.textType}</option>
                <option value="url">{S_Local.urlType}</option>
              </select>
            </div>
            {sourceInputType === 'text' ? (
              <textarea
                ref={sourceTextareaRef}
                value={sourceInputText}
                onChange={(e) => setSourceInputText(e.target.value)}
                placeholder={S_Local.addSourcePlaceholderText}
                className={`w-full p-1.5 border border-gray-300 dark:border-gray-500 rounded-md resize-none text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-secnto-blue mb-1.5 ${language === Language.Urdu ? 'urdu-text' : ''}`}
                rows={3}
                style={{minHeight: '60px', maxHeight: '120px'}}
              />
            ) : (
              <input
                type="url"
                value={sourceInputText}
                onChange={(e) => setSourceInputText(e.target.value)}
                placeholder={S_Local.addSourcePlaceholderUrl}
                className={`w-full p-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-secnto-blue mb-1.5 ${language === Language.Urdu ? 'urdu-text' : ''}`}
              />
            )}
            <button
              onClick={handleAddSourceClick}
              disabled={isLoading || !sourceInputText.trim()}
              className={`w-full p-1.5 text-xs bg-secnto-blue dark:bg-secnto-green text-white rounded-md hover:opacity-90 disabled:opacity-50 mb-3 ${language === Language.Urdu ? 'urdu-text' : ''}`}
            >
              {S_Local.addSourceButton}
            </button>

            <div className="flex-grow overflow-y-auto space-y-2">
              {sources.length === 0 && <p className={`text-xs text-gray-500 dark:text-gray-400 italic ${language === Language.Urdu ? 'urdu-text' : ''}`}>{S_Local.noSourcesAdded}</p>}
              {sources.map(source => (
                <div key={source.id} className="p-1.5 border rounded-md bg-gray-50 dark:bg-gray-600 relative">
                  <p className={`text-xs font-medium text-gray-700 dark:text-gray-200 truncate pr-6 ${language === Language.Urdu ? 'urdu-text' : ''}`} title={source.title || (source.type === NotebookSourceType.URL ? source.content : S_Local.pastedTextSourceTitle)}>
                    {source.title || (source.type === NotebookSourceType.URL ? source.content : S_Local.pastedTextSourceTitle)}
                  </p>
                  <p className={`text-[10px] text-gray-500 dark:text-gray-400 truncate pr-6 ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                    {source.type === NotebookSourceType.URL ? S_Local.urlSourceTitle : source.content.substring(0, 50) + (source.content.length > 50 ? '...' : '')}
                  </p>
                  <button 
                    onClick={() => onRemoveSource(source.id)}
                    className={`absolute top-1 p-0.5 rounded-full text-red-500 hover:text-red-700 dark:hover:text-red-400 ${language === Language.Urdu ? 'left-1' : 'right-1'}`}
                    title={S_Local.removeSourceButton}
                    aria-label={`${S_Local.removeSourceButton}: ${source.title || source.id}`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="w-full md:w-2/3 p-2 sm:p-3 flex flex-col overflow-hidden">
            <div ref={chatAreaRef} className="assistant-chat-area flex-grow text-sm sm:text-base">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`assistant-chat-message ${msg.role} ${language === Language.Urdu && (msg.role === 'user' || msg.text.match(/[\u0600-\u06FF]/)) ? 'urdu-text' : ''}`}
                >
                  <div className="markdown-content" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                </div>
              ))}
              {isLoading && messages[messages.length -1]?.role === 'user' && ( 
                 <div className={`assistant-chat-message model italic ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                    {S_Local.notebookLoading}
                </div>
              )}
            </div>
            <div className="assistant-modal-input-area mt-2 pt-2 border-t border-gray-200 dark:border-gray-500">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={S_Local.inputPlaceholder}
                className={`flex-grow p-2 sm:p-2.5 border border-gray-300 dark:border-gray-500 rounded-lg resize-none focus:ring-2 focus:ring-secnto-blue dark:focus:ring-secnto-green focus:border-transparent outline-none
                            bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100 text-sm sm:text-base
                            ${language === Language.Urdu ? 'urdu-text pr-2' : 'pl-2'}`}
                rows={1}
                style={{ maxHeight: '100px', overflowY: 'auto' }}
                disabled={isLoading}
                aria-label={S_Local.inputPlaceholder}
              />
              <button
                onClick={handleSendMessageClick}
                disabled={isLoading || !inputText.trim()}
                className={`p-2 sm:p-2.5 bg-secnto-blue dark:bg-secnto-green text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-600 focus:ring-secnto-blue disabled:opacity-50 ${language === Language.Urdu ? 'urdu-text' : ''}`}
                aria-label={S_Local.sendMessageLabel}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiNotebookModal;
