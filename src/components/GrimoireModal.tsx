import React, { useState, useMemo } from 'react';
import { VOCABULARY_BANK } from '../data/vocabulary';
import { WordCategory, MissedWordRecord } from '../types';
import { BookOpen, Search, Volume2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { speakEnglishWord } from '../utils/audio';

interface GrimoireModalProps {
  missedRecords: MissedWordRecord[];
  onClose: () => void;
}

const CATEGORIES: { id: WordCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'daily', label: 'Quotidien' },
  { id: 'work', label: 'Travail' },
  { id: 'travel', label: 'Voyage' },
  { id: 'dark_fantasy', label: 'Dark Fantasy' },
  { id: 'medical', label: 'Médical' },
  { id: 'phrases', label: 'Boss / Phrases' },
];

/** Searchable vocabulary reference with category filters and review-state indicators. */
export const GrimoireModal: React.FC<GrimoireModalProps> = ({
  missedRecords,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map of missed word records for fast lookup
  const missedMap = useMemo(() => {
    const map = new Map<string, MissedWordRecord>();
    missedRecords.forEach(r => map.set(r.word.id, r));
    return map;
  }, [missedRecords]);

  // Filtered vocabulary list
  const filteredWords = useMemo(() => {
    return VOCABULARY_BANK.filter(word => {
      const matchesCat = selectedCategory === 'all' || word.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        word.french.toLowerCase().includes(q) ||
        word.english.toLowerCase().includes(q) ||
        (word.acceptedVariants && word.acceptedVariants.some(v => v.toLowerCase().includes(q)));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-hidden">
      <div className="relative flex flex-col w-full max-w-2xl h-full max-h-[85vh] rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-[0_0_60px_rgba(14,165,233,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-slate-100">
                Grimoire de Vocabulaire
              </h2>
              <p className="text-xs text-slate-400">
                {VOCABULARY_BANK.length} termes et expressions enregistrés
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Search and Categories */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-950/20">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher en français ou anglais..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:outline-none text-sm text-slate-100 placeholder-slate-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vocabulary List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredWords.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Aucun mot ne correspond à votre recherche.
            </div>
          ) : (
            filteredWords.map(item => {
              const record = missedMap.get(item.id);
              const isMastered = record?.mastered;
              const isMissed = record && !record.mastered && record.timesMissed > 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => speakEnglishWord(item.english)}
                      className="p-2 rounded-xl bg-slate-800/90 hover:bg-sky-500 hover:text-slate-950 text-sky-400 transition-colors cursor-pointer shrink-0"
                      title="Écouter la prononciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-200">
                          {item.french}
                        </span>
                        <span className="text-xs text-slate-500">→</span>
                        <span className="font-code font-bold text-sm sm:text-base text-sky-300 uppercase">
                          {item.english}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.phonetic && (
                          <span className="text-[11px] font-code text-slate-500">
                            {item.phonetic}
                          </span>
                        )}
                        {item.hint && (
                          <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                            • {item.hint}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {isMastered ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Maîtrisé</span>
                      </span>
                    ) : isMissed ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400 text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="hidden sm:inline">À réviser ({record.timesMissed})</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-slate-800/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
