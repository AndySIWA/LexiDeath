import React, { useState } from 'react';
import { Mic, MicOff, Radio, Sparkles } from 'lucide-react';
import { ActiveZombie } from '../types';

interface VoiceDockProps {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  lockedZombie: ActiveZombie | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleContinuous: () => void;
  isContinuous: boolean;
  onSwitchToKeyboard: () => void;
}

/** Voice-input controls for continuous listening and push-to-talk gameplay. */
export const VoiceDock: React.FC<VoiceDockProps> = ({
  isListening,
  transcript,
  isSupported,
  lockedZombie,
  onStartListening,
  onStopListening,
  onToggleContinuous,
  isContinuous,
  onSwitchToKeyboard,
}) => {
  const [isPressingPTT, setIsPressingPTT] = useState(false);

  const handlePointerDown = () => {
    if (!isContinuous && isSupported) {
      setIsPressingPTT(true);
      onStartListening();
    }
  };

  const handlePointerUp = () => {
    if (!isContinuous && isSupported) {
      setIsPressingPTT(false);
      onStopListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="absolute bottom-2 sm:bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/50 shadow-xl backdrop-blur-md">
          <MicOff className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs text-slate-300">
            Reconnaissance vocale indisponible sur ce navigateur.
          </div>
          <button
            onClick={onSwitchToKeyboard}
            className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors"
          >
            Passer au clavier
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-2 sm:bottom-6 left-0 right-0 z-30 flex flex-col items-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      {/* Target Preview if locked by speech */}
      {lockedZombie && (
        <div className="mb-2.5 flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#060e20]/90 border border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.3)] backdrop-blur-md pointer-events-auto animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs text-slate-400">Verrouillé :</span>
          <span className="text-xs font-bold text-sky-300 uppercase tracking-wide">
            {lockedZombie.word.french}
          </span>
          <span className="text-xs text-slate-500">→</span>
          <span className="text-xs font-bold tracking-widest text-sky-200 uppercase">
            {lockedZombie.word.english}
          </span>
        </div>
      )}

      {/* Live Voice Transcription Badge */}
      {transcript && (
        <div className="mb-2 px-3.5 py-1 rounded-xl bg-[#060e20]/90 border border-sky-400/80 text-xs font-sans text-sky-300 backdrop-blur-md pointer-events-auto flex items-center gap-2 animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.4)]">
          <Radio className="w-3.5 h-3.5 text-sky-400 animate-ping" />
          <span>« {transcript} »</span>
        </div>
      )}

      {/* Voice Thumb Control */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Continuous vs Push-to-Talk Mode Selector */}
        <button
          onClick={onToggleContinuous}
          title={isContinuous ? 'Mode Écoute Continue (Cliquer pour Push-to-talk)' : 'Mode Push-to-Talk (Cliquer pour Écoute Continue)'}
          className="px-3 py-2 rounded-xl bg-[#060e20]/85 hover:bg-sky-500/20 border border-sky-500/40 text-[11px] font-semibold text-slate-200 transition-colors shadow-lg backdrop-blur-md cursor-pointer"
        >
          {isContinuous ? 'Écoute continue : ON' : 'Maintien au pouce'}
        </button>

        {/* Big Thumb Microphone Button */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={() => {
            if (isContinuous) {
              if (isListening) onStopListening();
              else onStartListening();
            }
          }}
          className={`relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full transition-all duration-200 cursor-pointer select-none shadow-2xl ${
            isListening || isPressingPTT
              ? 'bg-sky-500 text-slate-950 ring-8 ring-sky-500/30 scale-105 shadow-[0_0_35px_rgba(14,165,233,0.8)]'
              : 'bg-[#060e20]/90 text-sky-300 border-2 border-sky-500/60 hover:border-sky-400 hover:scale-105 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
          }`}
          title={isContinuous ? (isListening ? 'Arrêter écoute' : 'Démarrer écoute') : 'Maintenir pour parler'}
        >
          {/* Pulsing ring while listening */}
          {(isListening || isPressingPTT) && (
            <span className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-30 pointer-events-none" />
          )}

          <Mic className={`w-7 h-7 sm:w-8 sm:h-8 ${isListening || isPressingPTT ? 'animate-pulse' : ''}`} />
        </button>

        {/* Switch to keyboard mode button */}
        <button
          onClick={onSwitchToKeyboard}
          title="Basculer en mode clavier"
          className="px-3 py-2 rounded-xl bg-[#060e20]/85 hover:bg-sky-500/20 border border-sky-500/40 text-[11px] font-semibold text-slate-200 transition-colors shadow-lg backdrop-blur-md cursor-pointer"
        >
          Clavier
        </button>
      </div>
    </div>
  );
};
