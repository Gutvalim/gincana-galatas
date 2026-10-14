import React, { useState } from 'react';
import type { TeamId, TeamInfo, Question } from '../types/game';
import { getTeam, ROUNDS_INFO, FIXED_QUESTION_POINTS } from '../types/game';
import { TeamIcon } from './TeamIcon';
import { Check, X, Award, FastForward } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  question: Question;
  round?: number;
  drawnTeam: TeamId | null;
  teams?: TeamInfo[];
  initialDrawnCorrect?: boolean;
  isQuestionSkipped?: boolean;
  canSkip?: boolean;
  onTriggerSkip?: () => void;
  onClose: () => void;
  onConfirm: (drawnCorrect: boolean, paperCorrectTeams: TeamId[]) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  question,
  round,
  drawnTeam,
  teams,
  initialDrawnCorrect = true,
  isQuestionSkipped = false,
  canSkip = false,
  onTriggerSkip,
  onClose,
  onConfirm,
}) => {
  const [drawnCorrect, setDrawnCorrect] = useState<boolean>(!isQuestionSkipped && initialDrawnCorrect);

  React.useEffect(() => {
    if (isOpen) {
      setDrawnCorrect(isQuestionSkipped ? false : initialDrawnCorrect);
    }
  }, [isOpen, initialDrawnCorrect, isQuestionSkipped]);

  if (!isOpen) return null;

  const currentRoundNum = round ?? question.rodada;
  const roundInfo = ROUNDS_INFO[currentRoundNum];
  const fullPts = roundInfo?.pointsFull ?? question.pontosCheios ?? FIXED_QUESTION_POINTS;

  const activeTeam = drawnTeam ? getTeam(drawnTeam, teams) : null;

  const handleConfirm = () => {
    onConfirm(drawnCorrect, []);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0c231a] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1d5740] pb-4">
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Lançamento de Pontos
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              Pergunta #{question.id} • {question.categoria} (Valor: {fullPts} pts)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Skip Notification Banner if question was skipped */}
        {isQuestionSkipped && (
          <div className="p-3.5 rounded-2xl bg-orange-950/80 border-2 border-orange-500/80 text-orange-200 flex items-center justify-between gap-3 shadow-lg animate-pulse">
            <div className="flex items-center gap-2.5">
              <FastForward className="w-5 h-5 text-orange-400 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider block text-orange-100">
                  Carta Pular Pergunta Ativada!
                </span>
                <span className="text-[11px] text-orange-300">
                  {activeTeam ? activeTeam.name : 'A equipe'} pulou esta pergunta.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/50 text-[10px] font-black uppercase text-orange-300 shrink-0">
              Pulada
            </span>
          </div>
        )}

        {/* Section: Active Team Answer Evaluation */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              🎤 Equipe no Microfone:
            </span>

            {activeTeam ? (
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-white shadow"
                style={{ backgroundColor: activeTeam.color }}
              >
                <TeamIcon icon={activeTeam.icon} className="w-3.5 h-3.5" />
                {activeTeam.name}
              </span>
            ) : (
              <span className="text-xs text-amber-400 italic">
                Nenhuma equipe definida
              </span>
            )}
          </div>

          {activeTeam ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isQuestionSkipped}
                onClick={() => setDrawnCorrect(true)}
                className={`py-4 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 border-2 transition-all ${
                  isQuestionSkipped
                    ? 'opacity-30 border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed'
                    : drawnCorrect
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02] cursor-pointer'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-800 cursor-pointer'
                }`}
              >
                <Check className="w-5 h-5" />
                Acertou (+{fullPts} pts)
              </button>

              <button
                type="button"
                onClick={() => setDrawnCorrect(false)}
                className={`py-4 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 border-2 transition-all ${
                  !drawnCorrect
                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-[1.02] cursor-pointer'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-800 cursor-pointer'
                }`}
              >
                <X className="w-5 h-5" />
                {isQuestionSkipped ? 'Pulou (0 pts)' : 'Errou (0 pts)'}
              </button>
            </div>
          ) : (
            <div className="p-3 bg-gray-800/40 rounded-xl text-center text-xs text-gray-400">
              Defina a equipe antes de pontuar.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1d5740] gap-3">
          {canSkip && onTriggerSkip ? (
            <button
              type="button"
              onClick={onTriggerSkip}
              className="px-3.5 py-2.5 rounded-xl border border-orange-500/60 text-orange-300 bg-orange-950/40 hover:bg-orange-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FastForward className="w-4 h-4 text-orange-400" />
              Acionar Carta Pular
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Confirmar e Avançar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
