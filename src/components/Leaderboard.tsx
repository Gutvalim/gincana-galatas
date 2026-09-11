import React from 'react';
import type { TeamId } from '../types/game';
import { TEAMS, ALL_TEAM_IDS } from '../types/game';
import { Trophy, Award, Medal } from 'lucide-react';

interface LeaderboardProps {
  scores: Record<TeamId, number>;
  compact?: boolean;
  highlightTeam?: TeamId | null;
  onEmergencyAdjust?: (team: TeamId, delta: number) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  scores,
  compact = false,
  highlightTeam = null,
  onEmergencyAdjust,
}) => {
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
                  ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                  : 'border-gray-800 bg-[#111827]/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-gray-400 w-4">{rank + 1}º</span>
                <span
                  className="w-3 h-3 rounded-full shadow"
                  style={{ backgroundColor: team.color }}
                />
                <span className="font-bold text-sm text-gray-200">{team.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-base text-yellow-400 font-mono">
                  {score} <span className="text-xs text-gray-400 font-normal">pts</span>
                </span>

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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {sortedTeams.map((teamId, rank) => {
        const team = TEAMS[teamId];
        const score = scores[teamId] || 0;
        const percentage = Math.max(8, Math.min(100, (score / maxScore) * 100));
        const isHighlighted = highlightTeam === teamId;

        return (
          <div
            key={teamId}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 shadow-xl ${
              isHighlighted
                ? 'border-yellow-400 bg-gray-900/90 shadow-[0_0_30px_rgba(250,204,21,0.3)] scale-[1.02]'
                : 'border-gray-800 bg-[#111827]/90'
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
              {/* Rank & Team Name */}
              <div className="flex items-center gap-4 min-w-[200px]">
                {getRankBadge(rank)}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl sm:text-3xl font-black uppercase tracking-wider"
                      style={{ color: team.color }}
                    >
                      {team.name}
                    </span>
                    {rank === 0 && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                        Líder
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 hidden sm:block font-medium">
                    {team.fullName}
                  </span>
                </div>
              </div>

              {/* Progress Bar Line */}
              <div className="flex-1 mx-4 hidden md:block">
                <div className="w-full bg-gray-800/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-700">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: team.color,
                    }}
                  />
                </div>
              </div>

              {/* Score Number */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {score}
                </span>
                <span className="text-sm font-semibold text-gray-400 uppercase">
                  pts
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
