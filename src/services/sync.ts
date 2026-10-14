import type { GameState, TeamId, TeamInfo, GameStage, ActionCardType } from '../types/game';
import {
  DEFAULT_TEAMS,
  INITIAL_ACTION_CARDS,
  DEFAULT_TIMER_SECONDS,
} from '../types/game';

export const CHANNEL_NAME = 'gincana_galatas_ump';
export const STORAGE_KEY = 'gincana_galatas_ump_v2';

export type SyncAction =
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'REQUEST_SYNC' }
  | { type: 'CHANGE_STAGE'; payload: GameStage }
  | { type: 'START_SPIN'; payload: { targetTeam: TeamId; seed: number } }
  | { type: 'FINISH_SPIN'; payload: TeamId }
  | { type: 'SELECT_CARD'; payload: { questionId: number; cardIndex: number } }
  | { type: 'FINISH_CARD_FLIP'; payload: { questionId: number } }
  | { type: 'TIMER_START'; payload: { seconds: number; endTimestamp: number; maxSeconds?: number } }
  | { type: 'TIMER_PAUSE'; payload: { remainingSeconds: number } }
  | { type: 'TIMER_ADD_15'; payload: { seconds: number; endTimestamp: number } }
  | { type: 'TIMER_RESET'; payload: { seconds: number } }
  | { type: 'TIMER_TICK'; payload: { seconds: number } }
  | { type: 'REVEAL_ANSWER'; payload: boolean }
  | { type: 'PRESELECT_OPTION'; payload: { optionIndex: number | null } }
  | {
      type: 'CONFIRM_ANSWER';
      payload: {
        optionIndex: number;
        isCorrect: boolean;
        drawnTeam: TeamId | null;
        newScores?: Record<TeamId, number>;
      };
    }
  | {
      type: 'USE_ACTION_CARD';
      payload: {
        team: TeamId;
        cardType: ActionCardType;
        eliminatedOptionIndices?: number[];
        additionalSeconds?: number;
        newQuestionId?: number;
      };
    }
  | {
      type: 'SUBMIT_POINTS';
      payload: {
        drawnTeam: TeamId | null;
        drawnCorrect: boolean;
        paperCorrectTeams: TeamId[];
        pointsAwarded: Record<TeamId, number>;
        newScores: Record<TeamId, number>;
        nextQuestionId?: number;
        wasSkipped?: boolean;
      };
    }
  | { type: 'EMERGENCY_SCORE'; payload: { team: TeamId; delta: number; newScores: Record<TeamId, number> } }
  | { type: 'SET_ROUND'; payload: { round: number; questionId: number } }
  | { type: 'SET_QUESTION'; payload: number }
  | { type: 'RESET_GAME'; payload: GameState }
  | { type: 'UPDATE_TEAMS'; payload: { teams: TeamInfo[]; resetScores: boolean } }
  | { type: 'SET_RULE_INDEX'; payload: number }
  | { type: 'RESET_TEAM_ORDER' }
  | { type: 'SET_TEAM_ORDER'; payload: TeamId[] }
  | { type: 'CLEAR_LAST_CARD_USED' };

const initialScores: Record<TeamId, number> = {};
const initialCards = { ...INITIAL_ACTION_CARDS };

DEFAULT_TEAMS.forEach((t) => {
  initialScores[t.id] = 0;
  if (!initialCards[t.id]) {
    initialCards[t.id] = { skip: 2, bible: 1, fiftyFifty: 1 };
  }
});

export const INITIAL_STATE: GameState = {
  currentRound: 1,
  currentQuestionId: 1,
  stage: 'welcome',
  currentRuleIndex: 0,
  teams: DEFAULT_TEAMS,
  teamOrder: [],
  currentTurnTeamIndex: 0,
  scores: initialScores,
  actionCards: initialCards,
  eliminatedOptionIndices: [],
  isQuestionSkipped: false,
  skipsUsedInRound: 0,
  activeCardAnnouncement: null,
  teamsAvailableInRound: DEFAULT_TEAMS.map((t) => t.id),
  usedQuestionIdsInRound: [],
  usedQuestionIdsTotal: [],
  usedCardIndicesInRound: [],
  selectedCardIndex: null,
  isCardFlipping: false,
  drawnTeam: DEFAULT_TEAMS[0].id,
  isSpinning: false,
  spinningTargetTeam: null,
  spinSeed: 0,
  timerSeconds: DEFAULT_TIMER_SECONDS,
  timerMaxSeconds: DEFAULT_TIMER_SECONDS,
  isTimerRunning: false,
  timerEndTimestamp: null,
  isRevealed: false,
  selectedOptionIndex: null,
  answerStatus: 'idle',
  soundEnabled: true,
  history: [],
  lastCardUsed: null,
  lastUpdated: Date.now(),
};

export function loadSavedState(): GameState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as GameState;
      if (parsed && typeof parsed.scores === 'object') {
        const teams = parsed.teams && parsed.teams.length > 0 ? parsed.teams : DEFAULT_TEAMS;
        const teamOrder = Array.isArray(parsed.teamOrder) ? parsed.teamOrder : [];

        return {
          ...INITIAL_STATE,
          ...parsed,
          teams,
          teamOrder,
          currentRuleIndex: typeof parsed.currentRuleIndex === 'number' ? parsed.currentRuleIndex : 0,
          timerSeconds: parsed.timerSeconds || DEFAULT_TIMER_SECONDS,
          timerMaxSeconds: parsed.timerMaxSeconds || DEFAULT_TIMER_SECONDS,
          actionCards: parsed.actionCards || INITIAL_ACTION_CARDS,
          eliminatedOptionIndices: parsed.eliminatedOptionIndices || [],
          isQuestionSkipped: parsed.isQuestionSkipped || false,
          skipsUsedInRound: parsed.skipsUsedInRound || 0,
          activeCardAnnouncement: null,
          usedQuestionIdsTotal: parsed.usedQuestionIdsTotal || [],
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
