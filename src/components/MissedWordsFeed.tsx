import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { WordEntry } from '../types';

interface MissedWordNotice {
  id: number;
  word: WordEntry;
  createdAt: number;
}

interface MissedWordsFeedProps {
  notice: MissedWordNotice;
}

/** Announces one recent missed translation at a time without stacking notifications. */
export const MissedWordsFeed: React.FC<MissedWordsFeedProps> = ({ notice }) => (
  <section
    aria-label="Mots à revoir"
    aria-live="polite"
    className="pointer-events-none absolute left-1/2 top-[4.75rem] z-30 flex w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:top-[5.25rem]"
  >
    <div
      key={notice.id}
      className="missed-word-enter flex items-center gap-3 rounded-xl border border-amber-300/40 bg-slate-950/95 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(2,6,23,0.55)] ring-1 ring-amber-200/10"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-300/10 text-amber-200">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-amber-200/80">
          À retenir
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-slate-100 sm:text-sm">
            {notice.word.french}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0 text-amber-200/70" aria-hidden="true" />
          <span className="truncate text-xs font-extrabold tracking-wide text-amber-100 sm:text-sm">
            {notice.word.english.toLocaleUpperCase('en')}
          </span>
        </span>
      </span>
    </div>
  </section>
);
