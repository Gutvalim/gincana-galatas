import React from 'react';
import type { Question, TeamId, TeamInfo } from '../types/game';
import { getTeam, ROUNDS_INFO, FIXED_QUESTION_POINTS } from '../types/game';
import { TeamIcon } from './TeamIcon';
import { BookOpen, CheckCircle2, XCircle, Award, Sparkles, FastForward } from 'lucide-react';

interface QuestionViewProps {
  question: Question;
  round?: number;
  isRevealed: boolean;
  showPoints?: boolean;
  drawnTeam?: TeamId | null;
  teams?: TeamInfo[];
  selectedOptionIndex?: number | null;
  answerStatus?: 'idle' | 'selected' | 'correct' | 'wrong';
  eliminatedOptionIndices?: number[];
  activeCardAnnouncement?: string | null;
  isQuestionSkipped?: boolean;
  isStealActive?: boolean;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  round,
  isRevealed,
  showPoints = true,
  drawnTeam = null,
  teams,
  selectedOptionIndex = null,
  answerStatus = 'idle',
  eliminatedOptionIndices = [],
  activeCardAnnouncement = null,
  isQuestionSkipped = false,
  isStealActive = false,
}) => {
  const letters = ['A', 'B', 'C', 'D'];
  const team = drawnTeam ? getTeam(drawnTeam, teams) : null;

  const currentRoundNum = round ?? question.rodada;
  const roundInfo = ROUNDS_INFO[currentRoundNum];
  const fullPts = roundInfo?.pointsFull ?? question.pontosCheios ?? FIXED_QUESTION_POINTS;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 select-none animate-fadeIn">
      {/* Active Team on Microphone Banner */}
      {team && !isStealActive && (
        <div
          className="flex items-center justify-between px-5 py-3 rounded-2xl border-2 shadow-sm animate-fadeIn"
          style={{
            borderColor: team.color,
            backgroundColor: `${team.color}12`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow text-white"
              style={{ backgroundColor: team.color }}
            >
              <TeamIcon icon={team.icon} className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">
                Equipe no Microfone:
              </span>
              <span className="text-base sm:text-xl font-black uppercase tracking-wide" style={{ color: team.color }}>
                {team.name}
              </span>
            </div>
          </div>
          <span
            className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow"
            style={{ backgroundColor: team.color }}
          >
            Vez de Responder
          </span>
        </div>
      )}

      {/* Active Card Announcement Banner */}
      {activeCardAnnouncement && (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-red-500 to-blue-600 text-white shadow-xl flex items-center justify-center gap-3 text-center animate-bounce">
          <Sparkles className="w-6 h-6 text-yellow-300 shrink-0" />
          <span className="text-base sm:text-xl font-black uppercase tracking-wide drop-shadow">
            {activeCardAnnouncement}
          </span>
        </div>
      )}

      {/* Question Skipped Notice */}
      {isQuestionSkipped && (
        <div className="w-full p-3.5 rounded-xl bg-orange-100 border-2 border-orange-400 text-orange-950 flex items-center justify-center gap-2 shadow-sm">
          <FastForward className="w-5 h-5 text-orange-600 shrink-0" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-center">
            Pergunta Pulada! Uma nova questão foi apresentada à equipe.
          </span>
        </div>
      )}

      {/* Category & Points Badges Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-blue-900 text-white shadow-sm">
            Pergunta #{question.id} • {question.categoria}
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 shadow-sm">
            {question.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'}
          </span>
        </div>

        {showPoints && (
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
              <Award className="w-4 h-4 text-emerald-700" />
              Valor: {fullPts} pts
            </span>
          </div>
        )}
      </div>

      {/* Main Question Card (Crisp White Card with Deep Dark Slate Typography) */}
      <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white border-2 border-slate-200 shadow-xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-snug tracking-tight text-center sm:text-left font-display">
          {question.pergunta}
        </h2>
      </div>

      {/* Options Grid (Multiple Choice) */}
      {question.tipo === 'multipla_escolha' && question.opcoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {question.opcoes.map((opcao, idx) => {
            const isCorrect = opcao.trim().toLowerCase() === question.respostaCorreta.trim().toLowerCase();
            const isSelected = selectedOptionIndex === idx;
            const isEliminated = eliminatedOptionIndices.includes(idx);
            const letter = letters[idx] || `${idx + 1}`;

            let cardStyle = 'border-slate-200 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50/40 shadow-sm';
            let letterStyle = 'bg-blue-900 text-white border-blue-900';

            if (isEliminated) {
              cardStyle =
                'border-dashed border-slate-300 bg-slate-100 text-slate-400 line-through opacity-35 pointer-events-none filter grayscale';
              letterStyle = 'bg-slate-300 text-slate-500 border-slate-300';
            } else if (isRevealed || answerStatus === 'correct') {
              if (isCorrect) {
                cardStyle =
                  'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-lg scale-[1.01] ring-2 ring-emerald-500 font-bold';
                letterStyle = 'bg-emerald-600 text-white border-emerald-600 font-black';
              } else if (isSelected && !isCorrect) {
                cardStyle =
                  'border-red-500 bg-red-50 text-red-950 shadow-lg scale-[1.01] ring-2 ring-red-500';
                letterStyle = 'bg-red-600 text-white border-red-600 font-black';
              } else {
                cardStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-40';
                letterStyle = 'bg-slate-200 text-slate-400 border-slate-200';
              }
            } else if (answerStatus === 'wrong') {
              if (isSelected) {
                cardStyle =
                  'border-red-500 bg-red-50 text-red-950 shadow-lg scale-[1.01] ring-2 ring-red-500';
                letterStyle = 'bg-red-600 text-white border-red-600 font-black';
              } else {
                cardStyle = 'border-slate-200 bg-white text-slate-800 shadow-sm';
                letterStyle = 'bg-blue-900 text-white border-blue-900';
              }
            } else if (answerStatus === 'selected' && isSelected) {
              cardStyle =
                'border-amber-500 bg-amber-50 text-amber-950 shadow-lg scale-[1.01] ring-2 ring-amber-400 animate-pulse';
              letterStyle = 'bg-amber-500 text-white border-amber-500 font-black';
            }

            return (
              <div
                key={idx}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${cardStyle}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg border-2 shadow-sm shrink-0 transition-colors ${letterStyle}`}
                >
                  {letter}
                </div>
                <span className="text-lg sm:text-xl font-bold flex-1 leading-snug">
                  {opcao}
                </span>

                {/* Status Badges / Icons */}
                {isEliminated && (
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md border border-purple-300 shrink-0">
                    50/50 Eliminada
                  </span>
                )}
                {!isEliminated && !isRevealed && answerStatus === 'selected' && isSelected && (
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full border border-amber-300 animate-pulse">
                    Opção Marcada
                  </span>
                )}
                {!isEliminated && (isRevealed || answerStatus === 'correct') && isCorrect && (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce shrink-0" />
                )}
                {!isEliminated && answerStatus === 'wrong' && isSelected && (
                  <XCircle className="w-7 h-7 text-red-600 animate-pulse shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dissertative Answer (Revealed / Evaluated) */}
      {question.tipo === 'dissertativa' && (
        <div className="w-full flex flex-col gap-3">
          {answerStatus === 'wrong' && (
            <div className="p-5 rounded-2xl border-2 border-red-500 bg-red-50 text-red-950 shadow-md flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600 animate-pulse shrink-0" />
                <div>
                  <span className="text-sm font-black uppercase tracking-wider text-red-800 block">
                    Resposta Incorreta!
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-800">
                    {team ? `${team.name} errou e não pontuou nesta questão.` : 'A equipe errou no microfone (0 pts).'}
                  </span>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-black text-sm uppercase shadow">
                0 pts
              </span>
            </div>
          )}

          {answerStatus === 'correct' && (
            <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce shrink-0" />
                <div>
                  <span className="text-sm font-black uppercase tracking-wider text-emerald-800 block">
                    Resposta Correta!
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-800">
                    {team ? `${team.name} acertou no microfone!` : 'A equipe acertou a resposta!'}
                  </span>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-sm uppercase shadow">
                +{fullPts} pts
              </span>
            </div>
          )}

          {isRevealed ? (
            <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 text-sm font-black uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {answerStatus === 'wrong' ? 'Gabarito Oficial:' : 'Resposta Correta Oficial:'}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                "{question.respostaCorreta}"
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center text-slate-500">
              <span className="text-lg font-bold">
                Pergunta Dissertativa • O líder da equipe deve se manifestar e responder ao microfone!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Biblical Text and Reference (ARA) */}
      {isRevealed && question.textoBiblico && (
        <div className="p-6 sm:p-7 rounded-2xl border-2 border-blue-200 bg-blue-50/70 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2.5 mb-2">
            <BookOpen className="w-5 h-5 text-blue-900" />
            <span className="text-sm font-black uppercase tracking-wider text-blue-900">
              Texto Bíblico Oficial • {question.versiculo} (ARA)
            </span>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl italic text-slate-800 font-serif leading-relaxed border-l-4 border-blue-900 pl-4 mt-2">
            "{question.textoBiblico}"
          </p>
        </div>
      )}
    </div>
  );
};
