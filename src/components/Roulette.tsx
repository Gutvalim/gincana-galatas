import React, { useEffect, useRef, useState } from 'react';
import type { TeamId } from '../types/game';
import { TEAMS } from '../types/game';
import { sounds } from '../services/sound';

interface RouletteProps {
  teams: TeamId[];
  isSpinning: boolean;
  targetTeam: TeamId | null;
  drawnTeam: TeamId | null;
  spinSeed: number;
  onFinish?: (team: TeamId) => void;
  interactive?: boolean;
}

export const Roulette: React.FC<RouletteProps> = ({
  teams,
  isSpinning,
  targetTeam,
  drawnTeam,
  spinSeed,
  onFinish,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const prevSpinningRef = useRef<boolean>(false);
  const audioIntervalRef = useRef<number | null>(null);

  // Teams to display on wheel (fallback to all teams if current round is empty)
  const activeTeams = teams.length > 0 ? teams : (['UCP', 'UPA', 'UMP', 'Casais', 'Adultos'] as TeamId[]);
  const sliceAngle = 360 / activeTeams.length;

  useEffect(() => {
    if (isSpinning && !prevSpinningRef.current && targetTeam) {
      // Calculate target angle
      const targetIndex = activeTeams.indexOf(targetTeam);
      const safeIndex = targetIndex >= 0 ? targetIndex : 0;

      // Pointer is at the top (270 degrees in canvas coords, or 0 degrees with top indicator)
      // Each slice i spans [i * sliceAngle, (i + 1) * sliceAngle]
      // Center of slice i is (i + 0.5) * sliceAngle
      const sliceCenter = (safeIndex + 0.5) * sliceAngle;
      
      // We want sliceCenter to end up at top (which corresponds to 270 deg or 0 deg offset)
      // Spin at least 5 to 8 full revolutions (1800 to 2880 deg) + offset
      const extraRevs = 6 * 360;
      // Slight random wobble within the slice (up to +/- 35% of slice half-width)
      const wobble = ((spinSeed - 0.5) * 0.7) * (sliceAngle / 2);
      
      // Final target angle
      const finalAngle = extraRevs + (360 - sliceCenter) + wobble;
      setRotation(finalAngle);

      // Play tick audio effects during deceleration
      let tickCount = 0;
      const totalTicks = 45;
      const startTime = Date.now();
      const spinDuration = 5000; // 5 seconds

      const tickTimer = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= spinDuration) {
          if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
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

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Outer Glowing Container */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center">
        {/* Outer IPB Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#006341]/30 via-amber-500/20 to-emerald-500/25 blur-2xl animate-pulse" />

        {/* Pointer / Needle at Top */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.8)]">
          <div className="w-8 h-10 bg-gradient-to-b from-red-500 to-amber-500 clip-triangle shadow-lg transform rotate-180"
               style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <div className="w-4 h-4 rounded-full bg-white border-2 border-red-500 -mt-2 shadow" />
        </div>

        {/* Wheel SVG */}
        <div
          className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_50px_rgba(0,99,65,0.6)] overflow-hidden transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '5000ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.2, 1)',
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <filter id="inner-shadow">
                <feOffset dx="0" dy="0" />
                <feGaussianBlur stdDeviation="6" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood floodColor="black" floodOpacity="0.4" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
              </filter>
            </defs>

            {activeTeams.map((teamId, idx) => {
              const startA = (idx * sliceAngle - 90) * (Math.PI / 180);
              const endA = ((idx + 1) * sliceAngle - 90) * (Math.PI / 180);

              const x1 = 200 + 200 * Math.cos(startA);
              const y1 = 200 + 200 * Math.sin(startA);
              const x2 = 200 + 200 * Math.cos(endA);
              const y2 = 200 + 200 * Math.sin(endA);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const pathData = `M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              // Mid angle for text
              const midA = ((idx + 0.5) * sliceAngle - 90) * (Math.PI / 180);
              const textX = 200 + 130 * Math.cos(midA);
              const textY = 200 + 130 * Math.sin(midA);
              const textRot = (idx + 0.5) * sliceAngle;

              const team = TEAMS[teamId];

              return (
                <g key={teamId}>
                  <path
                    d={pathData}
                    fill={team.color}
                    stroke="#111827"
                    strokeWidth="3"
                    className="transition-colors hover:brightness-110"
                  />
                  {/* Team Label */}
                  <text
                    x={textX}
                    y={textY}
                    fill="#ffffff"
                    fontSize="22"
                    fontWeight="800"
                    fontFamily="Poppins, Inter, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textRot + 90}, ${textX}, ${textY})`}
                    style={{
                      textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                      letterSpacing: '1px',
                    }}
                  >
                    {team.name}
                  </text>
                </g>
              );
            })}

            {/* Center Cap */}
            <circle cx="200" cy="200" r="42" fill="#06140e" stroke="#f59e0b" strokeWidth="4" />
            <circle cx="200" cy="200" r="32" fill="#006341" />
            <text
              x="200"
              y="200"
              fill="#fbbf24"
              fontSize="16"
              fontWeight="900"
              textAnchor="middle"
              dominantBaseline="central"
            >
              IPBNB
            </text>
          </svg>
        </div>
      </div>

      {/* Selected Team Highlight Banner */}
      {drawnTeam && !isSpinning && (
        <div className="mt-8 animate-bounce">
          <div
            className="px-8 py-3 rounded-2xl border-2 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center gap-3"
            style={{
              borderColor: TEAMS[drawnTeam].color,
              backgroundColor: `${TEAMS[drawnTeam].color}25`,
            }}
          >
            <span className="text-xl text-gray-300 font-semibold uppercase tracking-wider">
              Equipe Sorteada:
            </span>
            <span
              className="text-3xl sm:text-4xl font-black uppercase tracking-widest drop-shadow-md"
              style={{ color: TEAMS[drawnTeam].color }}
            >
              {TEAMS[drawnTeam].name}
            </span>
          </div>
        </div>
      )}

      {/* Remaining Teams Counter */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 font-medium">
        <span>Equipes nesta rodada:</span>
        <div className="flex gap-1.5">
          {activeTeams.map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow"
              style={{ backgroundColor: TEAMS[t].color }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
