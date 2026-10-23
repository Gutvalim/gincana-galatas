import React, { useState } from 'react';
import type { TeamInfo } from '../types/game';
import { AVAILABLE_ICONS, AVAILABLE_COLORS, DEFAULT_TEAMS } from '../types/game';
import { TeamIcon } from './TeamIcon';
import {
  Users,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Shuffle,
  RotateCcw,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';

interface TeamSetupModalProps {
  isOpen: boolean;
  currentTeams: TeamInfo[];
  onClose: () => void;
  onSaveTeams: (newTeams: TeamInfo[], resetScores: boolean) => void;
}

export const TeamSetupModal: React.FC<TeamSetupModalProps> = ({
  isOpen,
  currentTeams,
  onClose,
  onSaveTeams,
}) => {
  const [teams, setTeams] = useState<TeamInfo[]>(() =>
    currentTeams.length > 0 ? JSON.parse(JSON.stringify(currentTeams)) : []
  );
  const [resetScores, setResetScores] = useState<boolean>(false);
  const [activeIconPickerTeamId, setActiveIconPickerTeamId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTeams(currentTeams.length > 0 ? JSON.parse(JSON.stringify(currentTeams)) : []);
      setActiveIconPickerTeamId(null);
    }
  }, [isOpen, currentTeams]);

  if (!isOpen) return null;

  const handleNameChange = (id: string, name: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    );
  };

  const handleColorChange = (id: string, color: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, color } : t))
    );
  };

  const handleIconChange = (id: string, icon: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, icon } : t))
    );
    setActiveIconPickerTeamId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setTeams((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= teams.length - 1) return;
    setTeams((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) {
      alert('A gincana precisa de pelo menos 2 equipes participantes!');
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTeam = () => {
    const nextIdx = teams.length + 1;
    const randomColor = AVAILABLE_COLORS[(nextIdx - 1) % AVAILABLE_COLORS.length];
    const randomIcon = AVAILABLE_ICONS[(nextIdx - 1) % AVAILABLE_ICONS.length];

    const newTeam: TeamInfo = {
      id: `ump_custom_${Date.now()}`,
      name: `UMP Equipe ${nextIdx}`,
      fullName: `União de Mocidade Presbiteriana - Equipe ${nextIdx}`,
      color: randomColor,
      icon: randomIcon,
      logo: '/logo_ump.webp',
    };

    setTeams((prev) => [...prev, newTeam]);
  };

  const handleShuffleOrder = () => {
    setTeams((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const handleSave = () => {
    onSaveTeams(teams, resetScores);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 shrink-0 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                Configurar Equipes Participantes
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Defina os nomes, ícones e a ordem oficial de apresentação para a Federação de UMPs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setTeams(JSON.parse(JSON.stringify(DEFAULT_TEAMS)))}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs sm:text-sm font-black uppercase flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Restaurar a lista oficial das 10 UMPs participantes"
            >
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              Restaurar 10 UMPs
            </button>
            <button
              onClick={handleShuffleOrder}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs sm:text-sm font-black uppercase flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Sortear a ordem das equipes aleatoriamente"
            >
              <Shuffle className="w-4 h-4 text-blue-700" />
              Embaralhar Ordem
            </button>
            <button
              onClick={handleAddTeam}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-black uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Equipe
            </button>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Total: <span className="text-blue-900 font-black">{teams.length}</span> equipes
          </span>
        </div>

        {/* Teams List */}
        <div className="flex flex-col gap-3.5">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="p-4 rounded-2xl bg-slate-50 border-2 flex flex-col gap-3 transition-all shadow-sm"
              style={{ borderColor: `${team.color}70` }}
            >
              {/* Main Team Info Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                {/* Left: Position & Icon & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: team.color }}
                  >
                    #{idx + 1}
                  </span>

                  {/* Team Icon Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIconPickerTeamId(
                        activeIconPickerTeamId === team.id ? null : team.id
                      )
                    }
                    className="w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all hover:scale-105 shrink-0 shadow-sm relative cursor-pointer text-white"
                    style={{
                      backgroundColor: team.color,
                      borderColor: team.color,
                    }}
                    title="Clique para trocar o ícone desta equipe"
                  >
                    <TeamIcon icon={team.icon} className="w-6 h-6" />
                  </button>

                  {/* Team Name Input */}
                  <div className="flex-1 min-w-[140px]">
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => handleNameChange(team.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-700 px-3.5 py-2 rounded-xl font-black text-slate-900 text-sm outline-none transition-colors shadow-inner"
                      placeholder="Nome da Equipe"
                    />
                  </div>
                </div>

                {/* Right: Color Picker & Order Controls */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  {/* Color swatches */}
                  <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
                    {AVAILABLE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleColorChange(team.id, c)}
                        className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                          team.color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                        title={`Cor ${c}`}
                      />
                    ))}
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none border border-slate-300 cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === teams.length - 1}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none border border-slate-300 cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Team */}
                  <button
                    type="button"
                    onClick={() => handleRemoveTeam(team.id)}
                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 cursor-pointer"
                    title="Remover Equipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Full-width Icon Picker Grid for this Team */}
              {activeIconPickerTeamId === team.id && (
                <div className="w-full mt-1 pt-3 border-t border-slate-200 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600">
                      Escolha um ícone para <strong className="text-slate-900">{team.name}</strong>:
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIconPickerTeamId(null)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Fechar
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {AVAILABLE_ICONS.map((iconName) => {
                      const isSelected = team.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleIconChange(team.id, iconName)}
                          className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-sm scale-105 ring-2 ring-blue-400/40'
                              : 'border-slate-200 hover:border-slate-400 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <TeamIcon icon={iconName} className="w-6 h-6" />
                          <span className="text-[10px] font-bold truncate w-full text-center">
                            {iconName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reset Option Warning */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold block text-slate-900">Resetar pontuações das equipes?</span>
              Marque se estiver iniciando uma nova gincana do zero com essas equipes.
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={resetScores}
              onChange={(e) => setResetScores(e.target.checked)}
              className="w-4 h-4 accent-blue-900 rounded"
            />
            <span className="text-xs font-bold text-slate-900">Zerar Placar</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Check className="w-5 h-5" />
            Salvar e Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
