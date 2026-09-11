import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { GameState, GameStage, TeamId, Question } from '../types/game';
import { ALL_TEAM_IDS } from '../types/game';
import questionsData from '../data/questions.json';
import {
  CHANNEL_NAME,
  STORAGE_KEY,
  INITIAL_STATE,
  loadSavedState,
  saveStateToStorage,
} from '../services/sync';
import type { SyncAction } from '../services/sync';
import { sounds } from '../services/sound';

const questions: Question[] = questionsData as Question[];

interface GameContextType {
  state: GameState;
  currentQuestion: Question | undefined;
  questions: Question[];
  isConnected: boolean;
  setStage: (stage: GameStage) => void;
  startRouletteSpin: () => TeamId | null;
  finishSpin: (team: TeamId) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  add15Seconds: () => void;
  resetTimer: () => void;
  toggleReveal: (forceState?: boolean) => void;
  submitQuestionScore: (drawnCorrect: boolean, paperCorrectTeams: TeamId[]) => void;
  emergencyScoreAdjust: (team: TeamId, delta: number) => void;
  selectRound: (round: number) => void;
  selectQuestion: (questionId: number) => void;
  selectCardQuestion: (questionId: number, cardIndex: number) => void;
  resetGameToStart: () => void;
  toggleSound: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => loadSavedState());
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Sync sound manager enabled state
  useEffect(() => {
    sounds.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Find current question
  const currentQuestion = questions.find((q) => q.id === state.currentQuestionId) || questions[0];

  // Broadcast helper
  const broadcast = useCallback((action: SyncAction) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(action);
      } catch (e) {
        console.error('Error posting message to BroadcastChannel', e);
      }
    }
  }, []);

  // Sync state updater that saves and broadcasts
  const updateStateAndSync = useCallback(
    (updater: (prev: GameState) => GameState, actionToBroadcast?: SyncAction) => {
      setState((prev) => {
        const next = updater(prev);
        next.lastUpdated = Date.now();
        saveStateToStorage(next);
        if (actionToBroadcast) {
          broadcast(actionToBroadcast);
        } else {
          broadcast({ type: 'SYNC_STATE', payload: next });
        }
        return next;
      });
    },
    [broadcast]
  );

  // Initialize BroadcastChannel and localStorage listeners
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = bc;

      bc.onmessage = (event: MessageEvent<SyncAction>) => {
        const action = event.data;
        if (!action || !action.type) return;

        setIsConnected(true);

        switch (action.type) {
          case 'REQUEST_SYNC':
            setState((curr) => {
              if (channelRef.current) {
                channelRef.current.postMessage({ type: 'SYNC_STATE', payload: curr });
              }
              return curr;
            });
            break;

          case 'SYNC_STATE':
            setState(action.payload);
            saveStateToStorage(action.payload);
            break;

          case 'CHANGE_STAGE':
            setState((prev) => {
              const updated = { ...prev, stage: action.payload, lastUpdated: Date.now() };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'START_SPIN':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                isSpinning: true,
                spinningTargetTeam: action.payload.targetTeam,
                spinSeed: action.payload.seed,
                stage: 'roulette',
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'FINISH_SPIN':
            sounds.playRouletteSelected();
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                isSpinning: false,
                drawnTeam: action.payload,
                spinningTargetTeam: null,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'SELECT_CARD':
            sounds.playCorrectReveal();
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                selectedCardIndex: action.payload.cardIndex,
                isCardFlipping: true,
                currentQuestionId: action.payload.questionId,
                usedQuestionIdsInRound: prev.usedQuestionIdsInRound.includes(action.payload.questionId)
                  ? prev.usedQuestionIdsInRound
                  : [...prev.usedQuestionIdsInRound, action.payload.questionId],
                usedCardIndicesInRound: prev.usedCardIndicesInRound.includes(action.payload.cardIndex)
                  ? prev.usedCardIndicesInRound
                  : [...prev.usedCardIndicesInRound, action.payload.cardIndex],
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'FINISH_CARD_FLIP':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                stage: 'question',
                currentQuestionId: action.payload.questionId,
                isCardFlipping: false,
                selectedCardIndex: null,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'TIMER_START':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                timerSeconds: action.payload.seconds,
                timerEndTimestamp: action.payload.endTimestamp,
                isTimerRunning: true,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'TIMER_PAUSE':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                timerSeconds: action.payload.remainingSeconds,
                isTimerRunning: false,
                timerEndTimestamp: null,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'TIMER_ADD_15':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                timerSeconds: action.payload.seconds,
                timerEndTimestamp: action.payload.endTimestamp,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'TIMER_RESET':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                timerSeconds: action.payload.seconds,
                isTimerRunning: false,
                timerEndTimestamp: null,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'TIMER_TICK':
            setState((prev) => ({
              ...prev,
              timerSeconds: action.payload.seconds,
            }));
            break;

          case 'REVEAL_ANSWER':
            if (action.payload) {
              sounds.playCorrectReveal();
            }
            setState((prev) => {
              const updated = { ...prev, isRevealed: action.payload, stage: 'reveal' as GameStage, lastUpdated: Date.now() };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'SUBMIT_POINTS':
            setState((prev) => {
              const available = prev.teamsAvailableInRound.filter((t) => t !== action.payload.drawnTeam);
              const updated: GameState = {
                ...prev,
                scores: action.payload.newScores,
                teamsAvailableInRound: available.length > 0 ? available : [...ALL_TEAM_IDS],
                drawnTeam: null,
                isRevealed: false,
                timerSeconds: 60,
                isTimerRunning: false,
                timerEndTimestamp: null,
                currentQuestionId: action.payload.nextQuestionId ?? prev.currentQuestionId,
                stage: 'leaderboard',
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'EMERGENCY_SCORE':
            setState((prev) => {
              const updated = { ...prev, scores: action.payload.newScores, lastUpdated: Date.now() };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'SET_ROUND':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                currentRound: action.payload.round,
                currentQuestionId: action.payload.questionId,
                teamsAvailableInRound: [...ALL_TEAM_IDS],
                usedQuestionIdsInRound: [],
                usedCardIndicesInRound: [],
                selectedCardIndex: null,
                isCardFlipping: false,
                drawnTeam: null,
                isRevealed: false,
                timerSeconds: 60,
                isTimerRunning: false,
                stage: action.payload.round === 7 ? 'sudden_death' : 'splash',
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'SET_QUESTION':
            setState((prev) => {
              const updated = {
                ...prev,
                currentQuestionId: action.payload,
                isRevealed: false,
                timerSeconds: 60,
                isTimerRunning: false,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'RESET_GAME':
            setState(action.payload);
            saveStateToStorage(action.payload);
            break;
        }
      };

      // Request fresh state from other active tabs
      bc.postMessage({ type: 'REQUEST_SYNC' });
    } catch (e) {
      console.warn('BroadcastChannel not supported or failed to instantiate', e);
    }

    // Storage event fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setState(fresh);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Timer interval ticker based on precise timestamp
  useEffect(() => {
    if (state.isTimerRunning && state.timerEndTimestamp) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      timerIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((state.timerEndTimestamp! - now) / 1000));

        // Trigger sounds
        if (remaining > 10) {
          sounds.playTimerTick();
        } else if (remaining > 0) {
          sounds.playWarningBeep();
        } else if (remaining === 0) {
          sounds.playTimesUp();
        }

        setState((prev) => ({
          ...prev,
          timerSeconds: remaining,
          isTimerRunning: remaining > 0,
        }));

        if (remaining === 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          updateStateAndSync((prev) => ({
            ...prev,
            timerSeconds: 0,
            isTimerRunning: false,
            timerEndTimestamp: null,
          }), { type: 'TIMER_PAUSE', payload: { remainingSeconds: 0 } });
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [state.isTimerRunning, state.timerEndTimestamp, updateStateAndSync]);

  // STAGE MANAGEMENT
  const setStage = useCallback((stage: GameStage) => {
    if (stage === 'podium') {
      sounds.playVictoryFanfare();
    }
    updateStateAndSync(
      (prev) => ({ ...prev, stage }),
      { type: 'CHANGE_STAGE', payload: stage }
    );
  }, [updateStateAndSync]);

  // ROULETTE
  const startRouletteSpin = useCallback((): TeamId | null => {
    const available = state.teamsAvailableInRound.length > 0 ? state.teamsAvailableInRound : ALL_TEAM_IDS;
    const randomIndex = Math.floor(Math.random() * available.length);
    const targetTeam = available[randomIndex];
    const seed = Math.random();

    updateStateAndSync(
      (prev) => ({
        ...prev,
        isSpinning: true,
        spinningTargetTeam: targetTeam,
        spinSeed: seed,
        stage: 'roulette',
      }),
      { type: 'START_SPIN', payload: { targetTeam, seed } }
    );

    return targetTeam;
  }, [state.teamsAvailableInRound, updateStateAndSync]);

  const finishSpin = useCallback((team: TeamId) => {
    sounds.playRouletteSelected();
    updateStateAndSync(
      (prev) => ({
        ...prev,
        isSpinning: false,
        drawnTeam: team,
        spinningTargetTeam: null,
      }),
      { type: 'FINISH_SPIN', payload: team }
    );

    // After celebratory highlight on the roulette (2s), transition smoothly to card_selection
    setTimeout(() => {
      updateStateAndSync(
        (prev) => ({
          ...prev,
          stage: 'card_selection',
        }),
        { type: 'CHANGE_STAGE', payload: 'card_selection' }
      );
    }, 2000);
  }, [updateStateAndSync]);

  // TIMER CONTROLS
  const startTimer = useCallback(() => {
    const currentSecs = state.timerSeconds > 0 ? state.timerSeconds : 60;
    const endTimestamp = Date.now() + currentSecs * 1000;

    updateStateAndSync(
      (prev) => ({
        ...prev,
        timerSeconds: currentSecs,
        timerEndTimestamp: endTimestamp,
        isTimerRunning: true,
        stage: 'timer',
      }),
      { type: 'TIMER_START', payload: { seconds: currentSecs, endTimestamp } }
    );
  }, [state.timerSeconds, updateStateAndSync]);

  const pauseTimer = useCallback(() => {
    updateStateAndSync(
      (prev) => ({
        ...prev,
        isTimerRunning: false,
        timerEndTimestamp: null,
      }),
      { type: 'TIMER_PAUSE', payload: { remainingSeconds: state.timerSeconds } }
    );
  }, [state.timerSeconds, updateStateAndSync]);

  const add15Seconds = useCallback(() => {
    const newSeconds = state.timerSeconds + 15;
    const endTimestamp = state.isTimerRunning ? Date.now() + newSeconds * 1000 : null;

    updateStateAndSync(
      (prev) => ({
        ...prev,
        timerSeconds: newSeconds,
        timerEndTimestamp: endTimestamp,
      }),
      { type: 'TIMER_ADD_15', payload: { seconds: newSeconds, endTimestamp: endTimestamp || 0 } }
    );
  }, [state.timerSeconds, state.isTimerRunning, updateStateAndSync]);

  const resetTimer = useCallback(() => {
    updateStateAndSync(
      (prev) => ({
        ...prev,
        timerSeconds: 60,
        isTimerRunning: false,
        timerEndTimestamp: null,
      }),
      { type: 'TIMER_RESET', payload: { seconds: 60 } }
    );
  }, [updateStateAndSync]);

  // REVEAL
  const toggleReveal = useCallback((forceState?: boolean) => {
    const targetState = forceState !== undefined ? forceState : !state.isRevealed;
    if (targetState) {
      sounds.playCorrectReveal();
    }
    updateStateAndSync(
      (prev) => ({
        ...prev,
        isRevealed: targetState,
        stage: targetState ? 'reveal' : prev.stage,
      }),
      { type: 'REVEAL_ANSWER', payload: targetState }
    );
  }, [state.isRevealed, updateStateAndSync]);

  // SUBMIT SCORE
  const submitQuestionScore = useCallback(
    (drawnCorrect: boolean, paperCorrectTeams: TeamId[]) => {
      const q = currentQuestion;
      const fullPts = q?.pontosCheios ?? 10;
      const halfPts = q?.pontosMeios ?? 5;

      const pointsAwarded: Record<TeamId, number> = {
        UCP: 0,
        UPA: 0,
        UMP: 0,
        Casais: 0,
        Adultos: 0,
      };

      if (state.drawnTeam && drawnCorrect) {
        pointsAwarded[state.drawnTeam] = fullPts;
      }

      paperCorrectTeams.forEach((t) => {
        if (t !== state.drawnTeam) {
          pointsAwarded[t] = (pointsAwarded[t] || 0) + halfPts;
        }
      });

      const newScores: Record<TeamId, number> = {
        UCP: state.scores.UCP + pointsAwarded.UCP,
        UPA: state.scores.UPA + pointsAwarded.UPA,
        UMP: state.scores.UMP + pointsAwarded.UMP,
        Casais: state.scores.Casais + pointsAwarded.Casais,
        Adultos: state.scores.Adultos + pointsAwarded.Adultos,
      };

      // Calculate next available question in round or next round
      let nextQId = state.currentQuestionId + 1;
      if (nextQId > questions.length) nextQId = questions.length;

      updateStateAndSync(
        (prev) => {
          const available = prev.teamsAvailableInRound.filter((t) => t !== prev.drawnTeam);
          return {
            ...prev,
            scores: newScores,
            teamsAvailableInRound: available.length > 0 ? available : [...ALL_TEAM_IDS],
            drawnTeam: null,
            isRevealed: false,
            timerSeconds: 60,
            isTimerRunning: false,
            timerEndTimestamp: null,
            currentQuestionId: nextQId,
            stage: 'leaderboard',
            history: [
              ...prev.history,
              {
                round: prev.currentRound,
                questionId: prev.currentQuestionId,
                drawnTeam: prev.drawnTeam,
                drawnCorrect,
                paperCorrectTeams,
                pointsAwarded,
                timestamp: Date.now(),
              },
            ],
          };
        },
        {
          type: 'SUBMIT_POINTS',
          payload: {
            drawnTeam: state.drawnTeam,
            drawnCorrect,
            paperCorrectTeams,
            pointsAwarded,
            newScores,
            nextQuestionId: nextQId,
          },
        }
      );
    },
    [currentQuestion, state.drawnTeam, state.scores, state.currentQuestionId, updateStateAndSync]
  );

  // EMERGENCY SCORE ADJUST (+5 / -5)
  const emergencyScoreAdjust = useCallback(
    (team: TeamId, delta: number) => {
      const newScores = {
        ...state.scores,
        [team]: Math.max(0, state.scores[team] + delta),
      };

      updateStateAndSync(
        (prev) => ({ ...prev, scores: newScores }),
        { type: 'EMERGENCY_SCORE', payload: { team, delta, newScores } }
      );
    },
    [state.scores, updateStateAndSync]
  );

  // SELECT ROUND (1 to 7)
  const selectRound = useCallback(
    (round: number) => {
      // Find first question for this round
      const firstQInRound = questions.find((q) => q.rodada === round);
      const qId = firstQInRound ? firstQInRound.id : state.currentQuestionId;

      updateStateAndSync(
        (prev) => ({
          ...prev,
          currentRound: round,
          currentQuestionId: qId,
          teamsAvailableInRound: [...ALL_TEAM_IDS],
          usedQuestionIdsInRound: [],
          usedCardIndicesInRound: [],
          selectedCardIndex: null,
          isCardFlipping: false,
          drawnTeam: null,
          isRevealed: false,
          timerSeconds: 60,
          isTimerRunning: false,
          stage: round === 7 ? 'sudden_death' : 'splash',
        }),
        { type: 'SET_ROUND', payload: { round, questionId: qId } }
      );
    },
    [state.currentQuestionId, updateStateAndSync]
  );

  // SELECT QUESTION CARD INTERACTIVELY
  const selectCardQuestion = useCallback(
    (questionId: number, cardIndex: number) => {
      sounds.playCorrectReveal();

      // Resolve question based on drawn team:
      // If UCP is the drawn team, ALWAYS assign the Kids question of the current round
      const questionsInRound = questions.filter((q) => q.rodada === state.currentRound);
      const kidsQ = questionsInRound.find((q) => q.isKids) || questionsInRound[0];
      const adultQuestions = questionsInRound.filter((q) => !q.isKids);

      let resolvedQId = questionId;

      if (state.drawnTeam === 'UCP') {
        resolvedQId = kidsQ.id;
      } else {
        // Non-UCP teams must never receive the kids question
        const availableAdultQuestions = adultQuestions.filter(
          (q) => !state.usedQuestionIdsInRound.includes(q.id)
        );
        const naturalQ = questionsInRound[cardIndex];
        if (naturalQ && !naturalQ.isKids && availableAdultQuestions.some((q) => q.id === naturalQ.id)) {
          resolvedQId = naturalQ.id;
        } else if (availableAdultQuestions.length > 0) {
          resolvedQId = availableAdultQuestions[0].id;
        } else {
          resolvedQId = naturalQ ? naturalQ.id : questionId;
        }
      }

      // Trigger 3D flip animation
      updateStateAndSync(
        (prev) => ({
          ...prev,
          selectedCardIndex: cardIndex,
          isCardFlipping: true,
          currentQuestionId: resolvedQId,
          usedQuestionIdsInRound: prev.usedQuestionIdsInRound.includes(resolvedQId)
            ? prev.usedQuestionIdsInRound
            : [...prev.usedQuestionIdsInRound, resolvedQId],
          usedCardIndicesInRound: prev.usedCardIndicesInRound.includes(cardIndex)
            ? prev.usedCardIndicesInRound
            : [...prev.usedCardIndicesInRound, cardIndex],
        }),
        { type: 'SELECT_CARD', payload: { questionId: resolvedQId, cardIndex } }
      );

      // Transition to question presentation after flip animation
      setTimeout(() => {
        updateStateAndSync(
          (prev) => ({
            ...prev,
            stage: 'question',
            isCardFlipping: false,
            selectedCardIndex: null,
          }),
          { type: 'FINISH_CARD_FLIP', payload: { questionId: resolvedQId } }
        );
      }, 1400);
    },
    [state.currentRound, state.drawnTeam, state.usedQuestionIdsInRound, updateStateAndSync]
  );

  // SELECT QUESTION MANUALLY
  const selectQuestion = useCallback(
    (questionId: number) => {
      const q = questions.find((item) => item.id === questionId);
      if (!q) return;

      updateStateAndSync(
        (prev) => ({
          ...prev,
          currentQuestionId: questionId,
          currentRound: q.rodada,
          isRevealed: false,
          timerSeconds: 60,
          isTimerRunning: false,
        }),
        { type: 'SET_QUESTION', payload: questionId }
      );
    },
    [updateStateAndSync]
  );

  // RESET GAME
  const resetGameToStart = useCallback(() => {
    const fresh = { ...INITIAL_STATE, lastUpdated: Date.now() };
    saveStateToStorage(fresh);
    setState(fresh);
    broadcast({ type: 'RESET_GAME', payload: fresh });
  }, [broadcast]);

  // TOGGLE SOUND
  const toggleSound = useCallback(() => {
    setState((prev) => {
      const nextSound = !prev.soundEnabled;
      sounds.enabled = nextSound;
      const updated = { ...prev, soundEnabled: nextSound };
      saveStateToStorage(updated);
      return updated;
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        currentQuestion,
        questions,
        isConnected,
        setStage,
        startRouletteSpin,
        finishSpin,
        startTimer,
        pauseTimer,
        add15Seconds,
        resetTimer,
        toggleReveal,
        submitQuestionScore,
        emergencyScoreAdjust,
        selectRound,
        selectQuestion,
        selectCardQuestion,
        resetGameToStart,
        toggleSound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
