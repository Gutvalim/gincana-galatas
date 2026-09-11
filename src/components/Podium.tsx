import React, { useEffect } from 'react';
import type { TeamId } from '../types/game';
import { TEAMS, ALL_TEAM_IDS } from '../types/game';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, Medal } from 'lucide-react';

interface PodiumProps {
  scores: Record<TeamId, number>;
}

export const Podium: React.FC<PodiumProps> = ({ scores }) => {
  // Sort teams
  const sorted = [...ALL_TEAM_IDS].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const winner = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // Shoot confetti repeatedly
  useEffect(() => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#06b6d4', '#10b981', '#a855f7'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#06b6d4', '#10b981', '#a855f7'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-6 px-4">
      {/* Title & Celebration Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold uppercase tracking-widest text-sm mb-4 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Grande Final • Gincana de Gálatas
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 uppercase tracking-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.6)]">
          Equipe Campeã!
        </h1>

        {/* Winner Spotlight Card */}
        <div className="mt-6 flex flex-col items-center animate-bounce">
          <Crown className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)] -mb-3 z-10" />
          <div
            className="px-8 sm:px-12 py-5 rounded-3xl border-4 shadow-[0_0_50px_rgba(251,191,36,0.5)] flex flex-col items-center"
            style={{
              borderColor: TEAMS[winner].color,
              backgroundColor: `${TEAMS[winner].color}20`,
            }}
          >
            {TEAMS[winner].logo && (
              <img src={TEAMS[winner].logo} alt={TEAMS[winner].name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2 drop-shadow-lg" />
            )}
            <span
              className="text-4xl sm:text-6xl font-black tracking-widest uppercase"
              style={{ color: TEAMS[winner].color }}
            >
              {TEAMS[winner].name}
            </span>
            <span className="text-base sm:text-lg text-gray-300 font-semibold mt-1">
              {TEAMS[winner].fullName}
            </span>
            <span className="mt-2 text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
              {scores[winner] || 0} PONTOS
            </span>
          </div>
        </div>
      </div>

      {/* 3D-Style Podium Columns (2nd, 1st, 3rd) */}
      <div className="w-full max-w-3xl grid grid-cols-3 items-end gap-3 sm:gap-6 pt-6">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <Medal className="w-8 h-8 text-slate-300" />
              {TEAMS[second].logo && (
                <img src={TEAMS[second].logo} alt={TEAMS[second].name} className="w-8 h-8 object-contain my-1" />
              )}
              <span
                className="font-black text-xl sm:text-2xl uppercase mt-1"
                style={{ color: TEAMS[second].color }}
              >
                {TEAMS[second].name}
              </span>
              <span className="font-bold text-sm text-slate-300 font-mono">
                {scores[second] || 0} pts
              </span>
            </div>
            <div className="w-full h-40 sm:h-52 bg-gradient-to-t from-slate-900 to-slate-700/80 border-2 border-slate-400/50 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-xl">
              <span className="text-3xl sm:text-4xl font-black text-slate-300">
                2º
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">
                Lugar
              </span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {winner && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
              {TEAMS[winner].logo && (
                <img src={TEAMS[winner].logo} alt={TEAMS[winner].name} className="w-10 h-10 object-contain my-1" />
              )}
              <span
                className="font-black text-2xl sm:text-3xl uppercase mt-1"
                style={{ color: TEAMS[winner].color }}
              >
                {TEAMS[winner].name}
              </span>
              <span className="font-black text-base sm:text-lg text-yellow-300 font-mono">
                {scores[winner] || 0} pts
              </span>
            </div>
            <div className="w-full h-56 sm:h-72 bg-gradient-to-t from-amber-950 to-amber-600/80 border-2 border-amber-400 rounded-t-2xl flex flex-col items-center justify-start pt-6 shadow-[0_0_35px_rgba(245,158,11,0.4)]">
              <span className="text-5xl sm:text-6xl font-black text-yellow-300">
                1º
              </span>
              <span className="text-xs sm:text-sm uppercase tracking-widest text-amber-200 font-black mt-2">
                CAMPEÃO
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <Medal className="w-8 h-8 text-amber-700" />
              {TEAMS[third].logo && (
                <img src={TEAMS[third].logo} alt={TEAMS[third].name} className="w-8 h-8 object-contain my-1" />
              )}
              <span
                className="font-black text-xl sm:text-2xl uppercase mt-1"
                style={{ color: TEAMS[third].color }}
              >
                {TEAMS[third].name}
              </span>
              <span className="font-bold text-sm text-amber-600 font-mono">
                {scores[third] || 0} pts
              </span>
            </div>
            <div className="w-full h-32 sm:h-40 bg-gradient-to-t from-amber-950/80 to-amber-800/60 border-2 border-amber-700/50 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-xl">
              <span className="text-3xl sm:text-4xl font-black text-amber-500">
                3º
              </span>
              <span className="text-xs uppercase tracking-widest text-amber-600 font-bold mt-1">
                Lugar
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard table footer */}
      <div className="w-full max-w-xl mt-8 pt-6 border-t border-gray-800 flex justify-around text-center">
        {sorted.map((t, idx) => (
          <div key={t} className="flex flex-col items-center">
            <span className="text-xs text-gray-500 font-bold">{idx + 1}º</span>
            <span className="font-bold text-sm" style={{ color: TEAMS[t].color }}>
              {TEAMS[t].name}
            </span>
            <span className="font-mono text-xs text-gray-300">{scores[t] || 0}p</span>
          </div>
        ))}
      </div>
    </div>
  );
};
