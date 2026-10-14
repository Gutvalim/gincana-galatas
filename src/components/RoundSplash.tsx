import React from 'react';
import { ROUNDS_INFO, FIXED_QUESTION_POINTS } from '../types/game';
import { Flame, Award, Clock, ArrowRight } from 'lucide-react';

interface RoundSplashProps {
  round: number;
}

export const RoundSplash: React.FC<RoundSplashProps> = ({ round }) => {
  const info = ROUNDS_INFO[round] || ROUNDS_INFO[1];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center p-8 animate-fadeIn">
      {/* Round Badge */}
      <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#006341]/40 border-2 border-emerald-400/60 text-emerald-300 font-black uppercase tracking-widest text-sm sm:text-base mb-6 shadow-[0_0_25px_rgba(0,99,65,0.5)]">
        <Flame className="w-5 h-5 text-emerald-400 animate-pulse" />
        Fase Oficial • Federação de UMPs
      </div>

      {/* Main Title */}
      <h1
        className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
        style={{
          color: info.color,
          textShadow: `0 0 40px ${info.color}60`,
        }}
      >
        {info.name}
      </h1>

      {/* Points & Timer Cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        <div className="p-6 rounded-3xl bg-[#0c231a] border-2 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)] flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 mb-2">
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400">
            Pontuação Fixa por Pergunta
          </span>
          <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono mt-1">
            {FIXED_QUESTION_POINTS} <span className="text-lg text-gray-300 font-bold">PTS</span>
          </span>
          <span className="text-xs text-gray-400 mt-1">Acertou no microfone, pontua!</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#0c231a] border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 mb-2">
            <Clock className="w-8 h-8 text-cyan-400" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400">
            Tempo para Resposta
          </span>
          <span className="text-4xl sm:text-5xl font-black text-cyan-400 font-mono mt-1">
            30 <span className="text-lg text-gray-300 font-bold">SEG</span>
          </span>
          <span className="text-xs text-gray-400 mt-1">Líder deve se levantar e responder</span>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-2 text-sm text-gray-300 animate-bounce font-medium">
        <span>Aguarde a abertura da pergunta pelo moderador</span>
        <ArrowRight className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
  );
};
