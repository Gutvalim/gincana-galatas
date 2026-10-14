import React, { useEffect } from 'react';
import type { TeamId, TeamInfo, ActionCardsInventory } from '../types/game';
import { getTeam, CARD_BONUS_POINTS } from '../types/game';
import { TeamIcon } from './TeamIcon';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, Medal, Award } from 'lucide-react';

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

  // Confetti effect
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
        colors: ['#003366', '#c8102e', '#f59e0b', '#10b981'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#003366', '#c8102e', '#f59e0b', '#10b981'],
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
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-6 px-4 select-none animate-fadeIn">
      {/* Title & Celebration Header */}
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-900 font-black uppercase tracking-widest text-sm mb-3 shadow-sm">
          <Sparkles className="w-4 h-4 text-red-600" />
          Federação de UMPs • Grande Final Gálatas
          <Sparkles className="w-4 h-4 text-red-600" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 font-display uppercase tracking-tight">
          Equipe Campeã!
        </h1>

        {/* Winner Spotlight Card */}
        {winner && (
          <div className="mt-5 flex flex-col items-center animate-bounce">
            <Crown className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 drop-shadow-md -mb-3 z-10" />
            <div
              className="px-8 sm:px-12 py-5 rounded-3xl border-4 shadow-xl flex flex-col items-center bg-white"
              style={{
                borderColor: winner.color,
              }}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-2 shadow-md text-white"
                style={{ backgroundColor: winner.color }}
              >
                <TeamIcon icon={winner.icon} className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <span
                className="text-4xl sm:text-6xl font-black tracking-wider uppercase font-display"
                style={{ color: winner.color }}
              >
                {winner.name}
              </span>
              <span className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {getFinalScore(winnerId)} PONTOS
              </span>
              {getCardBonus(winnerId) > 0 && (
                <span className="text-xs text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mt-1">
                  ({scores[winnerId] || 0} pts das perguntas + {getCardBonus(winnerId)} pts de {getCardBonus(winnerId) / CARD_BONUS_POINTS} cartas guardadas)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3D-Style Podium Columns */}
      <div className="w-full max-w-3xl grid grid-cols-3 items-end gap-3 sm:gap-6 pt-4">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-2 text-center">
              <Medal className="w-8 h-8 text-slate-400" />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center my-1 shadow text-white"
                style={{ backgroundColor: second.color }}
              >
                <TeamIcon icon={second.icon} className="w-5 h-5" />
              </div>
              <span
                className="font-black text-lg sm:text-xl uppercase truncate max-w-full font-display"
                style={{ color: second.color }}
              >
                {second.name}
              </span>
              <span className="font-bold text-sm text-slate-700 font-mono">
                {getFinalScore(secondId)} pts
              </span>
              {getCardBonus(secondId) > 0 && (
                <span className="text-[10px] text-amber-800 font-bold">
                  (+{getCardBonus(secondId)} pts bônus)
                </span>
              )}
            </div>
            <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-slate-200 to-slate-100 border-2 border-slate-300 rounded-t-3xl flex flex-col items-center justify-start pt-3 shadow-md">
              <span className="text-3xl sm:text-4xl font-black text-slate-700">2º</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Lugar</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {winner && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-2 text-center">
              <Trophy className="w-12 h-12 text-amber-500" />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center my-1 shadow text-white"
                style={{ backgroundColor: winner.color }}
              >
                <TeamIcon icon={winner.icon} className="w-7 h-7" />
              </div>
              <span
                className="font-black text-2xl sm:text-3xl uppercase tracking-wider truncate max-w-full font-display"
                style={{ color: winner.color }}
              >
                {winner.name}
              </span>
              <span className="font-black text-base sm:text-lg text-slate-900 font-mono">
                {getFinalScore(winnerId)} pts
              </span>
            </div>
            <div className="w-full h-48 sm:h-64 bg-gradient-to-t from-amber-200 to-amber-100 border-4 border-amber-400 rounded-t-3xl flex flex-col items-center justify-start pt-4 shadow-xl">
              <span className="text-4xl sm:text-5xl font-black text-amber-950 font-display">1º</span>
              <span className="text-xs uppercase tracking-widest text-amber-900 font-black">Campeã</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-2 text-center">
              <Award className="w-8 h-8 text-amber-700" />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center my-1 shadow text-white"
                style={{ backgroundColor: third.color }}
              >
                <TeamIcon icon={third.icon} className="w-5 h-5" />
              </div>
              <span
                className="font-black text-lg sm:text-xl uppercase truncate max-w-full font-display"
                style={{ color: third.color }}
              >
                {third.name}
              </span>
              <span className="font-bold text-sm text-slate-700 font-mono">
                {getFinalScore(thirdId)} pts
              </span>
              {getCardBonus(thirdId) > 0 && (
                <span className="text-[10px] text-amber-800 font-bold">
                  (+{getCardBonus(thirdId)} pts bônus)
                </span>
              )}
            </div>
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-orange-100 to-amber-50 border-2 border-amber-300 rounded-t-3xl flex flex-col items-center justify-start pt-3 shadow-md">
              <span className="text-3xl sm:text-4xl font-black text-amber-900">3º</span>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">Lugar</span>
            </div>
          </div>
        )}
      </div>

      {/* Full Standings Breakdown */}
      <div className="w-full max-w-2xl mt-8 p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 text-center">
          Classificação Final Completa com Bônus de Cartas
        </h4>
        <div className="space-y-2">
          {sorted.map((tId, idx) => {
            const t = getTeam(tId, teams);
            const basePts = scores[tId] || 0;
            const bonusPts = getCardBonus(tId);
            const totalPts = basePts + bonusPts;

            return (
              <div
                key={tId}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-500 w-5">{idx + 1}º</span>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    <TeamIcon icon={t.icon} className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{t.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    Perguntas: <strong className="text-slate-800">{basePts} pts</strong>
                  </span>
                  <span className="text-amber-700">
                    Bônus: <strong>+{bonusPts} pts</strong>
                  </span>
                  <span className="font-black text-slate-900 text-sm font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    Total: {totalPts} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
