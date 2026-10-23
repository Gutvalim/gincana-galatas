import React from 'react';
import type { ActionCardType, TeamId, TeamInfo, ActionCardsInventory } from '../types/game';
import { getTeam, CARD_BONUS_POINTS, getUnusedCardsCount, getCardBonus } from '../types/game';
import { TeamIcon } from './TeamIcon';
import { FastForward, BookOpen, Sparkles, Trophy } from 'lucide-react';

interface ActionCardsHUDProps {
  team: TeamId;
  teams?: TeamInfo[];
  inventory?: ActionCardsInventory;
  interactive?: boolean;
  onUseCard?: (cardType: ActionCardType) => void;
  isMultipleChoice?: boolean;
  isFiftyFiftyUsed?: boolean;
  isQuestionSkipped?: boolean;
  disabled?: boolean;
  compact?: boolean; // When true, rendered on the Telão viewer
  skipsUsedInRound?: number;
}

export const ActionCardsHUD: React.FC<ActionCardsHUDProps> = ({
  team,
  teams,
  inventory = { skip: 2, help: 2 },
  interactive = false,
  onUseCard,
  isMultipleChoice = true,
  isFiftyFiftyUsed = false,
  isQuestionSkipped = false,
  disabled = false,
  compact = false,
}) => {
  const teamInfo = getTeam(team, teams);

  // Shared help pool: 2 uses total (Bíblia if dissertative, 50/50 if multiple choice)
  const helpCount = typeof inventory?.help === 'number'
    ? inventory.help
    : (inventory?.bible || 0) + (inventory?.fiftyFifty || 0);
  const skipCount = inventory?.skip ?? 0;
  const totalUnused = getUnusedCardsCount(inventory);
  const potentialBonus = getCardBonus(inventory);

  // 1. Skip Card (Pular)
  const skipCard = {
    type: 'skip' as ActionCardType,
    name: 'Pular Pergunta',
    shortName: 'Pular',
    desc: 'Pula • Escolhe outro número',
    icon: <FastForward className="w-5 h-5 text-orange-600 shrink-0" />,
    count: skipCount,
    max: 2,
    canUse: skipCount > 0 && !isQuestionSkipped && !disabled,
    disabledReason:
      skipCount <= 0
        ? 'Esgotado'
        : isQuestionSkipped
        ? 'Já pulada'
        : undefined,
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    borderColor: 'border-orange-300 hover:border-orange-500',
    bgActive: 'bg-orange-50/80',
  };

  // 2. Adaptive Help Card (50/50 on Multiple Choice, Bible Consultation on Dissertative)
  const helpCard = isMultipleChoice
    ? {
        type: 'fiftyFifty' as ActionCardType,
        name: 'Carta 50/50',
        shortName: '50/50',
        desc: 'Elimina 2 alternativas erradas',
        icon: <Sparkles className="w-5 h-5 text-purple-700 shrink-0" />,
        count: helpCount,
        max: 2,
        canUse: helpCount > 0 && !isQuestionSkipped && !disabled && !isFiftyFiftyUsed,
        disabledReason:
          helpCount <= 0
            ? 'Esgotado'
            : isFiftyFiftyUsed
            ? 'Já utilizada'
            : isQuestionSkipped
            ? 'Pergunta pulada'
            : undefined,
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        borderColor: 'border-purple-300 hover:border-purple-500',
        bgActive: 'bg-purple-50/80',
        poolLabel: 'Pool de 2 ajudas',
      }
    : {
        type: 'bible' as ActionCardType,
        name: 'Consulta Bíblica',
        shortName: 'Bíblia (30s)',
        desc: '+30 segundos para pesquisar',
        icon: <BookOpen className="w-5 h-5 text-sky-700 shrink-0" />,
        count: helpCount,
        max: 2,
        canUse: helpCount > 0 && !isQuestionSkipped && !disabled,
        disabledReason:
          helpCount <= 0
            ? 'Esgotado'
            : isQuestionSkipped
            ? 'Pergunta pulada'
            : undefined,
        badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
        borderColor: 'border-sky-300 hover:border-sky-500',
        bgActive: 'bg-sky-50/80',
        poolLabel: 'Pool de 2 ajudas',
      };

  const activeCards = [skipCard, helpCard];

  // =========================================================================
  // VIEW 1: TELÃO DISPLAY (compact === true)
  // Large, high-visibility, eye-catching cards and prominent bonus for audience
  // =========================================================================
  if (compact) {
    return (
      <div className="w-full flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-200 shadow-xl">
        {/* Left: Team Identifier */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: teamInfo.color }}
          >
            <TeamIcon icon={teamInfo.icon} className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Cartas em Jogo
            </span>
            <span
              className="text-lg sm:text-2xl font-black uppercase tracking-wide"
              style={{ color: teamInfo.color }}
            >
              {teamInfo.name}
            </span>
          </div>
        </div>

        {/* Center: Available Adaptive Cards */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {activeCards.map((card) => {
            const hasAvailable = card.count > 0;
            return (
              <div
                key={card.type}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 transition-all shadow-sm ${
                  hasAvailable
                    ? `${card.borderColor} ${card.bgActive}`
                    : 'border-slate-200 bg-slate-100/70 opacity-40 line-through'
                }`}
              >
                {card.icon}
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {card.shortName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {card.desc}
                  </span>
                </div>
                <span
                  className={`ml-1 text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl border ${card.badgeColor} shadow-sm`}
                >
                  {card.count}/{card.max}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: BÔNUS NO PÓDIO (EM TAMANHO MAIOR E MAIS EVIDENTE) */}
        <div
          className={`flex items-center gap-3.5 px-5 py-3 rounded-2xl border-2 shadow-lg transition-transform ${
            potentialBonus > 0
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-yellow-200 text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.4)]'
              : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
          }`}
          title="Economizar cartas rende +5 pontos por unidade somados direto no pódio final!"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950/10 flex items-center justify-center shrink-0">
            <Trophy className={`w-6 h-6 ${potentialBonus > 0 ? 'text-amber-950 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-950 block leading-tight">
              Bônus no Pódio
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-950 leading-none my-0.5">
              +{potentialBonus} PTS
            </span>
            <span className="text-[11px] font-bold text-amber-950/80 leading-none">
              {totalUnused} {totalUnused === 1 ? 'carta guardada' : 'cartas guardadas'} (+{CARD_BONUS_POINTS} pts cada)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: OPERATOR CONSOLE DISPLAY (compact === false)
  // Standard functional operator view (not bloated, easy to trigger)
  // =========================================================================
  return (
    <div className="w-full flex flex-col gap-2.5 p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-md">
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
              Cartas de Ação
            </span>
            <span className="text-base font-black uppercase text-slate-900">
              {teamInfo.name}
            </span>
          </div>
        </div>

        {potentialBonus > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm"
            title="Economizar cartas rende pontos somados ao pódio final!"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Bônus Pódio: +{potentialBonus} pts ({totalUnused} cartas)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
        {activeCards.map((card) => {
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
                    ? 'border-blue-600 bg-blue-50/70 hover:bg-blue-100 hover:scale-[1.01] active:scale-95 cursor-pointer shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                  : 'border-slate-200 bg-slate-100 text-slate-400 opacity-40 line-through'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  {card.icon}
                  <span className="text-xs font-black text-slate-900">{card.name}</span>
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
