import React, { useEffect, useRef, useState } from 'react';
import type { TeamId, TeamInfo } from '../types/game';
import { getTeam } from '../types/game';
import { TeamIcon } from './TeamIcon';
import { sounds } from '../services/sound';
import { CheckCircle2, Shuffle, Sparkles, Trophy } from 'lucide-react';

interface RouletteProps {
  teams: TeamId[];
  teamsList?: TeamInfo[];
  drawnOrder?: TeamId[];
  isSpinning: boolean;
  targetTeam: TeamId | null;
  drawnTeam: TeamId | null;
  spinSeed: number;
  onFinish?: (team: TeamId) => void;
  interactive?: boolean;
}

export const Roulette: React.FC<RouletteProps> = ({
  teams,
  teamsList = [],
  drawnOrder = [],
  isSpinning,
  targetTeam,
  drawnTeam,
  spinSeed,
  onFinish,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const prevSpinningRef = useRef<boolean>(false);
  const audioIntervalRef = useRef<number | null>(null);

  // Teams to display on wheel: available teams to draw
  const activeTeams = teams.length > 0 ? teams : teamsList.map((t) => t.id);
  const sliceAngle = 360 / Math.max(1, activeTeams.length);

  useEffect(() => {
    if (isSpinning && !prevSpinningRef.current && targetTeam) {
      // Calculate target angle
      const targetIndex = activeTeams.indexOf(targetTeam);
      const safeIndex = targetIndex >= 0 ? targetIndex : 0;

      // Pointer is at the top (270 degrees in canvas coords, or 0 degrees with top indicator)
      const sliceCenter = (safeIndex + 0.5) * sliceAngle;
      const extraRevs = 6 * 360;
      const wobble = ((spinSeed - 0.5) * 0.7) * (sliceAngle / 2);
      const finalAngle = extraRevs + (360 - sliceCenter) + wobble;
      setRotation(finalAngle);

      // Audio ticks
      let tickCount = 0;
      const totalTicks = 45;
      const startTime = Date.now();
      const spinDuration = 5000;

      const tickTimer = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= spinDuration) {
          if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
          return;
        }

        const progress = elapsed / spinDuration;
        sounds.playSpinTick(1 + (1 - progress) * 0.5);
        tickCount++;

        if (tickCount < totalTicks) {
          const nextInterval = 40 + Math.pow(progress, 2.5) * 280;
          audioIntervalRef.current = window.setTimeout(tickTimer, nextInterval);
        }
      };

      audioIntervalRef.current = window.setTimeout(tickTimer, 40);

      const finishTimeout = setTimeout(() => {
        if (onFinish && targetTeam) {
          onFinish(targetTeam);
        }
      }, 5200);

      return () => {
        if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
        clearTimeout(finishTimeout);
      };
    }
    prevSpinningRef.current = isSpinning;
  }, [isSpinning, targetTeam, activeTeams, sliceAngle, spinSeed, onFinish]);

  // 20 LEDs around the wheel perimeter
  const numLeds = 20;
  const leds = Array.from({ length: numLeds }, (_, i) => {
    const angle = (i * (360 / numLeds) - 90) * (Math.PI / 180);
    const x = 50 + 47.5 * Math.cos(angle);
    const y = 50 + 47.5 * Math.sin(angle);
    return { x, y, angle: i * (360 / numLeds) };
  });

  const isAllDrawn = teamsList.length > 0 && drawnOrder.length >= teamsList.length;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center select-none animate-fadeIn">
      {/* Top Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm mb-2">
          <Shuffle className="w-4 h-4 text-red-600" />
          Sorteio Oficial da Ordem das Equipes
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">
          {isAllDrawn ? 'Ordem de Jogo Definida!' : 'Quem será a próxima a jogar?'}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          {isAllDrawn
            ? 'Todas as posições foram sorteadas e a ordem oficial está confirmada.'
            : `Sorteando agora a equipe que jogará em ${drawnOrder.length + 1}º lugar`}
        </p>
      </div>

      {/* Main Grid: Roulette Wheel on Left + Order List on Right */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 sm:p-8">
        {/* LEFT COLUMN: THE WHEEL (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[420px] md:h-[420px]">
            {/* Pointer / Flapper Indicator at the top (Rich UMP Red) */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-white shadow flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              </div>
              <div
                className="w-0 h-0 -mt-1.5"
                style={{
                  borderLeft: '14px solid transparent',
                  borderRight: '14px solid transparent',
                  borderTop: '26px solid #dc2626',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                }}
              />
            </div>

            {/* Glowing Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-900/10 shadow-[0_0_30px_rgba(0,51,102,0.1)] pointer-events-none" />

            {/* Rotating SVG Wheel */}
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full drop-shadow-xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 5s cubic-bezier(0.12, 0.98, 0.22, 1)' : 'none',
              }}
            >
              <defs>
                <radialGradient id="centerBulb" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                </radialGradient>
              </defs>

              {/* Slices */}
              {activeTeams.map((teamId, idx) => {
                const a1 = (idx * sliceAngle - 90) * (Math.PI / 180);
                const a2 = ((idx + 1) * sliceAngle - 90) * (Math.PI / 180);

                const x1 = 200 + 200 * Math.cos(a1);
                const y1 = 200 + 200 * Math.sin(a1);
                const x2 = 200 + 200 * Math.cos(a2);
                const y2 = 200 + 200 * Math.sin(a2);

                const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                const pathData = `M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                const midA = ((idx + 0.5) * sliceAngle - 90) * (Math.PI / 180);
                const textX = 200 + 125 * Math.cos(midA);
                const textY = 200 + 125 * Math.sin(midA);
                const textRot = (idx + 0.5) * sliceAngle;

                const team = getTeam(teamId, teamsList);

                return (
                  <g key={teamId}>
                    <path
                      d={pathData}
                      fill={team.color}
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      className="transition-colors hover:brightness-105"
                    />
                    <path d={pathData} fill="url(#centerBulb)" stroke="none" />

                    <g transform={`rotate(${textRot}, 200, 200)`}>
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${90}, ${textX}, ${textY})`}
                        style={{
                          fontWeight: 900,
                          fontSize: activeTeams.length <= 4 ? '18px' : '15px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                          letterSpacing: '1px',
                          fontFamily: 'Poppins, Inter, sans-serif',
                          textTransform: 'uppercase',
                        }}
                      >
                        {team.name}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Outer Navy Ring */}
              <circle
                cx="200"
                cy="200"
                r="194"
                fill="none"
                stroke="#003366"
                strokeWidth="12"
              />
            </svg>

            {/* Perimeter LEDs */}
            <div className="absolute inset-0 pointer-events-none">
              {leds.map((led, i) => (
                <div
                  key={i}
                  className="absolute w-3.5 h-3.5 -ml-1.75 -mt-1.75 rounded-full border border-white/80 shadow"
                  style={{
                    left: `${led.x}%`,
                    top: `${led.y}%`,
                    backgroundColor: i % 2 === 0 ? '#fbbf24' : '#ef4444',
                    boxShadow: i % 2 === 0 ? '0 0 8px #fbbf24' : '0 0 8px #ef4444',
                  }}
                />
              ))}
            </div>

            {/* Center Logo Hub */}
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-blue-900 shadow-2xl flex items-center justify-center p-2 z-20">
              <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Sorteada Highlight Banner */}
          {drawnTeam && !isSpinning && (() => {
            const dTeam = getTeam(drawnTeam, teamsList);
            return (
              <div className="mt-5 animate-bounce">
                <div
                  className="px-6 py-2.5 rounded-2xl border-2 shadow-lg flex items-center gap-3.5"
                  style={{
                    borderColor: dTeam.color,
                    backgroundColor: `${dTeam.color}15`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow"
                    style={{ backgroundColor: dTeam.color }}
                  >
                    <TeamIcon icon={dTeam.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                      🎉 Equipe Sorteada:
                    </span>
                    <span
                      className="text-xl sm:text-2xl font-black uppercase tracking-wider"
                      style={{ color: dTeam.color }}
                    >
                      {dTeam.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT COLUMN: LATERAL LIST (ORDEM OFICIAL DE JOGADA) (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-3 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide">
                Ordem Oficial de Jogada
              </h3>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-900">
              {drawnOrder.length} de {teamsList.length} Sorteadas
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Esta lista define a sequência exata de participação em todas as rodadas:
          </p>

          <div className="flex flex-col gap-2.5 mt-1">
            {teamsList.map((_, index) => {
              const teamId = drawnOrder[index];
              const teamInfo = teamId ? getTeam(teamId, teamsList) : null;
              const isCurrentDrawn = teamId && teamId === drawnTeam;

              if (teamInfo) {
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all duration-500 shadow-sm ${
                      isCurrentDrawn
                        ? 'border-blue-600 bg-blue-50/80 scale-[1.02] shadow-md'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow">
                        #{index + 1}
                      </div>

                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: teamInfo.color }}
                      >
                        <TeamIcon icon={teamInfo.icon} className="w-5 h-5" />
                      </div>

                      <div>
                        <span className="text-sm font-black text-slate-900 block leading-tight">
                          {teamInfo.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {index === 0 ? '1ª a Jogar (Abre a Rodada)' : `${index + 1}ª Equipe`}
                        </span>
                      </div>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                );
              }

              // Slot not yet drawn
              return (
                <div
                  key={index}
                  className="p-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 flex items-center justify-between text-slate-400"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 font-black text-sm flex items-center justify-center shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">
                        {index + 1}º Lugar a Jogar
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {index === drawnOrder.length ? 'Próxima a ser sorteada...' : 'Aguardando sorteio...'}
                      </span>
                    </div>
                  </div>

                  {index === drawnOrder.length && (
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  )}
                </div>
              );
            })}
          </div>

          {isAllDrawn && (
            <div className="mt-2 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Ordem completa e salva para todas as rodadas!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
