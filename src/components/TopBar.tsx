import React from 'react';
import { GameStats, InputMode } from '../types';
import { Volume2, VolumeX, Mic, Keyboard, BookOpen, Pause, Play } from 'lucide-react';

interface TopBarProps {
  stats: GameStats;
  inputMode: InputMode;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onToggleInputMode: () => void;
  onOpenGrimoire: () => void;
  onTogglePause: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  stats,
  inputMode,
  isMuted,
  isPaused,
  onToggleMute,
  onToggleInputMode,
  onOpenGrimoire,
  onTogglePause,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-2 sm:px-6 py-2 sm:py-3.5 pointer-events-none select-none pt-[max(0.5rem,env(safe-area-inset-top,0.5rem))]">
      {/* Left: Kill count matching reference: "💀 Zombies tués : 3 / 25" */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#060e20]/90 border border-sky-500/50 shadow-[0_0_15px_rgba(2,132,199,0.3)] backdrop-blur-md">
          <span className="text-sm sm:text-lg filter drop-shadow">💀</span>
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <span className="hidden sm:inline text-xs sm:text-sm font-medium text-slate-200 tracking-wide">
              Zombies tués :
            </span>
            <span className="text-xs sm:text-base font-bold text-white tracking-wider">
              {stats.waveKilled} / {stats.totalWaveZombies}
            </span>
          </div>
        </div>

        {/* Wave indicator */}
        {stats.wave > 1 && (
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#060e20]/80 border border-sky-500/30 text-[11px] sm:text-xs font-semibold text-sky-300 backdrop-blur-md">
            <span>V{stats.wave}</span>
            {stats.streak >= 3 && (
              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                x{stats.multiplier.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: 5 Hearts & Discreet Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 pointer-events-auto">
        {/* Heart Lives matching reference: 5 heart slots */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-[#060e20]/90 border border-sky-500/50 shadow-[0_0_15px_rgba(2,132,199,0.3)] backdrop-blur-md">
          {Array.from({ length: 5 }).map((_, i) => {
            const isAlive = i < stats.lives;
            return (
              <span
                key={i}
                className={`text-xs sm:text-base transition-all duration-300 ${
                  isAlive
                    ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] scale-100'
                    : 'text-slate-800 opacity-60 scale-90'
                }`}
              >
                {isAlive ? '❤️' : '🖤'}
              </span>
            );
          })}
        </div>

        {/* Compact Glass Control Pills */}
        <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-[#060e20]/90 border border-sky-500/40 shadow-[0_0_12px_rgba(2,132,199,0.2)] backdrop-blur-md">
          {/* Input Mode Toggle */}
          <button
            onClick={onToggleInputMode}
            title={`Mode actuel: ${inputMode === 'voice' ? 'Vocal' : 'Clavier'}. Cliquer pour alterner.`}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl hover:bg-sky-500/20 text-slate-200 transition-colors cursor-pointer"
          >
            {inputMode === 'voice' ? (
              <>
                <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                <span className="hidden md:inline text-xs font-semibold text-sky-300">Vocal</span>
              </>
            ) : (
              <>
                <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
                <span className="hidden md:inline text-xs font-semibold text-sky-300">Clavier</span>
              </>
            )}
          </button>

          {/* Grimoire */}
          <button
            onClick={onOpenGrimoire}
            title="Consulter le Grimoire"
            className="p-1.5 rounded-lg sm:rounded-xl hover:bg-sky-500/20 text-amber-300/90 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Audio Mute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Activer le son' : 'Couper le son'}
            className="p-1.5 rounded-lg sm:rounded-xl hover:bg-sky-500/20 text-slate-300 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Pause */}
          <button
            onClick={onTogglePause}
            title={isPaused ? 'Reprendre' : 'Pause'}
            className="p-1.5 rounded-lg sm:rounded-xl hover:bg-sky-500/20 text-slate-300 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
