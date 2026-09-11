import React from 'react';
import type { TeamId, ActionCardsInventory } from '../types/game';
import { TEAMS, ALL_TEAM_IDS } from '../types/game';
import { Trophy, Award, Medal, Sparkles } from 'lucide-react';

interface LeaderboardProps {
  scores: Record<TeamId, number>;
  actionCards?: Record<TeamId, ActionCardsInventory>;
  compact?: boolean;
  highlightTeam?: TeamId | null;
  onEmergencyAdjust?: (team: TeamId, delta: number) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  scores,
  actionCards,
  compact = false,
  highlightTeam = null,
  onEmergencyAdjust,
}) => {
  const getCardBonus = (teamId: TeamId) => {
    if (!actionCards || !actionCards[teamId]) return 0;
    const inv = actionCards[teamId];
    return ((inv.skip || 0) + (inv.bible || 0) + (inv.fiftyFifty || 0)) * 15;
  };

  // Sort teams by points descending
  const sortedTeams = [...ALL_TEAM_IDS].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const maxScore = Math.max(...Object.values(scores), 60);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.8)]">
            <Trophy className="w-4 h-4" />
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-300 text-black font-black flex items-center justify-center shadow-[0_0_10px_rgba(203,213,225,0.7)]">
            <Medal className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black flex items-center justify-center shadow-[0_0_10px_rgba(180,83,9,0.6)]">
            <Award className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 font-bold flex items-center justify-center border border-gray-700">
            {rank + 1}º
          </div>
        );
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {sortedTeams.map((teamId, rank) => {
          const team = TEAMS[teamId];
          const score = scores[teamId] || 0;
          const isHighlighted = highlightTeam === teamId;

          return (
            <div
              key={teamId}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isHighlighted
                  ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'border-[#1d5740] bg-[#0c231a] hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-gray-400 w-4">{rank + 1}º</span>
                {team.logo ? (
                  <div className="w-6 h-6 rounded-lg bg-white/95 border border-white/50 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <span
                    className="w-3 h-3 rounded-full shadow"
                    style={{ backgroundColor: team.color }}
                  />
                )}
                <span className="font-bold text-sm text-gray-200">{team.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-black text-base text-yellow-400 font-mono leading-tight">
                    {score} <span className="text-xs text-gray-400 font-normal">pts</span>
                  </span>
                  {getCardBonus(teamId) > 0 && (
                    <span
                      className="text-[10px] text-amber-300 font-bold"
                      title={`${getCardBonus(teamId)} pts bônus de ${getCardBonus(teamId) / 15} cartas de ação guardadas (+15 pts cada)`}
                    >
                      +{getCardBonus(teamId)} cartas
                    </span>
                  )}
                </div>

                {onEmergencyAdjust && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEmergencyAdjust(teamId, -5)}
                      title="Subtrair 5 pontos"
                      className="px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/50 hover:bg-red-700 text-xs font-bold transition-colors"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => onEmergencyAdjust(teamId, +5)}
                      title="Adicionar 5 pontos"
                      className="px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-700 text-xs font-bold transition-colors"
                    >
                      +5
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {sortedTeams.map((teamId, rank) => {
        const team = TEAMS[teamId];
        const score = scores[teamId] || 0;
        const percentage =
          maxScore > 0 && score > 0
            ? Math.min(100, Math.max(3, (score / maxScore) * 100))
            : 0;
        const isHighlighted = highlightTeam === teamId;

        return (
          <div
            key={teamId}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 shadow-xl ${
              isHighlighted
                ? 'border-amber-400 bg-[#0e2a1f] shadow-[0_0_35px_rgba(245,158,11,0.4)] scale-[1.02]'
                : 'border-[#1d5740] bg-[#0c231a]'
            }`}
          >
            {/* Background progress fill */}
            <div
              className="absolute top-0 bottom-0 left-0 opacity-15 transition-all duration-700 ease-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: team.color,
              }}
            />

            <div className="relative z-10 px-6 py-4 flex items-center justify-between gap-4">
              {/* Rank & Team Name - Fixed width column for perfect alignment */}
              <div className="w-64 sm:w-80 shrink-0 flex items-center gap-3.5">
                {getRankBadge(rank)}
                {team.logo ? (
                  <div className="w-12 h-12 rounded-xl bg-white/95 border border-white/50 p-1 flex items-center justify-center shrink-0 shadow-md">
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl border flex items-center justify-center font-black text-base shrink-0 shadow-md"
                    style={{ backgroundColor: `${team.color}20`, borderColor: `${team.color}60`, color: team.color }}
                  >
                    {team.name.slice(0, 3)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl sm:text-3xl font-black uppercase tracking-wider truncate"
                      style={{ color: team.color }}
                    >
                      {team.name}
                    </span>
                    {rank === 0 && score > 0 && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase shrink-0">
                        Líder
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 hidden sm:block font-medium truncate">
                    {team.fullName}
                  </span>
                </div>
              </div>

              {/* Progress Bar Line - Uniformly aligned across all teams */}
              <div className="flex-1 mx-4 hidden md:block">
                <div className="w-full bg-gray-900/90 rounded-full h-4 overflow-hidden p-0.5 border border-gray-700/80 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: team.color,
                      boxShadow: percentage > 0 ? `0 0 12px ${team.color}80` : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Score Number - Fixed right column */}
              <div className="w-32 sm:w-44 shrink-0 flex flex-col items-end justify-center">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {score}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 uppercase">
                    pts
                  </span>
                </div>
                {getCardBonus(teamId) > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-sm"
                      title="Bônus de 15 pontos para cada carta de ação não utilizada ao final"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      +{getCardBonus(teamId)} cartas ({getCardBonus(teamId) / 15} un.)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
