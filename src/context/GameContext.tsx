import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { GameState, GameStage, TeamId, TeamInfo, Question, ActionCardType } from '../types/game';
import {
  DEFAULT_TEAMS,
  DEFAULT_TIMER_SECONDS,
  FIXED_QUESTION_POINTS,
  ROUNDS_INFO,
  getTeam,
} from '../types/game';
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
  canUndo: boolean;
  historyCount: number;
  setStage: (stage: GameStage) => void;
  advanceGameStep: () => void;
  undoLastAction: () => void;
  getNextStepInfo: () => { label: string; actionDescription: string; canAdvance: boolean };
  startRouletteSpin: () => TeamId | null;
  finishSpin: (team: TeamId) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  add15Seconds: () => void;
  resetTimer: () => void;
  toggleReveal: (forceState?: boolean) => void;
  preselectOption: (index: number | null) => void;
  confirmOptionAnswer: (index: number) => { isCorrect: boolean };
  evaluateDissertativeAnswer: (isCorrect: boolean) => void;
  submitQuestionScore: (drawnCorrect: boolean, paperCorrectTeams?: TeamId[]) => void;
  emergencyScoreAdjust: (team: TeamId, delta: number) => void;
  setTeamScore: (team: TeamId, newScore: number) => void;
  selectRound: (round: number) => void;
  selectQuestion: (questionId: number) => void;
  selectCardQuestion: (questionId: number, cardIndex: number) => void;
  drawNextRandomQuestion: () => void;
  updateTeams: (newTeams: TeamInfo[], resetScores: boolean) => void;
  resetGameToStart: () => void;
  toggleSound: () => void;
  useActionCard: (cardType: ActionCardType) => void;
  clearLastCardUsed: () => void;
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

  // Helper to pick next random unused question
  const pickRandomUnusedQuestionId = useCallback((usedIds: number[]): number => {
    const unused = questions.filter((q) => !usedIds.includes(q.id));
    if (unused.length > 0) {
      const idx = Math.floor(Math.random() * unused.length);
      return unused[idx].id;
    }
    // If all used, pick any random question
    const idx = Math.floor(Math.random() * questions.length);
    return questions[idx]?.id || 1;
  }, []);

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

  const [historyStack, setHistoryStack] = useState<GameState[]>([]);

  // Sync state updater that saves and broadcasts
  const updateStateAndSync = useCallback(
    (updater: (prev: GameState) => GameState, actionToBroadcast?: SyncAction, skipSnapshot = false) => {
      setState((prev) => {
        if (!skipSnapshot) {
          setHistoryStack((stack) => [...stack.slice(-25), JSON.parse(JSON.stringify(prev))]);
        }
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
              const effectiveStage = action.payload;
              const updated = {
                ...prev,
                stage: effectiveStage,
                isSpinning: false,
                spinningTargetTeam: null,
                ...(effectiveStage !== 'reveal'
                  ? {
                      isRevealed: false,
                      answerStatus: 'idle' as const,
                      selectedOptionIndex: null,
                    }
                  : {}),
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'UPDATE_TEAMS': {
            const { teams, resetScores } = action.payload;
            setState((prev) => {
              const teamOrder = teams.map((t) => t.id);
              const newScores: Record<TeamId, number> = {};
              const newCards: Record<TeamId, any> = {};

              teams.forEach((t) => {
                newScores[t.id] = resetScores ? 0 : prev.scores[t.id] || 0;
                newCards[t.id] = resetScores
                  ? { skip: 2, bible: 1, fiftyFifty: 1 }
                  : prev.actionCards[t.id] || { skip: 2, bible: 1, fiftyFifty: 1 };
              });

              const updated: GameState = {
                ...prev,
                teams,
                teamOrder,
                currentTurnTeamIndex: 0,
                drawnTeam: teamOrder[0] || null,
                scores: newScores,
                actionCards: newCards,
                teamsAvailableInRound: [...teamOrder],
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;
          }

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

          case 'USE_ACTION_CARD': {
            const { team, cardType, eliminatedOptionIndices, newQuestionId } = action.payload;
            if (cardType === 'fiftyFifty') {
              sounds.playCard5050();
            } else if (cardType === 'bible') {
              sounds.playBibleConsult();
            } else if (cardType === 'skip') {
              sounds.playSkipCard();
            }

            setState((prev) => {
              const currentCards = prev.actionCards?.[team] || { skip: 2, bible: 1, fiftyFifty: 1 };
              const updatedCount = Math.max(0, (currentCards[cardType] || 0) - 1);
              const newCards = {
                ...prev.actionCards,
                [team]: {
                  ...currentCards,
                  [cardType]: updatedCount,
                },
              };

              let newTimerSeconds = prev.timerSeconds;
              let newTimerMaxSeconds = prev.timerMaxSeconds || DEFAULT_TIMER_SECONDS;
              let newTimerEndTimestamp = prev.timerEndTimestamp;
              let isRunning = prev.isTimerRunning;
              let nextStage = prev.stage;
              let announcement = '';

              if (cardType === 'bible') {
                newTimerSeconds = 30;
                newTimerMaxSeconds = 30;
                newTimerEndTimestamp = Date.now() + 30 * 1000;
                isRunning = true;
                if (nextStage === 'question') {
                  nextStage = 'timer';
                }
                announcement = `📖 Consulta Bíblica: 30s para pesquisar na Bíblia!`;
              } else if (cardType === 'fiftyFifty') {
                announcement = `🌓 50/50: 2 alternativas eliminadas para ${team}!`;
              } else if (cardType === 'skip') {
                announcement = `🏃‍♂️ ${team} usou a carta PULAR! Uma nova pergunta foi sorteada!`;
                newTimerSeconds = DEFAULT_TIMER_SECONDS;
                newTimerMaxSeconds = DEFAULT_TIMER_SECONDS;
                newTimerEndTimestamp = null;
                isRunning = false;
                nextStage = 'question';
              }

              const updated: GameState = {
                ...prev,
                actionCards: newCards,
                eliminatedOptionIndices:
                  cardType === 'skip'
                    ? []
                    : eliminatedOptionIndices !== undefined
                    ? eliminatedOptionIndices
                    : prev.eliminatedOptionIndices,
                isQuestionSkipped: cardType === 'skip',
                timerSeconds: newTimerSeconds,
                timerMaxSeconds: newTimerMaxSeconds,
                timerEndTimestamp: newTimerEndTimestamp,
                isTimerRunning: isRunning,
                stage: nextStage,
                activeCardAnnouncement: announcement,
                currentQuestionId: newQuestionId || prev.currentQuestionId,
                isRevealed: cardType === 'skip' ? false : prev.isRevealed,
                answerStatus: cardType === 'skip' ? 'idle' : prev.answerStatus,
                selectedOptionIndex: cardType === 'skip' ? null : prev.selectedOptionIndex,
                lastCardUsed: { type: cardType, team, timestamp: Date.now() },
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;
          }

          case 'CLEAR_LAST_CARD_USED':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                lastCardUsed: null,
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
                stage: 'timer',
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
              const updated: GameState = {
                ...prev,
                isRevealed: action.payload,
                answerStatus: action.payload ? 'correct' : 'idle',
                selectedOptionIndex: action.payload ? prev.selectedOptionIndex : null,
                stage: action.payload ? 'reveal' : (prev.stage === 'reveal' ? 'question' : prev.stage),
                ...(action.payload ? { isTimerRunning: false, timerEndTimestamp: null } : {}),
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'PRESELECT_OPTION':
            if (action.payload.optionIndex !== null) {
              sounds.playSelectionTick();
            }
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                selectedOptionIndex: action.payload.optionIndex,
                answerStatus: action.payload.optionIndex !== null ? 'selected' : 'idle',
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'CONFIRM_ANSWER':
            if (action.payload.isCorrect) {
              sounds.playCorrectReveal();
            } else {
              sounds.playWrongAnswer();
            }
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                isRevealed: true,
                selectedOptionIndex:
                  action.payload.optionIndex >= 0 ? action.payload.optionIndex : null,
                answerStatus: action.payload.isCorrect ? 'correct' : 'wrong',
                scores: action.payload.newScores ?? prev.scores,
                stage: 'reveal',
                isTimerRunning: false,
                timerEndTimestamp: null,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'SUBMIT_POINTS':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                scores: action.payload.newScores,
                isRevealed: false,
                selectedOptionIndex: null,
                answerStatus: 'idle',
                timerSeconds: DEFAULT_TIMER_SECONDS,
                timerMaxSeconds: DEFAULT_TIMER_SECONDS,
                isTimerRunning: false,
                timerEndTimestamp: null,
                currentQuestionId: action.payload.nextQuestionId ?? prev.currentQuestionId,
                stage: 'leaderboard',
                eliminatedOptionIndices: [],
                isQuestionSkipped: false,
                activeCardAnnouncement: null,
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
                isRevealed: false,
                timerSeconds: DEFAULT_TIMER_SECONDS,
                timerMaxSeconds: DEFAULT_TIMER_SECONDS,
                isTimerRunning: false,
                stage: action.payload.round === 7 ? 'sudden_death' : 'splash',
                eliminatedOptionIndices: [],
                isQuestionSkipped: false,
                skipsUsedInRound: 0,
                activeCardAnnouncement: null,
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
                answerStatus: 'idle' as const,
                selectedOptionIndex: null,
                timerSeconds: DEFAULT_TIMER_SECONDS,
                timerMaxSeconds: DEFAULT_TIMER_SECONDS,
                isTimerRunning: false,
                timerEndTimestamp: null,
                stage: prev.stage === 'reveal' ? ('question' as GameStage) : prev.stage,
                eliminatedOptionIndices: [],
                isQuestionSkipped: false,
                activeCardAnnouncement: null,
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

      bc.postMessage({ type: 'REQUEST_SYNC' });
    } catch (e) {
      console.warn('BroadcastChannel not supported or failed to instantiate', e);
    }

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
          updateStateAndSync(
            (prev) => ({
              ...prev,
              timerSeconds: 0,
              isTimerRunning: false,
              timerEndTimestamp: null,
            }),
            { type: 'TIMER_PAUSE', payload: { remainingSeconds: 0 } }
          );
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
  const setStage = useCallback(
    (stage: GameStage) => {
      if (stage === 'podium') {
        sounds.playVictoryFanfare();
      }
      updateStateAndSync(
        (prev) => ({
          ...prev,
          stage,
          ...(stage !== 'reveal'
            ? {
                isRevealed: false,
                answerStatus: 'idle' as const,
                selectedOptionIndex: null,
                ...(stage === 'question'
                  ? {
                      timerSeconds: DEFAULT_TIMER_SECONDS,
                      timerMaxSeconds: DEFAULT_TIMER_SECONDS,
                      isTimerRunning: false,
                    }
                  : {}),
              }
            : {}),
        }),
        { type: 'CHANGE_STAGE', payload: stage }
      );
    },
    [updateStateAndSync]
  );

  // UPDATE TEAMS CONFIGURATION
  const updateTeams = useCallback(
    (newTeams: TeamInfo[], resetScores: boolean) => {
      const order = newTeams.map((t) => t.id);
      updateStateAndSync(
        (prev) => {
          const newScores: Record<TeamId, number> = {};
          const newCards: Record<TeamId, any> = {};

          newTeams.forEach((t) => {
            newScores[t.id] = resetScores ? 0 : prev.scores[t.id] || 0;
            newCards[t.id] = resetScores
              ? { skip: 2, bible: 1, fiftyFifty: 1 }
              : prev.actionCards[t.id] || { skip: 2, bible: 1, fiftyFifty: 1 };
          });

          return {
            ...prev,
            teams: newTeams,
            teamOrder: order,
            currentTurnTeamIndex: 0,
            drawnTeam: order[0] || null,
            scores: newScores,
            actionCards: newCards,
            teamsAvailableInRound: [...order],
          };
        },
        { type: 'UPDATE_TEAMS', payload: { teams: newTeams, resetScores } }
      );
    },
    [updateStateAndSync]
  );

  // ROULETTE (Optional / Turn Presentation)
  const startRouletteSpin = useCallback((): TeamId | null => {
    const available = state.teamOrder.length > 0 ? state.teamOrder : DEFAULT_TEAMS.map((t) => t.id);
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
  }, [state.teamOrder, updateStateAndSync]);

  const finishSpin = useCallback(
    (team: TeamId) => {
      sounds.playRouletteSelected();

      updateStateAndSync(
        (prev) => ({
          ...prev,
          isSpinning: false,
          drawnTeam: team,
          spinningTargetTeam: null,
          isRevealed: false,
          answerStatus: 'idle',
          selectedOptionIndex: null,
          timerSeconds: DEFAULT_TIMER_SECONDS,
          timerMaxSeconds: DEFAULT_TIMER_SECONDS,
          isTimerRunning: false,
        }),
        { type: 'FINISH_SPIN', payload: team }
      );

      setTimeout(() => {
        setStage('question');
      }, 1800);
    },
    [setStage, updateStateAndSync]
  );

  // TIMER CONTROLS
  const startTimer = useCallback(() => {
    const currentSecs = state.timerSeconds > 0 ? state.timerSeconds : DEFAULT_TIMER_SECONDS;
    const endTimestamp = Date.now() + currentSecs * 1000;
    const maxSecs = state.timerMaxSeconds && state.timerMaxSeconds > 0 ? state.timerMaxSeconds : DEFAULT_TIMER_SECONDS;

    updateStateAndSync(
      (prev) => ({
        ...prev,
        timerSeconds: currentSecs,
        timerMaxSeconds: maxSecs,
        timerEndTimestamp: endTimestamp,
        isTimerRunning: true,
        stage: 'timer',
      }),
      { type: 'TIMER_START', payload: { seconds: currentSecs, endTimestamp, maxSeconds: maxSecs } }
    );
  }, [state.timerSeconds, state.timerMaxSeconds, updateStateAndSync]);

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
        timerSeconds: DEFAULT_TIMER_SECONDS,
        timerMaxSeconds: DEFAULT_TIMER_SECONDS,
        isTimerRunning: false,
        timerEndTimestamp: null,
      }),
      { type: 'TIMER_RESET', payload: { seconds: DEFAULT_TIMER_SECONDS } }
    );
  }, [updateStateAndSync]);

  // REVEAL GABARITO TOGGLE
  const toggleReveal = useCallback(
    (forceState?: boolean) => {
      const targetState = forceState !== undefined ? forceState : !state.isRevealed;
      if (targetState) {
        sounds.playCorrectReveal();
      }
      updateStateAndSync(
        (prev) => ({
          ...prev,
          isRevealed: targetState,
          answerStatus: targetState ? 'correct' : 'idle',
          selectedOptionIndex: targetState ? prev.selectedOptionIndex : null,
          stage: targetState ? 'reveal' : prev.stage === 'reveal' ? 'question' : prev.stage,
          ...(targetState ? { isTimerRunning: false, timerEndTimestamp: null } : {}),
        }),
        { type: 'REVEAL_ANSWER', payload: targetState }
      );
    },
    [state.isRevealed, updateStateAndSync]
  );

  // PRESELECT OPTION
  const preselectOption = useCallback(
    (index: number | null) => {
      if (index !== null) {
        sounds.playSelectionTick();
      }
      updateStateAndSync(
        (prev) => ({
          ...prev,
          selectedOptionIndex: index,
          answerStatus: index !== null ? 'selected' : 'idle',
        }),
        { type: 'PRESELECT_OPTION', payload: { optionIndex: index } }
      );
    },
    [updateStateAndSync]
  );

  // CONFIRM OPTION ANSWER (Multiple Choice)
  const confirmOptionAnswer = useCallback(
    (index: number) => {
      const q = currentQuestion;
      const isCorrect =
        !!q &&
        q.opcoes[index]?.trim().toLowerCase() === q.respostaCorreta?.trim().toLowerCase();

      const newScores = { ...state.scores };
      if (isCorrect) {
        sounds.playCorrectReveal();
        if (state.drawnTeam) {
          newScores[state.drawnTeam] = (newScores[state.drawnTeam] || 0) + FIXED_QUESTION_POINTS;
        }
      } else {
        sounds.playWrongAnswer();
      }

      updateStateAndSync(
        (prev) => ({
          ...prev,
          isRevealed: true,
          selectedOptionIndex: index,
          answerStatus: isCorrect ? 'correct' : 'wrong',
          scores: newScores,
          stage: 'reveal',
          isTimerRunning: false,
          timerEndTimestamp: null,
        }),
        {
          type: 'CONFIRM_ANSWER',
          payload: {
            optionIndex: index,
            isCorrect,
            drawnTeam: state.drawnTeam,
            newScores,
          },
        }
      );

      return { isCorrect };
    },
    [currentQuestion, state.scores, state.drawnTeam, updateStateAndSync]
  );

  // EVALUATE DISSERTATIVE ANSWER (Admin evaluates Correto / Incorreto)
  const evaluateDissertativeAnswer = useCallback(
    (isCorrect: boolean) => {
      const newScores = { ...state.scores };

      if (isCorrect) {
        sounds.playCorrectReveal();
        if (state.drawnTeam) {
          newScores[state.drawnTeam] = (newScores[state.drawnTeam] || 0) + FIXED_QUESTION_POINTS;
        }
      } else {
        sounds.playWrongAnswer();
      }

      updateStateAndSync(
        (prev) => ({
          ...prev,
          isRevealed: true,
          selectedOptionIndex: null,
          answerStatus: isCorrect ? 'correct' : 'wrong',
          scores: newScores,
          stage: 'reveal',
          isTimerRunning: false,
          timerEndTimestamp: null,
        }),
        {
          type: 'CONFIRM_ANSWER',
          payload: {
            optionIndex: -1,
            isCorrect,
            drawnTeam: state.drawnTeam,
            newScores,
          },
        }
      );
    },
    [state.scores, state.drawnTeam, updateStateAndSync]
  );

  // SUBMIT SCORE & COMPLETE TURN
  const submitQuestionScore = useCallback(
    (drawnCorrect: boolean, _paperCorrectTeams?: TeamId[]) => {
      const activeTeam = state.drawnTeam;
      const isSkipped = state.isQuestionSkipped;

      const newScores = { ...state.scores };
      if (!isSkipped && activeTeam && drawnCorrect) {
        newScores[activeTeam] = (newScores[activeTeam] || 0) + FIXED_QUESTION_POINTS;
      }

      // Next random question
      const updatedUsedIds = [...state.usedQuestionIdsTotal, state.currentQuestionId];
      const nextQId = pickRandomUnusedQuestionId(updatedUsedIds);

      // Advance team turn index
      const order = state.teamOrder.length > 0 ? state.teamOrder : DEFAULT_TEAMS.map((t) => t.id);
      const nextTurnIndex = (state.currentTurnTeamIndex + 1) % order.length;
      const nextTeam = order[nextTurnIndex];

      const pointsAwarded: Record<TeamId, number> = {};
      order.forEach((t) => {
        pointsAwarded[t] = t === activeTeam && drawnCorrect && !isSkipped ? FIXED_QUESTION_POINTS : 0;
      });

      updateStateAndSync(
        (prev) => ({
          ...prev,
          scores: newScores,
          drawnTeam: nextTeam,
          currentTurnTeamIndex: nextTurnIndex,
          isRevealed: false,
          selectedOptionIndex: null,
          answerStatus: 'idle',
          timerSeconds: DEFAULT_TIMER_SECONDS,
          timerMaxSeconds: DEFAULT_TIMER_SECONDS,
          isTimerRunning: false,
          timerEndTimestamp: null,
          currentQuestionId: nextQId,
          stage: 'leaderboard',
          eliminatedOptionIndices: [],
          isQuestionSkipped: false,
          activeCardAnnouncement: null,
          usedQuestionIdsTotal: updatedUsedIds,
          history: [
            ...prev.history,
            {
              round: prev.currentRound,
              questionId: prev.currentQuestionId,
              drawnTeam: activeTeam,
              drawnCorrect: !isSkipped && drawnCorrect,
              paperCorrectTeams: [],
              pointsAwarded,
              timestamp: Date.now(),
            },
          ],
        }),
        {
          type: 'SUBMIT_POINTS',
          payload: {
            drawnTeam: activeTeam,
            drawnCorrect: !isSkipped && drawnCorrect,
            paperCorrectTeams: [],
            pointsAwarded,
            newScores,
            nextQuestionId: nextQId,
            wasSkipped: isSkipped,
          },
        }
      );
    },
    [state.drawnTeam, state.isQuestionSkipped, state.scores, state.usedQuestionIdsTotal, state.currentQuestionId, state.teamOrder, state.currentTurnTeamIndex, pickRandomUnusedQuestionId, updateStateAndSync]
  );

  // DRAW NEXT RANDOM QUESTION
  const drawNextRandomQuestion = useCallback(() => {
    const nextQId = pickRandomUnusedQuestionId(state.usedQuestionIdsTotal);
    updateStateAndSync(
      (prev) => ({
        ...prev,
        currentQuestionId: nextQId,
        isRevealed: false,
        answerStatus: 'idle',
        selectedOptionIndex: null,
        timerSeconds: DEFAULT_TIMER_SECONDS,
        timerMaxSeconds: DEFAULT_TIMER_SECONDS,
        isTimerRunning: false,
        timerEndTimestamp: null,
        eliminatedOptionIndices: [],
        isQuestionSkipped: false,
        activeCardAnnouncement: null,
      }),
      { type: 'SET_QUESTION', payload: nextQId }
    );
  }, [state.usedQuestionIdsTotal, pickRandomUnusedQuestionId, updateStateAndSync]);

  // USE ACTION CARD
  const useActionCard = useCallback(
    (cardType: ActionCardType) => {
      const activeTeam = state.drawnTeam;
      if (!activeTeam) return;

      const teamCards = state.actionCards?.[activeTeam] || { skip: 2, bible: 1, fiftyFifty: 1 };
      if (!teamCards || teamCards[cardType] <= 0) return;

      let eliminatedIndices: number[] | undefined = undefined;
      let newQId: number | undefined = undefined;

      if (cardType === 'fiftyFifty') {
        if (!currentQuestion || !currentQuestion.opcoes || currentQuestion.opcoes.length <= 2) {
          return;
        }
        if (state.eliminatedOptionIndices && state.eliminatedOptionIndices.length > 0) {
          return;
        }

        sounds.playCard5050();
        const correctText = currentQuestion.respostaCorreta.trim().toLowerCase();
        const wrongIndices: number[] = [];
        currentQuestion.opcoes.forEach((op, idx) => {
          if (op.trim().toLowerCase() !== correctText) {
            wrongIndices.push(idx);
          }
        });

        const shuffled = [...wrongIndices].sort(() => 0.5 - Math.random());
        eliminatedIndices = shuffled.slice(0, 2);
      } else if (cardType === 'skip') {
        sounds.playSkipCard();
        // Pick new random question immediately for this team
        const updatedUsedIds = [...state.usedQuestionIdsTotal, state.currentQuestionId];
        newQId = pickRandomUnusedQuestionId(updatedUsedIds);
      }

      const updatedCount = Math.max(0, teamCards[cardType] - 1);
      const newActionCards = {
        ...state.actionCards,
        [activeTeam]: {
          ...teamCards,
          [cardType]: updatedCount,
        },
      };

      let newTimerSeconds = state.timerSeconds;
      let newTimerMaxSeconds = state.timerMaxSeconds || DEFAULT_TIMER_SECONDS;
      let newTimerEndTimestamp = state.timerEndTimestamp;
      let isRunning = state.isTimerRunning;
      let nextStage = state.stage;
      let announcement = '';

      if (cardType === 'bible') {
        sounds.playBibleConsult();
        newTimerSeconds = 30;
        newTimerMaxSeconds = 30;
        newTimerEndTimestamp = Date.now() + 30 * 1000;
        isRunning = true;
        if (nextStage === 'question') {
          nextStage = 'timer';
        }
        announcement = `📖 Consulta Bíblica: 30s adicionais de pesquisa na Bíblia!`;
      } else if (cardType === 'fiftyFifty') {
        const teamName = getTeam(activeTeam, state.teams).name;
        announcement = `🌓 50/50: 2 alternativas eliminadas para ${teamName}!`;
      } else if (cardType === 'skip') {
        const teamName = getTeam(activeTeam, state.teams).name;
        announcement = `🏃‍♂️ ${teamName} usou a carta PULAR! Nova pergunta sorteada!`;
        newTimerSeconds = DEFAULT_TIMER_SECONDS;
        newTimerMaxSeconds = DEFAULT_TIMER_SECONDS;
        newTimerEndTimestamp = null;
        isRunning = false;
        nextStage = 'question';
      }

      updateStateAndSync(
        (prev) => ({
          ...prev,
          actionCards: newActionCards,
          eliminatedOptionIndices:
            cardType === 'skip'
              ? []
              : eliminatedIndices !== undefined
              ? eliminatedIndices
              : prev.eliminatedOptionIndices,
          isQuestionSkipped: cardType === 'skip',
          timerSeconds: newTimerSeconds,
          timerMaxSeconds: newTimerMaxSeconds,
          timerEndTimestamp: newTimerEndTimestamp,
          isTimerRunning: isRunning,
          stage: nextStage,
          activeCardAnnouncement: announcement,
          currentQuestionId: newQId || prev.currentQuestionId,
          isRevealed: cardType === 'skip' ? false : prev.isRevealed,
          answerStatus: cardType === 'skip' ? 'idle' : prev.answerStatus,
          selectedOptionIndex: cardType === 'skip' ? null : prev.selectedOptionIndex,
          usedQuestionIdsTotal:
            cardType === 'skip'
              ? [...prev.usedQuestionIdsTotal, prev.currentQuestionId]
              : prev.usedQuestionIdsTotal,
          lastCardUsed: { type: cardType, team: activeTeam, timestamp: Date.now() },
        }),
        {
          type: 'USE_ACTION_CARD',
          payload: {
            team: activeTeam,
            cardType,
            eliminatedOptionIndices: eliminatedIndices,
            additionalSeconds: 30,
            newQuestionId: newQId,
          },
        }
      );
    },
    [currentQuestion, state.actionCards, state.drawnTeam, state.eliminatedOptionIndices, state.isTimerRunning, state.stage, state.teams, state.timerEndTimestamp, state.timerMaxSeconds, state.timerSeconds, state.usedQuestionIdsTotal, pickRandomUnusedQuestionId, updateStateAndSync]
  );

  // CLEAR LAST CARD USED
  const clearLastCardUsed = useCallback(() => {
    updateStateAndSync(
      (prev) => {
        if (!prev.lastCardUsed) return prev;
        return {
          ...prev,
          lastCardUsed: null,
        };
      },
      { type: 'CLEAR_LAST_CARD_USED' },
      true
    );
  }, [updateStateAndSync]);

  // EMERGENCY SCORE ADJUST
  const emergencyScoreAdjust = useCallback(
    (team: TeamId, delta: number) => {
      const newScores = {
        ...state.scores,
        [team]: Math.max(0, (state.scores[team] || 0) + delta),
      };

      updateStateAndSync(
        (prev) => ({ ...prev, scores: newScores }),
        { type: 'EMERGENCY_SCORE', payload: { team, delta, newScores } }
      );
    },
    [state.scores, updateStateAndSync]
  );

  // MANUAL SET SCORE
  const setTeamScore = useCallback(
    (team: TeamId, newScore: number) => {
      const clamped = Math.max(0, Math.floor(newScore));
      const oldScore = state.scores[team] || 0;
      const delta = clamped - oldScore;
      const newScores = {
        ...state.scores,
        [team]: clamped,
      };

      updateStateAndSync(
        (prev) => ({ ...prev, scores: newScores }),
        { type: 'EMERGENCY_SCORE', payload: { team, delta, newScores } }
      );
    },
    [state.scores, updateStateAndSync]
  );

  // SELECT ROUND
  const selectRound = useCallback(
    (round: number) => {
      const firstQInRound = questions.find((q) => q.rodada === round);
      const qId = firstQInRound ? firstQInRound.id : state.currentQuestionId;

      updateStateAndSync(
        (prev) => ({
          ...prev,
          currentRound: round,
          currentQuestionId: qId,
          isRevealed: false,
          timerSeconds: DEFAULT_TIMER_SECONDS,
          timerMaxSeconds: DEFAULT_TIMER_SECONDS,
          isTimerRunning: false,
          stage: round === 7 ? 'sudden_death' : 'splash',
          eliminatedOptionIndices: [],
          isQuestionSkipped: false,
          activeCardAnnouncement: null,
        }),
        { type: 'SET_ROUND', payload: { round, questionId: qId } }
      );
    },
    [state.currentQuestionId, updateStateAndSync]
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
          answerStatus: 'idle',
          selectedOptionIndex: null,
          timerSeconds: DEFAULT_TIMER_SECONDS,
          timerMaxSeconds: DEFAULT_TIMER_SECONDS,
          isTimerRunning: false,
          timerEndTimestamp: null,
          stage: prev.stage === 'reveal' ? 'question' : prev.stage,
          eliminatedOptionIndices: [],
          isQuestionSkipped: false,
          activeCardAnnouncement: null,
        }),
        { type: 'SET_QUESTION', payload: questionId }
      );
    },
    [updateStateAndSync]
  );

  const selectCardQuestion = useCallback(
    (questionId: number) => {
      selectQuestion(questionId);
    },
    [selectQuestion]
  );

  // UNDO LAST ACTION
  const undoLastAction = useCallback(() => {
    setHistoryStack((stack) => {
      if (stack.length === 0) return stack;
      const previousState = stack[stack.length - 1];
      const newStack = stack.slice(0, -1);

      const restored: GameState = {
        ...previousState,
        lastUpdated: Date.now(),
      };

      setState(restored);
      saveStateToStorage(restored);
      broadcast({ type: 'SYNC_STATE', payload: restored });

      return newStack;
    });
  }, [broadcast]);

  // GET NEXT STEP INFO (For Intelligent Action Button)
  const getNextStepInfo = useCallback(() => {
    const activeTeamInfo = getTeam(state.drawnTeam, state.teams);

    switch (state.stage) {
      case 'welcome':
        return {
          label: 'Iniciar Gincana (Regras)',
          actionDescription: 'Apresentar o regulamento da gincana aos participantes',
          canAdvance: true,
        };
      case 'rules':
        return {
          label: 'Iniciar 1ª Rodada',
          actionDescription: 'Começar a disputa entre as equipes da Federação',
          canAdvance: true,
        };
      case 'splash': {
        const rName = ROUNDS_INFO[state.currentRound]?.name || `Rodada ${state.currentRound}`;
        return {
          label: `Ir para Pergunta (${activeTeamInfo.name})`,
          actionDescription: `Abrir a pergunta sorteada (${rName}) para ${activeTeamInfo.name}`,
          canAdvance: true,
        };
      }
      case 'roulette':
        return {
          label: `Iniciar Vez de ${activeTeamInfo.name}`,
          actionDescription: `Ir para a pergunta de ${activeTeamInfo.name}`,
          canAdvance: true,
        };
      case 'card_selection':
        return {
          label: `Abrir Pergunta (${activeTeamInfo.name})`,
          actionDescription: `Exibir pergunta oficial para ${activeTeamInfo.name}`,
          canAdvance: true,
        };
      case 'question':
        return {
          label: 'Iniciar Cronômetro (30s)',
          actionDescription: 'Começar os 30s para o líder se manifestar e responder',
          canAdvance: true,
        };
      case 'timer':
        return {
          label: 'Encerrar Tempo / Revelar Gabarito',
          actionDescription: 'Pausar o relógio e conferir a resposta oficial',
          canAdvance: true,
        };
      case 'reveal':
        return {
          label: 'Confirmar Pontos e Ver Placar',
          actionDescription: 'Salvar pontuação e atualizar classificação',
          canAdvance: true,
        };
      case 'leaderboard': {
        const order = state.teamOrder.length > 0 ? state.teamOrder : DEFAULT_TEAMS.map((t) => t.id);
        const nextTurnIndex = state.currentTurnTeamIndex;
        const nextTeamId = order[nextTurnIndex];
        const nextTeamInfo = getTeam(nextTeamId, state.teams);

        return {
          label: `Próxima Pergunta: ${nextTeamInfo.name}`,
          actionDescription: `Vez de ${nextTeamInfo.name} responder`,
          canAdvance: true,
        };
      }
      case 'podium':
        return {
          label: 'Gincana Finalizada',
          actionDescription: 'Federação de UMPs premiou o grande campeão',
          canAdvance: false,
        };
      case 'sudden_death':
        return {
          label: 'Ver Pódio Final',
          actionDescription: 'Exibir premiação final',
          canAdvance: true,
        };
      default:
        return {
          label: 'Próximo Passo',
          actionDescription: 'Avançar etapa do jogo',
          canAdvance: true,
        };
    }
  }, [state]);

  // ADVANCE GAME STEP
  const advanceGameStep = useCallback(() => {
    switch (state.stage) {
      case 'welcome':
        setStage('rules');
        break;

      case 'rules': {
        // Draw first question for first team
        const qId = pickRandomUnusedQuestionId(state.usedQuestionIdsTotal);
        const order = state.teamOrder.length > 0 ? state.teamOrder : DEFAULT_TEAMS.map((t) => t.id);
        updateStateAndSync(
          (prev) => ({
            ...prev,
            currentQuestionId: qId,
            drawnTeam: order[0] || null,
            currentTurnTeamIndex: 0,
            stage: 'question',
            timerSeconds: DEFAULT_TIMER_SECONDS,
            timerMaxSeconds: DEFAULT_TIMER_SECONDS,
            isTimerRunning: false,
            isRevealed: false,
            answerStatus: 'idle',
            selectedOptionIndex: null,
            eliminatedOptionIndices: [],
            isQuestionSkipped: false,
            activeCardAnnouncement: null,
          }),
          { type: 'CHANGE_STAGE', payload: 'question' }
        );
        break;
      }

      case 'splash':
      case 'roulette':
      case 'card_selection':
        setStage('question');
        break;

      case 'question':
        startTimer();
        break;

      case 'timer':
        pauseTimer();
        toggleReveal(true);
        break;

      case 'reveal': {
        const isCorrect = state.answerStatus !== 'wrong';
        submitQuestionScore(isCorrect);
        break;
      }

      case 'leaderboard': {
        // Start next team's turn with a fresh random question
        const qId = pickRandomUnusedQuestionId(state.usedQuestionIdsTotal);
        const order = state.teamOrder.length > 0 ? state.teamOrder : DEFAULT_TEAMS.map((t) => t.id);
        const teamId = order[state.currentTurnTeamIndex] || order[0];

        updateStateAndSync(
          (prev) => ({
            ...prev,
            currentQuestionId: qId,
            drawnTeam: teamId,
            stage: 'question',
            timerSeconds: DEFAULT_TIMER_SECONDS,
            timerMaxSeconds: DEFAULT_TIMER_SECONDS,
            isTimerRunning: false,
            isRevealed: false,
            answerStatus: 'idle',
            selectedOptionIndex: null,
            eliminatedOptionIndices: [],
            isQuestionSkipped: false,
            activeCardAnnouncement: null,
          }),
          { type: 'CHANGE_STAGE', payload: 'question' }
        );
        break;
      }

      case 'podium':
        break;

      case 'sudden_death':
        setStage('podium');
        break;
    }
  }, [
    state,
    setStage,
    startTimer,
    pauseTimer,
    toggleReveal,
    submitQuestionScore,
    pickRandomUnusedQuestionId,
    updateStateAndSync,
  ]);

  // RESET GAME
  const resetGameToStart = useCallback(() => {
    const teams = state.teams.length > 0 ? state.teams : DEFAULT_TEAMS;
    const teamOrder = teams.map((t) => t.id);
    const initialScores: Record<TeamId, number> = {};
    const initialCards: Record<TeamId, any> = {};

    teams.forEach((t) => {
      initialScores[t.id] = 0;
      initialCards[t.id] = { skip: 2, bible: 1, fiftyFifty: 1 };
    });

    const resetState: GameState = {
      ...INITIAL_STATE,
      teams,
      teamOrder,
      currentTurnTeamIndex: 0,
      drawnTeam: teamOrder[0] || null,
      scores: initialScores,
      actionCards: initialCards,
      teamsAvailableInRound: [...teamOrder],
      timerSeconds: DEFAULT_TIMER_SECONDS,
      timerMaxSeconds: DEFAULT_TIMER_SECONDS,
      lastUpdated: Date.now(),
    };

    setState(resetState);
    saveStateToStorage(resetState);
    broadcast({ type: 'RESET_GAME', payload: resetState });
  }, [state.teams, broadcast]);

  // TOGGLE SOUND
  const toggleSound = useCallback(() => {
    updateStateAndSync((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, [updateStateAndSync]);

  return (
    <GameContext.Provider
      value={{
        state,
        currentQuestion,
        questions,
        isConnected,
        canUndo: historyStack.length > 0,
        historyCount: historyStack.length,
        setStage,
        advanceGameStep,
        undoLastAction,
        getNextStepInfo,
        startRouletteSpin,
        finishSpin,
        startTimer,
        pauseTimer,
        add15Seconds,
        resetTimer,
        toggleReveal,
        preselectOption,
        confirmOptionAnswer,
        evaluateDissertativeAnswer,
        submitQuestionScore,
        emergencyScoreAdjust,
        setTeamScore,
        selectRound,
        selectQuestion,
        selectCardQuestion,
        drawNextRandomQuestion,
        updateTeams,
        resetGameToStart,
        toggleSound,
        useActionCard,
        clearLastCardUsed,
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
