// Speech Recognition STT Engine supporting continuous listening and Push-to-Talk

/** Normalized speech transcript emitted by the browser recognition engine. */
export interface SpeechRecognitionResultItem {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

// Support browser SpeechRecognition types
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

/** Wraps the browser's vendor-prefixed speech recognition API and listening modes. */
export class SpeechEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private isPushToTalk: boolean = false;
  private shouldKeepListening: boolean = false;
  private onResultCallback?: (result: SpeechRecognitionResultItem) => void;
  private onStateChangeCallback?: (isListening: boolean, error?: string) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        this.isSupported = true;
        try {
          this.recognition = new SpeechRecognitionConstructor();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US'; // English input

          this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStateChangeCallback) this.onStateChangeCallback(true);
          };

          this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const item = event.results[i];
              if (item.isFinal) {
                finalTranscript += item[0].transcript;
              } else {
                interimTranscript += item[0].transcript;
              }
            }

            const activeTranscript = (finalTranscript || interimTranscript).trim().toLowerCase();
            if (activeTranscript && this.onResultCallback) {
              this.onResultCallback({
                transcript: activeTranscript,
                isFinal: !!finalTranscript,
                confidence: event.results[event.resultIndex]?.[0]?.confidence || 0.9,
              });
            }
          };

          this.recognition.onerror = (event: any) => {
            console.warn('Speech recognition error:', event.error);
            if (event.error !== 'no-speech' && this.onStateChangeCallback) {
              this.onStateChangeCallback(false, event.error);
            }
          };

          this.recognition.onend = () => {
            this.isListening = false;
            // Auto-restart if we should keep listening (continuous mode) and not stopped manually
            if (this.shouldKeepListening && !this.isPushToTalk) {
              try {
                this.recognition.start();
              } catch {
                if (this.onStateChangeCallback) this.onStateChangeCallback(false);
              }
            } else {
              if (this.onStateChangeCallback) this.onStateChangeCallback(false);
            }
          };
        } catch (e) {
          console.error('Failed to initialize speech recognition:', e);
          this.isSupported = false;
        }
      }
    }
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public setCallbacks(
    onResult: (result: SpeechRecognitionResultItem) => void,
    onStateChange: (isListening: boolean, error?: string) => void
  ) {
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
  }

  /** Starts recognition and restarts it after browser-generated session endings. */
  public startContinuous(): boolean {
    if (!this.recognition || !this.isSupported) return false;
    this.isPushToTalk = false;
    this.shouldKeepListening = true;

    try {
      if (!this.isListening) {
        this.recognition.start();
      }
      return true;
    } catch (e) {
      console.warn('Error starting speech:', e);
      return false;
    }
  }

  /** Starts one user-controlled listening session without automatic restarts. */
  public startPushToTalk(): boolean {
    if (!this.recognition || !this.isSupported) return false;
    this.isPushToTalk = true;
    this.shouldKeepListening = true;

    try {
      if (!this.isListening) {
        this.recognition.start();
      }
      return true;
    } catch (e) {
      console.warn('Error starting PTT speech:', e);
      return false;
    }
  }

  /** Stops recognition and clears the continuous-listening intent. */
  public stop(): void {
    this.shouldKeepListening = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping speech:', e);
      }
    }
    this.isListening = false;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }
}

export function playEnglishPronunciation(word: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('TTS error:', e);
  }
}
