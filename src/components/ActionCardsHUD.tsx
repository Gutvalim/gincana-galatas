import React from 'react';
import type { ActionCardType, TeamId } from '../types/game';
import { TEAMS, CARD_BONUS_POINTS } from '../types/game';
import { FastForward, BookOpen, Sparkles, Award } from 'lucide-react';

interface ActionCardsHUDProps {
  team: TeamId;
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
  inventory = { skip: 2, bible: 1, fiftyFifty: 1 },
  interactive = false,
  onUseCard,
  isMultipleChoice = true,
  isFiftyFiftyUsed = false,
  isQuestionSkipped = false,
  disabled = false,
  compact = false,
  skipsUsedInRound = 0,
}) => {
  const teamInfo = TEAMS[team];
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
      desc: team === 'UCP' ? 'Pula • Nova Carta Reserva' : 'Passa a vez • Libera papel',
      icon: <FastForward className="w-4 h-4 text-orange-400" />,
      count: inventory.skip,
      max: 2,
      canUse: inventory.skip > 0 && !isQuestionSkipped && !disabled && skipsUsedInRound < 2,
      disabledReason:
        inventory.skip <= 0
          ? 'Esgotado'
          : isQuestionSkipped
          ? 'Já pulada'
          : skipsUsedInRound >= 2
          ? 'Limite da rodada atingido (2/2)'
          : undefined,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      bgGradient: 'from-orange-950/40 to-black/60',
      borderColor: 'border-orange-500/40 hover:border-orange-400',
    },
    {
      type: 'bible',
      name: 'Consulta Bíblica',
      shortName: 'Bíblia (30s)',
      desc: 'Inicia timer de 30 segundos',
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
        isMultipleChoice &&
        !isFiftyFiftyUsed &&
        !isQuestionSkipped &&
        !disabled,
      disabledReason:
        inventory.fiftyFifty <= 0
          ? 'Esgotado'
          : !isMultipleChoice
          ? 'Só múltipla escolha'
          : isFiftyFiftyUsed
          ? 'Já aplicado'
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
      <div className="flex items-center gap-2 flex-wrap">
        {cardsConfig.map((card) => {
          const isUsable = interactive && card.canUse;
          return (
            <button
              key={card.type}
              type="button"
              disabled={!isUsable}
              onClick={() => interactive && onUseCard && onUseCard(card.type)}
              title={card.disabledReason || card.name}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                card.count > 0
                  ? `${card.badgeColor} ${isUsable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'opacity-80'}`
                  : 'bg-gray-900/50 border-gray-800 text-gray-600 opacity-40 cursor-not-allowed'
              }`}
            >
              {card.icon}
              <span>{card.shortName}:</span>
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[11px] font-mono font-black">
                {card.count}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#0c231a]/95 via-[#06140e] to-black/95 border-2 border-emerald-500/30 shadow-xl backdrop-blur-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
        <div className="flex items-center gap-2.5">
          {teamInfo?.logo && (
            <div className="w-6 h-6 rounded-md bg-white p-0.5 flex items-center justify-center shrink-0">
              <img src={teamInfo.logo} alt={teamInfo.name} className="w-full h-full object-contain" />
            </div>
          )}
          <span className="text-xs uppercase font-black tracking-widest text-emerald-300">
            Cartas de Ação • {teamInfo?.name || team}
          </span>
        </div>

        {/* Bonus Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm"
          title="Cada carta não utilizada ao término da gincana adiciona +15 pontos no placar final!"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Bônus não-uso:</span>
          <span className="font-mono font-black text-amber-200">+{potentialBonus} pts</span>
          <span className="text-[10px] text-amber-400/80">({totalUnused} un.)</span>
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cardsConfig.map((card) => {
          const isUsable = interactive && card.canUse;
          const isAvailable = card.count > 0;

          return (
            <div
              key={card.type}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border-2 transition-all ${
                isAvailable
                  ? `bg-gradient-to-b ${card.bgGradient} ${card.borderColor} shadow-md`
                  : 'bg-black/40 border-gray-800/80 opacity-40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-black/50 border border-white/10">
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                      {card.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium leading-tight">
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Available Counter Badge */}
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-black font-mono border ${
                    isAvailable
                      ? `${card.badgeColor} shadow-sm`
                      : 'bg-gray-800 text-gray-500 border-gray-700'
                  }`}
                >
                  {card.count}x
                </span>
              </div>

              {/* Action Trigger Button if Interactive */}
              {interactive && (
                <div className="mt-2">
                  <button
                    type="button"
                    disabled={!isUsable}
                    onClick={() => onUseCard && onUseCard(card.type)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      isUsable
                        ? 'bg-gradient-to-r from-emerald-600 to-[#006341] hover:from-emerald-500 hover:to-emerald-700 text-white shadow-lg shadow-emerald-950/50 active:scale-95 cursor-pointer border border-emerald-400/60'
                        : 'bg-gray-900 text-gray-500 border border-gray-800 cursor-not-allowed'
                    }`}
                  >
                    {isUsable ? (
                      <>Usar Carta Agora</>
                    ) : (
                      <span>{card.disabledReason || 'Indisponível'}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
