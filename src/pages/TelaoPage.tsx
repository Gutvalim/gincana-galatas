import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getTeam } from '../types/game';
import { TeamIcon } from '../components/TeamIcon';
import { Roulette } from '../components/Roulette';
import { CircularTimer } from '../components/CircularTimer';
import { Leaderboard } from '../components/Leaderboard';
import { QuestionView } from '../components/QuestionView';
import { RoundSplash } from '../components/RoundSplash';
import { RulesView } from '../components/RulesView';
import { CardSelectionView } from '../components/CardSelectionView';
import { Podium } from '../components/Podium';
import { ActionCardsHUD } from '../components/ActionCardsHUD';
import { ActionCardActivationOverlay } from '../components/ActionCardActivationOverlay';
import { Play, Maximize, Volume2, VolumeX, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export const TelaoPage: React.FC = () => {
  const {
    state,
    currentQuestion,
    questions,
    totalRounds,
    checkpoint1,
    checkpoint2,
    finishSpin,
    setStage,
    selectQuestion,
    finishCardFlip,
    toggleSound,
    clearLastCardUsed,
  } = useGame();

  const [graceSecondsLeft, setGraceSecondsLeft] = React.useState<number>(12);

  React.useEffect(() => {
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

  // Fullscreen helper
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Keyboard shortcuts (F for fullscreen, M for mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSound]);

  const activeTeamInfo = getTeam(state.drawnTeam, state.teams);
  const remainingTeamsToDraw = React.useMemo(() => {
    return state.teams
      .filter((t) => !(state.teamOrder || []).includes(t.id))
      .map((t) => t.id);
  }, [state.teams, state.teamOrder]);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 text-slate-800 flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none font-sans scrollbar-none">
      {/* Subtle Ambient Background Mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Status Bar (Crisp White with UMP Blue & Red accents) */}
      <header className="relative z-20 px-6 py-2.5 sm:px-8 sm:py-3 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 p-1.5 border-2 border-blue-900/15 shadow-sm flex items-center justify-center shrink-0">
            <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Gincana Gálatas
            </h2>
            <p className="text-[11px] text-blue-900 font-extrabold tracking-wide uppercase">
              Federação de UMPs
            </p>
          </div>
        </div>

        {/* Center Live Badges */}
        <div className="flex items-center gap-3">
          {state.drawnTeam && activeTeamInfo && state.stage !== 'roulette' && (
            state.isStealActive ? (
              <div className="px-4 py-1.5 rounded-full border-2 border-red-500 bg-red-500/15 flex items-center gap-2 shadow-sm animate-pulse text-red-600">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Repasse Liberado (30s)
                </span>
              </div>
            ) : (
              <div
                className="px-4 py-1.5 rounded-full border-2 flex items-center gap-2 shadow-sm animate-pulse"
                style={{
                  borderColor: activeTeamInfo.color,
                  backgroundColor: `${activeTeamInfo.color}15`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
                  style={{ color: activeTeamInfo.color }}
                >
                  <TeamIcon icon={activeTeamInfo.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 uppercase font-bold">Vez de:</span>
                <span
                  className="font-black text-sm uppercase tracking-wider"
                  style={{ color: activeTeamInfo.color }}
                >
                  {activeTeamInfo.name}
                </span>
              </div>
            )
          )}

          <div className="px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-black text-blue-900 uppercase">
            Rodada {state.currentRound} de {totalRounds}
          </div>
        </div>

        {/* Discreet Audio / Fullscreen controls */}
        <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
          <button
            onClick={toggleSound}
            title={state.soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-900 transition-colors border border-slate-200 cursor-pointer"
          >
            {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullScreen}
            title="Alternar Tela Cheia (F)"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-900 transition-colors border border-slate-200 cursor-pointer"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-6xl mx-auto w-full">
        {/* STAGE: WELCOME */}
        {state.stage === 'welcome' && (
          <div className="flex flex-col items-center justify-center text-center animate-fadeIn max-w-3xl">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-white flex items-center justify-center p-4 shadow-xl mb-8 border-4 border-blue-900/10">
              <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain drop-shadow" />
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              União de Mocidade Presbiteriana • Federação de UMPs
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-slate-900 font-display uppercase tracking-tight">
              Gincana Gálatas
            </h1>

            <p className="mt-4 text-xl sm:text-2xl text-red-600 font-extrabold uppercase tracking-widest">
              "Para a liberdade foi que Cristo nos libertou"
            </p>

            <button
              onClick={() => setStage('rules')}
              className="mt-10 px-10 py-5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xl uppercase tracking-widest border-2 border-blue-700 shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current text-amber-400" />
              Apresentar Regras
            </button>
          </div>
        )}

        {/* STAGE: RULES (PRESENTATION SLIDES) */}
        {state.stage === 'rules' && <RulesView currentIndex={state.currentRuleIndex ?? 0} />}

        {/* STAGE: LEADERBOARD */}
        {state.stage === 'leaderboard' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="text-center mb-6">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-blue-900 bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-full shadow-sm">
                {state.currentRound - 1 === checkpoint1
                  ? 'Placar Parcial • 1/3 da Gincana Concluído'
                  : state.currentRound - 1 === checkpoint2
                  ? 'Placar Parcial • 2/3 da Gincana Concluído'
                  : 'Classificação Parcial'}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-display">
                Placar das Equipes
              </h2>
            </div>
            <Leaderboard
              scores={state.scores}
              teams={state.teams}
              actionCards={state.actionCards}
              highlightTeam={state.drawnTeam}
            />
          </div>
        )}

        {/* STAGE: SPLASH ART */}
        {state.stage === 'splash' && <RoundSplash round={state.currentRound} />}

        {/* STAGE: ROULETTE (TEAM ORDER DRAW) */}
        {state.stage === 'roulette' && (
          <div className="w-full flex flex-col items-center justify-center animate-fadeIn">
            <Roulette
              teams={remainingTeamsToDraw}
              teamsList={state.teams}
              drawnOrder={state.teamOrder || []}
              isSpinning={state.isSpinning}
              targetTeam={state.spinningTargetTeam}
              drawnTeam={state.drawnTeam}
              spinSeed={state.spinSeed}
              onFinish={finishSpin}
            />
          </div>
        )}

        {/* STAGE: CARD SELECTION (1 TO 60) */}
        {state.stage === 'card_selection' && (
          <div className="w-full flex flex-col items-center justify-center animate-fadeIn">
            <CardSelectionView
              questions={questions}
              usedQuestionIds={state.usedQuestionIdsTotal || []}
              drawnTeam={state.drawnTeam}
              teams={state.teams}
              currentQuestion={currentQuestion}
              isCardFlipping={state.isCardFlipping}
              selectedCardIndex={state.selectedCardIndex}
              onSelectQuestion={selectQuestion}
              onFinishFlip={finishCardFlip}
              interactive={true}
              round={state.currentRound}
            />
          </div>
        )}

        {/* STAGE: QUESTION */}
        {state.stage === 'question' && currentQuestion && (
          <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
            {state.drawnTeam && (
              <div className="w-full max-w-5xl animate-fadeIn">
                <ActionCardsHUD
                  team={state.drawnTeam}
                  teams={state.teams}
                  inventory={state.actionCards?.[state.drawnTeam]}
                  interactive={false}
                  isMultipleChoice={currentQuestion.tipo === 'multipla_escolha'}
                  isFiftyFiftyUsed={(state.eliminatedOptionIndices?.length ?? 0) > 0}
                  isQuestionSkipped={state.isQuestionSkipped}
                  compact={true}
                  skipsUsedInRound={state.skipsUsedInRound || 0}
                />
              </div>
            )}

            {/* Auto-start reading grace pill */}
            {state.autoStartEndTimestamp && !state.isTimerRunning && (
              <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100 border-2 border-blue-300 text-blue-900 text-xs sm:text-sm font-bold shadow-sm animate-pulse">
                <Clock className="w-4 h-4 text-blue-900 animate-spin" />
                <span>Leitura da Pergunta • Cronômetro de 60s inicia em <strong>{graceSecondsLeft}s</strong></span>
              </div>
            )}

            <QuestionView
              question={currentQuestion}
              round={state.currentRound}
              isRevealed={state.isRevealed}
              drawnTeam={state.drawnTeam}
              teams={state.teams}
              selectedOptionIndex={state.selectedOptionIndex}
              answerStatus={state.answerStatus}
              eliminatedOptionIndices={state.eliminatedOptionIndices}
              activeCardAnnouncement={state.activeCardAnnouncement}
              isQuestionSkipped={state.isQuestionSkipped}
              isStealActive={state.isStealActive}
            />
          </div>
        )}

        {/* STAGE: TIMER */}
        {state.stage === 'timer' && currentQuestion && (
          <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
            {state.drawnTeam && (
              <div className="w-full max-w-5xl animate-fadeIn">
                <ActionCardsHUD
                  team={state.drawnTeam}
                  teams={state.teams}
                  inventory={state.actionCards?.[state.drawnTeam]}
                  interactive={false}
                  isMultipleChoice={currentQuestion.tipo === 'multipla_escolha'}
                  isFiftyFiftyUsed={(state.eliminatedOptionIndices?.length ?? 0) > 0}
                  isQuestionSkipped={state.isQuestionSkipped}
                  compact={true}
                  skipsUsedInRound={state.skipsUsedInRound || 0}
                />
              </div>
            )}

            {/* Steal / Repasse Banner */}
            {state.isStealActive && (
              <div className="w-full max-w-5xl p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl flex items-center justify-center gap-3 text-center animate-bounce">
                <AlertTriangle className="w-6 h-6 text-yellow-300 shrink-0" />
                <span className="text-base sm:text-xl font-black uppercase tracking-wider drop-shadow">
                  🚨 Resposta Incorreta! Repasse Liberado (30s) — Qualquer equipe pode responder!
                </span>
              </div>
            )}

            {/* Circular Timer Display */}
            <div className="my-2">
              <CircularTimer
                seconds={state.timerSeconds}
                maxSeconds={state.timerMaxSeconds || (state.isStealActive ? 30 : 60)}
                isRunning={state.isTimerRunning}
                size={180}
              />
            </div>

            <QuestionView
              question={currentQuestion}
              round={state.currentRound}
              isRevealed={state.isRevealed}
              drawnTeam={state.drawnTeam}
              teams={state.teams}
              selectedOptionIndex={state.selectedOptionIndex}
              answerStatus={state.answerStatus}
              eliminatedOptionIndices={state.eliminatedOptionIndices}
              activeCardAnnouncement={state.activeCardAnnouncement}
              isQuestionSkipped={state.isQuestionSkipped}
              isStealActive={state.isStealActive}
            />
          </div>
        )}

        {/* STAGE: REVEAL */}
        {state.stage === 'reveal' && currentQuestion && (
          <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
            <QuestionView
              question={currentQuestion}
              round={state.currentRound}
              isRevealed={true}
              drawnTeam={state.drawnTeam}
              teams={state.teams}
              selectedOptionIndex={state.selectedOptionIndex}
              answerStatus={state.answerStatus}
              eliminatedOptionIndices={state.eliminatedOptionIndices}
              activeCardAnnouncement={state.activeCardAnnouncement}
              isQuestionSkipped={state.isQuestionSkipped}
              isStealActive={state.isStealActive || state.firstTeamFailed}
            />
          </div>
        )}

        {/* STAGE: PODIUM */}
        {state.stage === 'podium' && (
          <Podium
            scores={state.scores}
            teams={state.teams}
            actionCards={state.actionCards}
          />
        )}
      </main>

      {/* Action Card Fullscreen Activation Overlay */}
      {state.lastCardUsed && (
        <ActionCardActivationOverlay
          cardType={state.lastCardUsed.type}
          team={state.lastCardUsed.team}
          teams={state.teams}
          timestamp={state.lastCardUsed.timestamp}
          onDismiss={clearLastCardUsed}
        />
      )}
    </div>
  );
};
