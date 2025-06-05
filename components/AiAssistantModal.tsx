
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Language } from '../types';
import { AssistantChatMessage } from '../App'; 

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;


interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AssistantChatMessage[];
  onSendMessage: (messageText: string, imagePayload?: { base64Data: string; mimeType: string; fileName?: string }) => void;
  isLoading: boolean;
  language: Language;
}

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  language,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ base64Data: string; mimeType: string; fileName: string } | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isAssistantListening, setIsAssistantListening] = useState<boolean>(false);
  const [assistantMicrophoneError, setAssistantMicrophoneError] = useState<string | null>(null);
  const assistantRecognitionRef = useRef<any>(null);
   const [assistantMicrophonePermission, setAssistantMicrophonePermission] = useState<'prompt' | 'granted' | 'denied' | 'error_acquiring' | 'unsupported'>('prompt');


  const S = useMemo(() => ({
    modalTitle: language === Language.Urdu ? "سیکنٹو اے آئی اسسٹنٹ" : "Secnto AI Assistant",
    closeButtonLabel: language === Language.Urdu ? "بند کریں" : "Close",
    sendMessageLabel: language === Language.Urdu ? "بھیجیں" : "Send",
    inputPlaceholder: language === Language.Urdu ? "ایک پیغام ٹائپ کریں..." : "Type a message...",
    assistantTyping: language === Language.Urdu ? "معاون ٹائپ کر رہا ہے..." : "Assistant is typing...",
    imageUploadTitle: language === Language.Urdu ? "تصویر اپ لوڈ کریں" : "Upload Image",
    voiceInputTitle: language === Language.Urdu ? "صوتی ان پٹ" : "Voice Input",
    stopListeningTitle: language === Language.Urdu ? "سننا بند کریں" : "Stop listening",
    videoInputTitle: language === Language.Urdu ? "ویڈیو ان پٹ" : "Video Input",
    featureInDevelopment: language === Language.Urdu ? "یہ خصوصیت ابھی زیر تکمیل ہے اور جلد ہی دستیاب ہو گی۔" : "This feature is under active development and will be available soon.",
    clearImageButton: language === Language.Urdu ? "تصویر ہٹائیں" : "Clear Image",
    imagePreviewAlt: language === Language.Urdu ? "منتخب کردہ تصویر کا پیش منظر" : "Selected image preview",
    micUnsupported: language === Language.Urdu ? "تقریر کی شناخت آپ کے براؤزر کی طرف سے تعاون یافتہ نہیں ہے۔" : "Speech recognition is not supported by your browser.",
    micAccessDeniedUser: language === Language.Urdu ? "مائیکروفون تک رسائی مسترد کر دی گئی۔ براہ کرم اسے اپنی براؤزر کی ترتیبات میں فعال کریں۔" : "Microphone access was denied. Please enable it in your browser settings.",
    micErrorNoSpeech: language === Language.Urdu ? "کوئی تقریر نہیں سنی گئی۔ براہ مہربانی دوبارہ کوشش کریں." : "No speech was detected. Please try again.",
    micErrorAudioCapture: language === Language.Urdu ? "آڈیو کیپچر ناکام۔ براہ کرم اپنا مائیکروفون چیک کریں۔" : "Audio capture failed. Please check your microphone.",
    micErrorNetwork: language === Language.Urdu ? "تقریر کی شناخت کے دوران نیٹ ورک میں خرابی واقع ہوئی۔" : "A network error occurred during speech recognition.",
    micErrorGeneric: language === Language.Urdu ? "صوتی تلاش شروع نہیں ہو سکی۔ براہ مہربانی دوبارہ کوشش کریں." : "Could not start voice search. Please try again.",
    tryAgainGrantPermission: language === Language.Urdu ? "دوبارہ کوشش / اجازت دیں" : "Try Again / Grant Permission",
    listeningPlaceholder: language === Language.Urdu ? "سن رہا ہے..." : "Listening...",
  }), [language]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 100; // Max height in px (same as style={{ maxHeight: '100px' }})
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputText]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setInputText('');
      setSelectedImage(null);
      setIsAssistantListening(false);
      setAssistantMicrophoneError(null);
      if (assistantRecognitionRef.current) {
        assistantRecognitionRef.current.abort();
      }
    }
  }, [isOpen]);

  // Speech Recognition Setup
  useEffect(() => {
    if (!SpeechRecognition) {
      setAssistantMicrophonePermission('unsupported');
      return;
    }
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then(permissionStatus => {
        setAssistantMicrophonePermission(permissionStatus.state as 'prompt' | 'granted' | 'denied');
        permissionStatus.onchange = () => {
           setAssistantMicrophonePermission(permissionStatus.state as 'prompt' | 'granted' | 'denied');
           if (permissionStatus.state === 'denied') {
            setAssistantMicrophoneError(S.micAccessDeniedUser);
           } else {
            setAssistantMicrophoneError(null);
           }
        };
      }).catch(() => {
        setAssistantMicrophonePermission('prompt'); // Fallback if query fails
      });
    }
    return () => {
      if (assistantRecognitionRef.current) {
        assistantRecognitionRef.current.abort();
      }
    };
  }, [S.micAccessDeniedUser]);


  const handleSendMessage = () => {
    if (inputText.trim() || selectedImage) {
      onSendMessage(inputText.trim(), selectedImage || undefined);
      setInputText('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(language === Language.Urdu ? 'براہ کرم ایک تصویری فائل منتخب کریں۔' : 'Please select an image file.');
        return;
      }
      // Limit file size (e.g., 4MB for Gemini API for inline data)
      if (file.size > 4 * 1024 * 1024) {
           alert(language === Language.Urdu ? 'تصویر کا سائز 4MB سے زیادہ نہیں ہونا چاہیے۔' : 'Image size should not exceed 4MB.');
           return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          base64Data: (reader.result as string).split(',')[1], // Get base64 part
          mimeType: file.type,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value so the same file can be selected again if cleared and re-selected
    if (event.target) {
        event.target.value = ''; 
    }
  };
  
  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  // Voice Input Logic
  const stopAssistantListeningInternal = useCallback(() => {
    if (assistantRecognitionRef.current) {
      assistantRecognitionRef.current.stop();
    }
    setIsAssistantListening(false);
  }, []);

  const handleRequestAssistantMicPermission = useCallback(async () => {
    if (!SpeechRecognition || assistantMicrophonePermission === 'unsupported') {
        setAssistantMicrophonePermission('unsupported');
        setAssistantMicrophoneError(S.micUnsupported);
        setIsAssistantListening(false);
        return false; 
    }
    setAssistantMicrophoneError(null);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setAssistantMicrophonePermission('granted');
      return true; 
    } catch (err) {
      console.error("Assistant Microphone permission error:", err);
      setAssistantMicrophonePermission('denied');
      setAssistantMicrophoneError(S.micAccessDeniedUser);
      setIsAssistantListening(false);
      return false;
    }
  }, [assistantMicrophonePermission, S]);


  const startAssistantListening = useCallback(async () => {
    if (isAssistantListening) return;

    let permissionGranted = assistantMicrophonePermission === 'granted';
    if (!permissionGranted) {
        permissionGranted = await handleRequestAssistantMicPermission();
    }
    if (!permissionGranted) return;


    setAssistantMicrophoneError(null);
    setIsAssistantListening(true);
    setInputText(''); // Clear input text when listening starts

    assistantRecognitionRef.current = new SpeechRecognition();
    assistantRecognitionRef.current.lang = language === Language.Urdu ? 'ur-PK' : 'en-US';
    assistantRecognitionRef.current.continuous = false;
    assistantRecognitionRef.current.interimResults = false;

    assistantRecognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript); // Populate the textarea
      stopAssistantListeningInternal();
    };

    assistantRecognitionRef.current.onerror = (event: any) => {
      console.error("Assistant Speech recognition error", event.error);
      let errorMsg = S.micErrorGeneric;
      if (event.error === 'no-speech') errorMsg = S.micErrorNoSpeech;
      else if (event.error === 'audio-capture') errorMsg = S.micErrorAudioCapture;
      else if (event.error === 'not-allowed') { errorMsg = S.micAccessDeniedUser; setAssistantMicrophonePermission('denied'); }
      else if (event.error === 'network') errorMsg = S.micErrorNetwork;
      setAssistantMicrophoneError(errorMsg);
      stopAssistantListeningInternal();
    };
    
    assistantRecognitionRef.current.onend = () => {
      stopAssistantListeningInternal();
    };

    try {
        assistantRecognitionRef.current.start();
    } catch (e) {
        console.error("Error starting assistant recognition:", e);
        setAssistantMicrophoneError(S.micErrorGeneric);
        stopAssistantListeningInternal();
    }
  }, [language, assistantMicrophonePermission, isAssistantListening, S, handleRequestAssistantMicPermission, stopAssistantListeningInternal]);

  const handleAssistantVoiceInputClick = () => {
    if (isAssistantListening) {
      stopAssistantListeningInternal();
    } else {
      startAssistantListening();
    }
  };

  const handleVideoFeatureNotReady = () => {
    alert(S.featureInDevelopment);
  };


  if (!isOpen) return null;

  return (
    <div className="assistant-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="assistant-modal-title">
      <div className="assistant-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="assistant-modal-header dark:border-gray-500">
          <h2 id="assistant-modal-title" className={`text-lg sm:text-xl font-semibold ${language === Language.Urdu ? 'urdu-text' : ''}`}>
            {S.modalTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-600 focus:ring-secnto-blue"
            aria-label={S.closeButtonLabel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div ref={chatAreaRef} className="assistant-chat-area text-sm sm:text-base">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`assistant-chat-message ${msg.role} ${language === Language.Urdu && (msg.role === 'user' || msg.text.match(/[\u0600-\u06FF]/)) ? 'urdu-text' : ''}`}
            >
              {msg.image && (
                <img 
                  src={`data:${msg.image.mimeType};base64,${msg.image.base64Data}`} 
                  alt={msg.image.fileName || (language === Language.Urdu ? "صارف کی تصویر" : "User image")} 
                  className="max-w-xs max-h-48 my-2 rounded-md shadow-sm"
                />
              )}
              {msg.text && <div className="markdown-content" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />}
            </div>
          ))}
          {isLoading && messages[messages.length -1]?.role === 'user' && ( 
            <div className={`assistant-chat-message model italic ${language === Language.Urdu ? 'urdu-text' : ''}`}>
              {S.assistantTyping}
            </div>
          )}
        </div>
        
        {assistantMicrophoneError && (
          <p className={`text-xs text-red-500 dark:text-red-400 mt-1 px-1 text-center ${language === Language.Urdu ? 'urdu-text' : ''}`} role="alert">
              {assistantMicrophoneError}
              {(assistantMicrophonePermission === 'denied' || assistantMicrophonePermission === 'error_acquiring') && (
                  <button
                      type="button"
                      onClick={handleRequestAssistantMicPermission}
                      className="ml-2 underline hover:text-red-700 dark:hover:text-red-300"
                  >
                      {S.tryAgainGrantPermission}
                  </button>
              )}
          </p>
        )}

        {selectedImage && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-500 flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={`data:${selectedImage.mimeType};base64,${selectedImage.base64Data}`} 
                alt={S.imagePreviewAlt} 
                className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-md shadow-sm"
              />
              <span className={`text-xs text-gray-600 dark:text-gray-300 truncate max-w-[150px] sm:max-w-[200px] ${language === Language.Urdu ? 'mr-2' : 'ml-2'}`}>
                {selectedImage.fileName}
              </span>
            </div>
            <button 
              onClick={clearSelectedImage}
              className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full focus:outline-none"
              title={S.clearImageButton}
              aria-label={S.clearImageButton}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="assistant-modal-input-area dark:border-gray-500">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <input 
              type="file" 
              ref={imageInputRef} 
              onChange={handleImageFileChange} 
              accept="image/*" 
              className="hidden"
              aria-hidden="true"
            />
            <button 
              title={S.imageUploadTitle}
              onClick={handleImageUploadClick}
              disabled={isLoading || isAssistantListening}
              className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-secnto-blue dark:hover:text-secnto-green rounded-full hover:bg-gray-100 dark:hover:bg-gray-400 focus:outline-none disabled:opacity-50"
              aria-label={S.imageUploadTitle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            {(assistantMicrophonePermission !== 'unsupported') && (
                <button 
                    title={isAssistantListening ? S.stopListeningTitle : S.voiceInputTitle}
                    onClick={handleAssistantVoiceInputClick}
                    disabled={isLoading || (isAssistantListening && isLoading)}
                    className={`p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-secnto-blue dark:hover:text-secnto-green rounded-full hover:bg-gray-100 dark:hover:bg-gray-400 focus:outline-none disabled:opacity-50 ${isAssistantListening ? 'text-red-500 dark:text-red-400' : ''}`}
                    aria-label={isAssistantListening ? S.stopListeningTitle : S.voiceInputTitle}
                    aria-pressed={isAssistantListening}
                >
                {isAssistantListening ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 2a1 1 0 11-2 0V4a1 1 0 112 0v2zm-3 7a4 4 0 004-4H5a4 4 0 004 4z" clipRule="evenodd" />
                    <path d="M3 9a1 1 0 011-1h.01a1 1 0 010 2H4a1 1 0 01-1-1zm13 0a1 1 0 011-1h.01a1 1 0 010 2H17a1 1 0 01-1-1z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
                </button>
            )}
             <button 
              title={S.videoInputTitle}
              onClick={handleVideoFeatureNotReady}
              disabled={isLoading || isAssistantListening}
              className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-secnto-blue dark:hover:text-secnto-green rounded-full hover:bg-gray-100 dark:hover:bg-gray-400 focus:outline-none disabled:opacity-50"
              aria-label={S.videoInputTitle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={isAssistantListening ? S.listeningPlaceholder : inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={S.inputPlaceholder}
            className={`flex-grow p-2 sm:p-2.5 border border-gray-300 dark:border-gray-500 rounded-lg resize-none focus:ring-2 focus:ring-secnto-blue dark:focus:ring-secnto-green focus:border-transparent outline-none
                        bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100 text-sm sm:text-base
                        ${language === Language.Urdu ? 'urdu-text pr-2' : 'pl-2'}`} 
            rows={1}
            style={{ overflowY: 'auto' }} 
            disabled={isLoading || isAssistantListening}
            aria-label={S.inputPlaceholder}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || isAssistantListening || (!inputText.trim() && !selectedImage)}
            className="p-2 sm:p-2.5 bg-secnto-blue dark:bg-secnto-green text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-600 focus:ring-secnto-blue disabled:opacity-50"
            aria-label={S.sendMessageLabel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantModal;
