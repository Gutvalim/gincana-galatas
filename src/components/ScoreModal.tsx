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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-900" />
              Lançamento de Pontos
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pergunta #{question.id} • {question.categoria} (Valor: {fullPts} pts)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Skip Notification Banner if question was skipped */}
        {isQuestionSkipped && (
          <div className="p-3.5 rounded-2xl bg-orange-50 border-2 border-orange-300 text-orange-950 flex items-center justify-between gap-3 shadow-sm animate-pulse">
            <div className="flex items-center gap-2.5">
              <FastForward className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider block text-orange-900">
                  Carta Pular Pergunta Ativada!
                </span>
                <span className="text-[11px] text-orange-700">
                  {activeTeam ? activeTeam.name : 'A equipe'} pulou esta pergunta.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-200 border border-orange-300 text-[10px] font-black uppercase text-orange-900 shrink-0">
              Pulada
            </span>
          </div>
        )}

        {/* Section: Active Team Answer Evaluation */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              🎤 Equipe no Microfone:
            </span>

            {activeTeam ? (
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-white shadow-sm"
                style={{ backgroundColor: activeTeam.color }}
              >
                <TeamIcon icon={activeTeam.icon} className="w-3.5 h-3.5" />
                {activeTeam.name}
              </span>
            ) : (
              <span className="text-xs text-amber-600 italic">
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
                    ? 'opacity-30 border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    : drawnCorrect
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md scale-[1.02] cursor-pointer'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 cursor-pointer'
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
                    ? 'bg-red-600 border-red-500 text-white shadow-md scale-[1.02] cursor-pointer'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 cursor-pointer'
                }`}
              >
                <X className="w-5 h-5" />
                {isQuestionSkipped ? 'Pulou (0 pts)' : 'Errou (0 pts)'}
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500">
              Defina a equipe antes de pontuar.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-3">
          {canSkip && onTriggerSkip ? (
            <button
              type="button"
              onClick={onTriggerSkip}
              className="px-3.5 py-2.5 rounded-xl border border-orange-300 text-orange-900 bg-orange-50 hover:bg-orange-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FastForward className="w-4 h-4 text-orange-600" />
              Acionar Carta Pular
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
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
