import React from 'react';
import { ROUNDS_INFO, FIXED_QUESTION_POINTS } from '../types/game';
import { Award, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface RoundSplashProps {
  round: number;
}

export const RoundSplash: React.FC<RoundSplashProps> = ({ round }) => {
  const info = ROUNDS_INFO[round] || ROUNDS_INFO[1];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center p-8 select-none animate-fadeIn">
      {/* Round Badge */}
      <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-100 border-2 border-blue-200 text-blue-900 font-black uppercase tracking-widest text-sm sm:text-base mb-6 shadow-sm">
        <BookOpen className="w-5 h-5 text-red-600" />
        Fase Oficial • Federação de UMPs
      </div>

      {/* Main Title */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-slate-900 font-display">
        {info.name}
      </h1>

      {/* Points & Timer Cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xl flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 mb-2">
            <Award className="w-8 h-8 text-emerald-700" />
          </div>
          <span className="text-xs uppercase font-black tracking-widest text-slate-500">
            Pontuação Fixa por Pergunta
          </span>
          <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono mt-1">
            {FIXED_QUESTION_POINTS} <span className="text-lg text-emerald-700 font-bold">PTS</span>
          </span>
          <span className="text-xs text-slate-500 mt-1 font-medium">Acertou no microfone, pontua!</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xl flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-blue-100 text-blue-900 mb-2">
            <Clock className="w-8 h-8 text-blue-800" />
          </div>
          <span className="text-xs uppercase font-black tracking-widest text-slate-500">
            Tempo para Resposta
          </span>
          <span className="text-4xl sm:text-5xl font-black text-blue-900 font-mono mt-1">
            30 <span className="text-lg text-slate-600 font-bold">SEG</span>
          </span>
          <span className="text-xs text-slate-500 mt-1 font-medium">Líder deve se levantar e responder</span>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-2 text-sm text-slate-600 animate-bounce font-bold">
        <span>Aguarde a abertura da pergunta pelo moderador</span>
        <ArrowRight className="w-4 h-4 text-blue-900" />
      </div>
    </div>
  );
};
