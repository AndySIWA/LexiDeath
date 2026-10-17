import React, { useEffect, useRef } from 'react';
import { ActiveZombie } from '../types';
import { CornerDownLeft, Sparkles, Volume2, X, Zap } from 'lucide-react';
import { playEnglishPronunciation } from '../utils/speech';

interface KeyboardDockProps {
  inputValue: string;
  onChangeInput: (val: string) => void;
  onSubmit: (val: string) => void;
  lockedZombie: ActiveZombie | null;
  onFocusChange: (focused: boolean) => void;
}

export const KeyboardDock: React.FC<KeyboardDockProps> = ({
  inputValue,
  onChangeInput,
  onSubmit,
  lockedZombie,
  onFocusChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(inputValue);
    }
  };

  const targetWordUpper = lockedZombie ? lockedZombie.word.english.toUpperCase() : '';
  const currentInputUpper = inputValue.toUpperCase();

  // Compute ghost suffix if input matches the start of target word
  const isPrefixMatch = targetWordUpper && targetWordUpper.startsWith(currentInputUpper);
  const ghostSuffix = isPrefixMatch ? targetWordUpper.slice(currentInputUpper.length) : '';

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeInput('');
    inputRef.current?.focus();
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lockedZombie) {
      playEnglishPronunciation(lockedZombie.word.english);
    }
    inputRef.current?.focus();
  };

  return (
    <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-30 flex flex-col items-center px-2.5 sm:px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      {/* Target Feedback Display with Sound Button */}
      {lockedZombie && (
        <div className="mb-1.5 flex items-center justify-between gap-2 px-3 py-1 rounded-xl bg-[#060e20]/95 border border-sky-400/70 shadow-[0_0_16px_rgba(56,189,248,0.35)] backdrop-blur-md pointer-events-auto max-w-sm w-auto animate-fadeIn">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] sm:text-xs text-slate-400 select-none">Cible :</span>
            <span className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wide truncate">
              {lockedZombie.word.french}
            </span>
            <span className="text-[11px] text-slate-500 select-none">→</span>
            <span className="text-xs sm:text-sm font-black tracking-widest text-sky-100 font-mono">
              {targetWordUpper}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlayAudio}
            title="Écouter la prononciation anglaise"
            className="p-1 rounded-lg bg-sky-950/70 border border-sky-500/40 hover:bg-sky-500/30 text-sky-300 transition-colors cursor-pointer active:scale-90 ml-1 shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Saisir Bar */}
      <div className="relative w-full max-w-lg pointer-events-auto">
        <div className="relative flex items-center justify-between rounded-2xl bg-[#050c1e]/95 border border-sky-500/60 shadow-[0_0_25px_rgba(14,165,233,0.35)] backdrop-blur-xl px-2.5 sm:px-4 py-2 transition-all">
          {/* Label / Spell Icon */}
          <div className="flex items-center gap-1.5 mr-2 select-none shrink-0">
            <Zap className="w-4 h-4 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <span className="hidden sm:inline text-sm font-bold text-slate-200 tracking-wide">
              Saisir :
            </span>
          </div>

          {/* Central glowing input box with ghost text completion */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="flex-1 relative flex items-center rounded-xl bg-[#081530]/90 border-2 border-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.5)] px-3 py-1 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-300/40 min-w-0"
          >
            {/* Visual Ghost completion overlay */}
            <div className="absolute inset-0 flex items-center justify-center px-3 pointer-events-none font-mono text-base sm:text-lg font-bold tracking-widest uppercase overflow-hidden">
              <span className="opacity-0">{currentInputUpper}</span>
              {ghostSuffix && (
                <span className="text-sky-400/40 select-none animate-pulse">
                  {ghostSuffix}
                </span>
              )}
            </div>

            <input
              ref={inputRef}
              id="combat-spell-input"
              name="spell-word-input"
              type="text"
              value={inputValue}
              onChange={(e) => onChangeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => onFocusChange(true)}
              onBlur={() => onFocusChange(false)}
              placeholder={lockedZombie ? targetWordUpper : "TAPEZ LE MOT ICI"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="go"
              inputMode="text"
              data-form-type="other"
              data-lpignore="true"
              className="w-full bg-transparent text-center font-mono text-base sm:text-lg font-bold tracking-widest text-sky-100 placeholder-sky-400/35 focus:outline-none uppercase py-0.5 relative z-10"
            />

            {/* Clear button when input has text */}
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                title="Effacer le mot saisi"
                className="relative z-20 p-1 rounded-full text-slate-400 hover:text-white hover:bg-sky-500/20 active:scale-90 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cast / Enter Action Button (44px touch target) */}
          <button
            type="button"
            onClick={() => onSubmit(inputValue)}
            className="ml-2 sm:ml-3 flex items-center justify-center min-w-[42px] h-[42px] sm:min-w-[46px] sm:h-[46px] rounded-xl bg-gradient-to-b from-sky-600 to-blue-800 border border-sky-300/80 hover:from-sky-500 hover:to-blue-700 active:scale-95 text-white font-bold transition-all shadow-[0_0_14px_rgba(56,189,248,0.4)] cursor-pointer shrink-0"
            title="Lancer le sort (Entrée)"
          >
            <CornerDownLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Subtle decorative sparkle */}
        <div className="absolute -bottom-1 -right-1 pointer-events-none">
          <Sparkles className="w-4 h-4 text-sky-300/60 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
        </div>
      </div>
    </div>
  );
};
