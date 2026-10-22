import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { GameStage, ActionCardType } from '../types/game';
import { getTeam, FIXED_QUESTION_POINTS } from '../types/game';
import { ScoreModal } from '../components/ScoreModal';
import { Leaderboard } from '../components/Leaderboard';
import { ActionCardsHUD } from '../components/ActionCardsHUD';
import { TeamSetupModal } from '../components/TeamSetupModal';
import { TeamIcon } from '../components/TeamIcon';
import {
  ExternalLink,
  Play,
  Pause,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  Award,
  BookOpen,
  CheckCircle2,
  Trophy,
  Volume2,
  VolumeX,
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Undo2,
  XCircle,
  X,
  Users,
  Shuffle,
  HelpCircle,
  Search,
  AlertCircle,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    state,
    currentQuestion,
    questions,
    isConnected,
    canUndo,
    historyCount,
    setStage,
    advanceGameStep,
    undoLastAction,
    getNextStepInfo,
    totalRounds,
    checkpoint1,
    checkpoint2,
    teamFailedAndStartSteal,
    confirmStealWinner,
    setRuleIndex,
    nextRule,
    prevRule,
    resetTeamOrder,
    startRouletteSpin,
    startTimer,
    pauseTimer,
    add15Seconds,
    resetTimer,
    toggleReveal,
    preselectOption,
    confirmOptionAnswer,
    evaluateDissertativeAnswer,
    submitQuestionScore,
    setTeamScore,
    selectQuestion,
    drawNextRandomQuestion,
    updateTeams,
    resetGameToStart,
    toggleSound,
    useActionCard,
  } = useGame();

  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [isStealModalOpen, setIsStealModalOpen] = useState<boolean>(false);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState<number>(12);
  const [scoreModalInitialCorrect, setScoreModalInitialCorrect] = useState<boolean>(true);
  const [operatorSearchQuery, setOperatorSearchQuery] = useState<string>('');
  const [operatorSearchError, setOperatorSearchError] = useState<string | null>(null);

  const handleOperatorSelectNumber = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(operatorSearchQuery.trim(), 10);
    if (isNaN(num) || num < 1 || num > 60) {
      setOperatorSearchError('Digite um número válido de 1 a 60.');
      return;
    }
    if (state.usedQuestionIdsTotal?.includes(num)) {
      setOperatorSearchError(`A pergunta #${num} já foi respondida! Escolha outra.`);
      return;
    }
    setOperatorSearchError(null);
    setOperatorSearchQuery('');
    selectQuestion(num);
  };

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState<boolean>(false);

  useEffect(() => {
    if (state.stage === 'question' && state.autoStartEndTimestamp && !state.isTimerRunning) {
      const updateGrace = () => {
        const left = Math.max(0, Math.ceil((state.autoStartEndTimestamp! - Date.now()) / 1000));
        setGraceSecondsLeft(left);
      };
      updateGrace();
      const interval = setInterval(updateGrace, 500);
      return () => clearInterval(interval);
    }
  }, [state.stage, state.autoStartEndTimestamp, state.isTimerRunning]);

  const handleUseActionCard = (cardType: ActionCardType) => {
    useActionCard(cardType);
  };

  const handleAdvanceStep = () => {
    advanceGameStep();
  };

  const stepInfo = getNextStepInfo();

  const handleOpenTelao = () => {
    window.open('/telao', '_blank');
  };

  const stages: { key: GameStage; label: string; icon: React.ReactNode }[] = [
    { key: 'welcome', label: 'Início', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'rules', label: 'Regras', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'roulette', label: 'Roleta (Ordem)', icon: <Shuffle className="w-4 h-4" /> },
    { key: 'card_selection', label: 'Escolha (1-60)', icon: <HelpCircle className="w-4 h-4" /> },
    { key: 'splash', label: 'Fase/Splash', icon: <Award className="w-4 h-4" /> },
    { key: 'question', label: 'Pergunta', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'timer', label: 'Cronômetro (60s)', icon: <Clock className="w-4 h-4" /> },
    { key: 'reveal', label: 'Revelação', icon: <Eye className="w-4 h-4" /> },
    { key: 'leaderboard', label: 'Placar', icon: <Trophy className="w-4 h-4" /> },
    { key: 'podium', label: 'Pódio Final', icon: <Award className="w-4 h-4" /> },
  ];

  const activeTeam = getTeam(state.drawnTeam, state.teams);
  const drawnOrder = state.teamOrder || [];
  const totalTeams = state.teams.length;
  const isOrderComplete = drawnOrder.length >= totalTeams;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none">
      {/* HEADER */}
      <header className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 p-1 border-2 border-blue-900/15 shadow-sm flex items-center justify-center shrink-0">
            <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
                Painel do Operador • Federação de UMPs
              </h1>
              {isConnected ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Telão Sincronizado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Conectando...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Gincana Gálatas (ARA) • Modo Mesa de Apresentação
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTeamSetupOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-slate-300 transition-all cursor-pointer shadow-sm"
            title="Configurar equipes participantes, cores e ícones"
          >
            <Users className="w-4 h-4 text-blue-900" />
            Equipes ({state.teams.length})
          </button>

          <button
            onClick={handleOpenTelao}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Telão
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              state.soundEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={state.soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          >
            {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
            title="Zerar toda a gincana"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* INTELLIGENT STEPPER BAR */}
      <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-200/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 block">
                Fluxo Inteligente da Vez:
              </span>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>{stepInfo.actionDescription}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={undoLastAction}
              disabled={!canUndo}
              title="Desfazer a última ação"
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm"
            >
              <Undo2 className="w-4 h-4 text-amber-600" />
              <span>Desfazer {historyCount > 0 && `(${historyCount})`}</span>
            </button>

            <button
              onClick={handleAdvanceStep}
              disabled={!stepInfo.canAdvance}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 text-white shadow-md"
            >
              <span>{stepInfo.label}</span>
              <ArrowRight className="w-4 h-4 text-white stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* STAGE STEPPER BAR (MANUAL OVERRIDE) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 shrink-0">
          Etapa Atual:
        </span>
        {stages.map((st) => {
          const isActive = state.stage === st.key;
          return (
            <button
              key={st.key}
              onClick={() => setStage(st.key)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st.icon}
              {st.label}
            </button>
          );
        })}
      </div>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT & CENTER: ACTIVE CONTROL CONSOLE (2 COLS) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* STAGE-SPECIFIC CONSOLE: RULES DECK */}
          {state.stage === 'rules' && (
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-slate-900">
                      Apresentador de Regras (Slide a Slide)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Controle os slides de regulamento no telão para o público.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  Slide {(state.currentRuleIndex ?? 0) + 1} de 6
                </span>
              </div>

              {/* Slide Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  '1. Sorteio na Roleta',
                  '2. 10 Pts Gálatas',
                  '3. Cronômetro 30s',
                  '4. Líder no Microfone',
                  '5. Cartas de Ação',
                  '6. Bônus no Pódio',
                ].map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRuleIndex(idx)}
                    className={`p-3 rounded-xl text-xs font-black uppercase text-left transition-all border cursor-pointer ${
                      (state.currentRuleIndex ?? 0) === idx
                        ? 'border-blue-900 bg-blue-900 text-white shadow-md'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-3">
                <button
                  disabled={(state.currentRuleIndex ?? 0) <= 0}
                  onClick={prevRule}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase disabled:opacity-30 cursor-pointer"
                >
                  ◀ Regra Anterior
                </button>

                <div className="flex items-center gap-2">
                  <button
                    disabled={(state.currentRuleIndex ?? 0) >= 5}
                    onClick={nextRule}
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase shadow disabled:opacity-30 cursor-pointer"
                  >
                    Próxima Regra ▶
                  </button>

                  <button
                    onClick={() => setStage('roulette')}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Shuffle className="w-4 h-4" />
                    Ir para Sorteio da Roleta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE-SPECIFIC CONSOLE: ROULETTE / TEAM ORDER DRAW */}
          {state.stage === 'roulette' && (
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-slate-900">
                      Sorteio da Ordem das Equipes (Roleta)
                    </h3>
                    <p className="text-xs text-slate-500">
                      As equipes acompanham o sorteio da ordem de participação ao vivo no telão.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {drawnOrder.length} de {totalTeams} Sorteadas
                </span>
              </div>

              {/* Progress and status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Sequência Oficial de Apresentação:
                  </span>
                  <button
                    onClick={resetTeamOrder}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reiniciar Sorteio da Ordem
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {state.teams.map((t) => {
                    const isDrawn = drawnOrder.includes(t.id);
                    const positionIndex = drawnOrder.indexOf(t.id);

                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border flex items-center gap-2 ${
                          isDrawn
                            ? 'border-blue-700 bg-blue-50/80 shadow-sm'
                            : 'border-dashed border-slate-300 bg-white opacity-60'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shrink-0"
                          style={{ backgroundColor: t.color }}
                        >
                          <TeamIcon icon={t.icon} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 block truncate">
                            {t.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {isDrawn ? `#${positionIndex + 1} Lugar` : 'Aguardando'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {!isOrderComplete ? (
                  <button
                    onClick={() => startRouletteSpin()}
                    disabled={state.isSpinning}
                    className="flex-1 py-4 px-6 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 cursor-pointer"
                  >
                    <Shuffle className="w-5 h-5 text-amber-400" />
                    {state.isSpinning
                      ? 'Girando Roleta no Telão...'
                      : `Girar Roleta para Sortear ${drawnOrder.length + 1}º Lugar`}
                  </button>
                ) : (
                  <button
                    onClick={advanceGameStep}
                    className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Play className="w-5 h-5 text-white fill-current" />
                    Iniciar 1ª Rodada com {getTeam(drawnOrder[0], state.teams).name}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STAGE-SPECIFIC CONSOLE: CARD SELECTION (1 A 60) */}
          {state.stage === 'card_selection' && (
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex flex-col gap-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-slate-900">
                      Mesa de Escolha de Perguntas (1 a 60)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Digite o número solicitado pela equipe no microfone ou clique diretamente no card dourado.
                    </p>
                  </div>
                </div>

                <button
                  onClick={drawNextRandomQuestion}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-black uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Shuffle className="w-4 h-4" />
                  Sortear Aleatória
                </button>
              </div>

              {/* OPERATOR SEARCH BAR */}
              <form onSubmit={handleOperatorSelectNumber} className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
                <div className="flex items-center gap-2 text-amber-950 font-black uppercase text-xs shrink-0">
                  <Search className="w-4 h-4 text-amber-700" />
                  <span>Selecionar Número:</span>
                </div>
                <div className="flex-1 flex items-center gap-2 w-full">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={operatorSearchQuery}
                    onChange={(e) => {
                      setOperatorSearchQuery(e.target.value);
                      setOperatorSearchError(null);
                    }}
                    placeholder="Digite o número (1 a 60)... Ex: 38"
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-400 bg-white text-slate-900 font-black text-base focus:outline-none focus:ring-4 focus:ring-amber-400/30 placeholder:text-slate-400 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md border border-yellow-300 transition-all transform active:scale-95 cursor-pointer shrink-0"
                  >
                    Abrir Pergunta
                  </button>
                </div>
              </form>

              {operatorSearchError && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/90 border border-red-300 px-3 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{operatorSearchError}</span>
                </div>
              )}

              {activeTeam && (
                <div
                  className="p-3.5 rounded-2xl border-2 flex items-center justify-between"
                  style={{ borderColor: activeTeam.color, backgroundColor: `${activeTeam.color}15` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: activeTeam.color }}
                    >
                      <TeamIcon icon={activeTeam.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block font-bold">Vez de Escolher:</span>
                      <span className="text-lg font-black uppercase tracking-wide" style={{ color: activeTeam.color }}>
                        {activeTeam.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
                    {60 - (state.usedQuestionIdsTotal?.length || 0)} disponíveis
                  </span>
                </div>
              )}

              {/* 1 to 60 Pure Numbers Grid (Gold = Available, Faded Gray = Used) */}
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 max-h-[360px] overflow-y-auto p-2 scrollbar-thin bg-slate-100/80 rounded-2xl border-2 border-slate-200 shadow-inner">
                {questions.map((q) => {
                  const isUsed = state.usedQuestionIdsTotal?.includes(q.id);
                  const formatted = q.id < 10 ? `0${q.id}` : `${q.id}`;
                  return (
                    <button
                      key={q.id}
                      disabled={isUsed}
                      onClick={() => selectQuestion(q.id)}
                      title={isUsed ? `Pergunta #${q.id} (Já Respondida)` : `Pergunta #${q.id} (Disponível)`}
                      className={`relative rounded-xl h-12 sm:h-14 flex items-center justify-center text-center select-none transition-all ${
                        isUsed
                          ? 'bg-slate-200/50 border border-slate-300/40 text-slate-400/50 font-black font-mono text-lg line-through opacity-25 cursor-not-allowed shadow-none'
                          : 'cursor-pointer bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] border border-yellow-200 shadow-[0_3px_10px_rgba(245,158,11,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:shadow-[0_5px_18px_rgba(245,158,11,0.8)] hover:scale-105 active:scale-95 text-slate-950 font-black font-mono text-xl sm:text-2xl'
                      }`}
                    >
                      <span>{formatted}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ROUND PROGRESS & METADATA BAR */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-black uppercase text-blue-900 tracking-wider">
                Andamento da Gincana:
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-900 text-white font-black text-sm shadow-sm">
                Rodada {state.currentRound} de {totalRounds}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span>(Placares parciais:</span>
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-black">R{checkpoint1} (1/3)</span>
                <span>e</span>
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-black">R{checkpoint2} (2/3)</span>
                <span>)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">
                Perguntas de Gálatas • Valor por Acerto:{' '}
                <strong className="text-blue-900 font-black">{FIXED_QUESTION_POINTS} pts</strong>
              </span>
            </div>
          </div>

          {/* AUTO-START 12S READING GRACE PERIOD BANNER */}
          {state.stage === 'question' && state.autoStartEndTimestamp && !state.isTimerRunning && !state.isStealActive && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-700 animate-spin" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950 block">
                    Leitura da Pergunta pelo Apresentador (12s)
                  </span>
                  <span className="text-xs text-amber-800 font-medium">
                    O cronômetro oficial de 60s iniciará automaticamente em <strong>{graceSecondsLeft}s</strong>.
                  </span>
                </div>
              </div>
              <button
                onClick={startTimer}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
              >
                Iniciar Agora (60s)
              </button>
            </div>
          )}

          {/* STEAL / REPASSE MODE BANNER */}
          {state.isStealActive && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 shadow-md flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <span className="text-sm font-black uppercase tracking-wider text-red-900 block">
                    Modo Repasse Ativo (30s) — A 1ª Equipe Errou!
                  </span>
                  <span className="text-xs text-red-700 font-medium">
                    O gabarito está oculto no telão. Qualquer equipe adversária pode responder agora no microfone.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleReveal(true);
                  setIsStealModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Eye className="w-4 h-4" />
                Revelar Gabarito e Pontuar
              </button>
            </div>
          )}

          {/* MAIN CONTROL DECK: QUESTION PREVIEW & GABARITO */}
          {currentQuestion && (
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-lg flex flex-col gap-5">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-900 text-white">
                    Pergunta #{currentQuestion.id} de {questions.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {currentQuestion.categoria}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ({currentQuestion.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'})
                  </span>
                </div>

                {/* Sorteio / Random Question / Navigator buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={drawNextRandomQuestion}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-black uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Sortear outra pergunta aleatória sem repetir as já usadas"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-blue-900" />
                    Sortear Outra Pergunta
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentQuestion.id <= 1}
                      onClick={() => selectQuestion(currentQuestion.id - 1)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer border border-slate-200"
                      title="Pergunta anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={currentQuestion.id >= questions.length}
                      onClick={() => selectQuestion(currentQuestion.id + 1)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer border border-slate-200"
                      title="Próxima pergunta"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Cards HUD for Active Team */}
              {state.drawnTeam && (
                <div className="animate-fadeIn">
                  <ActionCardsHUD
                    team={state.drawnTeam}
                    teams={state.teams}
                    inventory={state.actionCards?.[state.drawnTeam]}
                    interactive={true}
                    onUseCard={handleUseActionCard}
                    isMultipleChoice={currentQuestion.tipo === 'multipla_escolha'}
                    isFiftyFiftyUsed={(state.eliminatedOptionIndices?.length ?? 0) > 0}
                    isQuestionSkipped={state.isQuestionSkipped}
                    skipsUsedInRound={state.skipsUsedInRound || 0}
                  />
                </div>
              )}

              {/* Question Text */}
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Enunciado Oficial:
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug font-display">
                  {currentQuestion.pergunta}
                </p>
              </div>

              {/* Multiple Choice Options List with Interactive Selection */}
              {currentQuestion.tipo === 'multipla_escolha' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      Clique na alternativa respondida pelo líder da equipe:
                    </span>
                    {state.selectedOptionIndex !== null && (
                      <button
                        onClick={() => preselectOption(null)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Desmarcar opção
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQuestion.opcoes.map((op, idx) => {
                      const isCorrect =
                        op.trim().toLowerCase() === currentQuestion.respostaCorreta.trim().toLowerCase();
                      const isSelected = state.selectedOptionIndex === idx;
                      const isEliminated = state.eliminatedOptionIndices?.includes(idx);

                      let cardStyle =
                        'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-400 hover:bg-blue-50/30';
                      let letterStyle = 'bg-slate-200 text-slate-800 font-black';

                      if (isEliminated) {
                        cardStyle =
                          'border-dashed border-slate-300 bg-slate-100 text-slate-400 line-through opacity-30 pointer-events-none filter grayscale';
                        letterStyle = 'bg-slate-200 text-slate-400';
                      } else if (isSelected) {
                        cardStyle =
                          'border-amber-500 bg-amber-50 text-amber-950 shadow-md ring-2 ring-amber-400 scale-[1.01]';
                        letterStyle = 'bg-amber-500 text-white font-black';
                      } else if (state.answerStatus === 'correct' && isCorrect) {
                        cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                        letterStyle = 'bg-emerald-600 text-white font-black';
                      } else if (state.answerStatus === 'wrong' && isSelected) {
                        cardStyle = 'border-red-500 bg-red-50 text-red-950';
                        letterStyle = 'bg-red-600 text-white font-black';
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => !isEliminated && preselectOption(idx)}
                          className={`p-3 rounded-xl border text-sm flex items-center justify-between transition-all ${cardStyle} ${
                            isEliminated ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 pr-2">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${letterStyle}`}
                            >
                              {['A', 'B', 'C', 'D'][idx] || idx + 1}
                            </span>
                            <span className="leading-snug font-bold">{op}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isEliminated && (
                              <span className="text-[10px] uppercase font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                                50/50 Eliminada
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                Gabarito
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-xs font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                Marcada
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Confirmation Action Bar when an option is selected */}
                  {state.selectedOptionIndex !== null && !state.isRevealed && (
                    <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-300 shadow-sm flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-900 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-600 block">
                            Alternativa selecionada pelo operador:
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            Letra {['A', 'B', 'C', 'D'][state.selectedOptionIndex]}: "{currentQuestion.opcoes[state.selectedOptionIndex]}"
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => confirmOptionAnswer(state.selectedOptionIndex!)}
                          className={`px-5 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                            currentQuestion.opcoes[state.selectedOptionIndex].trim().toLowerCase() ===
                            currentQuestion.respostaCorreta.trim().toLowerCase()
                              ? 'bg-emerald-600 hover:bg-emerald-500'
                              : 'bg-red-600 hover:bg-red-500'
                          }`}
                        >
                          {currentQuestion.opcoes[state.selectedOptionIndex].trim().toLowerCase() ===
                          currentQuestion.respostaCorreta.trim().toLowerCase() ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Confirmar Acerto (+10 pts)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Confirmar Erro (Iniciar Repasse 30s)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dedicated Button: Team Erred on Microfone */}
                  {!state.isStealActive && !state.isRevealed && (
                    <button
                      type="button"
                      onClick={teamFailedAndStartSteal}
                      className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 hover:border-red-500 text-red-700 hover:text-red-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      title="Clique se a equipe errou ou o tempo expirou sem resposta"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      Equipe Errou no Microfone (Iniciar Repasse de 30s)
                    </button>
                  )}
                </div>
              )}

              {/* Dissertative Answer Decision Bar */}
              {currentQuestion.tipo === 'dissertativa' && (
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-900" />
                      Avaliação do Apresentador / Comissão Julgadora:
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Decisão imediata no microfone
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => evaluateDissertativeAnswer(false)}
                      className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                        state.answerStatus === 'wrong'
                          ? 'bg-red-600 border-red-500 text-white shadow-md'
                          : 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100'
                      }`}
                      title="Marcar que a equipe errou no microfone (inicia repasse 30s)"
                    >
                      <XCircle className="w-4 h-4" />
                      Incorreta (Iniciar Repasse 30s)
                    </button>

                    <button
                      type="button"
                      onClick={() => evaluateDissertativeAnswer(true)}
                      className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                        state.answerStatus === 'correct'
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      }`}
                      title="Marcar que a equipe acertou no microfone (+10 pts)"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Correta (+10 pts)
                    </button>
                  </div>
                </div>
              )}

              {/* GABARITO & BIBLICAL TEXT BOX */}
              <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-900" />
                    Resposta Esperada Oficial:
                  </span>
                  <span className="text-xs font-bold text-blue-900">
                    {currentQuestion.versiculo} (ARA)
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900">
                  "{currentQuestion.respostaCorreta}"
                </p>
                {currentQuestion.textoBiblico && (
                  <p className="text-xs italic text-slate-700 font-serif border-l-2 border-blue-900 pl-3 mt-1">
                    "{currentQuestion.textoBiblico}"
                  </p>
                )}
              </div>

              {/* TIMER & REVEAL ACTION ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                {/* Timer Controls Block */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-900" />
                      {state.isStealActive ? 'Tempo de Repasse (30s):' : 'Tempo de Resposta (60s):'}
                    </span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        state.timerSeconds <= 10 && state.timerSeconds > 0
                          ? 'text-red-600 animate-pulse'
                          : 'text-blue-900'
                      }`}
                    >
                      {state.timerSeconds}s
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={startTimer}
                      className="py-2.5 px-2 rounded-xl bg-blue-900 hover:bg-blue-800 font-black text-xs uppercase flex items-center justify-center gap-1 text-white shadow transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {state.isStealActive ? '30s' : '60s'}
                    </button>
                    <button
                      onClick={pauseTimer}
                      className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-black text-xs uppercase flex items-center justify-center gap-1 text-white shadow transition-all cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pausar
                    </button>
                    <button
                      onClick={add15Seconds}
                      className="py-2.5 px-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-black text-xs uppercase flex items-center justify-center gap-1 text-slate-800 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      +15s
                    </button>
                    <button
                      onClick={resetTimer}
                      className="py-2.5 px-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs uppercase flex items-center justify-center gap-1 text-slate-800 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Zerar
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col gap-2.5 justify-center">
                  <div className="grid grid-cols-2 gap-2">
                    {state.isStealActive ? (
                      <button
                        onClick={() => {
                          toggleReveal(true);
                          setIsStealModalOpen(true);
                        }}
                        className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        Revelar Gabarito (Repasse)
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleReveal()}
                        className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          state.isRevealed
                            ? 'bg-blue-900 border-blue-800 text-white shadow-sm'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {state.isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {state.isRevealed ? 'Ocultar Gabarito' : 'Revelar Gabarito'}
                      </button>
                    )}

                    <button
                      onClick={() => setStage('roulette')}
                      className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-300 transition-all cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4 text-blue-900" />
                      Ver Roleta
                    </button>
                  </div>

                  {state.isStealActive ? (
                    <button
                      onClick={() => {
                        toggleReveal(true);
                        setIsStealModalOpen(true);
                      }}
                      className="py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer animate-pulse"
                    >
                      <Award className="w-5 h-5" />
                      Definir Pontuação do Repasse
                    </button>
                  ) : state.isRevealed && state.answerStatus === 'correct' ? (
                    <button
                      onClick={() => submitQuestionScore(true)}
                      className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Award className="w-5 h-5" />
                      Avançar para Próxima Pergunta (+10 pts)
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setScoreModalInitialCorrect(true);
                        setIsScoreModalOpen(true);
                      }}
                      className="py-3.5 px-4 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Award className="w-5 h-5" />
                      Lançar Pontos / Confirmar Turno
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: REAL-TIME LEADERBOARD & TEAM STATUS */}
        <div className="flex flex-col gap-5">
          {/* Active Team Card */}
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
              {state.isStealActive ? '🚨 Modo Repasse (Microfone Aberto):' : 'Equipe da Vez no Microfone:'}
            </span>
            {state.isStealActive ? (
              <div className="p-3.5 rounded-xl border-2 border-red-500 bg-red-50 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse shrink-0" />
                <div>
                  <span className="text-xs font-bold text-red-700 block">
                    Microfone liberado para qualquer adversária!
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {activeTeam.name} errou a questão.
                  </span>
                </div>
              </div>
            ) : state.drawnTeam ? (
              <div
                className="p-3.5 rounded-xl border-2 shadow-sm flex items-center justify-between"
                style={{
                  borderColor: activeTeam.color,
                  backgroundColor: `${activeTeam.color}15`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow text-white"
                    style={{
                      backgroundColor: activeTeam.color,
                      borderColor: activeTeam.color,
                    }}
                  >
                    <TeamIcon icon={activeTeam.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block font-bold">
                      Vez de Responder:
                    </span>
                    <span
                      className="text-xl font-black uppercase tracking-wide"
                      style={{ color: activeTeam.color }}
                    >
                      {activeTeam.name}
                    </span>
                  </div>
                </div>
                <Radio className="w-6 h-6 text-red-600 animate-pulse" />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
                Nenhuma equipe definida no momento.
              </div>
            )}

            {/* Turn order indicator */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 block mb-1.5 font-black uppercase tracking-wider">
                Ordem oficial de participação:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {drawnOrder.map((tId, idx) => {
                  const t = getTeam(tId, state.teams);
                  const isTurn = state.drawnTeam === tId;
                  return (
                    <span
                      key={tId}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${
                        isTurn ? 'ring-2 ring-blue-900 scale-105' : 'opacity-85'
                      }`}
                      style={{ backgroundColor: t.color }}
                    >
                      <TeamIcon icon={t.icon} className="w-3.5 h-3.5" />
                      #{idx + 1} {t.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Compact Leaderboard */}
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Placar Geral em Tempo Real
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Edição Manual
              </span>
            </div>

            <Leaderboard
              scores={state.scores}
              teams={state.teams}
              actionCards={state.actionCards}
              compact={true}
              highlightTeam={state.drawnTeam}
              onSetScore={setTeamScore}
            />
          </div>

          {/* Question List Navigator (All 49 questions) */}
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                Questionário Gálatas (1 a {questions.length}):
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                Usadas: {state.usedQuestionIdsTotal?.length || 0}/{questions.length}
              </span>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {questions.map((q) => {
                const isSelected = q.id === state.currentQuestionId;
                const isUsed = state.usedQuestionIdsTotal?.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => selectQuestion(q.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-900 bg-blue-900 text-white font-bold shadow-sm'
                        : isUsed
                        ? 'border-transparent bg-slate-100 text-slate-400 line-through'
                        : 'border-transparent bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate pr-2">
                      #{q.id}. {q.pergunta}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-blue-700 shrink-0">
                      R{q.rodada}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SCORE MODAL */}
      {currentQuestion && (
        <ScoreModal
          isOpen={isScoreModalOpen}
          question={currentQuestion}
          round={state.currentRound}
          drawnTeam={state.drawnTeam}
          initialDrawnCorrect={scoreModalInitialCorrect}
          isQuestionSkipped={state.isQuestionSkipped}
          canSkip={
            state.drawnTeam
              ? (state.actionCards?.[state.drawnTeam]?.skip ?? 0) > 0
              : false
          }
          onTriggerSkip={() => handleUseActionCard('skip')}
          onClose={() => setIsScoreModalOpen(false)}
          onConfirm={(drawnCorrect, paperCorrectTeams) => {
            submitQuestionScore(drawnCorrect, paperCorrectTeams);
            setIsScoreModalOpen(false);
          }}
        />
      )}

      {/* STEAL WINNER SELECTION MODAL */}
      {isStealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-900" />
                  Quem Acertou o Repasse?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Selecione a equipe que respondeu corretamente ao repasse de 30s:
                </p>
              </div>
              <button
                onClick={() => setIsStealModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Remaining teams (excluding the drawn team that failed) */}
            <div className="grid grid-cols-1 gap-2.5">
              {state.teams
                .filter((t) => t.id !== state.drawnTeam)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      confirmStealWinner(t.id);
                      setIsStealModalOpen(false);
                    }}
                    className="p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer hover:scale-[1.02] shadow-sm"
                    style={{
                      borderColor: t.color,
                      backgroundColor: `${t.color}15`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow"
                        style={{ backgroundColor: t.color }}
                      >
                        <TeamIcon icon={t.icon} className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black uppercase tracking-wide block" style={{ color: t.color }}>
                          {t.name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Atual: {state.scores[t.id] || 0} pts
                        </span>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-xl text-xs font-black text-white uppercase shadow"
                      style={{ backgroundColor: t.color }}
                    >
                      +10 Pontos
                    </span>
                  </button>
                ))}

              <button
                onClick={() => {
                  confirmStealWinner(null);
                  setIsStealModalOpen(false);
                }}
                className="p-3.5 rounded-2xl border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer transition-all mt-1"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
                Nenhuma Equipe Acertou (0 pts)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEAM SETUP MODAL */}
      <TeamSetupModal
        isOpen={isTeamSetupOpen}
        currentTeams={state.teams}
        onClose={() => setIsTeamSetupOpen(false)}
        onSaveTeams={(newTeams, resetScores) => updateTeams(newTeams, resetScores)}
      />

      {/* CONFIRM RESET MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border-2 border-red-500 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-xl font-black uppercase text-slate-900">
                Zerar toda a Gincana?
              </h3>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              Esta ação redefinirá todas as pontuações para zero e restaurará o estado inicial tanto aqui quanto no Telão.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetGameToStart();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase shadow cursor-pointer"
              >
                Sim, Zerar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
