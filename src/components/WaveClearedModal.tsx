import React, { useEffect } from 'react';
import { GameStats, WordEntry } from '../types';
import { Trophy, Volume2, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { speakEnglishWord } from '../utils/audio';
import confetti from 'canvas-confetti';

interface WaveClearedModalProps {
  stats: GameStats;
  waveWords: WordEntry[];
  breachedWords?: WordEntry[];
  onNextWave: () => void;
  onOpenGrimoire: () => void;
}

export const WaveClearedModal: React.FC<WaveClearedModalProps> = ({
  stats,
  waveWords,
  breachedWords = [],
  onNextWave,
  onOpenGrimoire,
}) => {
  useEffect(() => {
    // Launch magical victory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-sky-500/40 shadow-[0_0_50px_rgba(56,189,248,0.3)] text-center my-auto">
        <div className="mx-auto mb-2 flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
          <Trophy className="w-6 h-6" />
        </div>

        <h2 className="font-cinzel text-3xl font-black text-slate-100 drop-shadow">
          Vague {stats.wave} Purifiée !
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          La horde a été repoussée par la puissance de vos sorts.
        </p>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Score</div>
            <div className="font-cinzel text-lg font-black text-sky-400">{stats.score}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Précision</div>
            <div className="font-cinzel text-lg font-black text-emerald-400">
              {stats.accuracy.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Combo Max</div>
            <div className="font-cinzel text-lg font-black text-amber-400">
              {stats.highestStreak}x
            </div>
          </div>
        </div>

        {/* Words that breached during the wave - Review Alert */}
        {breachedWords.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/40 border border-red-800/60 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase font-bold tracking-wider text-red-400">
                ⚠️ Mots ayant infligé des dégâts ({breachedWords.length}) :
              </span>
              <span className="text-[10px] text-slate-400">À réviser</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
              {breachedWords.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-950/60 border border-red-900/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-300">{item.french}</span>
                    <span className="text-[10px] text-slate-500">→</span>
                    <span className="font-code font-bold text-xs text-red-300 uppercase">{item.english}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakEnglishWord(item.english)}
                    className="p-1 rounded bg-slate-800 text-sky-300 hover:text-sky-200 cursor-pointer"
                    title="Écouter"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vocabulary learned in this wave with audio pronunciation */}
        <div className="mt-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Vocabulaire maîtrisé ({waveWords.length}) :
            </span>
            <span className="text-[10px] text-slate-500">Cliquez pour écouter</span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {waveWords.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-medium text-xs sm:text-sm text-slate-300">
                    {item.french}
                  </span>
                  <span className="text-xs text-slate-500">→</span>
                  <span className="font-code font-bold text-xs sm:text-sm text-sky-300 uppercase">
                    {item.english}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => speakEnglishWord(item.english)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-400 transition-colors cursor-pointer"
                  title="Écouter la prononciation native"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onNextWave}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all cursor-pointer"
          >
            <span>VAGUE SUIVANTE ({stats.wave + 1})</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={onOpenGrimoire}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Grimoire complet
          </button>
        </div>
      </div>
    </div>
  );
};
