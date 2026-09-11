import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { TEAMS } from '../types/game';
import { Roulette } from '../components/Roulette';
import { CircularTimer } from '../components/CircularTimer';
import { Leaderboard } from '../components/Leaderboard';
import { QuestionView } from '../components/QuestionView';
import { RoundSplash } from '../components/RoundSplash';
import { RulesView } from '../components/RulesView';
import { Podium } from '../components/Podium';
import { CardSelectionView } from '../components/CardSelectionView';
import { ActionCardsHUD } from '../components/ActionCardsHUD';
import { Play, Maximize, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export const TelaoPage: React.FC = () => {
  const {
    state,
    currentQuestion,
    questions,
    finishSpin,
    setStage,
    selectCardQuestion,
    toggleSound,
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

  const currentActiveTeam =
    state.drawnTeam ||
    (state.stage === 'roulette' && state.teamsAvailableInRound.length === 1
      ? state.teamsAvailableInRound[0]
      : null);

  return (
    <div className="relative w-screen h-screen bg-[#06140e] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background Ambience / IPB Presbyterian Green & Gold Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,99,65,0.25),transparent_65%)] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#006341]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Top Status Bar (Clean for projection) */}
      <header className="relative z-20 px-8 py-4 flex items-center justify-between border-b border-[#1d5740]/60 bg-[#06140e]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center p-1 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] shrink-0">
            <img src="/logo.png" alt="IPBNB" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Gincana Gálatas
            </h2>
            <p className="text-[11px] text-amber-300 font-semibold tracking-wide">
              IPBNB • 2026
            </p>
          </div>
        </div>

        {/* Center Live Badge */}
        <div className="flex items-center gap-3">
          {currentActiveTeam && TEAMS[currentActiveTeam] && (
            <div
              className="px-4 py-1 rounded-full border flex items-center gap-2 animate-pulse shadow-md"
              style={{
                borderColor: TEAMS[currentActiveTeam].color,
                backgroundColor: `${TEAMS[currentActiveTeam].color}25`,
              }}
            >
              <span className="text-xs text-gray-300 uppercase font-semibold">Vez de:</span>
              <span
                className="font-black text-sm uppercase"
                style={{ color: TEAMS[currentActiveTeam].color }}
              >
                {TEAMS[currentActiveTeam].name}
              </span>
            </div>
          )}

          <div className="px-3.5 py-1 rounded-full bg-[#0c231a] border border-[#1d5740] text-xs font-bold text-amber-300 uppercase">
            {state.currentRound <= 6 ? `Rodada ${state.currentRound} de 6` : 'Morte Súbita'}
          </div>
        </div>

        {/* Minimal Discreet Audio / Fullscreen controls */}
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
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {/* STAGE: WELCOME */}
        {state.stage === 'welcome' && (
          <div className="flex flex-col items-center justify-center text-center animate-fadeIn max-w-3xl">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/95 flex items-center justify-center p-4 shadow-[0_0_60px_rgba(251,191,36,0.5)] mb-8 border-4 border-amber-400">
              <img src="/logo.png" alt="IPBNB" className="w-full h-full object-contain drop-shadow" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006341]/40 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow">
              Igreja Presbiteriana do Brasil em Nova Brasília
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 uppercase tracking-tighter drop-shadow-2xl">
              Gincana Gálatas
            </h1>

            <p className="mt-4 text-xl sm:text-2xl text-amber-400 font-bold uppercase tracking-widest drop-shadow">
              "Para a liberdade foi que Cristo nos libertou"
            </p>

            <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-xl">
              Competição bíblica intersocietária: UCP, UPA, UMP, Sociedade de Casais e Sociedade de Adultos.
            </p>

            <button
              onClick={() => setStage('rules')}
              className="mt-10 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#006341] via-emerald-600 to-[#006341] hover:from-[#007a50] hover:to-emerald-500 text-white font-black text-xl uppercase tracking-widest border-2 border-amber-400/80 shadow-[0_0_40px_rgba(0,99,65,0.7)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 animate-pulse"
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
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 px-4 py-1.5 rounded-full">
                Classificação em Tempo Real
              </span>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mt-3 drop-shadow">
                Placar Geral
              </h2>
            </div>
            <Leaderboard
              scores={state.scores}
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
            {state.teamsAvailableInRound.length === 1 ? (
              (() => {
                const singleTeam = state.teamsAvailableInRound[0];
                const teamInfo = TEAMS[singleTeam];
                return (
                  <div className="flex flex-col items-center justify-center text-center animate-fadeIn w-full max-w-2xl py-4">
                    <span className="px-5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest shadow-lg mb-6 animate-pulse">
                      Última Sociedade da Rodada
                    </span>

                    <div
                      className="w-full rounded-3xl p-8 sm:p-10 border-4 shadow-2xl flex flex-col items-center relative overflow-hidden transition-all duration-500"
                      style={{
                        borderColor: teamInfo.color,
                        backgroundColor: `${teamInfo.color}18`,
                        boxShadow: `0 0 50px ${teamInfo.color}40`,
                      }}
                    >
                      {/* Ambient Glow */}
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at center, ${teamInfo.color}, transparent 70%)`,
                        }}
                      />

                      {/* Team Logo */}
                      <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white/95 border-4 border-white/60 p-4 flex items-center justify-center shrink-0 shadow-2xl mb-6">
                        {teamInfo.logo ? (
                          <img
                            src={teamInfo.logo}
                            alt={teamInfo.name}
                            className="w-full h-full object-contain drop-shadow"
                          />
                        ) : (
                          <span
                            className="text-5xl font-black"
                            style={{ color: teamInfo.color }}
                          >
                            {singleTeam}
                          </span>
                        )}
                      </div>

                      {/* Team Name */}
                      <span className="relative z-10 text-xs sm:text-sm text-gray-300 uppercase font-bold tracking-widest mb-1">
                        Vez de Responder:
                      </span>
                      <h2
                        className="relative z-10 text-4xl sm:text-6xl font-black uppercase tracking-tight drop-shadow-lg"
                        style={{ color: teamInfo.color }}
                      >
                        {teamInfo.name}
                      </h2>

                      <p className="relative z-10 mt-3 text-sm sm:text-base text-gray-300 max-w-md font-medium">
                        Única sociedade restante nesta rodada. Avance para a escolha do envelope!
                      </p>

                      {/* Action Cards HUD for this team */}
                      <div className="relative z-10 w-full mt-6 pt-6 border-t border-white/10">
                        <ActionCardsHUD
                          team={singleTeam}
                          inventory={state.actionCards?.[singleTeam]}
                          interactive={false}
                          skipsUsedInRound={state.skipsUsedInRound || 0}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white text-center drop-shadow mb-4">
                  Sorteio da Equipe
                </h2>
                <p className="text-sm sm:text-base text-gray-400 mb-6 text-center">
                  Quem responderá no microfone pelos pontos cheios?
                </p>
                <Roulette
                  teams={state.teamsAvailableInRound}
                  isSpinning={state.isSpinning}
                  targetTeam={state.spinningTargetTeam}
                  drawnTeam={state.drawnTeam}
                  spinSeed={state.spinSeed}
                  onFinish={finishSpin}
                />

                {/* Display active team's action cards when drawn */}
                {state.drawnTeam && !state.isSpinning && (
                  <div className="w-full max-w-2xl mt-6 animate-fadeIn">
                    <ActionCardsHUD
                      team={state.drawnTeam}
                      inventory={state.actionCards?.[state.drawnTeam]}
                      interactive={false}
                      skipsUsedInRound={state.skipsUsedInRound || 0}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STAGE: CARD SELECTION */}
        {state.stage === 'card_selection' && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {state.drawnTeam && (
              <div className="w-full max-w-3xl mb-4 animate-fadeIn">
                <ActionCardsHUD
                  team={state.drawnTeam}
                  inventory={state.actionCards?.[state.drawnTeam]}
                  interactive={false}
                  compact={true}
                  skipsUsedInRound={state.skipsUsedInRound || 0}
                />
              </div>
            )}
            <CardSelectionView
              round={state.currentRound}
              questionsInRound={questions.filter((q) => q.rodada === state.currentRound)}
              usedQuestionIds={state.usedQuestionIdsInRound}
              usedCardIndices={state.usedCardIndicesInRound}
              currentQuestion={currentQuestion}
              drawnTeam={state.drawnTeam}
              selectedCardIndex={state.selectedCardIndex}
              isCardFlipping={state.isCardFlipping}
              onSelectCard={selectCardQuestion}
              interactive={true}
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
              isRevealed={state.isRevealed}
              drawnTeam={state.drawnTeam}
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
            {/* Split layout: Circular timer above question */}
            <div className="flex flex-col items-center">
              <CircularTimer
                seconds={state.timerSeconds}
                maxSeconds={state.timerMaxSeconds || 60}
                isRunning={state.isTimerRunning}
                size={220}
              />
            </div>
            <QuestionView
              question={currentQuestion}
              isRevealed={state.isRevealed}
              showPoints={false}
              drawnTeam={state.drawnTeam}
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
            {state.drawnTeam && (
              <div className="w-full max-w-5xl animate-fadeIn">
                <ActionCardsHUD
                  team={state.drawnTeam}
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
              isRevealed={state.isRevealed}
              drawnTeam={state.drawnTeam}
              selectedOptionIndex={state.selectedOptionIndex}
              answerStatus={state.answerStatus}
              eliminatedOptionIndices={state.eliminatedOptionIndices}
              activeCardAnnouncement={state.activeCardAnnouncement}
              isQuestionSkipped={state.isQuestionSkipped}
            />
          </div>
        )}

        {/* STAGE: SUDDEN DEATH (MORTE SÚBITA) */}
        {state.stage === 'sudden_death' && currentQuestion && (
          <div className="w-full flex flex-col items-center gap-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-red-950/60 border-2 border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.4)] flex items-center gap-3 text-red-300">
              <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-red-200">
                  Morte Súbita • Desempate
                </h3>
                <p className="text-xs sm:text-sm text-red-300/80">
                  Pergunta final estrutural para definir a grande campeã!
                </p>
              </div>
            </div>

            {state.isTimerRunning && (
              <CircularTimer
                seconds={state.timerSeconds}
                maxSeconds={60}
                isRunning={state.isTimerRunning}
                size={180}
              />
            )}

            <QuestionView question={currentQuestion} isRevealed={state.isRevealed} />
          </div>
        )}

        {/* STAGE: PODIUM / VICTORY */}
        {state.stage === 'podium' && <Podium scores={state.scores} actionCards={state.actionCards} />}
      </main>

      {/* Subtle Footer Bar */}
      <footer className="relative z-20 px-8 py-3 flex items-center justify-between border-t border-gray-800/40 bg-[#0b0f19]/60 text-xs text-gray-500">
        <span>Gincana Bíblica Gálatas • Transmissão Oficial</span>
        <span className="font-mono">IPBNB © 2026</span>
      </footer>
    </div>
  );
};
