/** Shared domain contracts for vocabulary, combat state, game stats, and local progress. */
export type MonsterType = 'standard' | 'fast' | 'boss';

export type WordCategory = 'daily' | 'work' | 'travel' | 'dark_fantasy' | 'medical' | 'phrases';

export interface WordEntry {
  id: string;
  french: string;
  english: string;
  acceptedVariants?: string[];
  category: WordCategory;
  difficulty: 1 | 2 | 3;
  phonetic?: string;
  hint?: string;
}

/** Runtime position and combat state for one enemy in the arena. */
export interface ActiveZombie {
  id: string;
  word: WordEntry;
  type: MonsterType;
  x: number;
  z: number;
  speed: number;
  maxHp: number;
  currentHp: number;
  bossWords?: WordEntry[];
  bossWordIndex?: number;
  distanceToCenter: number;
  angle: number;
  scale: number;
  state: 'walking' | 'electrocuted' | 'dying' | 'attacking';
  dissolveProgress: number; // 0 to 1
  animOffset: number;
}

export interface GameStats {
  score: number;
  zombiesKilled: number;
  waveKilled: number;
  totalWaveZombies: number;
  wave: number;
  lives: number;
  maxLives: number;
  streak: number;
  highestStreak: number;
  multiplier: number;
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
}

/** Per-word review state used to prioritize vocabulary in later waves. */
export interface MissedWordRecord {
  word: WordEntry;
  timesMissed: number;
  lastMissedTimestamp: number;
  mastered: boolean;
}

export interface StoredStats {
  highScore: number;
  highestWave: number;
  totalKills: number;
  totalWordsAnswered: number;
  masteredWordsCount: number;
}

/** Persisted preference shape reserved for game settings. */
export interface UserSettings {
  defaultMode: 'voice' | 'keyboard' | 'hybrid';
  sfxVolume: number;
  speechAudioFeedback: boolean;
  screenShake: boolean;
}

export type InputMode = 'voice' | 'keyboard' | 'hybrid';

export type GameScreen = 'menu' | 'playing' | 'wave_cleared' | 'game_over' | 'grimoire' | 'settings';
