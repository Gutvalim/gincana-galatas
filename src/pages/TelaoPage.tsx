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
import { Podium } from '../components/Podium';
import { ActionCardsHUD } from '../components/ActionCardsHUD';
import { ActionCardActivationOverlay } from '../components/ActionCardActivationOverlay';
import { Play, Maximize, Volume2, VolumeX } from 'lucide-react';

export const TelaoPage: React.FC = () => {
  const {
    state,
    currentQuestion,
    finishSpin,
    setStage,
    toggleSound,
    clearLastCardUsed,
  } = useGame();

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

  return (
    <div className="relative w-screen h-screen bg-[#06140e] text-white flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none font-sans scrollbar-none">
      {/* Background Ambience / UMP Presbyterian Green & Gold Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,99,65,0.25),transparent_65%)] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#006341]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Top Status Bar (Clean for projection) */}
      <header className="relative z-20 px-6 py-2.5 sm:px-8 sm:py-3 flex items-center justify-between border-b border-[#1d5740]/60 bg-[#06140e]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#006341]/40 flex items-center justify-center p-1.5 border border-emerald-400/40 shadow-[0_0_20px_rgba(0,99,65,0.6)] shrink-0">
            <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Gincana Gálatas
            </h2>
            <p className="text-[11px] text-emerald-300 font-semibold tracking-wide">
              Federação de UMPs
            </p>
          </div>
        </div>

        {/* Center Live Badge */}
        <div className="flex items-center gap-3">
          {state.drawnTeam && activeTeamInfo && (
            <div
              className="px-4 py-1.5 rounded-full border flex items-center gap-2 animate-pulse shadow-md"
              style={{
                borderColor: activeTeamInfo.color,
                backgroundColor: `${activeTeamInfo.color}25`,
              }}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
                style={{ color: activeTeamInfo.color }}
              >
                <TeamIcon icon={activeTeamInfo.icon} className="w-4 h-4" />
              </div>
              <span className="text-xs text-gray-300 uppercase font-semibold">Vez de:</span>
              <span
                className="font-black text-sm uppercase"
                style={{ color: activeTeamInfo.color }}
              >
                {activeTeamInfo.name}
              </span>
            </div>
          )}

          <div className="px-3.5 py-1.5 rounded-full bg-[#0c231a] border border-[#1d5740] text-xs font-bold text-amber-300 uppercase">
            {state.currentRound <= 6 ? `Rodada ${state.currentRound} de 6` : 'Desempate'}
          </div>
        </div>

        {/* Discreet Audio / Fullscreen controls */}
        <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <button
            onClick={toggleSound}
            title={state.soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
            className="p-2 rounded-lg bg-[#0c231a] hover:bg-[#133829] text-gray-400 hover:text-amber-400 transition-colors border border-[#1d5740]"
          >
            {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullScreen}
            title="Alternar Tela Cheia (F)"
            className="p-2 rounded-lg bg-[#0c231a] hover:bg-[#133829] text-gray-400 hover:text-amber-400 transition-colors border border-[#1d5740]"
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
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl bg-white/95 flex items-center justify-center p-4 shadow-[0_0_60px_rgba(16,185,129,0.5)] mb-8 border-4 border-emerald-400">
              <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain drop-shadow" />
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#006341]/40 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow">
              União de Mocidade Presbiteriana • Federação de UMPs
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 uppercase tracking-tighter drop-shadow-2xl">
              Gincana Gálatas
            </h1>

            <p className="mt-4 text-xl sm:text-2xl text-amber-400 font-bold uppercase tracking-widest drop-shadow">
              "Para a liberdade foi que Cristo nos libertou"
            </p>

            <button
              onClick={() => setStage('rules')}
              className="mt-10 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#006341] via-emerald-600 to-[#006341] hover:from-[#007a50] hover:to-emerald-500 text-white font-black text-xl uppercase tracking-widest border-2 border-emerald-400/80 shadow-[0_0_40px_rgba(0,99,65,0.7)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 animate-pulse cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current text-amber-300" />
              Iniciar Gincana
            </button>
          </div>
        )}

        {/* STAGE: RULES */}
        {state.stage === 'rules' && <RulesView />}

        {/* STAGE: LEADERBOARD */}
        {state.stage === 'leaderboard' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="text-center mb-8">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-400/30 px-4 py-1.5 rounded-full">
                Classificação em Tempo Real
              </span>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mt-3 drop-shadow">
                Placar Geral
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

        {/* STAGE: ROULETTE */}
        {state.stage === 'roulette' && (
          <div className="flex flex-col items-center justify-center animate-fadeIn w-full max-w-4xl">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white text-center drop-shadow mb-2">
              Sorteio da Equipe
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 text-center">
              Quem responderá no microfone pelos 10 pontos?
            </p>
            <Roulette
              teams={state.teamOrder}
              teamsList={state.teams}
              isSpinning={state.isSpinning}
              targetTeam={state.spinningTargetTeam}
              drawnTeam={state.drawnTeam}
              spinSeed={state.spinSeed}
              onFinish={finishSpin}
            />

            {state.drawnTeam && !state.isSpinning && (
              <div className="w-full max-w-2xl mt-6 animate-fadeIn">
                <ActionCardsHUD
                  team={state.drawnTeam}
                  teams={state.teams}
                  inventory={state.actionCards?.[state.drawnTeam]}
                  interactive={false}
                  skipsUsedInRound={state.skipsUsedInRound || 0}
                />
              </div>
            )}
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

            {/* Circular Timer Display */}
            <div className="my-2">
              <CircularTimer
                seconds={state.timerSeconds}
                maxSeconds={state.timerMaxSeconds || 30}
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
          timestamp={state.lastCardUsed.timestamp}
          onDismiss={clearLastCardUsed}
        />
      )}
    </div>
  );
};
