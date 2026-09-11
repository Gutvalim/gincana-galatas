import React from 'react';
import type { Question, TeamId } from '../types/game';
import { TEAMS } from '../types/game';
import { BookOpen, CheckCircle2, XCircle, Award, Sparkles, FastForward } from 'lucide-react';

interface QuestionViewProps {
  question: Question;
  isRevealed: boolean;
  showPoints?: boolean;
  drawnTeam?: TeamId | null;
  selectedOptionIndex?: number | null;
  answerStatus?: 'idle' | 'selected' | 'correct' | 'wrong';
  eliminatedOptionIndices?: number[];
  activeCardAnnouncement?: string | null;
  isQuestionSkipped?: boolean;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  isRevealed,
  showPoints = true,
  drawnTeam = null,
  selectedOptionIndex = null,
  answerStatus = 'idle',
  eliminatedOptionIndices = [],
  activeCardAnnouncement = null,
  isQuestionSkipped = false,
}) => {
  const letters = ['A', 'B', 'C', 'D'];
  const team = drawnTeam ? TEAMS[drawnTeam] : null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      {/* Active Team on Microphone Banner */}
      {team && (
        <div
          className="flex items-center justify-between px-5 py-2.5 rounded-2xl border-2 shadow-lg animate-fadeIn"
          style={{
            borderColor: team.color,
            backgroundColor: `${team.color}20`,
            boxShadow: `0 0 20px ${team.color}30`,
          }}
        >
          <div className="flex items-center gap-3">
            {team.logo && (
              <div className="w-10 h-10 rounded-xl bg-white/95 border border-white/50 p-1 flex items-center justify-center shrink-0 shadow-md">
                <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <span className="text-[11px] text-gray-300 uppercase tracking-wider block font-bold">
                Equipe no Microfone:
              </span>
              <span className="text-base sm:text-xl font-black uppercase tracking-wide" style={{ color: team.color }}>
                {team.name} <span className="text-xs font-normal text-gray-300 hidden sm:inline">({team.fullName})</span>
              </span>
            </div>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow"
            style={{ backgroundColor: team.color }}
          >
            Vez de Responder
          </span>
        </div>
      )}

      {/* Active Card Announcement Banner */}
      {activeCardAnnouncement && (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-emerald-500/25 to-cyan-500/25 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3 text-center animate-bounce">
          <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
          <span className="text-base sm:text-xl font-black uppercase tracking-wide text-white drop-shadow">
            {activeCardAnnouncement}
          </span>
        </div>
      )}

      {/* Question Skipped Notice */}
      {isQuestionSkipped && (
        <div className="w-full p-3.5 rounded-xl bg-orange-950/70 border-2 border-orange-500/80 text-orange-200 flex items-center justify-center gap-2 shadow-lg">
          <FastForward className="w-5 h-5 text-orange-400 shrink-0" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-center">
            Pergunta Pulada pela Equipe! Apenas respostas avaliadas no papel pontuarão nesta questão.
          </span>
        </div>
      )}

      {/* Category & Points Badges Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-4 py-1.5 rounded-xl text-sm sm:text-base font-black uppercase tracking-wider bg-[#006341]/50 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(0,99,65,0.4)]">
            Pergunta #{question.id} • {question.categoria}
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#0c231a] text-gray-300 border border-[#1d5740]">
            {question.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'}
          </span>
        </div>

        {showPoints && (
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-xl text-sm sm:text-base font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Award className="w-4 h-4 text-amber-400" />
              Microfone: {question.pontosCheios} pts
            </span>
            {question.pontosMeios > 0 && (
              <span className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Papel: {question.pontosMeios} pts
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#0c231a] to-[#081c13] border-2 border-[#1d5740] shadow-[0_0_45px_rgba(0,99,65,0.3)]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-snug tracking-tight text-center sm:text-left drop-shadow-md">
          {question.pergunta}
        </h2>
      </div>

      {/* Options Grid (Multiple Choice) */}
      {question.tipo === 'multipla_escolha' && question.opcoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.opcoes.map((opcao, idx) => {
            const isCorrect = opcao.trim().toLowerCase() === question.respostaCorreta.trim().toLowerCase();
            const isSelected = selectedOptionIndex === idx;
            const isEliminated = eliminatedOptionIndices.includes(idx);
            const letter = letters[idx] || `${idx + 1}`;

            let cardStyle = 'border-[#1d5740] bg-[#0c231a]/90 text-gray-200 hover:border-emerald-500/60';
            let letterStyle = 'bg-[#133829] text-amber-300 border-[#1d5740]';

            if (isEliminated) {
              cardStyle =
                'border-dashed border-gray-800 bg-gray-950/40 text-gray-600 line-through opacity-30 pointer-events-none filter grayscale';
              letterStyle = 'bg-gray-900 text-gray-700 border-gray-800';
            } else if (answerStatus === 'selected' && isSelected) {
              cardStyle =
                'border-amber-400 bg-amber-500/20 text-white shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-[1.02] ring-2 ring-amber-400 animate-pulse';
              letterStyle = 'bg-amber-400 text-black border-amber-300 font-black';
            } else if (answerStatus === 'wrong') {
              if (isSelected) {
                cardStyle =
                  'border-red-500 bg-red-950/80 text-red-100 shadow-[0_0_35px_rgba(239,68,68,0.7)] scale-[1.02] ring-2 ring-red-500';
                letterStyle = 'bg-red-600 text-white border-red-400 font-black';
              } else if (isCorrect) {
                cardStyle =
                  'border-emerald-500/80 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500/60';
                letterStyle = 'bg-emerald-600/80 text-white border-emerald-500 font-bold';
              } else {
                cardStyle = 'border-gray-900 bg-gray-950/50 text-gray-500 opacity-40';
                letterStyle = 'bg-gray-900 text-gray-600 border-gray-800';
              }
            } else if (answerStatus === 'correct' || isRevealed) {
              if (isCorrect) {
                cardStyle =
                  'border-emerald-400 bg-emerald-950/80 text-emerald-100 shadow-[0_0_35px_rgba(16,185,129,0.6)] scale-[1.02] ring-2 ring-emerald-400';
                letterStyle = 'bg-emerald-500 text-black border-emerald-400 font-black';
              } else {
                cardStyle = 'border-gray-900 bg-gray-950/50 text-gray-500 opacity-40';
                letterStyle = 'bg-gray-900 text-gray-600 border-gray-800';
              }
            }

            return (
              <div
                key={idx}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-500 flex items-center gap-4 ${cardStyle}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg border-2 shadow shrink-0 transition-colors ${letterStyle}`}
                >
                  {letter}
                </div>
                <span className="text-lg sm:text-xl font-bold flex-1 leading-relaxed">
                  {opcao}
                </span>

                {/* Status Badges / Icons */}
                {isEliminated && (
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/30 shrink-0">
                    50/50 Eliminada
                  </span>
                )}
                {!isEliminated && answerStatus === 'selected' && isSelected && (
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-400/40 animate-pulse">
                    Opção Marcada
                  </span>
                )}
                {!isEliminated && (answerStatus === 'correct' || isRevealed) && isCorrect && (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce shrink-0" />
                )}
                {!isEliminated && answerStatus === 'wrong' && isSelected && (
                  <XCircle className="w-7 h-7 text-red-400 animate-pulse shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dissertative Answer (Revealed) */}
      {question.tipo === 'dissertativa' && (
        <div className="w-full">
          {isRevealed ? (
            <div className="p-6 rounded-2xl border-2 border-emerald-400 bg-emerald-950/70 text-emerald-100 shadow-[0_0_35px_rgba(16,185,129,0.4)] animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-5 h-5" />
                Resposta Correta Oficial:
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                "{question.respostaCorreta}"
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900/40 text-center text-gray-400">
              <span className="text-lg font-bold">
                Pergunta Dissertativa • Responda no microfone e no papel!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Biblical Text and Reference (ARA) */}
      {isRevealed && question.textoBiblico && (
        <div className="mt-2 p-6 sm:p-7 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-gray-900 to-amber-950/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-fadeIn">
          <div className="flex items-center gap-2.5 mb-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-black uppercase tracking-wider text-amber-300">
              Texto Bíblico Oficial • {question.versiculo}
            </span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl italic text-gray-200 font-serif leading-relaxed border-l-4 border-amber-400 pl-4">
            "{question.textoBiblico}"
          </p>
        </div>
      )}
    </div>
  );
};
