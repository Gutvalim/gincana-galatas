import React, { useState } from 'react';
import type { TeamInfo } from '../types/game';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../types/game';
import { TeamIcon } from './TeamIcon';
import {
  Users,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Shuffle,
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
    if (index === 0) return;
    setTeams((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= teams.length - 1) return;
    setTeams((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleAddTeam = () => {
    const nextNum = teams.length + 1;
    const colorIndex = (nextNum - 1) % AVAILABLE_COLORS.length;
    const iconIndex = (nextNum - 1) % AVAILABLE_ICONS.length;
    const newTeam: TeamInfo = {
      id: `ump_${Date.now()}`,
      name: `UMP Equipe ${nextNum}`,
      fullName: `União de Mocidade - Equipe ${nextNum}`,
      color: AVAILABLE_COLORS[colorIndex],
      icon: AVAILABLE_ICONS[iconIndex],
      logo: '/logo_ump.webp',
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) {
      alert('É necessário ter ao menos 2 equipes para a gincana!');
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const handleShuffleOrder = () => {
    setTeams((prev) => {
      const shuffled = [...prev].sort(() => 0.5 - Math.random());
      return shuffled;
    });
  };

  const handleSave = () => {
    if (teams.length < 2) {
      alert('Adicione pelo menos 2 equipes!');
      return;
    }
    onSaveTeams(teams, resetScores);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#0c231a] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1d5740] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                Configurar Equipes Participantes
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                Defina os nomes, ícones e a ordem oficial de apresentação para a Federação de UMPs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#081c13] p-3 rounded-2xl border border-[#1d5740]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleOrder}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-black uppercase flex items-center gap-2 transition-all shadow-sm"
              title="Sortear a ordem das equipes aleatoriamente"
            >
              <Shuffle className="w-4 h-4 text-amber-400" />
              Sortear Ordem das Equipes
            </button>
            <button
              onClick={handleAddTeam}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black uppercase flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Adicionar Equipe
            </button>
          </div>
          <span className="text-xs font-bold text-gray-400">
            Total: <span className="text-emerald-400">{teams.length}</span> equipes
          </span>
        </div>

        {/* Teams List */}
        <div className="flex flex-col gap-3">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="p-3.5 rounded-2xl bg-[#081c13] border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all shadow-md"
              style={{ borderColor: `${team.color}60` }}
            >
              {/* Left: Position & Icon & Name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-black shrink-0 shadow"
                  style={{ backgroundColor: team.color }}
                >
                  {idx + 1}º
                </span>

                {/* Team Icon Button (Click to open picker) */}
                <button
                  onClick={() =>
                    setActiveIconPickerTeamId(
                      activeIconPickerTeamId === team.id ? null : team.id
                    )
                  }
                  className="w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-transform hover:scale-105 shrink-0 shadow relative cursor-pointer"
                  style={{
                    backgroundColor: `${team.color}25`,
                    borderColor: team.color,
                    color: team.color,
                  }}
                  title="Clique para trocar o ícone da equipe"
                >
                  <TeamIcon icon={team.icon} className="w-6 h-6" />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-[8px] text-white">
                    ✎
                  </span>
                </button>

                {/* Team Name Input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => handleNameChange(team.id, e.target.value)}
                    placeholder="Nome da Equipe (ex: UMP Central)"
                    className="w-full bg-[#0c231a] border border-[#1d5740] rounded-xl px-3 py-1.5 text-sm sm:text-base font-black text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Right: Color Selection & Order Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {/* Palette quick buttons */}
                <div className="flex items-center gap-1 bg-[#0c231a] p-1.5 rounded-xl border border-[#1d5740]">
                  {AVAILABLE_COLORS.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColorChange(team.id, c)}
                      className={`w-5 h-5 rounded-lg transition-transform ${
                        team.color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                      title={`Cor ${c}`}
                    />
                  ))}
                  {/* Native color picker */}
                  <input
                    type="color"
                    value={team.color}
                    onChange={(e) => handleColorChange(team.id, e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                    title="Escolher outra cor"
                  />
                </div>

                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-[#0c231a] hover:bg-[#163829] text-gray-300 disabled:opacity-30 disabled:pointer-events-none border border-[#1d5740]"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === teams.length - 1}
                    className="p-1.5 rounded-lg bg-[#0c231a] hover:bg-[#163829] text-gray-300 disabled:opacity-30 disabled:pointer-events-none border border-[#1d5740]"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove Team */}
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40"
                  title="Remover Equipe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Collapsible Icon Picker Grid for this Team */}
              {activeIconPickerTeamId === team.id && (
                <div className="w-full mt-2 pt-3 border-t border-white/10 grid grid-cols-4 sm:grid-cols-8 gap-2 bg-[#0c231a] p-3 rounded-2xl">
                  <span className="col-span-full text-xs font-bold text-gray-300 mb-1">
                    Escolha um ícone para <span className="text-white font-black">{team.name}</span>:
                  </span>
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      onClick={() => handleIconChange(team.id, iconName)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                        team.icon === iconName
                          ? 'border-emerald-400 bg-emerald-500/25 text-white scale-105 shadow-md'
                          : 'border-white/10 hover:border-white/30 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <TeamIcon icon={iconName} className="w-5 h-5" />
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {iconName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reset Option Warning */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-200">
              <span className="font-bold block text-white">Resetar pontuações das equipes?</span>
              Marque se estiver iniciando uma nova gincana do zero com essas equipes.
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={resetScores}
              onChange={(e) => setResetScores(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-amber-300">Zerar Placar</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1d5740]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
          >
            <Check className="w-5 h-5" />
            Salvar e Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
