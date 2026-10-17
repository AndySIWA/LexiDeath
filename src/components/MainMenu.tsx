import React from 'react';
import { Play, Mic, Keyboard, BookOpen, Zap, Trophy, ShieldAlert } from 'lucide-react';
import { InputMode, StoredStats } from '../types';

interface MainMenuProps {
  stats: StoredStats;
  selectedMode: InputMode;
  onSelectMode: (mode: InputMode) => void;
  onStartGame: () => void;
  onOpenGrimoire: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenGrimoire,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-[0_0_60px_rgba(14,165,233,0.2)] text-center my-auto">
        {/* Lightning Glyph Icon */}
        <div className="mx-auto mb-3 flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-950/80 border border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-lightning">
          <Zap className="w-8 h-8 text-sky-400 fill-sky-400/20" />
        </div>

        {/* Title */}
        <h1 className="font-cinzel text-4xl sm:text-5xl font-black tracking-wider text-slate-100 drop-shadow-[0_2px_15px_rgba(56,189,248,0.4)]">
          LexiDeath
        </h1>

        {/* Subtitle matching PRD page 1 */}
        <p className="mt-2 text-sm sm:text-base text-slate-300 font-medium">
          Apprendre l'anglais au rythme d'une horde qui avance.
        </p>

        {/* Lore / Concept */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-400 leading-relaxed text-left">
          <p>
            Vous incarnez un mage encerclé par des vagues de monstres. Chaque zombie porte un mot en <strong className="text-slate-200">français</strong>. Énoncez sa traduction en <strong className="text-sky-300">anglais</strong> à la voix ou au clavier avant qu'il ne vous atteigne pour libérer un éclair destructeur !
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="mt-6 text-left">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
            Mode de combat :
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSelectMode('voice')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                selectedMode === 'voice'
                  ? 'bg-emerald-950/60 border-emerald-400/80 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl ${selectedMode === 'voice' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  Mode Vocal <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Défaut</span>
                </div>
                <div className="text-[11px] opacity-80">Arène dégagée, dictez à voix haute</div>
              </div>
            </button>

            <button
              onClick={() => onSelectMode('keyboard')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                selectedMode === 'keyboard'
                  ? 'bg-sky-950/60 border-sky-400/80 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl ${selectedMode === 'keyboard' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Mode Clavier</div>
                <div className="text-[11px] opacity-80">Dock de saisie & offset caméra</div>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Preview */}
        {stats.totalKills > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Record</div>
              <div className="font-cinzel text-base font-bold text-amber-400">{stats.highScore}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Zombies vaincus</div>
              <div className="font-cinzel text-base font-bold text-sky-400">{stats.totalKills}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Meilleure vague</div>
              <div className="font-cinzel text-base font-bold text-emerald-400">{stats.highestWave}</div>
            </div>
          </div>
        )}

        {/* Actions Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStartGame}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-base shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>COMMENCER LE COMBAT</span>
          </button>

          <button
            onClick={onOpenGrimoire}
            className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-amber-300 font-bold text-sm transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Grimoire</span>
          </button>
        </div>
      </div>
    </div>
  );
};
