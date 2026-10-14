import React, { useEffect } from 'react';
import type { TeamId, TeamInfo, ActionCardsInventory } from '../types/game';
import { getTeam, CARD_BONUS_POINTS } from '../types/game';
import { TeamIcon } from './TeamIcon';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, Medal } from 'lucide-react';

interface PodiumProps {
  scores: Record<TeamId, number>;
  teams?: TeamInfo[];
  actionCards?: Record<TeamId, ActionCardsInventory>;
}

export const Podium: React.FC<PodiumProps> = ({ scores, teams, actionCards }) => {
  const teamList = teams && teams.length > 0 ? teams.map((t) => t.id) : Object.keys(scores);

  const getCardBonus = (teamId: TeamId) => {
    if (!actionCards || !actionCards[teamId]) return 0;
    const inv = actionCards[teamId];
    return ((inv.skip || 0) + (inv.bible || 0) + (inv.fiftyFifty || 0)) * CARD_BONUS_POINTS;
  };

  const getFinalScore = (teamId: TeamId) => {
    return (scores[teamId] || 0) + getCardBonus(teamId);
  };

  // Sort teams by final score (base + unused cards bonus)
  const sorted = [...teamList].sort((a, b) => getFinalScore(b) - getFinalScore(a));
  const winnerId = sorted[0];
  const secondId = sorted[1];
  const thirdId = sorted[2];

  const winner = getTeam(winnerId, teams);
  const second = secondId ? getTeam(secondId, teams) : null;
  const third = thirdId ? getTeam(thirdId, teams) : null;

  // Shoot confetti repeatedly and cleanup on unmount
  useEffect(() => {
    let animId: number;
    let isCancelled = false;
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      if (isCancelled) return;
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#16a34a', '#f59e0b', '#0284c7', '#9333ea'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#16a34a', '#f59e0b', '#0284c7', '#9333ea'],
      });

      if (Date.now() < animationEnd) {
        animId = requestAnimationFrame(frame);
      }
    };

    frame();

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
      confetti.reset();
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-6 px-4">
      {/* Title & Celebration Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold uppercase tracking-widest text-sm mb-4 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Federação de UMPs • Grande Final Gálatas
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 uppercase tracking-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.6)]">
          Equipe Campeã!
        </h1>

        {/* Winner Spotlight Card */}
        {winner && (
          <div className="mt-6 flex flex-col items-center animate-bounce">
            <Crown className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)] -mb-3 z-10" />
            <div
              className="px-8 sm:px-12 py-5 rounded-3xl border-4 shadow-[0_0_50px_rgba(251,191,36,0.5)] flex flex-col items-center"
              style={{
                borderColor: winner.color,
                backgroundColor: `${winner.color}20`,
              }}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center mb-2 shadow-lg"
                style={{
                  backgroundColor: `${winner.color}30`,
                  borderColor: winner.color,
                  color: winner.color,
                }}
              >
                <TeamIcon icon={winner.icon} className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <span
                className="text-4xl sm:text-6xl font-black tracking-widest uppercase"
                style={{ color: winner.color }}
              >
                {winner.name}
              </span>
              <span className="mt-2 text-2xl sm:text-3xl font-black text-yellow-400 font-mono">
                {getFinalScore(winnerId)} PONTOS
              </span>
              {getCardBonus(winnerId) > 0 && (
                <span className="text-xs text-amber-300/90 font-medium text-center">
                  ({scores[winnerId] || 0} pts perguntas + {getCardBonus(winnerId)} pts de {getCardBonus(winnerId) / CARD_BONUS_POINTS} cartas guardadas)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3D-Style Podium Columns (2nd, 1st, 3rd) */}
      <div className="w-full max-w-3xl grid grid-cols-3 items-end gap-3 sm:gap-6 pt-6">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-3 text-center">
              <Medal className="w-8 h-8 text-slate-300" />
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center my-1 shadow-md"
                style={{
                  backgroundColor: `${second.color}25`,
                  borderColor: second.color,
                  color: second.color,
                }}
              >
                <TeamIcon icon={second.icon} className="w-5 h-5" />
              </div>
              <span
                className="font-black text-xl sm:text-2xl uppercase mt-1 truncate max-w-full"
                style={{ color: second.color }}
              >
                {second.name}
              </span>
              <span className="font-bold text-sm text-slate-300 font-mono">
                {getFinalScore(secondId)} pts
              </span>
              {getCardBonus(secondId) > 0 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  (+{getCardBonus(secondId)} pts bônus)
                </span>
              )}
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
            <div className="flex flex-col items-center mb-3 text-center">
              <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
              <div
                className="w-12 h-12 rounded-xl border flex items-center justify-center my-1 shadow-md"
                style={{
                  backgroundColor: `${winner.color}25`,
                  borderColor: winner.color,
                  color: winner.color,
                }}
              >
                <TeamIcon icon={winner.icon} className="w-7 h-7" />
              </div>
              <span
                className="font-black text-2xl sm:text-3xl uppercase mt-1 truncate max-w-full"
                style={{ color: winner.color }}
              >
                {winner.name}
              </span>
              <span className="font-black text-base sm:text-lg text-yellow-300 font-mono">
                {getFinalScore(winnerId)} pts
              </span>
              {getCardBonus(winnerId) > 0 && (
                <span className="text-[10px] text-amber-300 font-medium">
                  (+{getCardBonus(winnerId)} pts bônus)
                </span>
              )}
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
            <div className="flex flex-col items-center mb-3 text-center">
              <Medal className="w-8 h-8 text-amber-700" />
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center my-1 shadow-md"
                style={{
                  backgroundColor: `${third.color}25`,
                  borderColor: third.color,
                  color: third.color,
                }}
              >
                <TeamIcon icon={third.icon} className="w-5 h-5" />
              </div>
              <span
                className="font-black text-xl sm:text-2xl uppercase mt-1 truncate max-w-full"
                style={{ color: third.color }}
              >
                {third.name}
              </span>
              <span className="font-bold text-sm text-amber-600 font-mono">
                {getFinalScore(thirdId)} pts
              </span>
              {getCardBonus(thirdId) > 0 && (
                <span className="text-[10px] text-amber-500/80 font-medium">
                  (+{getCardBonus(thirdId)} pts bônus)
                </span>
              )}
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
      <div className="w-full max-w-2xl mt-8 pt-6 border-t border-gray-800 flex flex-wrap justify-around gap-4 text-center">
        {sorted.map((tId, idx) => {
          const t = getTeam(tId, teams);
          return (
            <div key={tId} className="flex flex-col items-center min-w-16">
              <span className="text-xs text-gray-500 font-bold">{idx + 1}º</span>
              <span className="font-bold text-sm" style={{ color: t.color }}>
                {t.name}
              </span>
              <span className="font-mono text-xs text-gray-200 font-black">
                {getFinalScore(tId)} pts
              </span>
              {getCardBonus(tId) > 0 && (
                <span className="text-[9px] text-amber-400/90 font-mono">
                  (+{getCardBonus(tId)} bônus)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
