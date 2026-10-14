import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { GameState, GameStage, TeamId, TeamInfo, Question, ActionCardType } from '../types/game';
import {
  DEFAULT_TEAMS,
  DEFAULT_TIMER_SECONDS,
  STEAL_TIMER_SECONDS,
  AUTO_START_GRACE_SECONDS,
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
  setRuleIndex: (index: number) => void;
  nextRule: () => void;
  prevRule: () => void;
  resetTeamOrder: () => void;
  setTeamOrder: (order: TeamId[]) => void;
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
  totalRounds: number;
  checkpoint1: number;
  checkpoint2: number;
  teamFailedAndStartSteal: () => void;
  confirmStealWinner: (winnerTeam: TeamId | null) => void;
  cancelAutoStart: () => void;
  submitQuestionScore: (drawnCorrect: boolean, paperCorrectTeams?: TeamId[], customWinnerTeam?: TeamId | null) => void;
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
              const team = action.payload;
              const currentOrder = prev.teamOrder || [];
              let newOrder = currentOrder.includes(team) ? currentOrder : [...currentOrder, team];

              // If only 1 team left among prev.teams, automatically append it too
              const remaining = prev.teams.filter((t) => !newOrder.includes(t.id));
              if (remaining.length === 1) {
                newOrder = [...newOrder, remaining[0].id];
              }

              // Re-sort prev.teams according to newOrder
              const orderedTeams = [...prev.teams].sort((a, b) => {
                const idxA = newOrder.indexOf(a.id);
                const idxB = newOrder.indexOf(b.id);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return 0;
              });

              const updated: GameState = {
                ...prev,
                isSpinning: false,
                drawnTeam: team,
                spinningTargetTeam: null,
                teamOrder: newOrder,
                teams: orderedTeams,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'SET_RULE_INDEX':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                currentRuleIndex: action.payload,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'RESET_TEAM_ORDER':
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                teamOrder: [],
                drawnTeam: prev.teams[0]?.id || null,
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'SET_TEAM_ORDER':
            setState((prev) => {
              const newOrder = action.payload;
              const orderedTeams = [...prev.teams].sort((a, b) => {
                const idxA = newOrder.indexOf(a.id);
                const idxB = newOrder.indexOf(b.id);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return 0;
              });
              const updated: GameState = {
                ...prev,
                teamOrder: newOrder,
                teams: orderedTeams,
                drawnTeam: newOrder[0] || prev.drawnTeam,
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

          case 'TEAM_FAILED_START_STEAL':
            sounds.playWrongAnswer();
            setState((prev) => {
              const endTimestamp = Date.now() + STEAL_TIMER_SECONDS * 1000;
              const updated: GameState = {
                ...prev,
                isStealActive: true,
                firstTeamFailed: true,
                isRevealed: false,
                selectedOptionIndex: null,
                answerStatus: 'wrong',
                timerSeconds: STEAL_TIMER_SECONDS,
                timerMaxSeconds: STEAL_TIMER_SECONDS,
                isTimerRunning: true,
                timerEndTimestamp: endTimestamp,
                autoStartEndTimestamp: null,
                stage: 'timer',
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;

          case 'CONFIRM_STEAL_WINNER': {
            const { winnerTeam, pointsAwarded, newScores } = action.payload;
            if (winnerTeam && pointsAwarded > 0) {
              sounds.playCorrectReveal();
            }
            setState((prev) => {
              const updated: GameState = {
                ...prev,
                scores: newScores,
                isRevealed: true,
                answerStatus: winnerTeam ? 'correct' : 'wrong',
                isTimerRunning: false,
                timerEndTimestamp: null,
                isStealActive: false,
                stage: 'reveal',
                lastUpdated: Date.now(),
              };
              saveStateToStorage(updated);
              return updated;
            });
            break;
          }

          case 'CANCEL_AUTO_START':
            setState((prev) => ({
              ...prev,
              autoStartEndTimestamp: null,
              lastUpdated: Date.now(),
            }));
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

  // Dynamic rounds calculation based on questions divided by teams
  const totalRounds = Math.max(1, Math.floor(questions.length / (state.teams.length || 4)));
  const checkpoint1 = Math.round(totalRounds * (1 / 3));
  const checkpoint2 = Math.round(totalRounds * (2 / 3));

  // Auto-start timer after 12s grace period when entering stage === 'question'
  useEffect(() => {
    if (
      state.stage === 'question' &&
      state.autoStartEndTimestamp &&
      !state.isTimerRunning &&
      !state.isRevealed &&
      !state.isStealActive
    ) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= state.autoStartEndTimestamp!) {
          // 12s expired: automatically start 60s timer!
          const currentSecs = DEFAULT_TIMER_SECONDS;
          const endTimestamp = Date.now() + currentSecs * 1000;
          sounds.playTimerTick();
          updateStateAndSync(
            (prev) => ({
              ...prev,
              timerSeconds: currentSecs,
              timerMaxSeconds: currentSecs,
              timerEndTimestamp: endTimestamp,
              autoStartEndTimestamp: null,
              isTimerRunning: true,
              stage: 'timer',
            }),
            {
              type: 'TIMER_START',
              payload: { seconds: currentSecs, endTimestamp, maxSeconds: currentSecs },
            }
          );
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [
    state.stage,
    state.autoStartEndTimestamp,
    state.isTimerRunning,
    state.isRevealed,
    state.isStealActive,
    updateStateAndSync,
  ]);

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
                      timerEndTimestamp: null,
                      autoStartEndTimestamp: Date.now() + AUTO_START_GRACE_SECONDS * 1000,
                      isStealActive: false,
                      firstTeamFailed: false,
                    }
                  : {
                      autoStartEndTimestamp: null,
                    }),
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

  // RULES SLIDE NAVIGATION
  const setRuleIndex = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(5, index));
      updateStateAndSync(
        (prev) => ({
          ...prev,
          currentRuleIndex: safeIndex,
        }),
        { type: 'SET_RULE_INDEX', payload: safeIndex }
      );
    },
    [updateStateAndSync]
  );

  const nextRule = useCallback(() => {
    const nextIdx = Math.min(5, (state.currentRuleIndex ?? 0) + 1);
    setRuleIndex(nextIdx);
  }, [setRuleIndex, state.currentRuleIndex]);

  const prevRule = useCallback(() => {
    const prevIdx = Math.max(0, (state.currentRuleIndex ?? 0) - 1);
    setRuleIndex(prevIdx);
  }, [setRuleIndex, state.currentRuleIndex]);

  // TEAM ORDER DRAW (ROULETTE BEFORE COMPETITION)
  const resetTeamOrder = useCallback(() => {
    updateStateAndSync(
      (prev) => ({
        ...prev,
        teamOrder: [],
        drawnTeam: prev.teams[0]?.id || null,
      }),
      { type: 'RESET_TEAM_ORDER' }
    );
  }, [updateStateAndSync]);

  const setTeamOrder = useCallback(
    (order: TeamId[]) => {
      updateStateAndSync(
        (prev) => {
          const orderedTeams = [...prev.teams].sort((a, b) => {
            const idxA = order.indexOf(a.id);
            const idxB = order.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return 0;
          });
          return {
            ...prev,
            teamOrder: order,
            teams: orderedTeams,
            drawnTeam: order[0] || prev.drawnTeam,
          };
        },
        { type: 'SET_TEAM_ORDER', payload: order }
      );
    },
    [updateStateAndSync]
  );

  const startRouletteSpin = useCallback((): TeamId | null => {
    const allTeamIds = state.teams.map((t) => t.id);
    const currentOrder = state.teamOrder || [];
    const remainingToDraw = allTeamIds.filter((id) => !currentOrder.includes(id));
    const pool = remainingToDraw.length > 0 ? remainingToDraw : allTeamIds;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const targetTeam = pool[randomIndex];
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
  }, [state.teams, state.teamOrder, updateStateAndSync]);

  const finishSpin = useCallback(
    (team: TeamId) => {
      sounds.playRouletteSelected();

      updateStateAndSync(
        (prev) => {
          const currentOrder = prev.teamOrder || [];
          let newOrder = currentOrder.includes(team) ? currentOrder : [...currentOrder, team];

          // If only 1 team left among prev.teams, automatically append it too
          const remaining = prev.teams.filter((t) => !newOrder.includes(t.id));
          if (remaining.length === 1) {
            newOrder = [...newOrder, remaining[0].id];
          }

          // Re-sort prev.teams according to newOrder
          const orderedTeams = [...prev.teams].sort((a, b) => {
            const idxA = newOrder.indexOf(a.id);
            const idxB = newOrder.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
          });

          return {
            ...prev,
            isSpinning: false,
            drawnTeam: team,
            spinningTargetTeam: null,
            teamOrder: newOrder,
            teams: orderedTeams,
            isRevealed: false,
            answerStatus: 'idle',
            selectedOptionIndex: null,
            timerSeconds: DEFAULT_TIMER_SECONDS,
            timerMaxSeconds: DEFAULT_TIMER_SECONDS,
            isTimerRunning: false,
          };
        },
        { type: 'FINISH_SPIN', payload: team }
      );
    },
    [updateStateAndSync]
  );

  // TIMER CONTROLS
  const startTimer = useCallback(() => {
    const maxSecs = state.timerMaxSeconds && state.timerMaxSeconds > 0 ? state.timerMaxSeconds : DEFAULT_TIMER_SECONDS;
    const currentSecs = state.timerSeconds > 0 ? state.timerSeconds : maxSecs;
    const endTimestamp = Date.now() + currentSecs * 1000;

    updateStateAndSync(
      (prev) => ({
        ...prev,
        timerSeconds: currentSecs,
        timerMaxSeconds: maxSecs,
        timerEndTimestamp: endTimestamp,
        autoStartEndTimestamp: null,
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
        autoStartEndTimestamp: null,
      }),
      { type: 'TIMER_RESET', payload: { seconds: DEFAULT_TIMER_SECONDS } }
    );
  }, [updateStateAndSync]);

  const cancelAutoStart = useCallback(() => {
    updateStateAndSync(
      (prev) => ({
        ...prev,
        autoStartEndTimestamp: null,
      }),
      { type: 'CANCEL_AUTO_START' }
    );
  }, [updateStateAndSync]);

  // TEAM FAILED: DO NOT REVEAL ANSWER, START 30s STEAL IMMEDIATELY
  const teamFailedAndStartSteal = useCallback(() => {
    sounds.playWrongAnswer();
    const endTimestamp = Date.now() + STEAL_TIMER_SECONDS * 1000;

    updateStateAndSync(
      (prev) => ({
        ...prev,
        isStealActive: true,
        firstTeamFailed: true,
        isRevealed: false,
        selectedOptionIndex: null,
        answerStatus: 'wrong',
        timerSeconds: STEAL_TIMER_SECONDS,
        timerMaxSeconds: STEAL_TIMER_SECONDS,
        isTimerRunning: true,
        timerEndTimestamp: endTimestamp,
        autoStartEndTimestamp: null,
        stage: 'timer',
      }),
      { type: 'TEAM_FAILED_START_STEAL' }
    );
  }, [updateStateAndSync]);

  // CONFIRM STEAL WINNER
  const confirmStealWinner = useCallback(
    (winnerTeam: TeamId | null) => {
      const newScores = { ...state.scores };
      let pointsAwarded = 0;
      if (winnerTeam) {
        pointsAwarded = FIXED_QUESTION_POINTS;
        newScores[winnerTeam] = (newScores[winnerTeam] || 0) + pointsAwarded;
        sounds.playCorrectReveal();
      }

      updateStateAndSync(
        (prev) => ({
          ...prev,
          scores: newScores,
          isRevealed: true,
          answerStatus: winnerTeam ? 'correct' : 'wrong',
          isTimerRunning: false,
          timerEndTimestamp: null,
          autoStartEndTimestamp: null,
          isStealActive: false,
          stage: 'reveal',
        }),
        {
          type: 'CONFIRM_STEAL_WINNER',
          payload: {
            winnerTeam,
            pointsAwarded,
            newScores,
          },
        }
      );
    },
    [state.scores, updateStateAndSync]
  );

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
          ...(targetState ? { isTimerRunning: false, timerEndTimestamp: null, autoStartEndTimestamp: null } : {}),
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

      if (isCorrect) {
        sounds.playCorrectReveal();
        const newScores = { ...state.scores };
        if (state.drawnTeam) {
          newScores[state.drawnTeam] = (newScores[state.drawnTeam] || 0) + FIXED_QUESTION_POINTS;
        }

        updateStateAndSync(
          (prev) => ({
            ...prev,
            isRevealed: true,
            selectedOptionIndex: index,
            answerStatus: 'correct',
            scores: newScores,
            stage: 'reveal',
            isTimerRunning: false,
            timerEndTimestamp: null,
            autoStartEndTimestamp: null,
            isStealActive: false,
          }),
          {
            type: 'CONFIRM_ANSWER',
            payload: {
              optionIndex: index,
              isCorrect: true,
              drawnTeam: state.drawnTeam,
              newScores,
            },
          }
        );
      } else {
        // Equipe errou: não revela gabarito, inicia repasse de 30s imediatamente!
        teamFailedAndStartSteal();
      }

      return { isCorrect };
    },
    [currentQuestion, state.scores, state.drawnTeam, teamFailedAndStartSteal, updateStateAndSync]
  );

  // EVALUATE DISSERTATIVE ANSWER (Admin evaluates Correto / Incorreto)
  const evaluateDissertativeAnswer = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        sounds.playCorrectReveal();
        const newScores = { ...state.scores };
        if (state.drawnTeam) {
          newScores[state.drawnTeam] = (newScores[state.drawnTeam] || 0) + FIXED_QUESTION_POINTS;
        }

        updateStateAndSync(
          (prev) => ({
            ...prev,
            isRevealed: true,
            selectedOptionIndex: null,
            answerStatus: 'correct',
            scores: newScores,
            stage: 'reveal',
            isTimerRunning: false,
            timerEndTimestamp: null,
            autoStartEndTimestamp: null,
            isStealActive: false,
          }),
          {
            type: 'CONFIRM_ANSWER',
            payload: {
              optionIndex: -1,
              isCorrect: true,
              drawnTeam: state.drawnTeam,
              newScores,
            },
          }
        );
      } else {
        // Equipe errou: inicia repasse 30s sem revelar gabarito
        teamFailedAndStartSteal();
      }
    },
    [state.scores, state.drawnTeam, teamFailedAndStartSteal, updateStateAndSync]
  );

  // SUBMIT SCORE & COMPLETE TURN
  const submitQuestionScore = useCallback(
    (drawnCorrect: boolean, _paperCorrectTeams?: TeamId[], customWinnerTeam?: TeamId | null) => {
      const activeTeam = state.drawnTeam;
      const isSkipped = state.isQuestionSkipped;

      const newScores = { ...state.scores };
      let winningTeam: TeamId | null = null;

      if (customWinnerTeam !== undefined) {
        winningTeam = customWinnerTeam;
      } else if (!isSkipped && activeTeam && drawnCorrect) {
        winningTeam = activeTeam;
      }

      // Next random unused question (ALWAYS random!)
      const updatedUsedIds = [...state.usedQuestionIdsTotal, state.currentQuestionId];
      const nextQId = pickRandomUnusedQuestionId(updatedUsedIds);

      // Order of teams remains strictly the one drawn on the roulette
      const order = state.teamOrder.length > 0 ? state.teamOrder : DEFAULT_TEAMS.map((t) => t.id);
      const nextTurnIndex = state.currentTurnTeamIndex + 1;

      const pointsAwarded: Record<TeamId, number> = {};
      order.forEach((t) => {
        pointsAwarded[t] = t === winningTeam && !isSkipped ? FIXED_QUESTION_POINTS : 0;
      });

      // Dynamic total rounds: questions.length / teams.length
      const totalRoundsCalc = Math.max(1, Math.floor(questions.length / order.length));
      const cp1 = Math.round(totalRoundsCalc * (1 / 3));
      const cp2 = Math.round(totalRoundsCalc * (2 / 3));

      let nextStage: GameStage = 'question';
      let nextRound = state.currentRound;
      let finalTurnIndex = nextTurnIndex;
      let nextTeam = order[nextTurnIndex];

      if (nextTurnIndex >= order.length) {
        // Round concluded! All teams played this round
        const finishedRound = state.currentRound;
        if (finishedRound >= totalRoundsCalc) {
          nextStage = 'podium';
          nextRound = finishedRound;
          finalTurnIndex = 0;
          nextTeam = order[0];
        } else if (finishedRound === cp1 || finishedRound === cp2) {
          nextStage = 'leaderboard';
          nextRound = finishedRound + 1;
          finalTurnIndex = 0;
          nextTeam = order[0];
        } else {
          // Seamless advance to next round without stopping at leaderboard
          nextStage = 'question';
          nextRound = finishedRound + 1;
          finalTurnIndex = 0;
          nextTeam = order[0];
        }
      }

      updateStateAndSync(
        (prev) => ({
          ...prev,
          scores: newScores,
          drawnTeam: nextTeam,
          currentTurnTeamIndex: finalTurnIndex,
          currentRound: nextRound,
          isRevealed: false,
          selectedOptionIndex: null,
          answerStatus: 'idle',
          timerSeconds: DEFAULT_TIMER_SECONDS,
          timerMaxSeconds: DEFAULT_TIMER_SECONDS,
          isTimerRunning: false,
          timerEndTimestamp: null,
          autoStartEndTimestamp: nextStage === 'question' ? Date.now() + AUTO_START_GRACE_SECONDS * 1000 : null,
          isStealActive: false,
          firstTeamFailed: false,
          currentQuestionId: nextQId,
          stage: nextStage,
          eliminatedOptionIndices: [],
          isQuestionSkipped: false,
          activeCardAnnouncement: null,
          usedQuestionIdsTotal: updatedUsedIds,
          history: [
            ...prev.history,
            {
              round: prev.currentRound,
              questionId: prev.currentQuestionId,
              drawnTeam: winningTeam || activeTeam,
              drawnCorrect: !isSkipped && (drawnCorrect || winningTeam !== null),
              paperCorrectTeams: [],
              pointsAwarded,
              timestamp: Date.now(),
            },
          ],
        }),
        {
          type: 'SUBMIT_POINTS',
          payload: {
            drawnTeam: winningTeam || activeTeam,
            drawnCorrect: !isSkipped && (drawnCorrect || winningTeam !== null),
            paperCorrectTeams: [],
            pointsAwarded,
            newScores,
            nextQuestionId: nextQId,
            wasSkipped: isSkipped,
          },
        }
      );
    },
    [state.drawnTeam, state.isQuestionSkipped, state.scores, state.usedQuestionIdsTotal, state.currentQuestionId, state.teamOrder, state.currentTurnTeamIndex, state.currentRound, pickRandomUnusedQuestionId, updateStateAndSync]
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
      case 'rules': {
        const ruleIdx = state.currentRuleIndex ?? 0;
        if (ruleIdx < 5) {
          return {
            label: `Próxima Regra (${ruleIdx + 2}/6)`,
            actionDescription: 'Apresentar a próxima regra oficial aos participantes',
            canAdvance: true,
          };
        }
        return {
          label: 'Ir para Sorteio da Ordem (Roleta)',
          actionDescription: 'Concluir apresentação das regras e abrir sorteio das equipes',
          canAdvance: true,
        };
      }
      case 'splash': {
        const rName = ROUNDS_INFO[state.currentRound]?.name || `Rodada ${state.currentRound}`;
        return {
          label: `Ir para Pergunta (${activeTeamInfo.name})`,
          actionDescription: `Abrir a pergunta sorteada (${rName}) para ${activeTeamInfo.name}`,
          canAdvance: true,
        };
      }
      case 'roulette': {
        const orderCount = state.teamOrder?.length || 0;
        const totalTeams = state.teams.length;
        if (orderCount < totalTeams) {
          return {
            label: `Girar Roleta para ${orderCount + 1}º Lugar`,
            actionDescription: 'Sortear ao vivo a próxima equipe na roleta',
            canAdvance: !state.isSpinning,
          };
        }
        const firstTeam = getTeam(state.teamOrder[0], state.teams);
        return {
          label: `Iniciar 1ª Rodada (${firstTeam.name})`,
          actionDescription: `Iniciar a disputa oficial com a 1ª equipe sorteada`,
          canAdvance: true,
        };
      }
      case 'card_selection':
        return {
          label: `Abrir Pergunta (${activeTeamInfo.name})`,
          actionDescription: `Exibir pergunta oficial para ${activeTeamInfo.name}`,
          canAdvance: true,
        };
      case 'question':
        return {
          label: 'Iniciar Cronômetro (60s)',
          actionDescription: 'Começar os 60s para a equipe responder (ou aguardar 12s de leitura)',
          canAdvance: true,
        };
      case 'timer':
        return {
          label: state.isStealActive ? 'Revelar Gabarito (Repasse)' : 'Encerrar Tempo / Revelar Gabarito',
          actionDescription: state.isStealActive
            ? 'Exibir gabarito e definir qual equipe pontuou no repasse'
            : 'Pausar o relógio e conferir a resposta oficial',
          canAdvance: true,
        };
      case 'reveal':
        return {
          label: 'Avançar para Próxima Pergunta',
          actionDescription: 'Salvar pontuação e avançar para o próximo turno',
          canAdvance: true,
        };
      case 'leaderboard': {
        const order = state.teamOrder.length > 0 ? state.teamOrder : DEFAULT_TEAMS.map((t) => t.id);
        const nextTurnIndex = state.currentTurnTeamIndex;
        const nextTeamId = order[nextTurnIndex];
        const nextTeamInfo = getTeam(nextTeamId, state.teams);

        return {
          label: `Continuar Gincana: ${nextTeamInfo.name}`,
          actionDescription: `Retomar a disputa oficial com a vez de ${nextTeamInfo.name}`,
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
        const ruleIdx = state.currentRuleIndex ?? 0;
        if (ruleIdx < 5) {
          nextRule();
        } else {
          setStage('roulette');
        }
        break;
      }

      case 'roulette': {
        const orderCount = state.teamOrder?.length || 0;
        const totalTeams = state.teams.length;
        if (orderCount < totalTeams) {
          startRouletteSpin();
        } else {
          const qId = pickRandomUnusedQuestionId(state.usedQuestionIdsTotal);
          const firstTeam = state.teamOrder[0] || state.teams[0]?.id;
          updateStateAndSync(
            (prev) => ({
              ...prev,
              currentRound: 1,
              currentQuestionId: qId,
              drawnTeam: firstTeam,
              currentTurnTeamIndex: 0,
              stage: 'question',
              timerSeconds: DEFAULT_TIMER_SECONDS,
              timerMaxSeconds: DEFAULT_TIMER_SECONDS,
              isTimerRunning: false,
              timerEndTimestamp: null,
              autoStartEndTimestamp: Date.now() + AUTO_START_GRACE_SECONDS * 1000,
              isRevealed: false,
              answerStatus: 'idle',
              selectedOptionIndex: null,
              eliminatedOptionIndices: [],
              isQuestionSkipped: false,
              activeCardAnnouncement: null,
            }),
            { type: 'SET_ROUND', payload: { round: 1, questionId: qId } }
          );
        }
        break;
      }

      case 'splash':
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
            timerEndTimestamp: null,
            autoStartEndTimestamp: Date.now() + AUTO_START_GRACE_SECONDS * 1000,
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
    nextRule,
    startRouletteSpin,
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
        totalRounds,
        checkpoint1,
        checkpoint2,
        setStage,
        advanceGameStep,
        undoLastAction,
        getNextStepInfo,
        setRuleIndex,
        nextRule,
        prevRule,
        resetTeamOrder,
        setTeamOrder,
        startRouletteSpin,
        finishSpin,
        startTimer,
        pauseTimer,
        add15Seconds,
        resetTimer,
        cancelAutoStart,
        teamFailedAndStartSteal,
        confirmStealWinner,
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
