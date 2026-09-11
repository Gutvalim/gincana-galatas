export type TeamId = 'UCP' | 'UPA' | 'UMP' | 'Casais' | 'Adultos';

export interface TeamInfo {
  id: TeamId;
  name: string;
  fullName: string;
  color: string;
  borderClass: string;
  bgClass: string;
  badgeClass: string;
  gradient: string;
  accent: string;
  logo?: string;
}

export const TEAMS: Record<TeamId, TeamInfo> = {
  UCP: {
    id: 'UCP',
    name: 'UCP',
    fullName: 'União de Crianças Presbiterianas',
    color: '#0284c7',
    borderClass: 'border-sky-500',
    bgClass: 'bg-sky-500/20 text-sky-300',
    badgeClass: 'bg-sky-500 text-white',
    gradient: 'from-sky-600 to-cyan-400',
    accent: '#38bdf8',
    logo: '/logo_ucp.png',
  },
  UPA: {
    id: 'UPA',
    name: 'UPA',
    fullName: 'União Presbiteriana de Adolescentes',
    color: '#ea580c',
    borderClass: 'border-orange-500',
    bgClass: 'bg-orange-500/20 text-orange-300',
    badgeClass: 'bg-orange-500 text-white',
    gradient: 'from-orange-600 to-amber-400',
    accent: '#fb923c',
    logo: '/logo_upa.png',
  },
  UMP: {
    id: 'UMP',
    name: 'UMP',
    fullName: 'União de Mocidade Presbiteriana',
    color: '#16a34a',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-500/20 text-emerald-300',
    badgeClass: 'bg-emerald-600 text-white',
    gradient: 'from-emerald-600 to-green-400',
    accent: '#4ade80',
    logo: '/logo_ump.webp',
  },
  Casais: {
    id: 'Casais',
    name: 'Casais',
    fullName: 'Sociedade de Casais',
    color: '#9333ea',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-500/20 text-purple-300',
    badgeClass: 'bg-purple-600 text-white',
    gradient: 'from-purple-600 to-pink-400',
    accent: '#c084fc',
    logo: '/logo_casais.svg',
  },
  Adultos: {
    id: 'Adultos',
    name: 'Adultos',
    fullName: 'Sociedade de Adultos (SAF/UPH)',
    color: '#ca8a04',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-500/20 text-amber-300',
    badgeClass: 'bg-amber-600 text-white',
    gradient: 'from-amber-600 to-yellow-400',
    accent: '#fde047',
    logo: '/logo_adultos.svg',
  },
};

export const ALL_TEAM_IDS: TeamId[] = ['UCP', 'UPA', 'UMP', 'Casais', 'Adultos'];

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

export interface GameState {
  currentRound: number;
  currentQuestionId: number;
  stage: GameStage;
  scores: Record<TeamId, number>;
  teamsAvailableInRound: TeamId[];
  usedQuestionIdsInRound: number[];
  selectedCardIndex: number | null;
  isCardFlipping: boolean;
  drawnTeam: TeamId | null;
  isSpinning: boolean;
  spinningTargetTeam: TeamId | null;
  spinSeed: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  timerEndTimestamp: number | null;
  isRevealed: boolean;
  soundEnabled: boolean;
  history: ScoreEntry[];
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
  1: { number: 1, name: 'Rodada 1: Aquecimento', category: 'Aquecimento', pointsFull: 10, pointsHalf: 5, color: '#38bdf8' },
  2: { number: 2, name: 'Rodada 2: Fácil', category: 'Fácil', pointsFull: 20, pointsHalf: 10, color: '#4ade80' },
  3: { number: 3, name: 'Rodada 3: Médio', category: 'Médio', pointsFull: 30, pointsHalf: 15, color: '#fbbf24' },
  4: { number: 4, name: 'Rodada 4: Quase Difícil', category: 'Quase Difícil', pointsFull: 40, pointsHalf: 20, color: '#fb923c' },
  5: { number: 5, name: 'Rodada 5: Difícil', category: 'Difícil', pointsFull: 50, pointsHalf: 25, color: '#f87171' },
  6: { number: 6, name: 'Rodada 6: Especialista', category: 'Especialista', pointsFull: 60, pointsHalf: 30, color: '#c084fc' },
  7: { number: 7, name: 'Morte Súbita: Desempate', category: 'Morte Súbita', pointsFull: 0, pointsHalf: 0, color: '#ef4444' },
};
