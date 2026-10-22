import React, { useState } from 'react';
import type { Question, TeamId, TeamInfo } from '../types/game';
import { getTeam } from '../types/game';
import { Sparkles, Search, AlertCircle, ArrowRight } from 'lucide-react';
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
            {availableCount} Douradas Disponíveis
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

      {/* CINEMATIC REVEAL ANIMATION MODAL WHEN A QUESTION IS SELECTED */}
      {isCardFlipping && revealQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          {/* Ambient Gold Halo */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/35 blur-3xl animate-pulse pointer-events-none" />

          {/* Flying & Flipping Zoom Card */}
          <div className="relative w-full max-w-lg sm:max-w-xl h-[440px] sm:h-[480px] rounded-3xl animate-cardFlyZoomIn shadow-[0_0_80px_rgba(251,191,36,0.95)] border-4 border-amber-400 overflow-hidden">
            {/* FRONT FACE (Gold Envelope with Big Number, flips out at 0.7s) */}
            <div className="absolute inset-0 rounded-3xl p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#78350f] border-2 border-yellow-200 animate-envelopeFlipOut">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-950/80 text-amber-300 border border-amber-400/60 shadow">
                  Pergunta Selecionada
                </span>
                <Sparkles className="w-7 h-7 text-amber-200 animate-pulse" />
              </div>

              <div className="flex flex-col items-center gap-2 my-auto">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-widest">
                  Número Escolhido
                </span>
                <span className="text-7xl sm:text-9xl font-black font-mono tracking-tight text-slate-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
                  #{revealQ.id < 10 ? `0${revealQ.id}` : revealQ.id}
                </span>
                <span className="text-xs sm:text-sm text-slate-900 font-bold uppercase tracking-wider bg-white/40 px-4 py-1 rounded-full shadow-sm">
                  Revelando Pergunta...
                </span>
              </div>

              <span className="text-xs text-slate-950 uppercase tracking-widest animate-pulse font-black">
                Gincana Gálatas • Federação de UMPs
              </span>
            </div>

            {/* BACK FACE (Question Flips In Facing Audience) */}
            <div className="absolute inset-0 rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center bg-gradient-to-br from-[#002b49] via-[#051e33] to-[#021321] text-white border-2 border-amber-400 shadow-2xl animate-questionFlipIn">
              {/* Header */}
              <div className="w-full flex items-center justify-between border-b border-amber-400/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                    Pergunta #{revealQ.id < 10 ? `0${revealQ.id}` : revealQ.id}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-900 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/40">
                    {revealQ.categoria}
                  </span>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase shadow">
                  10 pts
                </span>
              </div>

              {/* Question Enunciado */}
              <div className="my-auto flex flex-col items-center gap-3 w-full">
                <div className="w-full p-4 sm:p-6 rounded-2xl bg-black/50 border-2 border-amber-400/40 shadow-inner">
                  <p className="text-base sm:text-xl font-extrabold text-white leading-relaxed text-center">
                    "{revealQ.pergunta}"
                  </p>
                </div>
                <span className="text-xs text-blue-200 font-semibold">
                  {revealQ.tipo === 'multipla_escolha'
                    ? `Múltipla Escolha (${revealQ.opcoes.length} alternativas)`
                    : 'Pergunta Dissertativa / Memorização'}
                </span>
              </div>

              {/* Footer */}
              <div className="w-full flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300 animate-pulse">
                    Abrindo pergunta no telão...
                  </span>
                </div>
                {onFinishFlip && (
                  <button
                    onClick={() => onFinishFlip(revealQ.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Iniciar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
