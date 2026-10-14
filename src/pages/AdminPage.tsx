import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { GameStage, ActionCardType } from '../types/game';
import { getTeam, ROUNDS_INFO, FIXED_QUESTION_POINTS } from '../types/game';
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
  Compass,
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Undo2,
  XCircle,
  Users,
  Shuffle,
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
    selectRound,
    selectQuestion,
    drawNextRandomQuestion,
    updateTeams,
    resetGameToStart,
    toggleSound,
    useActionCard,
  } = useGame();

  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [scoreModalInitialCorrect, setScoreModalInitialCorrect] = useState<boolean>(true);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState<boolean>(false);

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
    { key: 'question', label: 'Pergunta', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'timer', label: 'Cronômetro (30s)', icon: <Clock className="w-4 h-4" /> },
    { key: 'reveal', label: 'Revelação', icon: <Eye className="w-4 h-4" /> },
    { key: 'leaderboard', label: 'Placar', icon: <Trophy className="w-4 h-4" /> },
    { key: 'podium', label: 'Pódio Final', icon: <Award className="w-4 h-4" /> },
    { key: 'roulette', label: 'Roleta', icon: <Compass className="w-4 h-4" /> },
    { key: 'sudden_death', label: 'Desempate', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const roundInfo = ROUNDS_INFO[state.currentRound] || ROUNDS_INFO[1];
  const activeTeam = getTeam(state.drawnTeam, state.teams);

  return (
    <div className="min-h-screen bg-[#06140e] text-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-6 py-4 bg-[#0c231a] border-b border-[#1d5740] flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#006341]/40 flex items-center justify-center p-1 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0">
            <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black uppercase tracking-wider text-white">
                Mesa de Controle Admin • Federação de UMPs
              </h1>
              {isConnected ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Telão Conectado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Canal Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Gincana Bíblica - Livro de Gálatas (ARA)
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTeamSetupOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border border-emerald-400/40 shadow-md transition-all cursor-pointer"
            title="Adicionar ou editar equipes e ícones participantes"
          >
            <Users className="w-4 h-4" />
            Configurar Equipes ({state.teams.length})
          </button>

          <button
            onClick={handleOpenTelao}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#006341] to-emerald-600 hover:from-[#007a50] hover:to-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border border-emerald-400/40 shadow-[0_0_20px_rgba(0,99,65,0.5)] transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Telão
          </button>

          <button
            onClick={toggleSound}
            title="Alternar Áudio"
            className="p-2 rounded-xl bg-[#133829] hover:bg-[#1a4a37] text-gray-300 transition-colors border border-[#1d5740] cursor-pointer"
          >
            {state.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Zerar Jogo
          </button>
        </div>
      </header>

      {/* AUTOMATIC WORKFLOW CONTROL PANEL */}
      <div className="bg-gradient-to-r from-[#0d2a1f] via-[#091f16] to-[#0d2a1f] border-b-2 border-emerald-400/60 px-6 py-4 shadow-2xl relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Current Status Info */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border-2 border-emerald-400/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 px-2.5 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/30">
                  {roundInfo.name}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs font-bold text-gray-300">
                  Etapa no Telão: <strong className="text-white uppercase">{stages.find((s) => s.key === state.stage)?.label || state.stage}</strong>
                </span>
                {state.drawnTeam && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black text-white shadow"
                    style={{ backgroundColor: activeTeam.color }}
                  >
                    <TeamIcon icon={activeTeam.icon} className="w-3.5 h-3.5" />
                    🎤 {activeTeam.name}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
                <span>{stepInfo.actionDescription}</span>
              </p>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={undoLastAction}
              disabled={!canUndo}
              title="Desfazer a última ação e restaurar o estado e pontos anteriores"
              className="px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[#133829] hover:bg-[#1a4a37] text-gray-200 border-[#1d5740] shadow-sm active:scale-95"
            >
              <Undo2 className="w-4 h-4 text-amber-400" />
              <span>Desfazer {historyCount > 0 && `(${historyCount})`}</span>
            </button>

            <button
              onClick={handleAdvanceStep}
              disabled={!stepInfo.canAdvance}
              className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 border-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 hover:from-emerald-400 hover:to-green-300 text-black border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{stepInfo.label}</span>
              <ArrowRight className="w-5 h-5 text-black stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* STAGE STEPPER BAR (MANUAL OVERRIDE) */}
      <div className="bg-[#0c231a]/90 border-b border-[#1d5740] px-6 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2 shrink-0">
          Atalhos de Etapa:
        </span>
        {stages.map((st) => {
          const isActive = state.stage === st.key;
          return (
            <button
              key={st.key}
              onClick={() => setStage(st.key)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                  : 'bg-[#133829] text-gray-300 hover:bg-[#1c4d38] hover:text-white border border-[#1d5740]'
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
          {/* ROUND SELECTOR & METADATA BAR */}
          <div className="p-4 rounded-2xl bg-[#0c231a] border border-[#1d5740] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                Fase / Capítulo:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((r) => (
                  <button
                    key={r}
                    onClick={() => selectRound(r)}
                    className={`px-2.5 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                      state.currentRound === r
                        ? 'bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)] scale-105'
                        : 'bg-[#133829] text-gray-300 hover:bg-[#1a4a37] hover:text-white border border-[#1d5740]'
                    }`}
                  >
                    R{r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-300">
                {roundInfo.name} • Valor:{' '}
                <strong className="text-amber-400">{FIXED_QUESTION_POINTS} pts</strong>
              </span>
            </div>
          </div>

          {/* MAIN CONTROL DECK: QUESTION PREVIEW & GABARITO */}
          {currentQuestion && (
            <div className="p-6 rounded-3xl bg-[#0c231a] border-2 border-emerald-500/40 shadow-xl flex flex-col gap-5">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d5740] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#006341]/40 text-emerald-300 border border-emerald-500/40">
                    Pergunta #{currentQuestion.id} de {questions.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#133829] text-gray-300 border border-[#1d5740]">
                    {currentQuestion.categoria}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({currentQuestion.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'})
                  </span>
                </div>

                {/* Sorteio / Random Question / Navigator buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={drawNextRandomQuestion}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Sortear outra pergunta aleatória sem repetir as já usadas"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                    Sortear Outra Pergunta
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentQuestion.id <= 1}
                      onClick={() => selectQuestion(currentQuestion.id - 1)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 cursor-pointer"
                      title="Pergunta anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={currentQuestion.id >= questions.length}
                      onClick={() => selectQuestion(currentQuestion.id + 1)}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 cursor-pointer"
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
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Enunciado Oficial:
                </span>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-1 leading-snug">
                  {currentQuestion.pergunta}
                </p>
              </div>

              {/* Multiple Choice Options List with Interactive Selection */}
              {currentQuestion.tipo === 'multipla_escolha' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Clique na alternativa respondida pelo líder da equipe:
                    </span>
                    {state.selectedOptionIndex !== null && (
                      <button
                        onClick={() => preselectOption(null)}
                        className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
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
                        'border-gray-800 bg-gray-900/70 text-gray-300 hover:border-emerald-400/60 hover:bg-gray-800/80';
                      let letterStyle = 'bg-gray-800 text-emerald-400';

                      if (isEliminated) {
                        cardStyle =
                          'border-dashed border-gray-800 bg-gray-950/40 text-gray-600 line-through opacity-30 pointer-events-none filter grayscale';
                        letterStyle = 'bg-gray-900 text-gray-700';
                      } else if (isSelected) {
                        cardStyle =
                          'border-amber-400 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-2 ring-amber-400 scale-[1.01]';
                        letterStyle = 'bg-amber-400 text-black font-black';
                      } else if (state.answerStatus === 'correct' && isCorrect) {
                        cardStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold';
                        letterStyle = 'bg-emerald-500 text-black font-black';
                      } else if (state.answerStatus === 'wrong' && isSelected) {
                        cardStyle = 'border-red-500 bg-red-950/70 text-red-200';
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
                            <span className="leading-snug">{op}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isEliminated && (
                              <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/90 px-2 py-0.5 rounded border border-purple-500/50">
                                50/50 Eliminada
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/50">
                                Gabarito
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40 animate-pulse">
                                Marcada
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Confirmation Action Bar when an option is selected */}
                  {state.selectedOptionIndex !== null && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d2a1f] to-[#071a13] border-2 border-emerald-400/80 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                          Opção marcada:
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-400 text-black font-black text-xs">
                          {['A', 'B', 'C', 'D'][state.selectedOptionIndex]}: {currentQuestion.opcoes[state.selectedOptionIndex]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            confirmOptionAnswer(state.selectedOptionIndex!);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Confirmar Resposta no Telão
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DISSERTATIVE EVALUATION ACTION BAR */}
              {currentQuestion.tipo === 'dissertativa' && (
                <div className="p-4 rounded-2xl bg-[#071a13] border-2 border-[#1d5740] flex flex-col gap-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Avaliação do Líder (Mesa Julgadora):
                    </span>
                    {state.answerStatus !== 'idle' && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                          state.answerStatus === 'correct'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {state.answerStatus === 'correct' ? 'Avaliação: Acertou (+10 pts)' : 'Avaliação: Errou (0 pts)'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => evaluateDissertativeAnswer(false)}
                      className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                        state.answerStatus === 'wrong'
                          ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                          : 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/60 hover:border-red-600'
                      }`}
                      title="Marcar que a equipe errou no microfone"
                    >
                      <XCircle className="w-4 h-4 text-red-400" />
                      Resposta Incorreta (0 pts)
                    </button>

                    <button
                      type="button"
                      onClick={() => evaluateDissertativeAnswer(true)}
                      className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                        state.answerStatus === 'correct'
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                          : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-600'
                      }`}
                      title="Marcar que a equipe acertou no microfone (+10 pts)"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Resposta Correta (+10 pts)
                    </button>
                  </div>
                </div>
              )}

              {/* GABARITO & BIBLICAL TEXT BOX */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Resposta Esperada Oficial:
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {currentQuestion.versiculo}
                  </span>
                </div>
                <p className="text-lg font-black text-white">
                  "{currentQuestion.respostaCorreta}"
                </p>
                {currentQuestion.textoBiblico && (
                  <p className="text-xs italic text-gray-300 font-serif border-l-2 border-emerald-500 pl-3 mt-1">
                    "{currentQuestion.textoBiblico}"
                  </p>
                )}
              </div>

              {/* TIMER & REVEAL ACTION ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                {/* 30s Timer Controls Block */}
                <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Tempo de Resposta (30s):
                    </span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        state.timerSeconds <= 10 && state.timerSeconds > 0
                          ? 'text-red-400 animate-pulse'
                          : 'text-cyan-400'
                      }`}
                    >
                      {state.timerSeconds}s
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={startTimer}
                      className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs uppercase flex items-center justify-center gap-1 text-white shadow transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      30s
                    </button>
                    <button
                      onClick={pauseTimer}
                      className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-xs uppercase flex items-center justify-center gap-1 text-black shadow transition-all cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pausar
                    </button>
                    <button
                      onClick={add15Seconds}
                      className="py-2.5 px-2 rounded-xl bg-[#006341] hover:bg-[#00875a] font-black text-xs uppercase flex items-center justify-center gap-1 text-white border border-emerald-400/40 shadow transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      +15s
                    </button>
                    <button
                      onClick={resetTimer}
                      className="py-2.5 px-2 rounded-xl bg-[#133829] hover:bg-[#1a4a37] font-bold text-xs uppercase flex items-center justify-center gap-1 text-gray-200 border border-[#1d5740] shadow transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Zerar
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col gap-2.5 justify-center">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleReveal()}
                      className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        state.isRevealed
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                          : 'bg-[#133829] border-[#1d5740] text-gray-200 hover:bg-[#1c4d38]'
                      }`}
                    >
                      {state.isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {state.isRevealed ? 'Ocultar Gabarito' : 'Revelar Gabarito'}
                    </button>

                    <button
                      onClick={() => startRouletteSpin()}
                      disabled={state.isSpinning}
                      className="py-3 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-40"
                    >
                      <Compass className="w-4 h-4" />
                      Girar Roleta
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setScoreModalInitialCorrect(true);
                      setIsScoreModalOpen(true);
                    }}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                  >
                    <Award className="w-5 h-5" />
                    Lançar Pontos / Confirmar Turno
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: REAL-TIME LEADERBOARD & TEAM STATUS */}
        <div className="flex flex-col gap-5">
          {/* Active Team Card */}
          <div className="p-4 rounded-2xl bg-[#0c231a] border border-[#1d5740]">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-2">
              Equipe da Vez no Microfone:
            </span>
            {state.drawnTeam ? (
              <div
                className="p-3 rounded-xl border-2 shadow flex items-center justify-between"
                style={{
                  borderColor: activeTeam.color,
                  backgroundColor: `${activeTeam.color}25`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-md"
                    style={{
                      backgroundColor: `${activeTeam.color}30`,
                      borderColor: activeTeam.color,
                      color: activeTeam.color,
                    }}
                  >
                    <TeamIcon icon={activeTeam.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-300 block font-medium">
                      Vez de Responder:
                    </span>
                    <span
                      className="text-xl font-black uppercase"
                      style={{ color: activeTeam.color }}
                    >
                      {activeTeam.name}
                    </span>
                  </div>
                </div>
                <Radio className="w-6 h-6 text-white animate-pulse" />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#06140e] border border-[#1d5740] text-center text-xs text-gray-400 italic">
                Nenhuma equipe definida no momento.
              </div>
            )}

            {/* Turn order indicator */}
            <div className="mt-3">
              <span className="text-[11px] text-gray-400 block mb-1 font-bold">
                Ordem oficial de apresentação:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {state.teamOrder.map((tId, idx) => {
                  const t = getTeam(tId, state.teams);
                  const isTurn = state.drawnTeam === tId;
                  return (
                    <span
                      key={tId}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm border transition-all ${
                        isTurn ? 'ring-2 ring-white scale-105' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: t.color, borderColor: `${t.color}80` }}
                    >
                      <TeamIcon icon={t.icon} className="w-3.5 h-3.5" />
                      {idx + 1}º {t.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Compact Leaderboard */}
          <div className="p-4 rounded-2xl bg-[#0c231a] border border-[#1d5740]">
            <div className="flex items-center justify-between mb-3 border-b border-[#1d5740] pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Placar Geral em Tempo Real
              </span>
              <span className="text-[10px] text-gray-400 font-bold">
                Edição Manual Habilitada
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
          <div className="p-4 rounded-2xl bg-[#0c231a] border border-[#1d5740] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Questionário Gálatas (1 a {questions.length}):
              </span>
              <span className="text-[10px] text-gray-400">
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
                        ? 'border-emerald-400 bg-[#006341]/60 text-white font-bold shadow'
                        : isUsed
                        ? 'border-transparent bg-[#06140e]/40 text-gray-500 line-through'
                        : 'border-transparent bg-[#06140e]/70 text-gray-300 hover:bg-[#133829] hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">
                      #{q.id}. {q.pergunta}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 shrink-0">
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

      {/* TEAM SETUP MODAL */}
      <TeamSetupModal
        isOpen={isTeamSetupOpen}
        currentTeams={state.teams}
        onClose={() => setIsTeamSetupOpen(false)}
        onSaveTeams={(newTeams, resetScores) => updateTeams(newTeams, resetScores)}
      />

      {/* CONFIRM RESET MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111827] border-2 border-red-500/60 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-xl font-black uppercase text-white">
                Zerar toda a Gincana?
              </h3>
            </div>
            <p className="text-sm text-gray-300">
              Esta ação redefinirá todas as pontuações para zero e restaurará o estado inicial tanto aqui quanto no Telão.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetGameToStart();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase shadow cursor-pointer"
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
