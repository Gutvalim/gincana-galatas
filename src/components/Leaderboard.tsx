import React, { useState, useEffect } from 'react';
import type { TeamId, TeamInfo, ActionCardsInventory } from '../types/game';
import { getTeam, getCardBonus as calcCardBonus } from '../types/game';
import { TeamIcon } from './TeamIcon';
import { Trophy, Award, Medal, Sparkles, Check } from 'lucide-react';

interface LeaderboardProps {
  scores: Record<TeamId, number>;
  teams?: TeamInfo[];
  actionCards?: Record<TeamId, ActionCardsInventory>;
  compact?: boolean;
  highlightTeam?: TeamId | null;
  onEmergencyAdjust?: (team: TeamId, delta: number) => void;
  onSetScore?: (team: TeamId, newScore: number) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  scores,
  teams,
  actionCards,
  compact = false,
  highlightTeam = null,
  onSetScore,
}) => {
  const [inputScores, setInputScores] = useState<Partial<Record<TeamId, string>>>({});
  const [savedTeam, setSavedTeam] = useState<TeamId | null>(null);

  const teamList = teams && teams.length > 0 ? teams.map((t) => t.id) : Object.keys(scores);

  useEffect(() => {
    setInputScores((prev) => {
      const next = { ...prev };
      teamList.forEach((id) => {
        next[id] = String(scores[id] ?? 0);
      });
      return next;
    });
  }, [scores, teamList.join(',')]);

  const handleSave = (teamId: TeamId) => {
    const raw = inputScores[teamId] !== undefined ? inputScores[teamId]! : String(scores[teamId] ?? 0);
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= 0) {
      onSetScore?.(teamId, val);
      setSavedTeam(teamId);
      setTimeout(() => {
        setSavedTeam((curr) => (curr === teamId ? null : curr));
      }, 1500);
    }
  };

  const getCardBonus = (teamId: TeamId) => {
    if (!actionCards || !actionCards[teamId]) return 0;
    return calcCardBonus(actionCards[teamId]);
  };

  const sortedTeams = [...teamList].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const maxScore = Math.max(...Object.values(scores), 40);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center shadow-md">
            <Trophy className="w-4 h-4" />
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center shadow-sm">
            <Medal className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black flex items-center justify-center shadow-sm">
            <Award className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center border border-slate-300">
            {rank + 1}º
          </div>
        );
    }
  };

  if (compact) {
    return (
      <div className="space-y-2 select-none">
        {sortedTeams.map((teamId, rank) => {
          const team = getTeam(teamId, teams);
          const score = scores[teamId] || 0;
          const isHighlighted = highlightTeam === teamId;

          return (
            <div
              key={teamId}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isHighlighted
                  ? 'border-blue-600 bg-blue-50/80 shadow-md'
                  : 'border-slate-200 bg-white hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-xs font-black text-slate-400 w-4 shrink-0">{rank + 1}º</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white"
                  style={{ backgroundColor: team.color }}
                >
                  <TeamIcon icon={team.icon} className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800 truncate">{team.name}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {getCardBonus(teamId) > 0 && (
                  <span
                    className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold hidden sm:inline whitespace-nowrap"
                    title={`+${getCardBonus(teamId)} pts de cartas guardadas`}
                  >
                    +{getCardBonus(teamId)} pts
                  </span>
                )}

                {onSetScore ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={inputScores[teamId] !== undefined ? inputScores[teamId] : String(score)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInputScores((prev) => ({ ...prev, [teamId]: val }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave(teamId);
                        }
                      }}
                      className="w-16 px-1.5 py-1 text-center bg-slate-50 border border-slate-300 focus:border-blue-700 rounded-lg text-sm font-black text-slate-900 font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSave(teamId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow transition-all cursor-pointer ${
                        savedTeam === teamId
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-900 hover:bg-blue-800 text-white'
                      }`}
                    >
                      {savedTeam === teamId ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Salvo!
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="font-black text-base text-slate-900 font-mono leading-tight">
                      {score} <span className="text-xs text-slate-400 font-normal">pts</span>
                    </span>
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
    <div className="w-full max-w-5xl mx-auto space-y-3.5 select-none">
      {sortedTeams.map((teamId, rank) => {
        const team = getTeam(teamId, teams);
        const score = scores[teamId] || 0;
        const percentage =
          maxScore > 0 && score > 0
            ? Math.min(100, Math.max(3, (score / maxScore) * 100))
            : 0;
        const isHighlighted = highlightTeam === teamId;

        return (
          <div
            key={teamId}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-md ${
              isHighlighted
                ? 'border-blue-600 bg-blue-50/80 shadow-xl scale-[1.01]'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {/* Background progress fill */}
            <div
              className="absolute top-0 bottom-0 left-0 opacity-10 transition-all duration-700 ease-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: team.color,
              }}
            />

            <div className="relative z-10 px-6 py-4 flex items-center justify-between gap-4">
              {/* Rank & Team Name */}
              <div className="w-72 sm:w-88 md:w-96 shrink-0 flex items-center gap-3.5">
                {getRankBadge(rank)}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow text-white"
                  style={{ backgroundColor: team.color }}
                >
                  <TeamIcon icon={team.icon} className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="text-2xl sm:text-3xl font-black uppercase tracking-wider whitespace-nowrap"
                    style={{ color: team.color }}
                  >
                    {team.name}
                  </span>
                  {rank === 0 && score > 0 && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 uppercase shrink-0 shadow-sm">
                      Líder
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Line */}
              <div className="flex-1 mx-4 hidden md:block">
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: team.color,
                    }}
                  />
                </div>
              </div>

              {/* Score Number */}
              <div className="w-32 sm:w-44 shrink-0 flex flex-col items-end justify-center">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                    {score}
                  </span>
                  <span className="text-sm font-semibold text-slate-400 uppercase">
                    pts
                  </span>
                </div>
                {getCardBonus(teamId) > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 shadow-sm whitespace-nowrap"
                      title={`+${getCardBonus(teamId)} pts de cartas guardadas para o pódio`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      +{getCardBonus(teamId)} pts guardados
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
