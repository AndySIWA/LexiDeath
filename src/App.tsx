import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActiveZombie,
  GameStats,
  GameScreen,
  InputMode,
  WordEntry,
  MissedWordRecord,
  StoredStats,
} from './types';
import {
  VOCABULARY_BANK,
  getWordsForWave,
  matchesWord,
  cleanAnswerText,
} from './data/vocabulary';
import { SoundEngine, speakEnglishWord } from './utils/audio';
import { SpeechEngine } from './utils/speech';
import { StorageManager } from './utils/storage';
import { useVisualViewport } from './utils/useVisualViewport';
import { Arena3D } from './components/Arena3D';
import { TopBar } from './components/TopBar';
import { KeyboardDock } from './components/KeyboardDock';
import { VoiceDock } from './components/VoiceDock';
import { MainMenu } from './components/MainMenu';
import { WaveClearedModal } from './components/WaveClearedModal';
import { GameOverModal } from './components/GameOverModal';
import { GrimoireModal } from './components/GrimoireModal';
import { MissedWordsFeed } from './components/MissedWordsFeed';

const MAX_LIVES = 5;
const SPAWN_INTERVAL_MS = 2200;
const ARENA_RADIUS = 21;
const MISSED_WORD_NOTICE_MS = 9000;

interface MissedWordNotice {
  id: number;
  word: WordEntry;
  createdAt: number;
}

export default function App() {
  // Screen & Navigation
  const viewport = useVisualViewport();
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Derive effective keyboard open state
  const effectiveKeyboardOpen = isKeyboardOpen || viewport.isKeyboardOpen;

  // Persistence Stats & SRS
  const [storedStats, setStoredStats] = useState<StoredStats>(() => StorageManager.getStats());
  const [missedRecords, setMissedRecords] = useState<MissedWordRecord[]>(() => StorageManager.getMissedWords());

  // Game Run State
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    zombiesKilled: 0,
    waveKilled: 0,
    totalWaveZombies: 15,
    wave: 1,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    streak: 0,
    highestStreak: 0,
    multiplier: 1.0,
    accuracy: 100,
    totalAttempts: 0,
    correctAttempts: 0,
  });

  // Active Entities in the 3D Arena
  const [activeZombies, setActiveZombies] = useState<ActiveZombie[]>([]);
  const activeZombiesRef = useRef(activeZombies);
  activeZombiesRef.current = activeZombies;
  const [lockedZombieId, setLockedZombieId] = useState<string | null>(null);
  const [lightningTargetId, setLightningTargetId] = useState<string | null>(null);
  const [missedWordNotice, setMissedWordNotice] = useState<MissedWordNotice | null>(null);
  const previousAttackingIdsRef = useRef<Set<string>>(new Set());
  const missedNoticeSequenceRef = useRef(0);

  // FX: Screen Shake and Red Flash on Damage
  const [isDamaged, setIsDamaged] = useState(false);

  // Wave Queue
  const waveQueueRef = useRef<WordEntry[]>([]);
  const waveEncounteredWordsRef = useRef<WordEntry[]>([]);
  const waveBreachedWordsRef = useRef<WordEntry[]>([]);
  const waveKilledRef = useRef(0);
  const totalWaveZombiesRef = useRef(15);
  const [unkilledWords, setUnkilledWords] = useState<WordEntry[]>([]);

  // Keyboard state
  const [keyboardInput, setKeyboardInput] = useState('');

  // Speech Recognition state
  const speechEngineRef = useRef<SpeechEngine | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isContinuousVoice, setIsContinuousVoice] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Audio mute helper
  const playSound = useCallback((fn: () => void) => {
    if (!isMuted) fn();
  }, [isMuted]);

  // Initialize Speech Recognition
  useEffect(() => {
    const engine = new SpeechEngine();
    speechEngineRef.current = engine;
    setIsSpeechSupported(engine.getSupported());

    engine.setCallbacks(
      (result) => {
        setVoiceTranscript(result.transcript);
        handleSpeechInput(result.transcript);
      },
      (listening, err) => {
        setIsListening(listening);
        if (err && err !== 'no-speech') {
          console.warn('Speech engine error:', err);
        }
      }
    );

    return () => {
      engine.stop();
    };
  }, []);

  // Sync Voice Engine with Game State & Mode
  useEffect(() => {
    const engine = speechEngineRef.current;
    if (!engine) return;

    if (screen === 'playing' && !isPaused && (inputMode === 'voice' || inputMode === 'hybrid')) {
      if (isContinuousVoice) {
        engine.startContinuous();
      }
    } else {
      engine.stop();
    }
  }, [screen, isPaused, inputMode, isContinuousVoice]);

  // Surface newly breached words without putting side effects inside the game-loop state updater.
  useEffect(() => {
    const attackingIds = new Set(
      activeZombies.filter(zombie => zombie.state === 'attacking').map(zombie => zombie.id)
    );
    const newlyBreached = activeZombies.filter(
      zombie => zombie.state === 'attacking' && !previousAttackingIdsRef.current.has(zombie.id)
    );
    previousAttackingIdsRef.current = attackingIds;

    if (newlyBreached.length > 0) {
      const createdAt = Date.now();
      const latestBreach = newlyBreached[newlyBreached.length - 1];
      setMissedWordNotice({
        id: ++missedNoticeSequenceRef.current,
        word: latestBreach.word,
        createdAt,
      });
    }
  }, [activeZombies]);

  // Keep one learning cue visible briefly, then clear it without a frame-by-frame interval.
  useEffect(() => {
    if (!missedWordNotice) return;

    const timeout = window.setTimeout(() => {
      setMissedWordNotice(current => current?.id === missedWordNotice.id ? null : current);
    }, Math.max(0, missedWordNotice.createdAt + MISSED_WORD_NOTICE_MS - Date.now()));

    return () => window.clearTimeout(timeout);
  }, [missedWordNotice]);

  // Start / Init Wave
  const startWave = useCallback((waveNum: number) => {
    // Wave zombies count: calibrated strictly between 15 and 25 words per wave
    // Wave 1: 15, Wave 2: 18, Wave 3: 21, Wave 4: 24, Wave 5+: 25
    const totalWaveZombies = Math.min(15 + (waveNum - 1) * 3, 25);

    // Fetch candidate words with Spaced Repetition Priority
    const activeMissedWords = missedRecords.filter(r => !r.mastered).map(r => r.word);
    const { standard, fast, boss } = getWordsForWave(waveNum, totalWaveZombies, activeMissedWords);

    // Merge and shuffle queue
    const queue: WordEntry[] = [...standard, ...fast, ...boss].sort(() => Math.random() - 0.5);
    waveQueueRef.current = queue;
    waveEncounteredWordsRef.current = [];
    waveBreachedWordsRef.current = [];
    waveKilledRef.current = 0;
    totalWaveZombiesRef.current = queue.length;
    previousAttackingIdsRef.current.clear();

    activeZombiesRef.current = [];
    setActiveZombies([]);
    setMissedWordNotice(null);
    setLockedZombieId(null);
    setLightningTargetId(null);
    setKeyboardInput('');
    setVoiceTranscript('');
    setUnkilledWords([]);

    setStats(prev => ({
      ...prev,
      wave: waveNum,
      waveKilled: 0,
      totalWaveZombies: queue.length,
      lives: prev.lives, // Retain current lives
    }));

    setScreen('playing');
  }, [missedRecords]);

  // Start Fresh Game
  const handleStartGame = () => {
    waveKilledRef.current = 0;
    totalWaveZombiesRef.current = 15;
    waveBreachedWordsRef.current = [];
    setUnkilledWords([]);
    setStats({
      score: 0,
      zombiesKilled: 0,
      waveKilled: 0,
      totalWaveZombies: 15,
      wave: 1,
      lives: MAX_LIVES,
      maxLives: MAX_LIVES,
      streak: 0,
      highestStreak: 0,
      multiplier: 1.0,
      accuracy: 100,
      totalAttempts: 0,
      correctAttempts: 0,
    });
    startWave(1);
  };

  // Zombie Spawning Interval
  useEffect(() => {
    if (screen !== 'playing' || isPaused) return;

    const spawnTimer = setInterval(() => {
      // Keep the state updater pure: StrictMode may invoke updater callbacks twice in development.
      const maxConcurrent = Math.min(5 + Math.floor(stats.wave * 1.5), 12);
      const activeCount = activeZombiesRef.current.filter(
        zombie => zombie.state === 'walking' || zombie.state === 'attacking' || zombie.state === 'electrocuted'
      ).length;
      if (activeCount >= maxConcurrent || waveQueueRef.current.length === 0) return;

      const nextWord = waveQueueRef.current.shift();
      if (!nextWord) return;
      waveEncounteredWordsRef.current.push(nextWord);

      // Determine monster type based on difficulty
      const type = nextWord.difficulty === 3 ? 'boss' : nextWord.difficulty === 2 ? 'fast' : 'standard';

      // Spawn monsters from around the forest clearing perimeter
      const angle = Math.random() * Math.PI * 2;
      const radius = 12.2 + Math.random() * 1.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Speed: standard is ~0.55, fast is 45% higher, boss is tanky ~0.38
      const baseSpeed = 0.52 + stats.wave * 0.04;
      const speed = type === 'fast' ? baseSpeed * 1.45 : type === 'boss' ? baseSpeed * 0.68 : baseSpeed;

      const newZombie: ActiveZombie = {
        id: `zombie_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        word: nextWord,
        type,
        x,
        z,
        speed,
        maxHp: type === 'boss' ? 2 : 1,
        currentHp: type === 'boss' ? 2 : 1,
        distanceToCenter: radius,
        angle,
        scale: type === 'boss' ? 1.24 : type === 'fast' ? 0.88 : 1.0,
        state: 'walking',
        dissolveProgress: 0,
        animOffset: Math.random() * 10,
      };

      setActiveZombies(currentZombies => [...currentZombies, newZombie]);
    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(spawnTimer);
  }, [screen, isPaused, stats.wave]);

  // Main 60FPS Game Loop: Move Zombies toward Mage, Check Damage & Wave Completion
  useEffect(() => {
    if (screen !== 'playing' || isPaused) return;

    let lastTime = performance.now();
    let frameId: number;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      setActiveZombies(prevZombies => {
        let damaged = false;
        let damagedCount = 0;
        const updatedZombies: ActiveZombie[] = [];

        for (const zombie of prevZombies) {
          if (zombie.state === 'dying' || zombie.state === 'electrocuted') {
            const nextDissolve = zombie.dissolveProgress + dt * 2.5;
            if (nextDissolve < 1.0) {
              updatedZombies.push({ ...zombie, dissolveProgress: nextDissolve });
            }
            continue;
          }

          if (zombie.state === 'attacking') {
            // Already executing attack animation, wait for knockback / recoil timer to reset it
            updatedZombies.push(zombie);
            continue;
          }

          // Advance towards center (0, 0)
          const newDistance = Math.max(0, zombie.distanceToCenter - zombie.speed * dt);
          const newX = Math.cos(zombie.angle) * newDistance;
          const newZ = Math.sin(zombie.angle) * newDistance;

          // Check if reached center (attack radius ~ 1.55)
          if (newDistance <= 1.55) {
            // Negative Resolution: Zombie strikes the player!
            damaged = true;
            damagedCount += 1;
            playSound(() => SoundEngine.playPlayerHurt());

            // Native auditory feedback for reinforcement
            speakEnglishWord(zombie.word.english);

            // Record in Spaced Repetition SRS storage
            StorageManager.recordMissedWord(zombie.word);
            setMissedRecords(StorageManager.getMissedWords());

            // Record in breached words for this wave
            if (!waveBreachedWordsRef.current.some(w => w.id === zombie.word.id)) {
              waveBreachedWordsRef.current.push(zombie.word);
            }

            // Put into attacking state
            const attackingZombie: ActiveZombie = {
              ...zombie,
              state: 'attacking',
              distanceToCenter: 1.55,
              x: Math.cos(zombie.angle) * 1.55,
              z: Math.sin(zombie.angle) * 1.55,
            };
            updatedZombies.push(attackingZombie);

            // Knockback / recoil back to the clearing perimeter after 550ms
            // CRITICAL REQUIREMENT: The monster is NOT removed; it must be found and killed to complete the wave!
            const recoilAngle = zombie.angle + (Math.random() - 0.5) * 0.9;
            const recoilDistance = 12.0 + Math.random() * 2.0;
            const zombieId = zombie.id;

            setTimeout(() => {
              setActiveZombies(current =>
                current.map(z =>
                  z.id === zombieId && z.state === 'attacking'
                    ? {
                        ...z,
                        state: 'walking',
                        angle: recoilAngle,
                        distanceToCenter: recoilDistance,
                        x: Math.cos(recoilAngle) * recoilDistance,
                        z: Math.sin(recoilAngle) * recoilDistance,
                      }
                    : z
                )
              );
            }, 550);

            continue;
          }

          updatedZombies.push({
            ...zombie,
            x: newX,
            z: newZ,
            distanceToCenter: newDistance,
          });
        }

        if (damaged) {
          setIsDamaged(true);
          setTimeout(() => setIsDamaged(false), 500);

          setStats(prev => {
            const nextLives = Math.max(0, prev.lives - damagedCount);
            const newTotalAttempts = prev.totalAttempts + damagedCount;
            const newAccuracy = Math.round((prev.correctAttempts / Math.max(1, newTotalAttempts)) * 100);

            if (nextLives <= 0) {
              // Game Over!
              playSound(() => SoundEngine.playGameOverGong());

              // GATHER ALL UNKILLED WORDS FOR THE FINAL LESSON
              // 1. All currently active threats on screen that haven't been eliminated
              // 2. All words remaining in the wave queue
              const activeWords = updatedZombies
                .filter(z => z.state === 'walking' || z.state === 'attacking')
                .map(z => z.word);
              const remainingQueue = [...waveQueueRef.current];
              const combined = [...activeWords, ...remainingQueue];

              const uniqueList: WordEntry[] = [];
              const seenIds = new Set<string>();
              for (const w of combined) {
                if (!seenIds.has(w.id)) {
                  seenIds.add(w.id);
                  uniqueList.push(w);
                }
              }
              setUnkilledWords(uniqueList);

              // Save stats
              StorageManager.saveStats({
                totalKills: storedStats.totalKills + prev.zombiesKilled,
                highScore: Math.max(storedStats.highScore, prev.score),
                highestWave: Math.max(storedStats.highestWave, prev.wave),
              });
              setStoredStats(StorageManager.getStats());
              setScreen('game_over');
            } else if (nextLives <= 2) {
              playSound(() => SoundEngine.playHeartbeat());
            }

            return {
              ...prev,
              lives: nextLives,
              streak: 0,
              multiplier: 1.0,
              totalAttempts: newTotalAttempts,
              accuracy: newAccuracy,
            };
          });
        }

        // Check if wave is completed:
        // STRICT REQUIREMENT: ALL words of the wave must be found and killed!
        const allWordsKilled = waveKilledRef.current >= totalWaveZombiesRef.current && totalWaveZombiesRef.current > 0;
        const queueEmpty = waveQueueRef.current.length === 0;
        const noActiveThreats = updatedZombies.filter(z => z.state === 'walking' || z.state === 'attacking').length === 0;

        if (allWordsKilled && queueEmpty && noActiveThreats) {
          // Wave Cleared!
          playSound(() => SoundEngine.playWaveComplete());
          // Update persistence
          StorageManager.saveStats({
            totalKills: storedStats.totalKills + stats.zombiesKilled,
            highScore: Math.max(storedStats.highScore, stats.score),
            highestWave: Math.max(storedStats.highestWave, stats.wave + 1),
          });
          setStoredStats(StorageManager.getStats());
          setScreen('wave_cleared');
        }

        return updatedZombies;
      });

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [screen, isPaused, playSound, stats.score, stats.wave, stats.zombiesKilled, storedStats]);

  // Eliminate or Hit a Zombie (Positive Resolution)
  const eliminateZombie = useCallback((targetZombie: ActiveZombie) => {
    // Trigger Lightning bolt and sound impact
    setLightningTargetId(targetZombie.id);
    playSound(() => SoundEngine.playLightningZap());

    // Positive Resolution (PRD Section 2):
    // "Bonne réponse : un éclair jaillit de la baguette, le zombie explose avec un impact sonore, le score progresse."
    if (targetZombie.type === 'boss' && targetZombie.currentHp > 1) {
      // Boss hit
      setActiveZombies(current =>
        current.map(z =>
          z.id === targetZombie.id
            ? { ...z, currentHp: z.currentHp - 1, state: 'electrocuted' }
            : z
        )
      );
      setTimeout(() => {
        setActiveZombies(current =>
          current.map(z =>
            z.id === targetZombie.id ? { ...z, state: 'walking' } : z
          )
        );
        setLightningTargetId(null);
      }, 300);
    } else {
      // Full kill & Disintegration
      waveKilledRef.current += 1;
      setTimeout(() => {
        playSound(() => SoundEngine.playZombieDeath());
      }, 80);

      setActiveZombies(current =>
        current.map(z =>
          z.id === targetZombie.id
            ? { ...z, state: 'dying', dissolveProgress: 0.1 }
            : z
        )
      );

      // Record SRS success
      StorageManager.recordWordSuccess(targetZombie.word.id);

      setTimeout(() => {
        setLightningTargetId(null);
        if (lockedZombieId === targetZombie.id) {
          setLockedZombieId(null);
        }
      }, 400);

      // Update score and statistics
      setStats(prev => {
        const streakBonus = prev.streak + 1;
        const newMultiplier = Math.min(1.0 + Math.floor(streakBonus / 3) * 0.5, 4.0);
        const basePoints = targetZombie.type === 'boss' ? 300 : targetZombie.type === 'fast' ? 150 : 100;
        const earned = Math.round(basePoints * newMultiplier);
        const newCorrect = prev.correctAttempts + 1;
        const newTotal = prev.totalAttempts + 1;
        const newAccuracy = Math.round((newCorrect / newTotal) * 100);

        return {
          ...prev,
          score: prev.score + earned,
          zombiesKilled: prev.zombiesKilled + 1,
          waveKilled: prev.waveKilled + 1,
          streak: streakBonus,
          highestStreak: Math.max(prev.highestStreak, streakBonus),
          multiplier: newMultiplier,
          correctAttempts: newCorrect,
          totalAttempts: newTotal,
          accuracy: newAccuracy,
        };
      });
    }

    setKeyboardInput('');
    setVoiceTranscript('');
  }, [lockedZombieId, playSound]);

  // Handle Keyboard Input & Auto-Targeting (PRD Section 3 & 4)
  // "Ciblage automatique — dès la première lettre saisie... le jeu verrouille automatiquement le zombie correspondant."
  const handleKeyboardChange = (val: string) => {
    setKeyboardInput(val);
    playSound(() => SoundEngine.playTypeSound());

    const clean = cleanAnswerText(val);
    if (!clean) {
      setLockedZombieId(null);
      return;
    }

    // Auto-Target matching zombie prefix (both walking and attacking monsters can be targeted)
    const matchingZombies = activeZombies.filter(z => {
      if (z.state !== 'walking' && z.state !== 'attacking') return false;
      const targetClean = cleanAnswerText(z.word.english);
      const variantMatch = z.word.acceptedVariants?.some(v => cleanAnswerText(v).startsWith(clean));
      return targetClean.startsWith(clean) || variantMatch;
    });

    if (matchingZombies.length > 0) {
      // Lock on the closest matching zombie
      matchingZombies.sort((a, b) => a.distanceToCenter - b.distanceToCenter);
      const chosen = matchingZombies[0];
      if (chosen.id !== lockedZombieId) {
        setLockedZombieId(chosen.id);
        playSound(() => SoundEngine.playTargetLock());
      }

      // Check if full word matches immediately!
      if (matchesWord(clean, chosen.word)) {
        eliminateZombie(chosen);
      }
    }
  };

  const handleKeyboardSubmit = (val: string) => {
    const clean = cleanAnswerText(val);
    if (!clean) return;

    // Check if matches currently locked zombie or any active zombie (walking or attacking)
    let target = activeZombies.find(
      z => z.id === lockedZombieId && (z.state === 'walking' || z.state === 'attacking') && matchesWord(clean, z.word)
    );
    if (!target) {
      target = activeZombies.find(
        z => (z.state === 'walking' || z.state === 'attacking') && matchesWord(clean, z.word)
      );
    }

    if (target) {
      eliminateZombie(target);
    } else {
      // Missed attempt - penalize accuracy
      setStats(prev => {
        const newTotal = prev.totalAttempts + 1;
        const newAccuracy = Math.round((prev.correctAttempts / newTotal) * 100);
        return {
          ...prev,
          streak: 0,
          multiplier: 1.0,
          totalAttempts: newTotal,
          accuracy: newAccuracy,
        };
      });
    }
  };

  // Handle Voice Input & Auto-Targeting
  const handleSpeechInput = (transcript: string) => {
    const clean = cleanAnswerText(transcript);
    if (!clean) return;

    // Auto-target lock or strike (both walking and attacking)
    let target = activeZombies.find(
      z => (z.state === 'walking' || z.state === 'attacking') && matchesWord(clean, z.word)
    );

    // Also check if transcript contains target word as a token
    if (!target) {
      const tokens = clean.split(' ');
      for (const token of tokens) {
        target = activeZombies.find(
          z => (z.state === 'walking' || z.state === 'attacking') && matchesWord(token, z.word)
        );
        if (target) break;
      }
    }

    // If still no exact match, check prefix for auto-target lock
    if (!target) {
      const prefixMatch = activeZombies.find(z => {
        if (z.state !== 'walking' && z.state !== 'attacking') return false;
        const targetClean = cleanAnswerText(z.word.english);
        return targetClean.startsWith(clean) || clean.startsWith(targetClean);
      });
      if (prefixMatch && prefixMatch.id !== lockedZombieId) {
        setLockedZombieId(prefixMatch.id);
        playSound(() => SoundEngine.playTargetLock());
      }
    }

    if (target) {
      eliminateZombie(target);
    }
  };

  const lockedZombie = activeZombies.find(z => z.id === lockedZombieId) || null;

  return (
    <main
      id="lexideath-app-root"
      className={`fixed inset-0 w-full overflow-hidden select-none bg-slate-950 font-sans ${isDamaged ? 'animate-shake' : ''}`}
      style={{ height: `${viewport.height}px` }}
    >
      {/* Screen Damage Red Flash */}
      {isDamaged && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-red-600/30 ring-inset ring-8 ring-red-500 animate-red-flash" />
      )}

      {/* 3D Isometric Dark Fantasy Arena */}
      <Arena3D
        zombies={activeZombies}
        lockedZombieId={lockedZombieId}
        lightningTargetId={lightningTargetId}
        inputMode={inputMode}
        isKeyboardOpen={effectiveKeyboardOpen}
        onSelectZombie={(id) => {
          setLockedZombieId(id);
          playSound(() => SoundEngine.playTargetLock());
        }}
      />

      {/* In-Game Top Bar Header */}
      {screen === 'playing' && (
        <TopBar
          stats={stats}
          inputMode={inputMode}
          isMuted={isMuted}
          isPaused={isPaused}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleInputMode={() => {
            const nextMode = inputMode === 'voice' ? 'keyboard' : inputMode === 'keyboard' ? 'hybrid' : 'voice';
            setInputMode(nextMode);
          }}
          onOpenGrimoire={() => setScreen('grimoire')}
          onTogglePause={() => setIsPaused(!isPaused)}
        />
      )}

      {screen === 'playing' && !isPaused && missedWordNotice && (
        <MissedWordsFeed notice={missedWordNotice} />
      )}

      {/* In-Game Bottom Dock based on active mode */}
      {screen === 'playing' && !isPaused && (
        <>
          {(inputMode === 'keyboard' || inputMode === 'hybrid') && (
            <KeyboardDock
              inputValue={keyboardInput}
              onChangeInput={handleKeyboardChange}
              onSubmit={handleKeyboardSubmit}
              lockedZombie={lockedZombie}
              onFocusChange={setIsKeyboardOpen}
            />
          )}

          {(inputMode === 'voice' || inputMode === 'hybrid') && (
            <VoiceDock
              isListening={isListening}
              transcript={voiceTranscript}
              isSupported={isSpeechSupported}
              lockedZombie={lockedZombie}
              isContinuous={isContinuousVoice}
              onToggleContinuous={() => setIsContinuousVoice(!isContinuousVoice)}
              onStartListening={() => speechEngineRef.current?.startPushToTalk()}
              onStopListening={() => speechEngineRef.current?.stop()}
              onSwitchToKeyboard={() => setInputMode('keyboard')}
            />
          )}
        </>
      )}

      {/* Pause Overlay */}
      {screen === 'playing' && isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 text-center max-w-sm w-full">
            <h3 className="font-cinzel text-2xl font-bold text-slate-100 mb-2">Jeu en Pause</h3>
            <p className="text-xs text-slate-400 mb-6">Prenez votre souffle avant de reprendre le combat.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsPaused(false)}
                className="py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm cursor-pointer"
              >
                Reprendre le combat
              </button>
              <button
                onClick={() => setScreen('menu')}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Quitter vers le menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu */}
      {screen === 'menu' && (
        <MainMenu
          stats={storedStats}
          selectedMode={inputMode}
          onSelectMode={setInputMode}
          onStartGame={handleStartGame}
          onOpenGrimoire={() => setScreen('grimoire')}
        />
      )}

      {/* Wave Cleared Modal */}
      {screen === 'wave_cleared' && (
        <WaveClearedModal
          stats={stats}
          waveWords={waveEncounteredWordsRef.current}
          breachedWords={waveBreachedWordsRef.current}
          onNextWave={() => startWave(stats.wave + 1)}
          onOpenGrimoire={() => setScreen('grimoire')}
        />
      )}

      {/* Game Over Modal */}
      {screen === 'game_over' && (
        <GameOverModal
          stats={stats}
          missedWords={missedRecords}
          unkilledWords={unkilledWords}
          onRetry={handleStartGame}
          onGoHome={() => setScreen('menu')}
        />
      )}

      {/* Grimoire & Spaced Repetition Review */}
      {screen === 'grimoire' && (
        <GrimoireModal
          missedRecords={missedRecords}
          onClose={() => setScreen(stats.lives > 0 && stats.waveKilled > 0 ? 'playing' : 'menu')}
        />
      )}
    </main>
  );
}
