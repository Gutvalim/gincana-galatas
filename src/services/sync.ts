import type { GameState, TeamId, GameStage } from '../types/game';
import { ALL_TEAM_IDS } from '../types/game';

export const CHANNEL_NAME = 'gincana_galatas';
export const STORAGE_KEY = 'gincana_galatas_state_v1';

export type SyncAction =
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'REQUEST_SYNC' }
  | { type: 'CHANGE_STAGE'; payload: GameStage }
  | { type: 'START_SPIN'; payload: { targetTeam: TeamId; seed: number } }
  | { type: 'FINISH_SPIN'; payload: TeamId }
  | { type: 'SELECT_CARD'; payload: { questionId: number; cardIndex: number } }
  | { type: 'FINISH_CARD_FLIP'; payload: { questionId: number } }
  | { type: 'TIMER_START'; payload: { seconds: number; endTimestamp: number } }
  | { type: 'TIMER_PAUSE'; payload: { remainingSeconds: number } }
  | { type: 'TIMER_ADD_15'; payload: { seconds: number; endTimestamp: number } }
  | { type: 'TIMER_RESET'; payload: { seconds: number } }
  | { type: 'TIMER_TICK'; payload: { seconds: number } }
  | { type: 'REVEAL_ANSWER'; payload: boolean }
  | {
      type: 'SUBMIT_POINTS';
      payload: {
        drawnTeam: TeamId | null;
        drawnCorrect: boolean;
        paperCorrectTeams: TeamId[];
        pointsAwarded: Record<TeamId, number>;
        newScores: Record<TeamId, number>;
        nextQuestionId?: number;
      };
    }
  | { type: 'EMERGENCY_SCORE'; payload: { team: TeamId; delta: number; newScores: Record<TeamId, number> } }
  | { type: 'SET_ROUND'; payload: { round: number; questionId: number } }
  | { type: 'SET_QUESTION'; payload: number }
  | { type: 'RESET_GAME'; payload: GameState };

export const INITIAL_STATE: GameState = {
  currentRound: 1,
  currentQuestionId: 1,
  stage: 'welcome',
  scores: {
    UCP: 0,
    UPA: 0,
    UMP: 0,
    Casais: 0,
    Adultos: 0,
  },
  teamsAvailableInRound: [...ALL_TEAM_IDS],
  usedQuestionIdsInRound: [],
  usedCardIndicesInRound: [],
  selectedCardIndex: null,
  isCardFlipping: false,
  drawnTeam: null,
  isSpinning: false,
  spinningTargetTeam: null,
  spinSeed: 0,
  timerSeconds: 60,
  isTimerRunning: false,
  timerEndTimestamp: null,
  isRevealed: false,
  soundEnabled: true,
  history: [],
  lastUpdated: Date.now(),
};

export function loadSavedState(): GameState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as GameState;
      // Sanity checks on parsed state
      if (parsed && typeof parsed.scores === 'object' && parsed.currentRound) {
        return {
          ...INITIAL_STATE,
          ...parsed,
          usedCardIndicesInRound: parsed.usedCardIndicesInRound || [],
          usedQuestionIdsInRound: parsed.usedQuestionIdsInRound || [],
        };
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }
  return INITIAL_STATE;
}

export function saveStateToStorage(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}
