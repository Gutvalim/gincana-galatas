import React, { useEffect, useState, useRef } from 'react';
import type { ActionCardType, TeamId } from '../types/game';
import { TEAMS } from '../types/game';
import { BookOpen, Sparkles, FastForward, Zap, Flame } from 'lucide-react';

interface ActionCardActivationOverlayProps {
  cardType: ActionCardType | null;
  team: TeamId | null;
  timestamp?: number;
  onDismiss?: () => void;
  duration?: number;
}

export const ActionCardActivationOverlay: React.FC<ActionCardActivationOverlayProps> = ({
  cardType,
  team,
  timestamp,
  onDismiss,
  duration = 2700,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const playedTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (cardType && team && timestamp) {
      // Only play animation if this specific timestamp hasn't played yet
      if (timestamp !== playedTimestampRef.current) {
        playedTimestampRef.current = timestamp;
        setVisible(true);
        const timer = setTimeout(() => {
          setVisible(false);
          if (onDismiss) onDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [cardType, team, timestamp, duration, onDismiss]);

  if (!visible || !cardType || !team) return null;

  const teamInfo = TEAMS[team];

  return (
    <div
      onClick={() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer select-none"
    >
      {/* ========================================================
          1. CONSULTA BÍBLICA (+30s)
          ======================================================== */}
      {cardType === 'bible' && (
        <div className="relative flex flex-col items-center text-center max-w-2xl w-full">
          {/* Rotating Heavenly Golden Rays */}
          <div className="absolute -inset-40 pointer-events-none flex items-center justify-center overflow-hidden">
            <div
              className="w-[700px] h-[700px] rounded-full animate-rotateRays opacity-40"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(251,191,36,0.4) 0deg, transparent 20deg, rgba(251,191,36,0.3) 40deg, transparent 60deg, rgba(251,191,36,0.4) 80deg, transparent 100deg, rgba(251,191,36,0.3) 120deg, transparent 140deg, rgba(251,191,36,0.4) 160deg, transparent 180deg, rgba(251,191,36,0.3) 200deg, transparent 220deg, rgba(251,191,36,0.4) 240deg, transparent 260deg, rgba(251,191,36,0.3) 280deg, transparent 300deg, rgba(251,191,36,0.4) 320deg, transparent 340deg, rgba(251,191,36,0.4) 360deg)',
              }}
            />
          </div>

          {/* Central Holy Aura */}
          <div className="absolute w-80 h-80 rounded-full bg-amber-400/25 blur-3xl animate-pulse pointer-events-none" />

          {/* Card Frame */}
          <div className="relative z-10 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0c2e1f] via-[#071d13] to-black border-4 border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.8)] flex flex-col items-center gap-5 transform scale-105 animate-actionCardPopIn">
            {/* Top Team Pill */}
            <div
              className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border-2 text-xs sm:text-sm font-black uppercase tracking-widest shadow-lg"
              style={{
                borderColor: teamInfo.color,
                backgroundColor: `${teamInfo.color}30`,
                color: teamInfo.color,
              }}
            >
              {teamInfo.logo && (
                <img src={teamInfo.logo} alt={teamInfo.name} className="w-5 h-5 object-contain" />
              )}
              {teamInfo.name} acionou um Power-Up!
            </div>

            {/* Holy Bible Icon & Rays */}
            <div className="relative my-2">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-1 flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.9)] border-4 border-white animate-bounce">
                <div className="w-full h-full rounded-2xl bg-[#06140e] flex items-center justify-center">
                  <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-amber-300 stroke-[2.5]" />
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-200 absolute -top-3 -right-3 animate-pulse" />
              <Sparkles className="w-6 h-6 text-amber-300 absolute -bottom-2 -left-2 animate-pulse" />
            </div>

            {/* Headings */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-4 py-1 rounded-full border border-amber-400/40">
                📖 Ajuda das Escrituras
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] mt-2">
                Consulta Bíblica!
              </h2>
              <p className="text-xl sm:text-3xl font-black text-amber-400 font-mono mt-1 drop-shadow">
                +30 SEGUNDOS NA BÍBLIA
              </p>
            </div>

            <p className="text-sm sm:text-base text-gray-200 max-w-md font-medium text-center leading-snug">
              A equipe abriu o texto sagrado. O cronômetro foi ajustado para 30 segundos de pesquisa!
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          2. CARTA 50/50 (Elimina 2 Alternativas)
          ======================================================== */}
      {cardType === 'fiftyFifty' && (
        <div className="relative flex flex-col items-center text-center max-w-2xl w-full">
          {/* Laser Slash Effect Across Screen */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[800px] h-3 bg-gradient-to-r from-transparent via-purple-300 to-transparent animate-laserSlash shadow-[0_0_40px_#a855f7]" />
          </div>

          {/* Electric Purple Ambient Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-purple-600/30 blur-3xl animate-pulse pointer-events-none" />

          {/* Card Frame */}
          <div className="relative z-10 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#240d3a] via-[#150724] to-black border-4 border-purple-400 shadow-[0_0_80px_rgba(168,85,247,0.8)] flex flex-col items-center gap-5 transform scale-105 animate-actionCardPopIn">
            {/* Top Team Pill */}
            <div
              className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border-2 text-xs sm:text-sm font-black uppercase tracking-widest shadow-lg"
              style={{
                borderColor: teamInfo.color,
                backgroundColor: `${teamInfo.color}30`,
                color: teamInfo.color,
              }}
            >
              {teamInfo.logo && (
                <img src={teamInfo.logo} alt={teamInfo.name} className="w-5 h-5 object-contain" />
              )}
              {teamInfo.name} acionou um Power-Up!
            </div>

            {/* 50/50 Icon & Electric Rings */}
            <div className="relative my-2">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-600 p-1 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.9)] border-4 border-white animate-pulse">
                <div className="w-full h-full rounded-2xl bg-[#11051c] flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-300 via-white to-pink-300 font-mono tracking-tighter">
                    50:50
                  </span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-yellow-300 absolute -top-3 -right-3 animate-bounce" />
              <Zap className="w-6 h-6 text-purple-300 absolute -bottom-2 -left-2 animate-bounce" />
            </div>

            {/* Headings */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-4 py-1 rounded-full border border-purple-400/40">
                ⚡ Desintegração de Erros
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] mt-2">
                Poder 50 / 50!
              </h2>
              <p className="text-xl sm:text-3xl font-black text-purple-300 font-mono mt-1 drop-shadow">
                2 ALTERNATIVAS ELIMINADAS
              </p>
            </div>

            <p className="text-sm sm:text-base text-gray-200 max-w-md font-medium text-center leading-snug">
              Duas respostas incorretas foram riscadas no telão. Restam apenas 2 opções para a resposta!
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          3. CARTA PULAR (Passa vez / 30s Papel ou Kids)
          ======================================================== */}
      {cardType === 'skip' && (
        <div className="relative flex flex-col items-center text-center max-w-2xl w-full">
          {/* Turbo Speed Vortex */}
          <div className="absolute -inset-20 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[600px] h-[600px] rounded-full border-4 border-dashed border-orange-500/50 animate-turboSpin opacity-40" />
            <div className="w-[450px] h-[450px] rounded-full border-2 border-amber-400/40 animate-turboSpin opacity-50" />
          </div>

          {/* Orange Speed Ambient Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-orange-600/30 blur-3xl animate-pulse pointer-events-none" />

          {/* Card Frame */}
          <div className="relative z-10 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#3a1508] via-[#210903] to-black border-4 border-orange-400 shadow-[0_0_80px_rgba(249,115,22,0.8)] flex flex-col items-center gap-5 transform scale-105 animate-actionCardPopIn">
            {/* Top Team Pill */}
            <div
              className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border-2 text-xs sm:text-sm font-black uppercase tracking-widest shadow-lg"
              style={{
                borderColor: teamInfo.color,
                backgroundColor: `${teamInfo.color}30`,
                color: teamInfo.color,
              }}
            >
              {teamInfo.logo && (
                <img src={teamInfo.logo} alt={teamInfo.name} className="w-5 h-5 object-contain" />
              )}
              {teamInfo.name} acionou a Carta Pular!
            </div>

            {/* Skip / Runner Icon */}
            <div className="relative my-2">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 p-1 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.9)] border-4 border-white animate-bounce">
                <div className="w-full h-full rounded-2xl bg-[#160702] flex items-center justify-center">
                  <FastForward className="w-16 h-16 sm:w-20 sm:h-20 text-orange-400 stroke-[2.5]" />
                </div>
              </div>
              <Flame className="w-8 h-8 text-amber-300 absolute -top-3 -right-3 animate-pulse" />
              <Flame className="w-6 h-6 text-red-400 absolute -bottom-2 -left-2 animate-pulse" />
            </div>

            {/* Headings */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-orange-300 bg-orange-500/20 px-4 py-1 rounded-full border border-orange-400/40">
                🏃‍♂️ Troca de Pergunta
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] mt-2">
                Pergunta Pulada!
              </h2>
              <p className="text-xl sm:text-2xl font-black text-orange-300 font-mono mt-1 drop-shadow">
                {team === 'UCP'
                  ? 'NOVA CARTA KIDS DISPONÍVEL'
                  : '30s PARA RESPOSTA NO PAPEL'}
              </p>
            </div>

            <p className="text-sm sm:text-base text-gray-200 max-w-md font-medium text-center leading-snug">
              {team === 'UCP'
                ? 'As crianças recebem uma nova escolha de envelope na mesa para responder à Pergunta Kids Reserva!'
                : 'As equipes rivais têm 30 segundos no cronômetro para escrever a resposta no papel e disputar metade dos pontos!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
