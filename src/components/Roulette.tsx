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
  const rotationRef = useRef<number>(0);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const audioIntervalRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);
  const lastSpinSeedRef = useRef<number | null>(null);

  // Teams to display on wheel: available teams to draw
  const activeTeams = React.useMemo(
    () => (teams.length > 0 ? teams : teamsList.map((t) => t.id)),
    [teams, teamsList]
  );
  const sliceAngle = 360 / Math.max(1, activeTeams.length);

  // Reset rotation when drawnOrder is reset
  useEffect(() => {
    if (!drawnOrder || drawnOrder.length === 0) {
      rotationRef.current = 0;
      setRotation(0);
      lastSpinSeedRef.current = null;
    }
  }, [drawnOrder]);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
    };
  }, []);

  // Cancel timers if isSpinning becomes false
  useEffect(() => {
    if (!isSpinning) {
      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
        finishTimeoutRef.current = null;
      }
      if (audioIntervalRef.current) {
        clearTimeout(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }
  }, [isSpinning]);

  useEffect(() => {
    if (isSpinning && targetTeam && lastSpinSeedRef.current !== spinSeed) {
      lastSpinSeedRef.current = spinSeed;

      // Calculate target angle
      const targetIndex = activeTeams.indexOf(targetTeam);
      const safeIndex = targetIndex >= 0 ? targetIndex : 0;

      // Pointer is at the top (12 o'clock, 0 degrees with top indicator)
      const sliceCenter = (safeIndex + 0.5) * sliceAngle;
      const wobble = ((spinSeed - 0.5) * 0.7) * (sliceAngle / 2);

      // Desired angle where sliceCenter is aligned with the top pointer
      const targetBaseAngle = ((360 - sliceCenter + wobble) % 360 + 360) % 360;

      // Current normalized angle of the wheel
      const currentRotation = rotationRef.current;
      const currentNormalized = ((currentRotation % 360) + 360) % 360;

      // Forward delta to reach targetBaseAngle
      let forwardDelta = (targetBaseAngle - currentNormalized) % 360;
      if (forwardDelta <= 0) {
        forwardDelta += 360;
      }

      // Add 6 full revolutions (2160 deg) for a dramatic spin animation
      const extraRevs = 6 * 360;
      const finalAngle = currentRotation + extraRevs + forwardDelta;

      rotationRef.current = finalAngle;
      setRotation(finalAngle);

      // Play tick audio effects during deceleration
      if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
      let tickCount = 0;
      const totalTicks = 45;
      const startTime = Date.now();
      const spinDuration = 5000;

      const tickTimer = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= spinDuration) {
          if (audioIntervalRef.current) {
            clearTimeout(audioIntervalRef.current);
            audioIntervalRef.current = null;
          }
          return;
        }

        // Decelerating interval: ticks become farther apart
        const progress = elapsed / spinDuration;
        sounds.playSpinTick(1 + (1 - progress) * 0.5);
        tickCount++;

        if (tickCount < totalTicks) {
          const nextInterval = 40 + Math.pow(progress, 2.5) * 280;
          audioIntervalRef.current = window.setTimeout(tickTimer, nextInterval);
        }
      };

      audioIntervalRef.current = window.setTimeout(tickTimer, 40);

      // Finish callback after transition ends (5.2 seconds)
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = window.setTimeout(() => {
        finishTimeoutRef.current = null;
        if (onFinishRef.current && targetTeam) {
          onFinishRef.current(targetTeam);
        }
      }, 5200);
    }
  }, [isSpinning, targetTeam, activeTeams, sliceAngle, spinSeed]);

  // 20 LEDs around the wheel perimeter
  const numLeds = 20;
  const leds = Array.from({ length: numLeds }, (_, i) => {
    const angle = (i * (360 / numLeds) - 90) * (Math.PI / 180);
    const x = 50 + 47.5 * Math.cos(angle);
    const y = 50 + 47.5 * Math.sin(angle);
    return { x, y, id: i };
  });

  const isAllDrawn = teamsList.length > 0 && drawnOrder.length >= teamsList.length;
  const isTeamActuallyDrawn = Boolean(
    drawnTeam &&
      !isSpinning &&
      drawnOrder &&
      drawnOrder.length > 0 &&
      drawnOrder[drawnOrder.length - 1] === drawnTeam
  );

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
        {/* LEFT COLUMN: THE CASINO WHEEL (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          {/* Outer Chassis with Gold Ring & Chasing Lights */}
          <div className="relative w-72 h-72 sm:w-[350px] sm:h-[350px] md:w-[410px] md:h-[410px] flex items-center justify-center select-none">
            {/* Outer Halo Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#006341]/40 via-amber-500/30 to-emerald-500/35 blur-3xl animate-pulse pointer-events-none" />

            {/* Casino Gold Metallic Outer Bezel */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#78350f] p-3.5 sm:p-4 shadow-[0_0_60px_rgba(245,158,11,0.5),inset_0_2px_8px_rgba(255,255,255,0.4)] border-4 border-amber-300">
              {/* Circular Track */}
              <div className="w-full h-full rounded-full bg-[#05140d] border-2 border-amber-600/60 shadow-inner relative flex items-center justify-center">
                {/* Chasing Perimeter LED Bulbs */}
                {leds.map((led, idx) => {
                  const isAlternate = idx % 2 === 0;
                  return (
                    <div
                      key={led.id}
                      className={`absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-amber-200 transition-all ${
                        isSpinning
                          ? isAlternate
                            ? 'bg-amber-300 shadow-[0_0_12px_#fde047]'
                            : 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                          : 'bg-amber-400/80 shadow-[0_0_6px_#f59e0b]'
                      }`}
                      style={{
                        left: `${led.x}%`,
                        top: `${led.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  );
                })}

                {/* Triangular Gold Flapper Needle with 3D Ruby Gem pointing down */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center">
                  <svg width="44" height="42" viewBox="0 0 44 42" className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                    <polygon points="22,38 6,6 38,6" fill="url(#goldPointerGradient)" stroke="#fef08a" strokeWidth="2.5" />
                    <circle cx="22" cy="14" r="6" fill="url(#rubyGem)" stroke="#fca5a5" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Rotating SVG Wheel */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 5s cubic-bezier(0.12, 0.98, 0.22, 1)' : 'none',
                  }}
                >
                  <defs>
                    {/* Gold Pointer Gradient */}
                    <linearGradient id="goldPointerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="35%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>

                    {/* Ruby Gem Gradient */}
                    <radialGradient id="rubyGem" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#fecaca" />
                      <stop offset="25%" stopColor="#ef4444" />
                      <stop offset="70%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#450a0a" />
                    </radialGradient>

                    {/* Metallic Gold Rim Gradient */}
                    <linearGradient id="goldRimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="25%" stopColor="#d97706" />
                      <stop offset="50%" stopColor="#fef3c7" />
                      <stop offset="75%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>

                    {/* Center Bulb Radial Lighting */}
                    <radialGradient id="centerBulb" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
                    </radialGradient>
                  </defs>

                  {/* Wheel Outer Gold Rim Ring */}
                  <circle cx="200" cy="200" r="198" fill="url(#goldRimGradient)" stroke="#fef08a" strokeWidth="2" />
                  <circle cx="200" cy="200" r="192" fill="#040d08" stroke="#78350f" strokeWidth="1.5" />

                  {/* Gold studs around rim */}
                  {Array.from({ length: 24 }).map((_, i) => {
                    const a = (i * 15) * (Math.PI / 180);
                    const sx = 200 + 195 * Math.cos(a);
                    const sy = 200 + 195 * Math.sin(a);
                    return <circle key={i} cx={sx} cy={sy} r="3" fill="#fef08a" stroke="#78350f" strokeWidth="1" />;
                  })}

                  {/* Slices */}
                  {activeTeams.map((teamId, idx) => {
                    const startA = (idx * sliceAngle - 90) * (Math.PI / 180);
                    const endA = ((idx + 1) * sliceAngle - 90) * (Math.PI / 180);

                    const x1 = 200 + 191 * Math.cos(startA);
                    const y1 = 200 + 191 * Math.sin(startA);
                    const x2 = 200 + 191 * Math.cos(endA);
                    const y2 = 200 + 191 * Math.sin(endA);

                    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                    const pathData = `M 200 200 L ${x1} ${y1} A 191 191 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    const midA = ((idx + 0.5) * sliceAngle - 90) * (Math.PI / 180);
                    const textX = 200 + 122 * Math.cos(midA);
                    const textY = 200 + 122 * Math.sin(midA);
                    const textRot = (idx + 0.5) * sliceAngle;

                    const team = getTeam(teamId, teamsList);

                    return (
                      <g key={teamId}>
                        {/* Slice Wedge */}
                        <path
                          d={pathData}
                          fill={team.color}
                          stroke="#f59e0b"
                          strokeWidth="3.5"
                          className="transition-colors hover:brightness-110"
                        />
                        {/* Slice Shading Overlay */}
                        <path
                          d={pathData}
                          fill="url(#centerBulb)"
                          stroke="none"
                          pointerEvents="none"
                        />
                        {/* Team Label */}
                        <text
                          x={textX}
                          y={textY}
                          fill="#ffffff"
                          fontSize={
                            activeTeams.length <= 4
                              ? "20"
                              : activeTeams.length <= 6
                              ? "15"
                              : team.name.length > 16
                              ? "10"
                              : team.name.length > 10
                              ? "12"
                              : "13"
                          }
                          fontWeight="900"
                          fontFamily="Poppins, Inter, sans-serif"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textRot + 90}, ${textX}, ${textY})`}
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                            letterSpacing: activeTeams.length > 6 ? '0.5px' : '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {team.name}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center Cap Medallion with Gold Bevel and Logo */}
                  <circle cx="200" cy="200" r="48" fill="url(#goldRimGradient)" stroke="#fef08a" strokeWidth="3" />
                  <circle cx="200" cy="200" r="42" fill="#06140e" stroke="#78350f" strokeWidth="2" />
                  <clipPath id="centerLogoClip">
                    <circle cx="200" cy="200" r="37" />
                  </clipPath>
                  <circle cx="200" cy="200" r="38" fill="#ffffff" />
                  <image
                    href="/logo_ump.webp"
                    x="163"
                    y="163"
                    width="74"
                    height="74"
                    clipPath="url(#centerLogoClip)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Selected Team Highlight Banner with Glow and Animation */}
          {isTeamActuallyDrawn && drawnTeam && (() => {
            const dTeam = getTeam(drawnTeam, teamsList);
            return (
              <div className="mt-5 animate-bounce">
                <div
                  className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl border-2 shadow-[0_0_40px_rgba(251,191,36,0.6)] flex items-center gap-4 bg-white"
                  style={{
                    borderColor: dTeam.color,
                  }}
                >
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                    style={{ backgroundColor: dTeam.color }}
                  >
                    <TeamIcon icon={dTeam.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block">
                      🎉 Equipe Sorteada:
                    </span>
                    <span
                      className="text-2xl sm:text-3xl font-black uppercase tracking-widest drop-shadow-sm"
                      style={{ color: dTeam.color }}
                    >
                      {dTeam.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Remaining Teams Counter */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span>Restam sortear:</span>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {activeTeams.map((t) => {
                const tInfo = getTeam(t, teamsList);
                return (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow"
                    style={{ backgroundColor: tInfo.color }}
                  >
                    <TeamIcon icon={tInfo.icon} className="w-3.5 h-3.5" />
                    {tInfo.name}
                  </span>
                );
              })}
            </div>
          </div>
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
