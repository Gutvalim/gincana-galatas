import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { GameStage } from '../types/game';
import { TEAMS, ROUNDS_INFO } from '../types/game';
import { ScoreModal } from '../components/ScoreModal';
import { Leaderboard } from '../components/Leaderboard';
import { CardSelectionView } from '../components/CardSelectionView';
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
  Flame,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Layers,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    state,
    currentQuestion,
    questions,
    isConnected,
    setStage,
    startRouletteSpin,
    startTimer,
    pauseTimer,
    add15Seconds,
    resetTimer,
    toggleReveal,
    submitQuestionScore,
    emergencyScoreAdjust,
    selectRound,
    selectQuestion,
    selectCardQuestion,
    resetGameToStart,
    toggleSound,
  } = useGame();

  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Open Telão in new tab/window
  const handleOpenTelao = () => {
    window.open('/telao', '_blank');
  };

  const stages: { key: GameStage; label: string; icon: React.ReactNode }[] = [
    { key: 'welcome', label: 'Início', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'rules', label: 'Regras', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'leaderboard', label: 'Placar', icon: <Trophy className="w-4 h-4" /> },
    { key: 'splash', label: 'Splash Rodada', icon: <Flame className="w-4 h-4" /> },
    { key: 'roulette', label: 'Roleta', icon: <Compass className="w-4 h-4" /> },
    { key: 'card_selection', label: 'Escolha Cards', icon: <Layers className="w-4 h-4" /> },
    { key: 'question', label: 'Pergunta', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'timer', label: 'Cronômetro', icon: <Clock className="w-4 h-4" /> },
    { key: 'reveal', label: 'Revelação', icon: <Eye className="w-4 h-4" /> },
    { key: 'podium', label: 'Pódio Final', icon: <Award className="w-4 h-4" /> },
    { key: 'sudden_death', label: 'Morte Súbita', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const roundInfo = ROUNDS_INFO[state.currentRound] || ROUNDS_INFO[1];

  return (
    <div className="min-h-screen bg-[#06140e] text-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-6 py-4 bg-[#0c231a] border-b border-[#1d5740] flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006341]/30 flex items-center justify-center p-1 border border-amber-400/40 shadow-[0_0_15px_rgba(0,99,65,0.6)]">
            <img src="/logo.png" alt="IPBNB" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black uppercase tracking-wider text-white">
                Mesa de Controle Admin
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
              Gincana Gálatas • IPBNB
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenTelao}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#006341] to-emerald-600 hover:from-[#007a50] hover:to-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border border-emerald-400/40 shadow-[0_0_20px_rgba(0,99,65,0.5)] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Telão em Nova Janela
          </button>

          <button
            onClick={toggleSound}
            title="Alternar Áudio"
            className="p-2 rounded-xl bg-[#133829] hover:bg-[#1a4a37] text-gray-300 transition-colors border border-[#1d5740]"
          >
            {state.soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Zerar Jogo
          </button>
        </div>
      </header>

      {/* STAGE STEPPER BAR */}
      <div className="bg-[#0c231a]/90 border-b border-[#1d5740] px-6 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 mr-2 shrink-0">
          Etapa no Telão:
        </span>
        {stages.map((st) => {
          const isActive = state.stage === st.key;
          return (
            <button
              key={st.key}
              onClick={() => setStage(st.key)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
                isActive
                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.6)]'
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
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                Rodada:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map((r) => (
                  <button
                    key={r}
                    onClick={() => selectRound(r)}
                    className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                      state.currentRound === r
                        ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-105'
                        : 'bg-[#133829] text-gray-300 hover:bg-[#1a4a37] hover:text-white border border-[#1d5740]'
                    }`}
                  >
                    {r === 7 ? 'MS' : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-300">
                {roundInfo.name} • Microfone:{' '}
                <strong className="text-amber-400">{roundInfo.pointsFull}p</strong> | Papel:{' '}
                <strong className="text-purple-400">{roundInfo.pointsHalf}p</strong>
              </span>
            </div>
          </div>

          {/* CARD SELECTION VIEW (WHEN IN CARD_SELECTION STAGE) */}
          {state.stage === 'card_selection' && (
            <div className="p-4 rounded-3xl bg-[#0c231a] border-2 border-[#1d5740] shadow-xl">
              <CardSelectionView
                round={state.currentRound}
                questionsInRound={questions.filter((q) => q.rodada === state.currentRound)}
                usedQuestionIds={state.usedQuestionIdsInRound}
                drawnTeam={state.drawnTeam}
                selectedCardIndex={state.selectedCardIndex}
                isCardFlipping={state.isCardFlipping}
                onSelectCard={selectCardQuestion}
                interactive={true}
              />
            </div>
          )}

          {/* MAIN CONTROL DECK: QUESTION PREVIEW & GABARITO */}
          {currentQuestion && (
            <div className="p-6 rounded-3xl bg-[#0c231a] border-2 border-emerald-500/40 shadow-xl flex flex-col gap-5">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d5740] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#006341]/40 text-emerald-300 border border-emerald-500/40">
                    Pergunta #{currentQuestion.id} de 43
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#133829] text-gray-300 border border-[#1d5740]">
                    {currentQuestion.categoria}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({currentQuestion.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : 'Dissertativa'})
                  </span>
                </div>

                {/* Quick Prev / Next Question buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentQuestion.id <= 1}
                    onClick={() => selectQuestion(currentQuestion.id - 1)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300"
                    title="Pergunta anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentQuestion.id >= questions.length}
                    onClick={() => selectQuestion(currentQuestion.id + 1)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300"
                    title="Próxima pergunta"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Enunciado:
                </span>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-1 leading-snug">
                  {currentQuestion.pergunta}
                </p>
              </div>

              {/* Multiple Choice Options List */}
              {currentQuestion.tipo === 'multipla_escolha' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion.opcoes.map((op, idx) => {
                    const isCorrect =
                      op.trim().toLowerCase() === currentQuestion.respostaCorreta.trim().toLowerCase();
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-sm flex items-center justify-between ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold'
                            : 'border-gray-800 bg-gray-900/60 text-gray-400'
                        }`}
                      >
                        <span>
                          <strong className="mr-2 text-cyan-400">
                            {['A', 'B', 'C', 'D'][idx] || idx + 1}:
                          </strong>
                          {op}
                        </span>
                        {isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* JURADO GABARITO & BIBLICAL TEXT BOX (OFFICIAL ANSWER) */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Gabarito Oficial (Mesa Julgadora):
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {currentQuestion.versiculo}
                  </span>
                </div>
                <p className="text-lg font-black text-white">
                  {currentQuestion.respostaCorreta}
                </p>
                {currentQuestion.textoBiblico && (
                  <p className="text-xs italic text-gray-300 font-serif border-l-2 border-emerald-500 pl-3 mt-1">
                    "{currentQuestion.textoBiblico}"
                  </p>
                )}
              </div>

              {/* TIMER & ROULETTE ACTION ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                {/* Timer Controls Block */}
                <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Cronômetro (60s):
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
                      className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs uppercase flex items-center justify-center gap-1 text-white shadow transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      60s
                    </button>
                    <button
                      onClick={pauseTimer}
                      className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-xs uppercase flex items-center justify-center gap-1 text-black shadow transition-all"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pausar
                    </button>
                    <button
                      onClick={add15Seconds}
                      className="py-2.5 px-2 rounded-xl bg-[#006341] hover:bg-[#00875a] font-black text-xs uppercase flex items-center justify-center gap-1 text-white border border-emerald-400/40 shadow transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      +15s
                    </button>
                    <button
                      onClick={resetTimer}
                      className="py-2.5 px-2 rounded-xl bg-[#133829] hover:bg-[#1a4a37] font-bold text-xs uppercase flex items-center justify-center gap-1 text-gray-200 border border-[#1d5740] shadow transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Zerar
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col gap-2.5 justify-center">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Spin Roulette */}
                    <button
                      onClick={() => startRouletteSpin()}
                      className="py-3 px-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all"
                    >
                      <Compass className="w-4 h-4" />
                      Girar Roleta
                    </button>

                    {/* Toggle Reveal */}
                    <button
                      onClick={() => toggleReveal()}
                      className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                        state.isRevealed
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                          : 'bg-[#133829] border-[#1d5740] text-gray-200 hover:bg-[#1c4d38]'
                      }`}
                    >
                      {state.isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {state.isRevealed ? 'Ocultar Gabarito' : 'Revelar Gabarito'}
                    </button>
                  </div>

                  {/* Open Score Modal */}
                  <button
                    onClick={() => setIsScoreModalOpen(true)}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm sm:text-base uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all"
                  >
                    <Award className="w-5 h-5" />
                    Lançar Pontos da Pergunta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: REAL-TIME LEADERBOARD & EMERGENCY ADJUSTMENTS (1 COL) */}
        <div className="flex flex-col gap-5">
          {/* Currently Drawn Team Widget */}
          <div className="p-4 rounded-2xl bg-[#0c231a] border border-[#1d5740]">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2">
              Sorteio da Rodada Atual:
            </span>
            {state.drawnTeam ? (
              <div
                className="p-3 rounded-xl border-2 shadow flex items-center justify-between"
                style={{
                  borderColor: TEAMS[state.drawnTeam].color,
                  backgroundColor: `${TEAMS[state.drawnTeam].color}25`,
                }}
              >
                <div className="flex items-center gap-3">
                  {TEAMS[state.drawnTeam].logo && (
                    <img
                      src={TEAMS[state.drawnTeam].logo}
                      alt={TEAMS[state.drawnTeam].name}
                      className="w-9 h-9 object-contain shrink-0"
                    />
                  )}
                  <div>
                    <span className="text-xs text-gray-300 block">Equipe no Microfone:</span>
                    <span
                      className="text-xl font-black uppercase"
                      style={{ color: TEAMS[state.drawnTeam].color }}
                    >
                      {TEAMS[state.drawnTeam].name}
                    </span>
                  </div>
                </div>
                <Radio className="w-6 h-6 text-white animate-pulse" />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#06140e] border border-[#1d5740] text-center text-xs text-gray-400 italic">
                Nenhuma equipe sorteada no momento.
              </div>
            )}

            {/* Remaining teams in round */}
            <div className="mt-3">
              <span className="text-[11px] text-gray-400 block mb-1">
                Restam sortear nesta rodada:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {state.teamsAvailableInRound.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: TEAMS[t].color }}
                  >
                    {TEAMS[t].logo && (
                      <img src={TEAMS[t].logo} alt={t} className="w-3 h-3 object-contain" />
                    )}
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard with Emergency +5 / -5 buttons */}
          <div className="p-4 rounded-2xl bg-[#0c231a] border border-[#1d5740] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Placar ao Vivo (Ajuste Rápido)
              </h3>
            </div>
            <p className="text-[11px] text-gray-400">
              Use os botões <span className="text-red-400 font-bold">-5</span> e{' '}
              <span className="text-emerald-400 font-bold">+5</span> para eventuais correções manuais instantâneas.
            </p>

            <Leaderboard
              scores={state.scores}
              compact={true}
              highlightTeam={state.drawnTeam}
              onEmergencyAdjust={emergencyScoreAdjust}
            />
          </div>

          {/* Question List Navigator */}
          <div className="p-4 rounded-2xl bg-[#0c231a] border border-[#1d5740] flex flex-col gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              Navegador de Perguntas (1 a 43):
            </span>
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {questions.map((q) => {
                const isSelected = q.id === state.currentQuestionId;
                return (
                  <button
                    key={q.id}
                    onClick={() => selectQuestion(q.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-[#006341]/40 text-white font-bold shadow'
                        : 'border-transparent bg-[#06140e]/60 text-gray-400 hover:bg-[#133829] hover:text-gray-200'
                    }`}
                  >
                    <span className="truncate pr-2">
                      #{q.id}. {q.pergunta}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0">
                      R{q.rodada} ({q.pontosCheios}p)
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
          drawnTeam={state.drawnTeam}
          onClose={() => setIsScoreModalOpen(false)}
          onConfirm={(drawnCorrect, paperCorrectTeams) => {
            submitQuestionScore(drawnCorrect, paperCorrectTeams);
            setIsScoreModalOpen(false);
          }}
        />
      )}

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
              Esta ação redefinirá todas as pontuações para zero, voltará para a Rodada 1 e restaurará o estado inicial tanto aqui quanto no Telão.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetGameToStart();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase shadow"
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
