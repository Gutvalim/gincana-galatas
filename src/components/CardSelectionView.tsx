import React from 'react';
import type { Question, TeamId } from '../types/game';
import { TEAMS } from '../types/game';
import { Lock, Sparkles, CheckCircle2, Award } from 'lucide-react';

interface CardSelectionViewProps {
  round: number;
  questionsInRound: Question[];
  usedQuestionIds: number[];
  usedCardIndices: number[];
  currentQuestion?: Question | null;
  drawnTeam: TeamId | null;
  selectedCardIndex: number | null;
  isCardFlipping: boolean;
  onSelectCard: (questionId: number, cardIndex: number) => void;
  interactive?: boolean;
}

export const CardSelectionView: React.FC<CardSelectionViewProps> = ({
  round,
  questionsInRound,
  usedQuestionIds: _usedQuestionIds,
  usedCardIndices = [],
  currentQuestion = null,
  drawnTeam,
  selectedCardIndex,
  isCardFlipping,
  onSelectCard,
  interactive = true,
}) => {
  const team = drawnTeam ? TEAMS[drawnTeam] : null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8 py-4 px-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#006341]/30 border-2 border-amber-400/60 text-amber-300 font-black uppercase tracking-widest text-xs sm:text-sm mb-3 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          Fase de Escolha • Rodada {round}
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white tracking-tight drop-shadow-md">
          Escolha da Pergunta
        </h2>

        {team && (
          <div className="mt-4 flex items-center gap-3 animate-bounce">
            <span className="text-base sm:text-xl font-bold text-gray-300 uppercase tracking-wider">
              Vez da Equipe:
            </span>
            <span
              className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl border-2 font-black text-xl sm:text-3xl uppercase tracking-widest shadow-xl"
              style={{
                borderColor: team.color,
                backgroundColor: `${team.color}25`,
                color: team.color,
                boxShadow: `0 0 25px ${team.color}50`,
              }}
            >
              {team.logo && (
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/95 border border-white/60 p-1 flex items-center justify-center shrink-0 shadow-md">
                  <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                </div>
              )}
              {team.name}
            </span>
          </div>
        )}

        <p className="mt-3 text-xs sm:text-sm text-gray-300 max-w-xl font-medium">
          A equipe sorteada escolhe um card para responder. Os cards já respondidos ficam bloqueados para as próximas equipes nesta rodada!
        </p>
      </div>

      {/* Cards Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-5 perspective-1000">
        {questionsInRound.map((q, idx) => {
          const isUsed = usedCardIndices.includes(idx);
          const isSelected = selectedCardIndex === idx;
          const isFlipping = isSelected && isCardFlipping;
          const revealQ = isSelected && currentQuestion ? currentQuestion : q;

          return (
            <div
              key={q.id}
              className="relative h-56 sm:h-64 cursor-pointer select-none transition-transform"
              style={{ perspective: '1000px' }}
              onClick={() => {
                if (!isUsed && interactive && !isCardFlipping) {
                  onSelectCard(q.id, idx);
                }
              }}
            >
              {/* Card Container with 3D Flip */}
              <div
                className={`w-full h-full rounded-3xl transition-all duration-700 relative [transform-style:preserve-3d] shadow-2xl ${
                  isFlipping
                    ? '[transform:rotateY(180deg)] shadow-[0_0_40px_rgba(251,191,36,0.9)] scale-105'
                    : isUsed
                    ? 'opacity-40 grayscale cursor-not-allowed scale-95'
                    : 'hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,135,90,0.6)]'
                }`}
              >
                {/* FRONT OF CARD (Mystery / Unrevealed) */}
                <div
                  className={`absolute inset-0 rounded-3xl p-4 flex flex-col justify-between items-center text-center [backface-visibility:hidden] border-2 transition-all ${
                    isUsed
                      ? 'bg-[#0b1d14] border-gray-700/60 text-gray-500'
                      : 'bg-gradient-to-b from-[#0e2a1f] via-[#091f16] to-[#06140e] border-[#1d5740] hover:border-amber-400/80 shadow-lg'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#006341]/60 text-emerald-300 border border-emerald-500/40">
                      R{q.rodada}
                    </span>
                    {isUsed ? (
                      <Lock className="w-4 h-4 text-red-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    )}
                  </div>

                  {/* Center Emblem & Mystery Card Label */}
                  <div className="flex flex-col items-center gap-1.5 my-auto">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 ${
                        isUsed
                          ? 'bg-gray-800/60 border-gray-700 text-gray-500'
                          : 'bg-gradient-to-br from-[#006341] to-[#043322] border-amber-400/60 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      }`}
                    >
                      {isUsed ? '🔒' : '📖'}
                    </div>
                    <span
                      className={`text-xl sm:text-2xl font-black uppercase tracking-widest mt-1 ${
                        isUsed ? 'text-gray-500 line-through' : 'text-amber-300'
                      }`}
                    >
                      Card {idx + 1}
                    </span>
                  </div>

                  {/* Bottom Points / Status Banner */}
                  <div className="w-full">
                    {isUsed ? (
                      <span className="block text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-950/60 py-1 rounded-xl border border-red-800/60">
                        Esgotado
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 py-1 rounded-xl border border-amber-500/30">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {q.pontosCheios} pts
                      </div>
                    )}
                  </div>
                </div>

                {/* BACK OF CARD (Revealed after click) */}
                <div
                  className="absolute inset-0 rounded-3xl p-5 flex flex-col justify-between items-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden] bg-gradient-to-br from-[#006341] via-[#0b2b1d] to-[#05170f] border-4 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.8)] text-white"
                >
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Card Escolhido!
                  </div>

                  <div className="my-auto flex flex-col items-center gap-1">
                    <span className="text-3xl font-black text-amber-300 font-mono">
                      #{revealQ.id}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-500/50">
                      {revealQ.categoria}
                    </span>
                    <p className="text-xs text-gray-200 mt-2 line-clamp-3 font-medium">
                      "{revealQ.pergunta}"
                    </p>
                  </div>

                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 animate-pulse">
                    Abrindo Pergunta...
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
        <span>Cards restantes nesta rodada:</span>
        <strong className="text-emerald-400 font-bold">
          {questionsInRound.length - usedCardIndices.length} de {questionsInRound.length}
        </strong>
      </div>
    </div>
  );
};
