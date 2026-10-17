import { MissedWordRecord, WordEntry, StoredStats, UserSettings } from '../types';

/** Browser-local persistence for settings, best scores, and vocabulary review history. */
const STORAGE_KEYS = {
  MISSED_WORDS: 'lexideath_missed_words',
  STATS: 'lexideath_stats',
  SETTINGS: 'lexideath_settings',
};

const DEFAULT_STATS: StoredStats = {
  highScore: 0,
  highestWave: 1,
  totalKills: 0,
  totalWordsAnswered: 0,
  masteredWordsCount: 0,
};

const DEFAULT_SETTINGS: UserSettings = {
  defaultMode: 'voice',
  sfxVolume: 0.8,
  speechAudioFeedback: true,
  screenShake: true,
};

export const StorageManager = {
  /** Reads saved stats and merges them with defaults for newly added fields. */
  getStats(): StoredStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  },

  /** Persists a partial update without discarding previously stored stat fields. */
  saveStats(stats: Partial<StoredStats>) {
    try {
      const current = this.getStats();
      const updated = { ...current, ...stats };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save stats:', e);
    }
  },

  /** Reads user preferences, supplying defaults for missing or invalid storage. */
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  /** Persists only the supplied preference fields. */
  saveSettings(settings: Partial<UserSettings>) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  /** Returns the set of words currently tracked for spaced review. */
  getMissedWords(): MissedWordRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSED_WORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** Adds a first miss or increments the existing word's review count. */
  recordMissedWord(word: WordEntry): void {
    try {
      const current = this.getMissedWords();
      const existingIdx = current.findIndex(item => item.word.id === word.id);
      if (existingIdx >= 0) {
        current[existingIdx].timesMissed += 1;
        current[existingIdx].lastMissedTimestamp = Date.now();
        current[existingIdx].mastered = false;
      } else {
        current.push({
          word,
          timesMissed: 1,
          lastMissedTimestamp: Date.now(),
          mastered: false,
        });
      }
      localStorage.setItem(STORAGE_KEYS.MISSED_WORDS, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to record missed word:', e);
    }
  },

  /** Reduces review debt after a correct answer and marks simple words mastered. */
  recordWordSuccess(wordId: string): void {
    try {
      const current = this.getMissedWords();
      const existingIdx = current.findIndex(item => item.word.id === wordId);
      if (existingIdx >= 0) {
        // If answered correctly multiple times, mark as mastered
        if (current[existingIdx].timesMissed <= 1) {
          current[existingIdx].mastered = true;
        } else {
          current[existingIdx].timesMissed = Math.max(0, current[existingIdx].timesMissed - 1);
        }
        localStorage.setItem(STORAGE_KEYS.MISSED_WORDS, JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Failed to record word success:', e);
    }
  }
};
