import React, { useState } from 'react';
import type { TeamId, Question } from '../types/game';
import { TEAMS, ALL_TEAM_IDS } from '../types/game';
import { Check, X, Award, FileText, CheckSquare, Square } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  question: Question;
  drawnTeam: TeamId | null;
  initialDrawnCorrect?: boolean;
  onClose: () => void;
  onConfirm: (drawnCorrect: boolean, paperCorrectTeams: TeamId[]) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  question,
  drawnTeam,
  initialDrawnCorrect = true,
  onClose,
  onConfirm,
}) => {
  const [drawnCorrect, setDrawnCorrect] = useState<boolean>(initialDrawnCorrect);
  const [paperCorrectTeams, setPaperCorrectTeams] = useState<TeamId[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setDrawnCorrect(initialDrawnCorrect);
      setPaperCorrectTeams([]);
    }
  }, [isOpen, initialDrawnCorrect]);

  if (!isOpen) return null;

  const fullPts = question.pontosCheios;
  const halfPts = question.pontosMeios;

  // Teams other than the drawn team that responded on paper
  const otherTeams = ALL_TEAM_IDS.filter((t) => t !== drawnTeam);

  const togglePaperTeam = (t: TeamId) => {
    setPaperCorrectTeams((prev) =>
      prev.includes(t) ? prev.filter((id) => id !== t) : [...prev, t]
    );
  };

  const handleConfirm = () => {
    // A pontuação no papel só é creditada se a equipe do microfone errar
    const finalPaperTeams = drawnCorrect ? [] : paperCorrectTeams;
    onConfirm(drawnCorrect, finalPaperTeams);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0c231a] border-2 border-[#1d5740] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,99,65,0.5)] flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1d5740] pb-4">
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Lançamento de Pontos
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              Pergunta #{question.id} • {question.categoria} (Microfone: {fullPts} pts | Papel: {halfPts} pts)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Section 1: Drawn Team (Microphone) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              🎤 Equipe no Microfone:
            </span>
            {drawnTeam ? (
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black text-white shadow"
                style={{ backgroundColor: TEAMS[drawnTeam].color }}
              >
                {TEAMS[drawnTeam].logo && (
                  <img src={TEAMS[drawnTeam].logo} alt={TEAMS[drawnTeam].name} className="w-4 h-4 object-contain" />
                )}
                {TEAMS[drawnTeam].name} ({TEAMS[drawnTeam].fullName})
              </span>
            ) : (
              <span className="text-xs text-amber-400 italic">
                Nenhuma equipe sorteada
              </span>
            )}
          </div>

          {drawnTeam ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDrawnCorrect(true)}
                className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 border-2 transition-all ${
                  drawnCorrect
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Check className="w-5 h-5" />
                Acertou (+{fullPts} pts)
              </button>

              <button
                type="button"
                onClick={() => setDrawnCorrect(false)}
                className={`py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 border-2 transition-all ${
                  !drawnCorrect
                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-[1.02]'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <X className="w-5 h-5" />
                Errou (0 pts)
              </button>
            </div>
          ) : (
            <div className="p-3 bg-gray-800/40 rounded-xl text-center text-xs text-gray-400">
              Sorteie uma equipe na roleta antes de pontuar no microfone.
            </div>
          )}
        </div>

        {/* Section 2: Other 4 Teams on Paper */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              Respostas no Papel das Outras Equipes:
            </span>
            <span className="text-[11px] font-bold text-gray-400">
              Valor: <strong className="text-purple-300">+{halfPts} pts</strong>
            </span>
          </div>

          {/* Conditional Guidance Banner */}
          {drawnCorrect ? (
            <div className="p-3.5 rounded-2xl bg-[#133829] border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 shadow-sm">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block font-black uppercase text-[11px]">
                  Equipe acertou no microfone!
                </strong>
                <span className="text-gray-300 text-[11px]">
                  Conforme o regulamento, as respostas no papel <strong>só são avaliadas e pontuadas em caso de erro</strong> da equipe que estava respondendo. Nenhuma pontuação no papel será creditada.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
              <FileText className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-amber-300 block font-black uppercase text-[11px]">
                  Equipe errou no microfone!
                </strong>
                <span className="text-gray-200 text-[11px]">
                  Avalie agora as respostas no papel das outras 4 equipes. Marque quem acertou para receber <strong>+{halfPts} pontos</strong>:
                </span>
              </div>
            </div>
          )}

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 transition-opacity ${
              drawnCorrect ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}
          >
            {otherTeams.map((teamId) => {
              const team = TEAMS[teamId];
              const isChecked = paperCorrectTeams.includes(teamId);

              return (
                <button
                  type="button"
                  key={teamId}
                  disabled={drawnCorrect}
                  onClick={() => togglePaperTeam(teamId)}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                    isChecked && !drawnCorrect
                      ? 'border-purple-400 bg-purple-950/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'border-gray-800 bg-[#1f2937]/70 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                    ) : (
                      <span
                        className="w-3 h-3 rounded-full shadow"
                        style={{ backgroundColor: team.color }}
                      />
                    )}
                    <span className="font-bold text-sm text-gray-200">
                      {team.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-300">
                      +{halfPts} pts
                    </span>
                    {isChecked && !drawnCorrect ? (
                      <CheckSquare className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#1d5740]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-[#1d5740] bg-[#133829] hover:bg-[#1c4d38] text-gray-300 font-bold text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#006341] to-emerald-600 hover:from-[#007a50] hover:to-emerald-500 text-white font-black text-sm sm:text-base uppercase tracking-wider border border-emerald-400/40 shadow-[0_0_25px_rgba(0,99,65,0.6)] transition-all"
          >
            {drawnCorrect
              ? `Confirmar (+${fullPts} pts para ${drawnTeam ? TEAMS[drawnTeam].name : 'Equipe'})`
              : `Confirmar (${paperCorrectTeams.length} acertos no papel: +${paperCorrectTeams.length * halfPts} pts)`}
          </button>
        </div>
      </div>
    </div>
  );
};
