import React from 'react';
import type { Question, TeamId, TeamInfo } from '../types/game';
import { getTeam } from '../types/game';
import { Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { TeamIcon } from './TeamIcon';
import { sounds } from '../services/sound';

export interface CardSelectionViewProps {
  questions: Question[];
  usedQuestionIds: number[];
  drawnTeam: TeamId | null;
  teams?: TeamInfo[];
  onSelectQuestion: (questionId: number) => void;
  interactive?: boolean;
  round?: number;
}

export const CardSelectionView: React.FC<CardSelectionViewProps> = ({
  questions,
  usedQuestionIds = [],
  drawnTeam,
  teams = [],
  onSelectQuestion,
  interactive = true,
  round,
}) => {
  const team = drawnTeam ? getTeam(drawnTeam, teams) : null;
  const usedCount = usedQuestionIds.length;
  const totalCount = questions.length;
  const availableCount = Math.max(0, totalCount - usedCount);

  const handleCardClick = (questionId: number, isUsed: boolean) => {
    if (isUsed || !interactive) return;
    try {
      sounds.playSelectionTick();
    } catch {}
    onSelectQuestion(questionId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-5 py-2 px-3 sm:px-6 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 font-black uppercase tracking-widest text-xs mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          {round ? `Rodada ${round} • ` : ''}Federação de UMPs • Gálatas
          <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase text-slate-900 tracking-tight font-display">
          Escolha da Pergunta
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
          A equipe no microfone deve escolher um número de <strong>1 a 60</strong>
        </p>

        {/* ACTIVE TEAM BANNER */}
        {team && (
          <div className="mt-3 flex items-center gap-3 animate-fadeIn">
            <span className="text-sm sm:text-base font-bold text-slate-500 uppercase tracking-wider">
              Vez de Escolher:
            </span>
            <div
              className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl border-2 font-black text-lg sm:text-2xl uppercase tracking-wider shadow-md bg-white transition-all"
              style={{
                borderColor: team.color,
                boxShadow: `0 4px 20px ${team.color}30`,
              }}
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: team.color }}
              >
                <TeamIcon icon={team.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span style={{ color: team.color }}>{team.name}</span>
            </div>
          </div>
        )}

        {/* STATS PILL */}
        <div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-600">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {availableCount} Disponíveis
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
            {usedCount} Respondidas
          </span>
        </div>
      </div>

      {/* 60 QUESTIONS GRID (10 COLUMNS ON DESKTOP, 6 ON TABLET, 5 ON MOBILE) */}
      <div className="w-full grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-2.5 max-h-[64vh] overflow-y-auto p-2 scrollbar-thin rounded-2xl bg-slate-50/70 border border-slate-200">
        {questions.map((q) => {
          const isUsed = usedQuestionIds.includes(q.id);
          const formattedNumber = q.id < 10 ? `0${q.id}` : `${q.id}`;

          return (
            <div
              key={q.id}
              onClick={() => handleCardClick(q.id, isUsed)}
              title={`Pergunta #${q.id}: ${q.categoria} - ${q.pergunta}`}
              className={`relative rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center select-none transition-all duration-150 min-h-[82px] sm:min-h-[92px] ${
                isUsed
                  ? 'bg-slate-100/80 border-2 border-slate-200 text-slate-400 opacity-35 cursor-not-allowed'
                  : 'bg-white border-2 border-slate-200 hover:border-blue-900 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.03] cursor-pointer text-slate-800 shadow-sm'
              }`}
              style={{
                borderColor: !isUsed && team ? undefined : undefined,
              }}
            >
              {/* TOP STATUS */}
              <div className="w-full flex items-center justify-between text-[10px]">
                {isUsed ? (
                  <span className="w-full flex items-center justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                ) : (
                  <>
                    <span className="font-extrabold text-blue-900 text-[10px]">
                      10 pts
                    </span>
                    <HelpCircle className="w-3 h-3 text-slate-300 group-hover:text-blue-900" />
                  </>
                )}
              </div>

              {/* CENTER QUESTION NUMBER */}
              <div className="my-auto flex flex-col items-center justify-center">
                <span
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight leading-none ${
                    isUsed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {formattedNumber}
                </span>
              </div>

              {/* BOTTOM CATEGORY BADGE */}
              <div className="w-full">
                <span
                  className={`block text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1 py-0.5 rounded truncate max-w-full ${
                    isUsed
                      ? 'bg-slate-200/60 text-slate-400'
                      : 'bg-blue-50 text-blue-900 border border-blue-100'
                  }`}
                >
                  {q.categoria}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER NOTICE */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium text-center">
        <span>Selecione a pergunta solicitada pela equipe no microfone. Cada acerto vale <strong>10 pontos</strong>.</span>
      </div>
    </div>
  );
};
