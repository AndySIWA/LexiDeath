import React from 'react';
import { GameStats, MissedWordRecord, WordEntry } from '../types';
import { Skull, RotateCcw, Home, Volume2, ShieldAlert, BookOpen } from 'lucide-react';
import { speakEnglishWord } from '../utils/audio';

interface GameOverModalProps {
  stats: GameStats;
  missedWords: MissedWordRecord[];
  unkilledWords?: WordEntry[];
  onRetry: () => void;
  onGoHome: () => void;
}

/** Summarizes the run and turns surviving or missed words into a review lesson. */
export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  missedWords,
  unkilledWords = [],
  onRetry,
  onGoHome,
}) => {
  // Combine unkilled words with recent missed words for comprehensive lesson
  const displayLessonWords: WordEntry[] = React.useMemo(() => {
    const list: WordEntry[] = [...unkilledWords];
    const seen = new Set(list.map(w => w.id));

    // Also append missed words from SRS if not already in list
    for (const rec of missedWords) {
      if (!seen.has(rec.word.id)) {
        seen.add(rec.word.id);
        list.push(rec.word);
      }
    }
    return list;
  }, [unkilledWords, missedWords]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.25)] text-center my-auto animate-fade-in">
        <div className="mx-auto mb-2 flex items-center justify-center w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="font-cinzel text-3xl sm:text-4xl font-black text-red-100 tracking-wider">
          Vous Avez Succombé
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          La horde a submergé le sanctuaire à la vague {stats.wave}.
        </p>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Score</div>
            <div className="font-cinzel text-base sm:text-lg font-black text-amber-400">{stats.score}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Tués</div>
            <div className="font-cinzel text-base sm:text-lg font-black text-sky-400">{stats.zombiesKilled}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Précision</div>
            <div className="font-cinzel text-base sm:text-lg font-black text-emerald-400">
              {stats.accuracy.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Vague</div>
            <div className="font-cinzel text-base sm:text-lg font-black text-red-400">{stats.wave}</div>
          </div>
        </div>

        {/* Leçon de Vocabulaire : Monstres non vaincus */}
        {displayLessonWords.length > 0 && (
          <div className="mt-5 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Leçon : Monstres non vaincus ({displayLessonWords.length})
              </span>
              <span className="text-[10px] text-slate-500">Cliquer pour écouter</span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2.5">
              Ces mots ont franchi vos défenses sans être terrassés. Mémorisez leur traduction pour la prochaine bataille :
            </p>

            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {displayLessonWords.map((word, idx) => (
                <div
                  key={word.id || idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-red-900/50 hover:border-amber-500/60 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="font-medium text-xs sm:text-sm text-slate-200">
                      {word.french}
                    </span>
                    <span className="text-xs text-slate-500">→</span>
                    <span className="font-code font-black text-xs sm:text-sm text-amber-300 uppercase tracking-wide">
                      {word.english}
                    </span>
                    {word.phonetic && (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        [{word.phonetic}]
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speakEnglishWord(word.english)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 transition-colors cursor-pointer shrink-0 ml-2"
                    title="Écouter la prononciation anglaise"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RÉESSAYER</span>
          </button>

          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
