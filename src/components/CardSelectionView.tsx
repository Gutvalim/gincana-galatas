import React, { useState } from 'react';
import type { Question, TeamId, TeamInfo } from '../types/game';
import { getTeam } from '../types/game';
import { Sparkles, Search, AlertCircle } from 'lucide-react';
import { TeamIcon } from './TeamIcon';
import { sounds } from '../services/sound';

export interface CardSelectionViewProps {
  questions: Question[];
  usedQuestionIds: number[];
  drawnTeam: TeamId | null;
  teams?: TeamInfo[];
  currentQuestion?: Question | null;
  isCardFlipping?: boolean;
  selectedCardIndex?: number | null;
  onSelectQuestion: (questionId: number) => void;
  onFinishFlip?: (questionId: number) => void;
  interactive?: boolean;
  round?: number;
}

export const CardSelectionView: React.FC<CardSelectionViewProps> = ({
  questions,
  usedQuestionIds = [],
  drawnTeam,
  teams = [],
  currentQuestion = null,
  isCardFlipping = false,
  selectedCardIndex: _selectedCardIndex,
  onSelectQuestion,
  onFinishFlip,
  interactive = true,
  round,
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const team = drawnTeam ? getTeam(drawnTeam, teams) : null;
  const usedCount = usedQuestionIds.length;
  const totalCount = questions.length;
  const availableCount = Math.max(0, totalCount - usedCount);

  // Handle clicking on a question card directly
  const handleCardClick = (questionId: number, isUsed: boolean) => {
    if (isUsed || !interactive || isCardFlipping) return;
    try {
      sounds.playSelectionTick();
    } catch {}
    onSelectQuestion(questionId);
  };

  // Handle search bar number submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(searchInput.trim(), 10);
    if (isNaN(num) || num < 1 || num > 60) {
      setSearchError('Digite um número válido entre 1 e 60.');
      return;
    }
    if (usedQuestionIds.includes(num)) {
      setSearchError(`A pergunta #${num} já foi respondida! Escolha outra.`);
      return;
    }
    setSearchError(null);
    setSearchInput('');
    onSelectQuestion(num);
  };

  // Question being revealed in the animation
  const revealQ = currentQuestion || questions[0];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-4 py-2 px-3 sm:px-6 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="text-center flex flex-col items-center w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 font-black uppercase tracking-widest text-xs mb-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          {round ? `Rodada ${round} • ` : ''}Federação de UMPs • Gálatas
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase text-slate-900 tracking-tight font-display">
          Escolha da Pergunta
        </h1>

        {/* ACTIVE TEAM BANNER */}
        {team && (
          <div className="mt-2.5 flex items-center gap-3 animate-fadeIn">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Vez de Escolher:
            </span>
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-2xl border-2 font-black text-base sm:text-xl uppercase tracking-wider shadow-md bg-white transition-all"
              style={{
                borderColor: team.color,
                boxShadow: `0 4px 18px ${team.color}30`,
              }}
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: team.color }}
              >
                <TeamIcon icon={team.icon} className="w-4 h-4" />
              </div>
              <span style={{ color: team.color }}>{team.name}</span>
            </div>
          </div>
        )}

        {/* SEARCH BAR FOR QUICK NUMBER INPUT */}
        <div className="w-full max-w-md mt-3 flex flex-col gap-1.5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min={1}
                max={60}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchError(null);
                }}
                placeholder="Número da pergunta (1 a 60)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-amber-400 bg-white text-slate-900 font-black text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-400/30 placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md border border-yellow-300 transition-all transform active:scale-95 cursor-pointer shrink-0"
            >
              Escolher
            </button>
          </form>

          {searchError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-3 py-1 rounded-lg animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* STATS PILL */}
        <div className="mt-2.5 flex items-center gap-3 text-xs font-bold text-slate-600">
          <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black">
            {availableCount} Disponíveis
          </span>
          <span className="px-3 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300 font-medium">
            {usedCount} Escolhidas
          </span>
        </div>
      </div>

      {/* 60 QUESTIONS NUMBER-ONLY GRID (10 COLUMNS ON DESKTOP, 6 ON TABLET, 5 ON MOBILE) */}
      <div className="w-full grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-2.5 max-h-[60vh] overflow-y-auto p-2.5 scrollbar-thin rounded-2xl bg-slate-100/80 border-2 border-slate-200 shadow-inner">
        {questions.map((q) => {
          const isUsed = usedQuestionIds.includes(q.id);
          const formattedNumber = q.id < 10 ? `0${q.id}` : `${q.id}`;

          return (
            <div
              key={q.id}
              onClick={() => handleCardClick(q.id, isUsed)}
              title={isUsed ? `Pergunta #${q.id} (Já Respondida)` : `Pergunta #${q.id} (Disponível)`}
              className={`relative rounded-2xl h-14 sm:h-16 md:h-18 flex items-center justify-center text-center select-none transition-all duration-150 ${
                isUsed
                  ? 'bg-slate-200/50 border border-slate-300/40 text-slate-400/50 font-black font-mono text-xl sm:text-2xl line-through opacity-25 cursor-not-allowed shadow-none'
                  : 'group cursor-pointer bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] border-2 border-yellow-200 shadow-[0_4px_14px_rgba(245,158,11,0.45),inset_0_1px_2px_rgba(255,255,255,0.7)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.85)] hover:scale-110 hover:-translate-y-1 active:scale-95 text-slate-950 font-black font-mono text-2xl sm:text-3xl tracking-tight'
              }`}
            >
              {/* Glossy top reflection for available flashy gold cards */}
              {!isUsed && (
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-xl pointer-events-none" />
              )}

              {/* ONLY THE NUMBER - NO EXTRA INFO */}
              <span className={`relative z-10 leading-none ${!isUsed ? 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' : ''}`}>
                {formattedNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* CINEMATIC REVEAL: CARD APPROACHES SCREEN, NUMBER GROWS BIG, AND FADES OUT TO QUESTION */}
      {isCardFlipping && revealQ && (
        <div
          onClick={() => onFinishFlip && onFinishFlip(revealQ.id)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-backdropFadeOut cursor-pointer select-none"
        >
          {/* Ambient Gold Halo */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-amber-500/30 blur-3xl animate-pulse pointer-events-none" />

          {/* Card that approaches the screen and fades out */}
          <div className="relative w-full max-w-md sm:max-w-lg h-[460px] sm:h-[500px] rounded-3xl p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#78350f] border-4 border-yellow-200 shadow-[0_0_100px_rgba(245,158,11,0.9)] overflow-hidden animate-cardApproachAndFade">
            {/* Top Gloss Reflection */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

            {/* Header Badge */}
            <div className="relative z-10 w-full flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-950/85 text-amber-300 border border-amber-400/60 shadow">
                {revealQ.categoria || 'Gálatas'}
              </span>
              <Sparkles className="w-7 h-7 text-amber-200 animate-pulse" />
            </div>

            {/* Center: BIG NUMBER THAT GROWS LARGE */}
            <div className="relative z-10 flex flex-col items-center gap-3 my-auto">
              <span className="text-xs sm:text-sm font-black text-slate-950/80 uppercase tracking-widest bg-white/40 px-4 py-1 rounded-full shadow-sm">
                Número Escolhido
              </span>

              <div className="animate-numberPopGrow">
                <span className="text-8xl sm:text-9xl md:text-[10rem] font-black font-mono tracking-tight text-slate-950 drop-shadow-[0_4px_16px_rgba(255,255,255,0.9)] leading-none select-none">
                  #{revealQ.id < 10 ? `0${revealQ.id}` : revealQ.id}
                </span>
              </div>

              <span className="text-xs sm:text-sm font-extrabold text-slate-950 uppercase tracking-wider bg-white/50 px-4 py-1.5 rounded-xl shadow-sm border border-yellow-200/60">
                10 Pontos • Abrindo...
              </span>
            </div>

            {/* Footer */}
            <div className="relative z-10 w-full flex items-center justify-center pt-2 border-t border-slate-950/15">
              <span className="text-xs text-slate-950 uppercase tracking-widest font-black">
                Gincana Gálatas • Federação de UMPs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
