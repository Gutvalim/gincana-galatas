export type TeamId = string;

export interface TeamInfo {
  id: TeamId;
  name: string;
  fullName?: string;
  color: string;
  icon: string;
  borderClass?: string;
  bgClass?: string;
  badgeClass?: string;
  gradient?: string;
  accent?: string;
  logo?: string;
}

export const AVAILABLE_ICONS = [
  'Flame',
  'BookOpen',
  'Shield',
  'Cross',
  'Heart',
  'Star',
  'Anchor',
  'Zap',
  'Trophy',
  'Crown',
  'Compass',
  'Users',
  'Sun',
  'Flag',
  'Sparkles',
  'Award',
] as const;

export const AVAILABLE_COLORS = [
  '#16a34a', // Verde UMP
  '#0284c7', // Azul Céu
  '#ea580c', // Laranja
  '#9333ea', // Roxo
  '#e11d48', // Vermelho
  '#ca8a04', // Dourado
  '#0d9488', // Verde Petróleo
  '#4f46e5', // Índigo
  '#db2777', // Rosa
  '#059669', // Menta
];

export const DEFAULT_TEAMS: TeamInfo[] = [
  {
    id: 'ump_1',
    name: 'UMP Betel',
    fullName: 'União de Mocidade - Igreja Betel',
    color: '#16a34a',
    icon: 'Flame',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-500/20 text-emerald-300',
    badgeClass: 'bg-emerald-600 text-white',
    gradient: 'from-emerald-600 to-green-400',
    accent: '#4ade80',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_2',
    name: 'UMP Central',
    fullName: 'União de Mocidade - Igreja Central',
    color: '#0284c7',
    icon: 'BookOpen',
    borderClass: 'border-sky-500',
    bgClass: 'bg-sky-500/20 text-sky-300',
    badgeClass: 'bg-sky-500 text-white',
    gradient: 'from-sky-600 to-cyan-400',
    accent: '#38bdf8',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_3',
    name: 'UMP Aliança',
    fullName: 'União de Mocidade - Igreja Aliança',
    color: '#ea580c',
    icon: 'Shield',
    borderClass: 'border-orange-500',
    bgClass: 'bg-orange-500/20 text-orange-300',
    badgeClass: 'bg-orange-500 text-white',
    gradient: 'from-orange-600 to-amber-400',
    accent: '#fb923c',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_4',
    name: 'UMP Peniel',
    fullName: 'União de Mocidade - Igreja Peniel',
    color: '#9333ea',
    icon: 'Crown',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-500/20 text-purple-300',
    badgeClass: 'bg-purple-600 text-white',
    gradient: 'from-purple-600 to-pink-400',
    accent: '#c084fc',
    logo: '/logo_ump.webp',
  },
];

export const TEAMS: Record<string, TeamInfo> = {
  ump_1: DEFAULT_TEAMS[0],
  ump_2: DEFAULT_TEAMS[1],
  ump_3: DEFAULT_TEAMS[2],
  ump_4: DEFAULT_TEAMS[3],
  // Legacy mappings for safe fallback
  UCP: { id: 'UCP', name: 'UCP', fullName: 'União de Crianças Presbiterianas', color: '#0284c7', icon: 'Star', logo: '/logo_ump.webp' },
  UPA: { id: 'UPA', name: 'UPA', fullName: 'União Presbiteriana de Adolescentes', color: '#ea580c', icon: 'Flame', logo: '/logo_ump.webp' },
  UMP: { id: 'UMP', name: 'UMP', fullName: 'União de Mocidade Presbiteriana', color: '#16a34a', icon: 'Users', logo: '/logo_ump.webp' },
  Casais: { id: 'Casais', name: 'Casais', fullName: 'Sociedade de Casais', color: '#9333ea', icon: 'Heart', logo: '/logo_ump.webp' },
  Adultos: { id: 'Adultos', name: 'Adultos', fullName: 'Sociedade de Adultos', color: '#ca8a04', icon: 'BookOpen', logo: '/logo_ump.webp' },
};

export const ALL_TEAM_IDS: string[] = DEFAULT_TEAMS.map((t) => t.id);

export function getTeam(teamId?: string | null, customTeams?: TeamInfo[]): TeamInfo {
  if (!teamId) return DEFAULT_TEAMS[0];
  if (customTeams && customTeams.length > 0) {
    const found = customTeams.find((t) => t.id === teamId);
    if (found) return found;
  }
  if (TEAMS[teamId]) return TEAMS[teamId];
  return {
    id: teamId,
    name: teamId,
    color: '#16a34a',
    icon: 'Flame',
    logo: '/logo_ump.webp',
  };
}

export interface Question {
  id: number;
  rodada: number;
  categoria: string;
  pontosCheios: number;
  pontosMeios: number;
  pergunta: string;
  tipo: 'multipla_escolha' | 'dissertativa';
  opcoes: string[];
  respostaCorreta: string;
  versiculo: string;
  textoBiblico: string;
  isKids?: boolean;
  isKidsBackup?: boolean;
  fiftyFiftyEliminate?: number[];
}

export type GameStage =
  | 'welcome'
  | 'rules'
  | 'leaderboard'
  | 'splash'
  | 'roulette'
  | 'card_selection'
  | 'question'
  | 'timer'
  | 'reveal'
  | 'sudden_death'
  | 'podium';

export interface ScoreEntry {
  round: number;
  questionId: number;
  drawnTeam: TeamId | null;
  drawnCorrect: boolean;
  paperCorrectTeams: TeamId[];
  pointsAwarded: Record<TeamId, number>;
  timestamp: number;
}

export type ActionCardType = 'skip' | 'bible' | 'fiftyFifty';

export interface ActionCardsInventory {
  skip: number;       // 2 unidades
  bible: number;      // 1 unidade (30s)
  fiftyFifty: number; // 1 unidade (elimina 2 alternativas)
}

export const INITIAL_ACTION_CARDS: Record<string, ActionCardsInventory> = {
  ump_1: { skip: 2, bible: 1, fiftyFifty: 1 },
  ump_2: { skip: 2, bible: 1, fiftyFifty: 1 },
  ump_3: { skip: 2, bible: 1, fiftyFifty: 1 },
  ump_4: { skip: 2, bible: 1, fiftyFifty: 1 },
  UCP: { skip: 2, bible: 1, fiftyFifty: 1 },
  UPA: { skip: 2, bible: 1, fiftyFifty: 1 },
  UMP: { skip: 2, bible: 1, fiftyFifty: 1 },
  Casais: { skip: 2, bible: 1, fiftyFifty: 1 },
  Adultos: { skip: 2, bible: 1, fiftyFifty: 1 },
};

export const CARD_BONUS_POINTS = 10;
export const FIXED_QUESTION_POINTS = 10;
export const DEFAULT_TIMER_SECONDS = 60;
export const STEAL_TIMER_SECONDS = 30;
export const AUTO_START_GRACE_SECONDS = 12;

export interface GameState {
  currentRound: number;
  currentQuestionId: number;
  stage: GameStage;
  currentRuleIndex: number;
  teams: TeamInfo[];
  teamOrder: TeamId[];
  currentTurnTeamIndex: number;
  scores: Record<TeamId, number>;
  actionCards: Record<TeamId, ActionCardsInventory>;
  eliminatedOptionIndices: number[];
  isQuestionSkipped: boolean;
  skipsUsedInRound: number;
  ucpSkipsInRound?: number;
  activeCardAnnouncement: string | null;
  teamsAvailableInRound: TeamId[];
  usedQuestionIdsInRound: number[];
  usedQuestionIdsTotal: number[];
  usedCardIndicesInRound: number[];
  selectedCardIndex: number | null;
  isCardFlipping: boolean;
  drawnTeam: TeamId | null;
  isSpinning: boolean;
  spinningTargetTeam: TeamId | null;
  spinSeed: number;
  timerSeconds: number;
  timerMaxSeconds: number;
  isTimerRunning: boolean;
  timerEndTimestamp: number | null;
  autoStartEndTimestamp: number | null;
  isStealActive: boolean;
  firstTeamFailed: boolean;
  isRevealed: boolean;
  selectedOptionIndex: number | null;
  answerStatus: 'idle' | 'selected' | 'correct' | 'wrong';
  soundEnabled: boolean;
  history: ScoreEntry[];
  lastCardUsed?: {
    type: ActionCardType;
    team: TeamId;
    timestamp: number;
  } | null;
  lastUpdated: number;
}

export interface RoundInfo {
  number: number;
  name: string;
  category: string;
  pointsFull: number;
  pointsHalf: number;
  color: string;
}

export const ROUNDS_INFO: Record<number, RoundInfo> = {
  1: { number: 1, name: 'Rodada 1 • Gálatas 1 e 2', category: 'Gálatas 1 e 2', pointsFull: FIXED_QUESTION_POINTS, pointsHalf: 0, color: '#38bdf8' },
  2: { number: 2, name: 'Rodada 2 • Gálatas 3', category: 'Gálatas 3', pointsFull: FIXED_QUESTION_POINTS, pointsHalf: 0, color: '#4ade80' },
  3: { number: 3, name: 'Rodada 3 • Gálatas 4', category: 'Gálatas 4', pointsFull: FIXED_QUESTION_POINTS, pointsHalf: 0, color: '#fbbf24' },
  4: { number: 4, name: 'Rodada 4 • Gálatas 5', category: 'Gálatas 5', pointsFull: FIXED_QUESTION_POINTS, pointsHalf: 0, color: '#fb923c' },
  5: { number: 5, name: 'Rodada 5 • Gálatas 6', category: 'Gálatas 6', pointsFull: FIXED_QUESTION_POINTS, pointsHalf: 0, color: '#c084fc' },
  6: { number: 6, name: 'Rodada Final • Desafio UMP', category: 'Desafio UMP', pointsFull: FIXED_QUESTION_POINTS, pointsHalf: 0, color: '#f87171' },
  7: { number: 7, name: 'Rodada de Desempate', category: 'Desempate', pointsFull: FIXED_QUESTION_POINTS, pointsHalf: 0, color: '#ef4444' },
};

export const getRoundPlayableQuestions = (allQuestions: Question[], round: number): Question[] => {
  return allQuestions.filter((q) => q.rodada === round);
};
