import React from 'react';
import type { ActionCardType, TeamId, TeamInfo } from '../types/game';
import { getTeam, CARD_BONUS_POINTS } from '../types/game';
import { TeamIcon } from './TeamIcon';
import { FastForward, BookOpen, Sparkles, Award } from 'lucide-react';

interface ActionCardsHUDProps {
  team: TeamId;
  teams?: TeamInfo[];
  inventory?: {
    skip: number;
    bible: number;
    fiftyFifty: number;
  };
  interactive?: boolean;
  onUseCard?: (cardType: ActionCardType) => void;
  isMultipleChoice?: boolean;
  isFiftyFiftyUsed?: boolean;
  isQuestionSkipped?: boolean;
  disabled?: boolean;
  compact?: boolean;
  skipsUsedInRound?: number;
}

export const ActionCardsHUD: React.FC<ActionCardsHUDProps> = ({
  team,
  teams,
  inventory = { skip: 2, bible: 1, fiftyFifty: 1 },
  interactive = false,
  onUseCard,
  isMultipleChoice = true,
  isFiftyFiftyUsed = false,
  isQuestionSkipped = false,
  disabled = false,
  compact = false,
}) => {
  const teamInfo = getTeam(team, teams);
  const totalUnused = (inventory.skip || 0) + (inventory.bible || 0) + (inventory.fiftyFifty || 0);
  const potentialBonus = totalUnused * CARD_BONUS_POINTS;

  const cardsConfig: Array<{
    type: ActionCardType;
    name: string;
    shortName: string;
    desc: string;
    icon: React.ReactNode;
    count: number;
    max: number;
    canUse: boolean;
    disabledReason?: string;
    badgeColor: string;
    bgGradient: string;
    borderColor: string;
  }> = [
    {
      type: 'skip',
      name: 'Pular Pergunta',
      shortName: 'Pular',
      desc: 'Pula • Sorteia outra questão',
      icon: <FastForward className="w-4 h-4 text-orange-400" />,
      count: inventory.skip,
      max: 2,
      canUse: inventory.skip > 0 && !isQuestionSkipped && !disabled,
      disabledReason:
        inventory.skip <= 0
          ? 'Esgotado'
          : isQuestionSkipped
          ? 'Já pulada'
          : undefined,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      bgGradient: 'from-orange-950/40 to-black/60',
      borderColor: 'border-orange-500/40 hover:border-orange-400',
    },
    {
      type: 'bible',
      name: 'Consulta Bíblica',
      shortName: 'Bíblia (30s)',
      desc: 'Tempo de consulta na Bíblia',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      count: inventory.bible,
      max: 1,
      canUse: inventory.bible > 0 && !isQuestionSkipped && !disabled,
      disabledReason:
        inventory.bible <= 0
          ? 'Esgotado'
          : isQuestionSkipped
          ? 'Pergunta pulada'
          : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      bgGradient: 'from-cyan-950/40 to-black/60',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    },
    {
      type: 'fiftyFifty',
      name: 'Carta 50/50',
      shortName: '50/50',
      desc: 'Elimina 2 alternativas',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      count: inventory.fiftyFifty,
      max: 1,
      canUse:
        inventory.fiftyFifty > 0 &&
        !isQuestionSkipped &&
        !disabled &&
        isMultipleChoice &&
        !isFiftyFiftyUsed,
      disabledReason:
        inventory.fiftyFifty <= 0
          ? 'Esgotado'
          : !isMultipleChoice
          ? 'Apenas múltipla escolha'
          : isFiftyFiftyUsed
          ? 'Já utilizada'
          : isQuestionSkipped
          ? 'Pergunta pulada'
          : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      bgGradient: 'from-purple-950/40 to-black/60',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-black/60 border border-[#1d5740] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center border text-xs"
            style={{
              backgroundColor: `${teamInfo.color}30`,
              borderColor: teamInfo.color,
              color: teamInfo.color,
            }}
          >
            <TeamIcon icon={teamInfo.icon} className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-gray-300">
            Cartas de <span className="text-white font-black">{teamInfo.name}</span>:
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cardsConfig.map((card) => {
            const isClickable = interactive && card.canUse;
            return (
              <button
                key={card.type}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onUseCard && onUseCard(card.type)}
                title={card.disabledReason || `${card.name} (${card.count}/${card.max})`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                  card.count > 0
                    ? isClickable
                      ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm'
                      : 'border-gray-700 bg-gray-900/60 text-gray-300'
                    : 'border-gray-800 bg-gray-950/40 text-gray-600 opacity-40 line-through'
                }`}
              >
                {card.icon}
                <span className="font-mono">{card.count}</span>
              </button>
            );
          })}

          {potentialBonus > 0 && (
            <span
              className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1"
              title={`+${CARD_BONUS_POINTS} pts por carta poupada no pódio final`}
            >
              <Award className="w-3 h-3 text-amber-400" />+{potentialBonus}p
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-gradient-to-r from-gray-950/80 via-[#0c231a] to-gray-950/80 border border-[#1d5740] shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm"
            style={{
              backgroundColor: `${teamInfo.color}30`,
              borderColor: teamInfo.color,
              color: teamInfo.color,
            }}
          >
            <TeamIcon icon={teamInfo.icon} className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider block text-gray-400">
              Arsenal Estratégico
            </span>
            <span className="text-base font-black uppercase" style={{ color: teamInfo.color }}>
              {teamInfo.name}
            </span>
          </div>
        </div>

        {potentialBonus > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold"
            title="Economizar cartas rende pontos automáticos somados ao final!"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Bônus Final: +{potentialBonus} pts</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
        {cardsConfig.map((card) => {
          const isClickable = interactive && card.canUse;
          return (
            <button
              key={card.type}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onUseCard && onUseCard(card.type)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                card.count > 0
                  ? isClickable
                    ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/50 to-gray-950 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md'
                    : 'border-gray-700 bg-gray-900/50 text-gray-300'
                  : 'border-gray-800 bg-gray-950/40 text-gray-600 opacity-40 line-through'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  {card.icon}
                  <span className="text-xs font-black text-white">{card.shortName}</span>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                >
                  {card.count}/{card.max}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-1">{card.desc}</p>
              {card.disabledReason && (
                <span className="text-[9px] text-amber-400/80 mt-1 font-semibold block">
                  {card.disabledReason}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
