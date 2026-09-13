import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { GameState, GameStage, TeamId, Question, ActionCardType } from '../types/game';
import { ALL_TEAM_IDS, INITIAL_ACTION_CARDS, ROUNDS_INFO, TEAMS, getRoundPlayableQuestions } from '../types/game';
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
  submitQuestionScore: (drawnCorrect: boolean, paperCorrectTeams: TeamId[]) => void;
  emergencyScoreAdjust: (team: TeamId, delta: number) => void;
  setTeamScore: (team: TeamId, newScore: number) => void;
  selectRound: (round: number) => void;
  selectQuestion: (questionId: number) => void;
  selectCardQuestion: (questionId: number, cardIndex: number) => void;
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
              const targetTeam =
                action.payload === 'card_selection' && prev.teamsAvailableInRound.length === 1
                  ? prev.teamsAvailableInRound[0]
                  : prev.drawnTeam;

              const updated = {
                ...prev,
                stage: effectiveStage,
                drawnTeam: targetTeam,
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
                isRevealed: false,
                answerStatus: 'idle',
                selectedOptionIndex: null,
                timerSeconds: 60,
                timerMaxSeconds: 60,
                isTimerRunning: false,
                timerEndTimestamp: null,
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
                isRevealed: false,
                answerStatus: 'idle',
                selectedOptionIndex: null,
                timerSeconds: 60,
                timerMaxSeconds: 60,
                isTimerRunning: false,
                timerEndTimestamp: null,
                eliminatedOptionIndices: [],
                isQuestionSkipped: false,
                activeCardAnnouncement: null,
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
              const currentCards = prev.actionCards?.[team] || INITIAL_ACTION_CARDS[team];
              const updatedCount = Math.max(0, (currentCards[cardType] || 0) - 1);
              const newCards = {
                ...prev.actionCards,
                [team]: {
                  ...currentCards,
                  [cardType]: updatedCount,
                },
              };

              let newTimerSeconds = prev.timerSeconds;
              let newTimerMaxSeconds = prev.timerMaxSeconds || 60;
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
                if (team === 'UCP') {
                  const nextUcpSkips = (prev.ucpSkipsInRound || 0) + 1;
                  announcement =
                    nextUcpSkips >= 2
                      ? `🏃‍♂️ UCP pulou novamente! Escolha uma nova carta para a Pergunta Kids Reserva Especial!`
                      : `🏃‍♂️ UCP usou a carta Pular! Escolha uma nova carta para a Pergunta Kids Reserva!`;
                  newTimerSeconds = 60;
                  newTimerMaxSeconds = 60;
                  newTimerEndTimestamp = null;
                  isRunning = false;
                  nextStage = 'card_selection';
                } else {
                  announcement = `🏃‍♂️ ${team} Pulou! As outras equipes têm 30s para responder no papel!`;
                  newTimerSeconds = 30;
                  newTimerMaxSeconds = 30;
                  newTimerEndTimestamp = Date.now() + 30 * 1000;
                  isRunning = true;
                  nextStage = 'timer';
                }
              }

              const updated: GameState = {
                ...prev,
                actionCards: newCards,
                eliminatedOptionIndices:
                  cardType === 'skip' && team === 'UCP'
                    ? []
                    : eliminatedOptionIndices !== undefined
                    ? eliminatedOptionIndices
                    : prev.eliminatedOptionIndices,
                isQuestionSkipped: cardType === 'skip' ? true : prev.isQuestionSkipped,
                skipsUsedInRound: cardType === 'skip' ? (prev.skipsUsedInRound || 0) + 1 : (prev.skipsUsedInRound || 0),
                ucpSkipsInRound: cardType === 'skip' && team === 'UCP' ? (prev.ucpSkipsInRound || 0) + 1 : (prev.ucpSkipsInRound || 0),
                timerSeconds: newTimerSeconds,
                timerMaxSeconds: newTimerMaxSeconds,
                timerEndTimestamp: newTimerEndTimestamp,
                isTimerRunning: isRunning,
                stage: nextStage,
                activeCardAnnouncement: announcement,
                currentQuestionId:
                  cardType === 'skip' && team === 'UCP' && newQuestionId
                    ? newQuestionId
                    : prev.currentQuestionId,
                isRevealed: cardType === 'skip' ? false : prev.isRevealed,
                answerStatus: cardType === 'skip' ? 'idle' : prev.answerStatus,
                selectedOptionIndex: cardType === 'skip' ? null : prev.selectedOptionIndex,
                usedQuestionIdsInRound:
                  cardType === 'skip' && team === 'UCP' && newQuestionId && !prev.usedQuestionIdsInRound.includes(newQuestionId)
                    ? [...prev.usedQuestionIdsInRound, newQuestionId]
                    : prev.usedQuestionIdsInRound,
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
              const wasSkipped = action.payload.wasSkipped ?? prev.isQuestionSkipped;
              const nextStage: GameStage = wasSkipped ? 'card_selection' : 'leaderboard';
              const nextDrawnTeam = wasSkipped ? prev.drawnTeam : null;
              const available = wasSkipped
                ? prev.teamsAvailableInRound
                : prev.teamsAvailableInRound.filter((t) => t !== action.payload.drawnTeam);
              const updated: GameState = {
                ...prev,
                scores: action.payload.newScores,
                teamsAvailableInRound: available,
                drawnTeam: nextDrawnTeam,
                isRevealed: false,
                selectedOptionIndex: null,
                answerStatus: 'idle',
                timerSeconds: 60,
                timerMaxSeconds: 60,
                isTimerRunning: false,
                timerEndTimestamp: null,
                currentQuestionId: action.payload.nextQuestionId ?? prev.currentQuestionId,
                stage: nextStage,
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
                teamsAvailableInRound: [...ALL_TEAM_IDS],
                usedQuestionIdsInRound: [],
                usedCardIndicesInRound: [],
                selectedCardIndex: null,
                isCardFlipping: false,
                drawnTeam: null,
                isRevealed: false,
                timerSeconds: 60,
                timerMaxSeconds: 60,
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
                timerSeconds: 60,
                timerMaxSeconds: 60,
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
  const setStage = useCallback(
    (stage: GameStage) => {
      if (stage === 'podium') {
        sounds.playVictoryFanfare();
      }
      updateStateAndSync(
        (prev) => {
          const effectiveStage = stage;
          const effectiveDrawnTeam =
            stage === 'card_selection' && prev.teamsAvailableInRound.length === 1
              ? prev.teamsAvailableInRound[0]
              : prev.drawnTeam;

          return {
            ...prev,
            stage: effectiveStage,
            drawnTeam: effectiveDrawnTeam,
            ...(effectiveStage !== 'reveal'
              ? {
                  isRevealed: false,
                  answerStatus: 'idle' as const,
                  selectedOptionIndex: null,
                  ...(effectiveStage === 'question' || stage === 'card_selection' || stage === 'roulette'
                    ? {
                        timerSeconds: 60,
                        timerMaxSeconds: 60,
                        isTimerRunning: false,
                      }
                    : {}),
                }
              : {}),
          };
        },
        { type: 'CHANGE_STAGE', payload: stage }
      );
    },
    [updateStateAndSync]
  );

  // ROULETTE
  const startRouletteSpin = useCallback((): TeamId | null => {
    if (state.teamsAvailableInRound.length === 1) {
      const onlyTeam = state.teamsAvailableInRound[0];

      updateStateAndSync(
        (prev) => ({
          ...prev,
          isSpinning: false,
          drawnTeam: onlyTeam,
          spinningTargetTeam: null,
          stage: 'card_selection',
          isRevealed: false,
          answerStatus: 'idle',
          selectedOptionIndex: null,
        }),
        { type: 'CHANGE_STAGE', payload: 'card_selection' }
      );
      return onlyTeam;
    }

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
          timerSeconds: 60,
          timerMaxSeconds: 60,
          isTimerRunning: false,
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
    },
    [updateStateAndSync]
  );

  // TIMER CONTROLS
  const startTimer = useCallback(() => {
    const currentSecs = state.timerSeconds > 0 ? state.timerSeconds : 60;
    const endTimestamp = Date.now() + currentSecs * 1000;
    const maxSecs = state.timerMaxSeconds && state.timerMaxSeconds > 0 ? state.timerMaxSeconds : 60;

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
        timerSeconds: 60,
        timerMaxSeconds: 60,
        isTimerRunning: false,
        timerEndTimestamp: null,
      }),
      { type: 'TIMER_RESET', payload: { seconds: 60 } }
    );
  }, [updateStateAndSync]);

  // REVEAL GABARITO TOGGLE
  const toggleReveal = useCallback((forceState?: boolean) => {
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
        stage: targetState ? 'reveal' : (prev.stage === 'reveal' ? 'question' : prev.stage),
        ...(targetState ? { isTimerRunning: false, timerEndTimestamp: null } : {}),
      }),
      { type: 'REVEAL_ANSWER', payload: targetState }
    );
  }, [state.isRevealed, updateStateAndSync]);

  // PRESELECT OPTION (From Admin, live highlights on Telão)
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

  // CONFIRM OPTION ANSWER (From Admin: evaluates correctness, plays sounds, updates points)
  const confirmOptionAnswer = useCallback(
    (index: number) => {
      const q = currentQuestion;
      const isCorrect =
        !!q &&
        q.opcoes[index]?.trim().toLowerCase() === q.respostaCorreta?.trim().toLowerCase();

      const newScores = { ...state.scores };
      if (isCorrect) {
        sounds.playCorrectReveal();
        const roundInfo = ROUNDS_INFO[state.currentRound];
        const fullPts = roundInfo?.pointsFull ?? q.pontosCheios;
        if (state.drawnTeam) {
          newScores[state.drawnTeam] = (newScores[state.drawnTeam] || 0) + fullPts;
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
    [currentQuestion, state.scores, state.drawnTeam, state.currentRound, updateStateAndSync]
  );

  // EVALUATE DISSERTATIVE ANSWER (From Admin: marks correct or wrong, plays sounds, updates score)
  const evaluateDissertativeAnswer = useCallback(
    (isCorrect: boolean) => {
      const q = currentQuestion;
      const newScores = { ...state.scores };

      if (isCorrect) {
        sounds.playCorrectReveal();
        const roundInfo = ROUNDS_INFO[state.currentRound];
        const fullPts = roundInfo?.pointsFull ?? q?.pontosCheios ?? 10;
        if (state.drawnTeam) {
          newScores[state.drawnTeam] = (newScores[state.drawnTeam] || 0) + fullPts;
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
    [currentQuestion, state.scores, state.drawnTeam, state.currentRound, updateStateAndSync]
  );

  // SUBMIT SCORE
  const submitQuestionScore = useCallback(
    (drawnCorrect: boolean, paperCorrectTeams: TeamId[]) => {
      const q = currentQuestion;
      const roundInfo = ROUNDS_INFO[state.currentRound];
      const fullPts = roundInfo?.pointsFull ?? q?.pontosCheios ?? 10;
      const halfPts = roundInfo?.pointsHalf ?? q?.pontosMeios ?? 5;
      const isSkipped = state.isQuestionSkipped;

      const pointsAwarded: Record<TeamId, number> = {
        UCP: 0,
        UPA: 0,
        UMP: 0,
        Casais: 0,
        Adultos: 0,
      };

      if (!isSkipped && state.drawnTeam && drawnCorrect) {
        pointsAwarded[state.drawnTeam] = fullPts;
      } else if (isSkipped) {
        // A pontuação no papel só é avaliada e creditada quando a equipe decide pular a pergunta
        paperCorrectTeams.forEach((t) => {
          if (t !== state.drawnTeam) {
            pointsAwarded[t] = (pointsAwarded[t] || 0) + halfPts;
          }
        });
      }

      const evaluatedPaperTeams = isSkipped ? paperCorrectTeams : [];

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

      const nextStage: GameStage = isSkipped ? 'card_selection' : 'leaderboard';
      const nextDrawnTeam = isSkipped ? state.drawnTeam : null;

      updateStateAndSync(
        (prev) => {
          const available = isSkipped
            ? prev.teamsAvailableInRound
            : prev.teamsAvailableInRound.filter((t) => t !== prev.drawnTeam);
          return {
            ...prev,
            scores: newScores,
            teamsAvailableInRound: available,
            drawnTeam: nextDrawnTeam,
            isRevealed: false,
            selectedOptionIndex: null,
            answerStatus: 'idle',
            timerSeconds: 60,
            isTimerRunning: false,
            timerEndTimestamp: null,
            currentQuestionId: nextQId,
            stage: nextStage,
            eliminatedOptionIndices: [],
            isQuestionSkipped: false,
            ucpSkipsInRound: 0,
            activeCardAnnouncement: null,
            history: [
              ...prev.history,
              {
                round: prev.currentRound,
                questionId: prev.currentQuestionId,
                drawnTeam: prev.drawnTeam,
                drawnCorrect: !isSkipped && drawnCorrect,
                paperCorrectTeams: evaluatedPaperTeams,
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
            drawnCorrect: !isSkipped && drawnCorrect,
            paperCorrectTeams: evaluatedPaperTeams,
            pointsAwarded,
            newScores,
            nextQuestionId: nextQId,
            wasSkipped: isSkipped,
          },
        }
      );
    },
    [currentQuestion, state.drawnTeam, state.scores, state.currentQuestionId, state.isQuestionSkipped, updateStateAndSync]
  );

  // USE ACTION CARD
  const useActionCard = useCallback(
    (cardType: ActionCardType) => {
      const activeTeam = state.drawnTeam;
      if (!activeTeam) return;

      if (cardType === 'skip' && (state.skipsUsedInRound || 0) >= 2) {
        return;
      }

      const teamCards = state.actionCards?.[activeTeam] || INITIAL_ACTION_CARDS[activeTeam];
      if (!teamCards || teamCards[cardType] <= 0) return;

      let eliminatedIndices: number[] | undefined = undefined;

      if (cardType === 'fiftyFifty') {
        if (!currentQuestion || !currentQuestion.opcoes || currentQuestion.opcoes.length <= 2) {
          return;
        }
        if (state.eliminatedOptionIndices && state.eliminatedOptionIndices.length > 0) {
          return;
        }

        sounds.playCard5050();
        if (currentQuestion.fiftyFiftyEliminate && currentQuestion.fiftyFiftyEliminate.length === 2) {
          eliminatedIndices = currentQuestion.fiftyFiftyEliminate;
        } else if (currentQuestion.id === 17) {
          eliminatedIndices = [2, 3];
        } else if (currentQuestion.id === 51) {
          eliminatedIndices = [0, 2];
        } else {
          const correctText = currentQuestion.respostaCorreta.trim().toLowerCase();
          const wrongIndices: number[] = [];
          currentQuestion.opcoes.forEach((op, idx) => {
            if (op.trim().toLowerCase() !== correctText) {
              wrongIndices.push(idx);
            }
          });

          const shuffled = [...wrongIndices].sort(() => 0.5 - Math.random());
          eliminatedIndices = shuffled.slice(0, 2);
        }
      } else if (cardType === 'skip') {
        sounds.playSkipCard();
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
      let newTimerMaxSeconds = state.timerMaxSeconds || 60;
      let newTimerEndTimestamp = state.timerEndTimestamp;
      let isRunning = state.isTimerRunning;
      let nextStage = state.stage;
      let announcement = '';
      let newQuestionId: number | undefined = undefined;

      if (cardType === 'bible') {
        sounds.playBibleConsult();
        newTimerSeconds = 30;
        newTimerMaxSeconds = 30;
        newTimerEndTimestamp = Date.now() + 30 * 1000;
        isRunning = true;
        if (nextStage === 'question') {
          nextStage = 'timer';
        }
        announcement = `📖 Consulta Bíblica: 30s para pesquisar na Bíblia!`;
      } else if (cardType === 'fiftyFifty') {
        announcement = `🌓 50/50: 2 alternativas eliminadas para ${activeTeam}!`;
      } else if (cardType === 'skip') {
        sounds.playSkipCard();
        if (activeTeam === 'UCP') {
          const nextUcpSkips = (state.ucpSkipsInRound || 0) + 1;
          announcement =
            nextUcpSkips >= 2
              ? `🏃‍♂️ UCP pulou novamente! Escolha uma nova carta para a Pergunta Kids Reserva Especial!`
              : `🏃‍♂️ UCP usou a carta Pular! Escolha uma nova carta para a Pergunta Kids Reserva!`;
          newTimerSeconds = 60;
          newTimerMaxSeconds = 60;
          newTimerEndTimestamp = null;
          isRunning = false;
          nextStage = 'card_selection';
        } else {
          announcement = `🏃‍♂️ ${activeTeam} Pulou! As outras equipes têm 30s para responder no papel!`;
          newTimerSeconds = 30;
          newTimerMaxSeconds = 30;
          newTimerEndTimestamp = Date.now() + 30 * 1000;
          isRunning = true;
          nextStage = 'timer';
        }
      }

      updateStateAndSync(
        (prev) => ({
          ...prev,
          actionCards: newActionCards,
          eliminatedOptionIndices:
            cardType === 'skip' && activeTeam === 'UCP'
              ? []
              : eliminatedIndices !== undefined
              ? eliminatedIndices
              : prev.eliminatedOptionIndices,
          isQuestionSkipped: cardType === 'skip' ? true : prev.isQuestionSkipped,
          skipsUsedInRound:
            cardType === 'skip' ? (prev.skipsUsedInRound || 0) + 1 : (prev.skipsUsedInRound || 0),
          ucpSkipsInRound:
            cardType === 'skip' && activeTeam === 'UCP'
              ? (prev.ucpSkipsInRound || 0) + 1
              : (prev.ucpSkipsInRound || 0),
          timerSeconds: newTimerSeconds,
          timerMaxSeconds: newTimerMaxSeconds,
          timerEndTimestamp: newTimerEndTimestamp,
          isTimerRunning: isRunning,
          stage: nextStage,
          activeCardAnnouncement: announcement,
          currentQuestionId:
            cardType === 'skip' && activeTeam === 'UCP' && newQuestionId
              ? newQuestionId
              : prev.currentQuestionId,
          isRevealed: cardType === 'skip' ? false : prev.isRevealed,
          answerStatus: cardType === 'skip' ? 'idle' : prev.answerStatus,
          selectedOptionIndex: cardType === 'skip' ? null : prev.selectedOptionIndex,
          usedQuestionIdsInRound:
            cardType === 'skip' && activeTeam === 'UCP' && newQuestionId && !prev.usedQuestionIdsInRound.includes(newQuestionId)
              ? [...prev.usedQuestionIdsInRound, newQuestionId]
              : prev.usedQuestionIdsInRound,
          lastCardUsed: { type: cardType, team: activeTeam, timestamp: Date.now() },
        }),
        {
          type: 'USE_ACTION_CARD',
          payload: {
            team: activeTeam,
            cardType,
            eliminatedOptionIndices: eliminatedIndices,
            additionalSeconds: 30,
            newQuestionId: cardType === 'skip' && activeTeam === 'UCP' ? newQuestionId : undefined,
          },
        }
      );
    },
    [
      currentQuestion,
      questions,
      state.actionCards,
      state.currentRound,
      state.drawnTeam,
      state.eliminatedOptionIndices,
      state.isTimerRunning,
      state.timerEndTimestamp,
      state.timerSeconds,
      state.timerMaxSeconds,
      state.stage,
      state.skipsUsedInRound,
      state.ucpSkipsInRound,
      updateStateAndSync,
    ]
  );

  // CLEAR LAST CARD USED (Dismiss overlay and prevent replay)
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

  // MANUAL SET SCORE (Set directly to a typed number)
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
          timerMaxSeconds: 60,
          isTimerRunning: false,
          stage: round === 7 ? 'sudden_death' : 'splash',
          eliminatedOptionIndices: [],
          isQuestionSkipped: false,
          skipsUsedInRound: 0,
          ucpSkipsInRound: 0,
          activeCardAnnouncement: null,
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
      // Adult cards are strictly the 7 adult questions in the round
      const questionsInRound = questions.filter((q) => q.rodada === state.currentRound);
      const adultQuestions = questionsInRound.filter((q) => !q.isKids);

      let resolvedQId = questionId;

      if (state.drawnTeam === 'UCP') {
        const ucpSkips = state.ucpSkipsInRound || 0;
        if (ucpSkips >= 2) {
          // 2 pulos na mesma rodada pela UCP: reserva da rodada acima (ou rodada 5 se estiver na 6)
          const targetRound = state.currentRound === 6 ? 5 : state.currentRound + 1;
          const kidsBackupQ2 = questions.find(
            (q) => q.rodada === targetRound && q.isKids && q.isKidsBackup
          );
          if (kidsBackupQ2) {
            resolvedQId = kidsBackupQ2.id;
          }
        } else if (ucpSkips === 1 || state.isQuestionSkipped) {
          // 1 pulo da UCP: reserva da rodada atual
          const kidsBackupQ1 = questions.find(
            (q) => q.rodada === state.currentRound && q.isKids && q.isKidsBackup
          );
          if (kidsBackupQ1) {
            resolvedQId = kidsBackupQ1.id;
          }
        } else {
          // Titular da rodada atual
          const kidsTitularQ = questions.find(
            (q) => q.rodada === state.currentRound && q.isKids && !q.isKidsBackup
          );
          if (kidsTitularQ) {
            resolvedQId = kidsTitularQ.id;
          }
        }
      } else {
        const naturalAdultQ = adultQuestions[cardIndex];
        if (naturalAdultQ && !state.usedQuestionIdsInRound.includes(naturalAdultQ.id)) {
          resolvedQId = naturalAdultQ.id;
        } else {
          const availableAdult = adultQuestions.filter(
            (q) => !state.usedQuestionIdsInRound.includes(q.id)
          );
          resolvedQId = availableAdult.length > 0 ? availableAdult[0].id : questionId;
        }
      }

      // Trigger 3D flip animation
      updateStateAndSync(
        (prev) => ({
          ...prev,
          selectedCardIndex: cardIndex,
          isCardFlipping: true,
          currentQuestionId: resolvedQId,
          isRevealed: false,
          answerStatus: 'idle',
          selectedOptionIndex: null,
          timerSeconds: 60,
          timerMaxSeconds: 60,
          isTimerRunning: false,
          timerEndTimestamp: null,
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
            isRevealed: false,
            answerStatus: 'idle',
            selectedOptionIndex: null,
            timerSeconds: 60,
            timerMaxSeconds: 60,
            isTimerRunning: false,
            timerEndTimestamp: null,
            eliminatedOptionIndices: [],
            isQuestionSkipped: false,
            activeCardAnnouncement: null,
          }),
          { type: 'FINISH_CARD_FLIP', payload: { questionId: resolvedQId } }
        );
      }, 2800);
    },
    [
      questions,
      state.currentRound,
      state.drawnTeam,
      state.isQuestionSkipped,
      state.ucpSkipsInRound,
      state.usedQuestionIdsInRound,
      updateStateAndSync,
    ]
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
          timerSeconds: 60,
          timerMaxSeconds: 60,
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

  // UNDO LAST ACTION (Pops previous snapshot and restores state across tabs)
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

  // GET NEXT STEP INFO (Dynamic label and description for operator)
  const getNextStepInfo = useCallback(() => {
    switch (state.stage) {
      case 'welcome':
        return {
          label: 'Iniciar Gincana (Regras)',
          actionDescription: 'Apresentar as regras oficiais aos participantes',
          canAdvance: true,
        };
      case 'rules':
        return {
          label: 'Iniciar Rodada 1 (Splash)',
          actionDescription: 'Abrir tela de apresentação da 1ª Rodada',
          canAdvance: true,
        };
      case 'splash': {
        const rName = ROUNDS_INFO[state.currentRound]?.name || `Rodada ${state.currentRound}`;
        return {
          label: `Ir para Roleta (${rName})`,
          actionDescription: 'Iniciar sorteio da equipe no microfone',
          canAdvance: true,
        };
      }
      case 'roulette':
        if (state.isSpinning) {
          return {
            label: 'Roleta Girando...',
            actionDescription: 'Aguarde a roleta desacelerar e definir a equipe',
            canAdvance: false,
          };
        }
        if (state.teamsAvailableInRound.length === 1) {
          const lastTeam = state.teamsAvailableInRound[0];
          return {
            label: `Ir para Escolha de Cards (${TEAMS[lastTeam]?.name || lastTeam})`,
            actionDescription: 'Última equipe da rodada (definida diretamente sem roleta)',
            canAdvance: true,
          };
        }
        if (!state.drawnTeam) {
          return {
            label: 'Girar Roleta',
            actionDescription: `Sortear entre ${state.teamsAvailableInRound.length} equipe(s) restante(s)`,
            canAdvance: true,
          };
        }
        return {
          label: `Ir para Escolha de Cards (${TEAMS[state.drawnTeam]?.name || state.drawnTeam})`,
          actionDescription: 'A equipe sorteada escolhe o envelope da rodada',
          canAdvance: true,
        };
      case 'card_selection':
        if (state.isCardFlipping) {
          return {
            label: 'Abrindo Card...',
            actionDescription: 'Animando revelação do envelope',
            canAdvance: false,
          };
        }
        return {
          label: state.drawnTeam
            ? `Escolher Envelope (${TEAMS[state.drawnTeam]?.name || state.drawnTeam})`
            : 'Abrir Pergunta Selecionada',
          actionDescription: 'A equipe sorteada escolhe o envelope da rodada',
          canAdvance: true,
        };
      case 'question':
        return {
          label: 'Iniciar Cronômetro (60s)',
          actionDescription: 'Começar contagem de tempo para resposta',
          canAdvance: true,
        };
      case 'timer':
        if (state.isQuestionSkipped) {
          return {
            label: 'Encerrar 30s / Lançar Notas do Papel',
            actionDescription: 'Encerrar contagem do papel e lançar pontuação das equipes',
            canAdvance: true,
          };
        }
        return {
          label: 'Encerrar Tempo / Revelar Gabarito',
          actionDescription: 'Pausar cronômetro e exibir gabarito oficial',
          canAdvance: true,
        };
      case 'reveal':
        if (state.isQuestionSkipped) {
          return {
            label: `Escolher Novo Envelope (${state.drawnTeam ? TEAMS[state.drawnTeam]?.name : 'Equipe'})`,
            actionDescription: 'A equipe que pulou escolhe um novo envelope para responder',
            canAdvance: true,
          };
        }
        return {
          label: 'Confirmar Pontos e Ver Placar',
          actionDescription: 'Creditar pontos, encerrar turno da equipe e ver ranking',
          canAdvance: true,
        };
      case 'leaderboard':
        if (state.teamsAvailableInRound.length > 0) {
          return {
            label: `Próxima Equipe na Roleta (${state.teamsAvailableInRound.length} restantes)`,
            actionDescription: `Restam jogar: ${state.teamsAvailableInRound.join(', ')}`,
            canAdvance: true,
          };
        }
        if (state.currentRound < 6) {
          const nextR = state.currentRound + 1;
          const nextName = ROUNDS_INFO[nextR]?.name || `Rodada ${nextR}`;
          return {
            label: `Concluir Rodada e Ir para ${nextName}`,
            actionDescription: `Finalizar Rodada ${state.currentRound} e abrir nova fase`,
            canAdvance: true,
          };
        }
        return {
          label: 'Ver Pódio Final e Campeão 🏆',
          actionDescription: 'Exibir premiação, bônus de cartas e classificação final',
          canAdvance: true,
        };
      case 'podium':
        return {
          label: 'Torneio Finalizado',
          actionDescription: 'Gincana Gálatas concluída com sucesso',
          canAdvance: false,
        };
      case 'sudden_death':
        return {
          label: 'Ver Pódio Final',
          actionDescription: 'Ir para o pódio após o desempate',
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

  // ADVANCE GAME STEP (The main intelligent stepper)
  const advanceGameStep = useCallback(() => {
    switch (state.stage) {
      case 'welcome':
        setStage('rules');
        break;

      case 'rules':
        selectRound(1);
        break;

      case 'splash':
        updateStateAndSync(
          (prev) => ({
            ...prev,
            stage: 'roulette',
            drawnTeam: null,
            isSpinning: false,
            spinningTargetTeam: null,
            teamsAvailableInRound:
              prev.teamsAvailableInRound.length > 0 ? prev.teamsAvailableInRound : [...ALL_TEAM_IDS],
          }),
          { type: 'CHANGE_STAGE', payload: 'roulette' }
        );
        break;

      case 'roulette':
        if (state.isSpinning) return;
        if (state.teamsAvailableInRound.length === 1) {
          const lastTeam = state.teamsAvailableInRound[0];
          updateStateAndSync(
            (prev) => ({
              ...prev,
              drawnTeam: lastTeam,
              isSpinning: false,
              spinningTargetTeam: null,
              stage: 'card_selection',
              isRevealed: false,
              answerStatus: 'idle',
              selectedOptionIndex: null,
            }),
            { type: 'CHANGE_STAGE', payload: 'card_selection' }
          );
        } else if (!state.drawnTeam) {
          startRouletteSpin();
        } else {
          setStage('card_selection');
        }
        break;

      case 'card_selection': {
        if (state.isCardFlipping) return;
        // Auto-select next available card if none selected (8 cards in round)
        const roundCards = getRoundPlayableQuestions(questions, state.currentRound);
        const availableIndices = Array.from({ length: roundCards.length }, (_, i) => i).filter(
          (idx) => !state.usedCardIndicesInRound.includes(idx)
        );
        if (availableIndices.length > 0) {
          const pickIndex = availableIndices[0];
          const qId = roundCards[pickIndex]?.id ?? roundCards[0].id;
          selectCardQuestion(qId, pickIndex);
        } else {
          setStage('question');
        }
        break;
      }

      case 'question':
        startTimer();
        break;

      case 'timer':
        pauseTimer();
        toggleReveal(true);
        break;

      case 'reveal': {
        // Complete the question turn
        const activeTeam = state.drawnTeam;
        const q = currentQuestion;
        const roundInfo = ROUNDS_INFO[state.currentRound];
        const fullPts = roundInfo?.pointsFull ?? q?.pontosCheios ?? 10;
        const isSkipped = state.isQuestionSkipped;

        let newScores = { ...state.scores };
        // If answer was not marked as wrong, was not skipped, and not yet credited to drawnTeam, credit it
        if (!isSkipped && state.answerStatus !== 'wrong' && activeTeam) {
          if (state.answerStatus === 'idle') {
            newScores[activeTeam] = (newScores[activeTeam] || 0) + fullPts;
          }
        }

        const remainingTeams = isSkipped
          ? state.teamsAvailableInRound
          : state.teamsAvailableInRound.filter((t) => t !== activeTeam);
        const nextStage: GameStage = isSkipped ? 'card_selection' : 'leaderboard';
        const nextDrawnTeam = isSkipped ? activeTeam : null;

        let nextQId = state.currentQuestionId + 1;
        if (nextQId > questions.length) nextQId = questions.length;

        const pointsAwarded: Record<TeamId, number> = {
          UCP: 0,
          UPA: 0,
          UMP: 0,
          Casais: 0,
          Adultos: 0,
        };
        if (!isSkipped && activeTeam && state.answerStatus !== 'wrong') {
          pointsAwarded[activeTeam] = fullPts;
        }

        updateStateAndSync(
          (prev) => ({
            ...prev,
            scores: newScores,
            teamsAvailableInRound: remainingTeams,
            drawnTeam: nextDrawnTeam,
            isRevealed: false,
            selectedOptionIndex: null,
            answerStatus: 'idle',
            timerSeconds: 60,
            isTimerRunning: false,
            timerEndTimestamp: null,
            currentQuestionId: nextQId,
            stage: nextStage,
            eliminatedOptionIndices: [],
            isQuestionSkipped: false,
            activeCardAnnouncement: null,
            history: [
              ...prev.history,
              {
                round: prev.currentRound,
                questionId: prev.currentQuestionId,
                drawnTeam: activeTeam,
                drawnCorrect: !isSkipped && prev.answerStatus !== 'wrong',
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
              drawnCorrect: !isSkipped && state.answerStatus !== 'wrong',
              paperCorrectTeams: [],
              pointsAwarded,
              newScores,
              nextQuestionId: nextQId,
              wasSkipped: isSkipped,
            },
          }
        );
        break;
      }

      case 'leaderboard':
        if (state.teamsAvailableInRound.length > 0) {
          // Return to roulette with remaining teams!
          const onlyOneLeft = state.teamsAvailableInRound.length === 1;
          const preSelected = onlyOneLeft ? state.teamsAvailableInRound[0] : null;
          updateStateAndSync(
            (prev) => ({
              ...prev,
              stage: 'roulette',
              drawnTeam: preSelected,
              isSpinning: false,
              spinningTargetTeam: null,
            })
          );
        } else {
          // Round completed
          if (state.currentRound < 6) {
            selectRound(state.currentRound + 1);
          } else {
            setStage('podium');
          }
        }
        break;

      case 'podium':
        break;

      case 'sudden_death':
        setStage('podium');
        break;
    }
  }, [
    state,
    currentQuestion,
    questions,
    setStage,
    selectRound,
    startRouletteSpin,
    selectCardQuestion,
    startTimer,
    pauseTimer,
    toggleReveal,
    updateStateAndSync,
  ]);

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
