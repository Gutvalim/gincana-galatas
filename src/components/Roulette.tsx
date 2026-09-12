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

  // 20 LEDs around the wheel perimeter
  const numLeds = 20;
  const leds = Array.from({ length: numLeds }, (_, i) => {
    const angle = (i * (360 / numLeds) - 90) * (Math.PI / 180);
    const x = 50 + 47.5 * Math.cos(angle);
    const y = 50 + 47.5 * Math.sin(angle);
    return { x, y, id: i };
  });

  return (
    <div className="flex flex-col items-center justify-center p-2 relative">
      {/* Outer Chassis with Gold Ring & Chasing Lights */}
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-[390px] md:h-[390px] flex items-center justify-center select-none">
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
                        ? 'bg-amber-300 shadow-[0_0_10px_#fde047] animate-bulbPulse'
                        : 'bg-emerald-300 shadow-[0_0_10px_#6ee7b7] animate-bulbPulse [animation-delay:0.5s]'
                      : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                  }`}
                  style={{
                    left: `${led.x}%`,
                    top: `${led.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Pointer / Needle at Top with Jewel & Gold Finish (Always pointing straight down into wheel) */}
        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] pointer-events-none">
          {/* Top Gold Stud */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 border-2 border-amber-200 shadow-md flex items-center justify-center -mb-2 z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white shadow" />
          </div>
          {/* Needle Arrowhead - Points straight down into the wheel */}
          <div
            className="w-7 h-10 sm:w-8 sm:h-12 bg-gradient-to-b from-amber-300 via-amber-500 to-red-600 shadow-xl"
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
            }}
          />
        </div>

        {/* Main Spinning Wheel SVG */}
        <div
          className="relative z-10 w-[78%] h-[78%] rounded-full overflow-hidden shadow-[inset_0_0_25px_rgba(0,0,0,0.8),0_0_20px_rgba(0,0,0,0.6)] border-4 border-amber-400"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '5000ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.2, 1)',
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <linearGradient id="goldRimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="centerBulb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
              </radialGradient>
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
              const textX = 200 + 125 * Math.cos(midA);
              const textY = 200 + 125 * Math.sin(midA);
              const textRot = (idx + 0.5) * sliceAngle;

              const team = TEAMS[teamId];

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
                    fontSize="21"
                    fontWeight="900"
                    fontFamily="Poppins, Inter, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textRot + 90}, ${textX}, ${textY})`}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                      letterSpacing: '1px',
                    }}
                  >
                    {team.name}
                  </text>
                </g>
              );
            })}

            {/* Center Cap Medallion with Gold Bevel and IPB Logo */}
            <circle cx="200" cy="200" r="48" fill="url(#goldRimGradient)" stroke="#fef08a" strokeWidth="3" />
            <circle cx="200" cy="200" r="42" fill="#06140e" stroke="#78350f" strokeWidth="2" />
            <clipPath id="centerLogoClip">
              <circle cx="200" cy="200" r="37" />
            </clipPath>
            <circle cx="200" cy="200" r="38" fill="#ffffff" />
            <image
              href="/logo.png"
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

      {/* Selected Team Highlight Banner with Glow and Animation */}
      {drawnTeam && !isSpinning && (
        <div className="mt-5 animate-bounce">
          <div
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl border-2 shadow-[0_0_40px_rgba(251,191,36,0.7)] flex items-center gap-4"
            style={{
              borderColor: TEAMS[drawnTeam].color,
              backgroundColor: `${TEAMS[drawnTeam].color}25`,
            }}
          >
            {TEAMS[drawnTeam].logo && (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/95 border border-white/60 p-1 flex items-center justify-center shrink-0 shadow-md">
                <img src={TEAMS[drawnTeam].logo} alt={TEAMS[drawnTeam].name} className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <span className="text-[11px] sm:text-xs text-gray-300 font-semibold uppercase tracking-wider block">
                🎉 Equipe Sorteada:
              </span>
              <span
                className="text-2xl sm:text-3xl font-black uppercase tracking-widest drop-shadow-md"
                style={{ color: TEAMS[drawnTeam].color }}
              >
                {TEAMS[drawnTeam].name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Remaining Teams Counter (Compact for 4:3) */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 font-medium">
        <span>Restam jogar:</span>
        <div className="flex gap-1.5 flex-wrap justify-center">
          {activeTeams.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow"
              style={{ backgroundColor: TEAMS[t].color }}
            >
              {TEAMS[t].logo && (
                <img src={TEAMS[t].logo} alt={t} className="w-3.5 h-3.5 object-contain" />
              )}
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
