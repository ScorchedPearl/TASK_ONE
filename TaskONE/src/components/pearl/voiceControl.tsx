import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

interface VoiceControlProps {
  onCommand: (command: string) => void;
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onspeechstart: (() => void) | null;
    onspeechend: (() => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
}

type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'error';

export const VoiceControl = ({ 
  onCommand, 
  onTranscript,
  onError,
  language = "en-US",
  continuous = false,
  interimResults = true
}: VoiceControlProps) => {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string>('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = 
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = 
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configuration
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setStatus('listening');
        setError('');
        setTranscript('');
      };

      recognition.onspeechstart = () => {
        setStatus('processing');
      };

      recognition.onspeechend = () => {
        setStatus('listening');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        if (onTranscript) {
          onTranscript(currentTranscript);
        }

        if (finalTranscript) {
          const command = finalTranscript.trim().toLowerCase();
          onCommand(command);
          
          if (!continuous) {
            recognition.stop();
          }
        }
      };

      recognition.onend = () => {
        setStatus('idle');
        setTranscript('');
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage = getErrorMessage(event.error);
        setError(errorMessage);
        setStatus('error');
        
        if (onError) {
          onError(errorMessage);
        }

     
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          timeoutRef.current = setTimeout(() => {
            setStatus('idle');
            setError('');
          }, 2000);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current && status === 'listening') {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSupported, language, continuous, interimResults, onCommand, onTranscript, onError, status]);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Microphone access denied or unavailable.';
      case 'not-allowed':
        return 'Microphone permission denied.';
      case 'network':
        return 'Network error occurred.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
      default:
        return `Speech recognition error: ${errorCode}`;
    }
  };

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || status === 'listening') return;

    try {
      recognition.start();
    } catch (err) {
      const errorMessage = 'Failed to start speech recognition';
      setError(errorMessage);
      setStatus('error');
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [status, onError]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || status === 'idle') return;

    recognition.stop();
  }, [status]);

  const toggleListening = () => {
    if (status === 'listening' || status === 'processing') {
      stopListening();
    } else {
      startListening();
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <VolumeX className="w-4 h-4" />
        <span>Speech recognition not supported</span>
      </div>
    );
  }

  const getButtonVariant = () => {
    switch (status) {
      case 'listening':
      case 'processing':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getIcon = () => {
    if (status === 'error') {
      return <VolumeX className="w-4 h-4" />;
    }
    return status === 'listening' || status === 'processing' 
      ? <MicOff className="w-4 h-4" /> 
      : <Mic className="w-4 h-4" />;
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'error':
        return error;
      default:
        return 'Click to speak';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant={getButtonVariant()}
        size="icon"
        onClick={toggleListening}
        disabled={status === 'processing'}
        className={`transition-all duration-200 ${
          status === 'listening' ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        } ${
          status === 'processing' ? 'animate-pulse' : ''
        }`}
        title={getStatusText()}
      >
        {getIcon()}
      </Button>
      
      <div className="text-center min-h-[2rem]">
        <div className="text-xs text-muted-foreground mb-1">
          {getStatusText()}
        </div>
        
        {transcript && (
          <div className="text-sm max-w-[200px] p-2 bg-muted rounded text-center">
            "{transcript}"
          </div>
        )}
      </div>
    </div>
  );
};