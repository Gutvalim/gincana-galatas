import React from 'react';
import type { Question } from '../types/game';
import { BookOpen, CheckCircle2, Award } from 'lucide-react';

interface QuestionViewProps {
  question: Question;
  isRevealed: boolean;
  showPoints?: boolean;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  isRevealed,
  showPoints = true,
}) => {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Category & Points Badges Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-4 py-1.5 rounded-xl text-sm sm:text-base font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            Pergunta #{question.id} • {question.categoria}
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-gray-800 text-gray-300 border border-gray-700">
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
      <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#111827] to-[#1f2937] border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-snug tracking-tight text-center sm:text-left drop-shadow-md">
          {question.pergunta}
        </h2>
      </div>

      {/* Options Grid (Multiple Choice) */}
      {question.tipo === 'multipla_escolha' && question.opcoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.opcoes.map((opcao, idx) => {
            const isCorrect = opcao.trim().toLowerCase() === question.respostaCorreta.trim().toLowerCase();
            const letter = letters[idx] || `${idx + 1}`;

            let cardStyle = 'border-gray-800 bg-[#111827]/80 text-gray-200 hover:border-gray-700';
            let letterStyle = 'bg-gray-800 text-cyan-400 border-gray-700';

            if (isRevealed) {
              if (isCorrect) {
                cardStyle =
                  'border-emerald-400 bg-emerald-950/70 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-[1.02] ring-2 ring-emerald-400/50';
                letterStyle = 'bg-emerald-500 text-black border-emerald-400 font-black';
              } else {
                cardStyle = 'border-gray-900 bg-gray-950/50 text-gray-500 opacity-60';
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
                {isRevealed && isCorrect && (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-bounce shrink-0" />
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
