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
    borderColor: string;
  }> = [
    {
      type: 'skip',
      name: 'Pular Pergunta',
      shortName: 'Pular',
      desc: 'Pula • Escolhe outro número',
      icon: <FastForward className="w-4 h-4 text-orange-600" />,
      count: inventory.skip,
      max: 2,
      canUse: inventory.skip > 0 && !isQuestionSkipped && !disabled,
      disabledReason:
        inventory.skip <= 0
          ? 'Esgotado'
          : isQuestionSkipped
          ? 'Já pulada'
          : undefined,
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
      borderColor: 'border-orange-300 hover:border-orange-500',
    },
    {
      type: 'bible',
      name: 'Consulta Bíblica',
      shortName: 'Bíblia (30s)',
      desc: 'Tempo de consulta na Bíblia',
      icon: <BookOpen className="w-4 h-4 text-sky-700" />,
      count: inventory.bible,
      max: 1,
      canUse: inventory.bible > 0 && !isQuestionSkipped && !disabled,
      disabledReason:
        inventory.bible <= 0
          ? 'Esgotado'
          : isQuestionSkipped
          ? 'Pergunta pulada'
          : undefined,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      borderColor: 'border-sky-300 hover:border-sky-500',
    },
    {
      type: 'fiftyFifty',
      name: 'Carta 50/50',
      shortName: '50/50',
      desc: 'Elimina 2 alternativas',
      icon: <Sparkles className="w-4 h-4 text-purple-700" />,
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
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      borderColor: 'border-purple-300 hover:border-purple-500',
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs text-white"
            style={{ backgroundColor: teamInfo.color }}
          >
            <TeamIcon icon={teamInfo.icon} className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-600">
            Cartas de <span className="text-slate-900 font-black">{teamInfo.name}</span>:
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
                      ? 'border-blue-600 bg-blue-50 text-blue-900 hover:scale-105 active:scale-95 cursor-pointer shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-400 opacity-40 line-through'
                }`}
              >
                {card.icon}
                <span className="font-mono font-black">{card.count}</span>
              </button>
            );
          })}

          {potentialBonus > 0 && (
            <span
              className="text-[10px] text-amber-800 font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 flex items-center gap-1 shadow-sm"
              title={`+${CARD_BONUS_POINTS} pts por carta guardada no pódio final`}
            >
              <Award className="w-3 h-3 text-amber-600" />+{potentialBonus}p
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: teamInfo.color }}
          >
            <TeamIcon icon={teamInfo.icon} className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500">
              Arsenal Estratégico
            </span>
            <span className="text-base font-black uppercase text-slate-900">
              {teamInfo.name}
            </span>
          </div>
        </div>

        {potentialBonus > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold"
            title="Economizar cartas rende pontos automáticos somados ao final!"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
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
                    ? 'border-blue-600 bg-blue-50/70 hover:bg-blue-100 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                  : 'border-slate-200 bg-slate-100 text-slate-400 opacity-40 line-through'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  {card.icon}
                  <span className="text-xs font-black text-slate-900">{card.shortName}</span>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                >
                  {card.count}/{card.max}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{card.desc}</p>
              {card.disabledReason && (
                <span className="text-[9px] text-amber-700 mt-1 font-bold block">
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
