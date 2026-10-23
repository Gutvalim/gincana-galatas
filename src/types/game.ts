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
    id: 'ump_flexal_2',
    name: 'Flexal II',
    fullName: 'UMP Flexal II',
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
    id: 'ump_ebenezer',
    name: 'Ebenézer',
    fullName: 'UMP Ebenézer',
    color: '#0284c7',
    icon: 'Anchor',
    borderClass: 'border-sky-500',
    bgClass: 'bg-sky-500/20 text-sky-300',
    badgeClass: 'bg-sky-600 text-white',
    gradient: 'from-sky-600 to-cyan-400',
    accent: '#38bdf8',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_santana',
    name: 'Santana',
    fullName: 'UMP Santana',
    color: '#ea580c',
    icon: 'Shield',
    borderClass: 'border-orange-500',
    bgClass: 'bg-orange-500/20 text-orange-300',
    badgeClass: 'bg-orange-600 text-white',
    gradient: 'from-orange-600 to-amber-400',
    accent: '#fb923c',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_porto_santana',
    name: 'Porto de Santana',
    fullName: 'UMP Porto de Santana',
    color: '#0d9488',
    icon: 'Compass',
    borderClass: 'border-teal-500',
    bgClass: 'bg-teal-500/20 text-teal-300',
    badgeClass: 'bg-teal-600 text-white',
    gradient: 'from-teal-600 to-emerald-400',
    accent: '#2dd4bf',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_nova_brasilia',
    name: 'Nova Brasília',
    fullName: 'UMP Nova Brasília',
    color: '#9333ea',
    icon: 'Star',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-500/20 text-purple-300',
    badgeClass: 'bg-purple-600 text-white',
    gradient: 'from-purple-600 to-pink-400',
    accent: '#c084fc',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_central_cg',
    name: 'Central de Campo Grande',
    fullName: 'UMP Central de Campo Grande',
    color: '#4f46e5',
    icon: 'BookOpen',
    borderClass: 'border-indigo-500',
    bgClass: 'bg-indigo-500/20 text-indigo-300',
    badgeClass: 'bg-indigo-600 text-white',
    gradient: 'from-indigo-600 to-violet-400',
    accent: '#818cf8',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_campo_verde',
    name: 'Campo Verde',
    fullName: 'UMP Campo Verde',
    color: '#059669',
    icon: 'Zap',
    borderClass: 'border-emerald-600',
    bgClass: 'bg-emerald-600/20 text-emerald-300',
    badgeClass: 'bg-emerald-700 text-white',
    gradient: 'from-emerald-700 to-teal-400',
    accent: '#34d399',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_betel',
    name: 'Betel',
    fullName: 'UMP Betel',
    color: '#ca8a04',
    icon: 'Crown',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-500/20 text-amber-300',
    badgeClass: 'bg-amber-600 text-white',
    gradient: 'from-amber-600 to-yellow-400',
    accent: '#facc15',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_agape',
    name: 'Ágape',
    fullName: 'UMP Ágape',
    color: '#e11d48',
    icon: 'Heart',
    borderClass: 'border-rose-500',
    bgClass: 'bg-rose-500/20 text-rose-300',
    badgeClass: 'bg-rose-600 text-white',
    gradient: 'from-rose-600 to-red-400',
    accent: '#fb7185',
    logo: '/logo_ump.webp',
  },
  {
    id: 'ump_itaciba',
    name: 'Itacibá',
    fullName: 'UMP Itacibá',
    color: '#db2777',
    icon: 'Cross',
    borderClass: 'border-pink-500',
    bgClass: 'bg-pink-500/20 text-pink-300',
    badgeClass: 'bg-pink-600 text-white',
    gradient: 'from-pink-600 to-rose-400',
    accent: '#f472b6',
    logo: '/logo_ump.webp',
  },
];

export const TEAMS: Record<string, TeamInfo> = {
  ...DEFAULT_TEAMS.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<string, TeamInfo>),
  // Backward compatibility with previous ids
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
  help?: number;      // 2 unidades de ajuda adaptativa (Bíblia se dissertativa, 50/50 se múltipla escolha)
  bible?: number;      // compatibilidade legada
  fiftyFifty?: number; // compatibilidade legada
}

export const INITIAL_ACTION_CARDS: Record<string, ActionCardsInventory> = {
  ...DEFAULT_TEAMS.reduce((acc, t) => {
    acc[t.id] = { skip: 2, help: 2 };
    return acc;
  }, {} as Record<string, ActionCardsInventory>),
  ump_1: { skip: 2, help: 2 },
  ump_2: { skip: 2, help: 2 },
  ump_3: { skip: 2, help: 2 },
  ump_4: { skip: 2, help: 2 },
  UCP: { skip: 2, help: 2 },
  UPA: { skip: 2, help: 2 },
  UMP: { skip: 2, help: 2 },
  Casais: { skip: 2, help: 2 },
  Adultos: { skip: 2, help: 2 },
};

export function getUnusedCardsCount(inv?: ActionCardsInventory | null): number {
  if (!inv) return 0;
  if (typeof inv.help === 'number') {
    return (inv.skip || 0) + inv.help;
  }
  return (inv.skip || 0) + (inv.bible || 0) + (inv.fiftyFifty || 0);
}

export function getCardBonus(inv?: ActionCardsInventory | null): number {
  return getUnusedCardsCount(inv) * CARD_BONUS_POINTS;
}

export const CARD_BONUS_POINTS = 5;
export const FIXED_QUESTION_POINTS = 10;
export const STEAL_QUESTION_POINTS = 5;
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
