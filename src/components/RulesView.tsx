import React from 'react';
import { useGame } from '../context/GameContext';
import {
  Shuffle,
  BookOpen,
  Clock,
  Award,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  FastForward,
} from 'lucide-react';

interface RulesViewProps {
  currentIndex?: number;
}

export const RulesView: React.FC<RulesViewProps> = ({ currentIndex }) => {
  const { state, nextRule, prevRule, setRuleIndex } = useGame();
  const activeIndex = currentIndex ?? (state.currentRuleIndex || 0);

  const ruleSlides = [
    {
      num: '01',
      badge: 'Ordem das Equipes',
      title: 'Sorteio da Ordem na Roleta',
      subtitle: 'A roleta define a sequência das equipes para a gincana inteira',
      icon: <Shuffle className="w-12 h-12 text-blue-700" />,
      color: 'blue',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            Antes da gincana começar, giramos a roleta ao vivo no telão para sortear a ordem de participação das equipes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-blue-900 text-base">Ordem Fixa</h4>
                <p className="text-sm text-slate-600 mt-1">A sequência sorteada não muda. Todas as rodadas seguem rigorosamente a mesma ordem até o fim.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-emerald-900 text-base">Disputa Igual</h4>
                <p className="text-sm text-slate-600 mt-1">Todas as equipes respondem o mesmo número de perguntas ao longo do jogo.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      badge: 'Escolha da Pergunta',
      title: 'Escolha de 1 a 60 & 10 Pontos',
      subtitle: 'A equipe escolhe o número no telão e joga valendo 10 pontos',
      icon: <BookOpen className="w-12 h-12 text-blue-700" />,
      color: 'blue',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            Na vez da sua equipe, vocês escolhem qualquer número livre de 1 a 60 no telão. Cada pergunta é usada uma única vez.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider block">Acerto de Primeira</span>
                <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono">+10 PONTOS</span>
              </div>
              <Award className="w-10 h-10 text-amber-500" />
            </div>
            <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 flex flex-col justify-center">
              <span className="text-xs font-black uppercase text-blue-900 tracking-wider block">Pergunta Esgotada</span>
              <p className="text-sm text-slate-700 font-semibold mt-1">Assim que um número é escolhido, ele fica cinza e ninguém mais pode repeti-lo.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '03',
      badge: 'Tempo de Resposta',
      title: '60 Segundos no Cronômetro',
      subtitle: '12 segundos de leitura prévia e 60s para a equipe debater',
      icon: <Clock className="w-12 h-12 text-blue-700" />,
      color: 'blue',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            Assim que a pergunta abre, temos 12 segundos para a leitura em voz alta. Depois disso, o cronômetro oficial de 60 segundos começa a correr.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-blue-900 text-base">Tempo de Debate (60s)</h4>
                <p className="text-sm text-slate-600 mt-1">A equipe conversa e decide a resposta dentro do tempo do cronômetro.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-amber-950 text-base">Voz no Microfone</h4>
                <p className="text-sm text-slate-600 mt-1">O líder da equipe se levanta e dá a resposta oficial antes do tempo zerar.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '04',
      badge: 'Repasse',
      title: 'Errou? Repasse de 30s por 5 Pontos',
      subtitle: 'O gabarito não é revelado e as outras equipes disputam 5 pontos',
      icon: <Award className="w-12 h-12 text-red-600" />,
      color: 'red',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            Se a equipe da vez errar ou o tempo esgotar, <strong className="text-red-600 font-black">o gabarito continua em segredo</strong>. Abre na hora o repasse de 30 segundos!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-red-950 text-base">Microfone Aberto</h4>
                <p className="text-sm text-red-900 mt-1">A primeira equipe adversária que se manifestar ganha a chance de responder.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-emerald-950 text-base">Acertou no Repasse?</h4>
                <p className="text-sm text-emerald-900 mt-1">Leva <strong>+5 pontos</strong> para a sua equipe no placar!</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '05',
      badge: 'Cartas de Ação',
      title: 'Cartas de Ação da Equipe',
      subtitle: '2 cartas de Pular + 2 cartas de Ajuda (Bíblia ou 50/50)',
      icon: <Sparkles className="w-12 h-12 text-blue-700" />,
      color: 'blue',
      content: (
        <div className="flex flex-col gap-4 text-left">
          <p className="text-lg sm:text-xl text-slate-700 font-medium">
            Cada equipe começa com <strong className="text-blue-900 font-black">4 cartas no total</strong> para usar estrategicamente na sua vez:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            {/* 1. Pular */}
            <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/90 border-2 border-orange-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-700 font-black text-base sm:text-lg mb-1.5">
                  <FastForward className="w-5 h-5 shrink-0" />
                  <span>Pular Pergunta (2x)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  Não tem certeza da resposta? Descarta a pergunta e a sua equipe escolhe outro número no telão sem qualquer penalidade.
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-800 mt-3 px-3 py-1 rounded-xl bg-orange-100 border border-orange-200 self-start">
                2 Unidades
              </span>
            </div>

            {/* 2. Ajuda Adaptativa */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-purple-50 border-2 border-indigo-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-900 font-black text-base sm:text-lg mb-1.5">
                  <BookOpen className="w-5 h-5 text-sky-700 shrink-0" />
                  <Sparkles className="w-5 h-5 text-purple-700 shrink-0" />
                  <span>Ajuda Adaptativa (2x no Total)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  A ajuda adapta-se automaticamente à pergunta:
                </p>
                <ul className="text-xs sm:text-sm text-slate-700 font-medium space-y-1 mt-1.5">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                    <span><strong>Múltipla Escolha:</strong> vira <strong>50/50</strong> (elimina 2 erradas).</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span><strong>Dissertativa:</strong> vira <strong>Consulta Bíblica</strong> (+30s extras).</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 font-semibold mt-2">
                  Vocês escolhem como gastar as 2: pode ser 2 Bíblias, 2 de 50/50 ou 1 de cada!
                </p>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-900 mt-3 px-3 py-1 rounded-xl bg-indigo-100 border border-indigo-200 self-start">
                Pool de 2 Ajudas
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '06',
      badge: 'Pontuação Final',
      title: 'Placares Parciais & Bônus de Cartas',
      subtitle: 'Cartas guardadas até o fim valem pontos extras no pódio!',
      icon: <Trophy className="w-12 h-12 text-amber-500" />,
      color: 'amber',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            O placar parcial aparece na tela ao completar <strong className="text-blue-900 font-black">1/3</strong> e <strong className="text-blue-900 font-black">2/3</strong> das rodadas para acompanhar a classificação.
          </p>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-50 to-emerald-100 border-2 border-amber-400 flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Bônus no Pódio
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                +5 Pontos por cada carta guardada
              </p>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Se a equipe economizar e terminar com as 4 cartas = <strong className="text-emerald-700 font-bold">+20 pontos extras</strong> direto no resultado final!
              </p>
            </div>
            <Trophy className="w-12 h-12 text-amber-600 shrink-0" />
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = ruleSlides[activeIndex] || ruleSlides[0];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn select-none">
      {/* Presentation Slide Card */}
      <div className="w-full bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
        {/* Top Accent Stripe: UMP Blue & Red */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-red-600 to-blue-800" />

        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-black text-xs sm:text-sm uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              Regra Oficial {currentSlide.num} de 06 • {currentSlide.badge}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest hidden sm:inline">
                Federação de UMPs
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 p-1 flex items-center justify-center">
                <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 sm:gap-6 mt-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 p-3 sm:p-4 flex items-center justify-center shadow-inner shrink-0">
              {currentSlide.icon}
            </div>

            <div>
              <span className="text-xs sm:text-sm font-extrabold text-red-600 uppercase tracking-wider block">
                {currentSlide.subtitle}
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight mt-0.5 leading-tight">
                {currentSlide.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Card Body Content */}
        <div className="my-8">
          {currentSlide.content}
        </div>

        {/* Slide Footer Navigation Indicator */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {ruleSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setRuleIndex(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeIndex
                    ? 'w-8 h-3 bg-red-600 shadow-md'
                    : 'w-3 h-3 bg-slate-300 hover:bg-blue-600'
                }`}
                title={`Ir para Regra ${i + 1}`}
              />
            ))}
            <span className="ml-2 text-xs font-black text-slate-500 uppercase tracking-wider">
              Slide {activeIndex + 1} / {ruleSlides.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={activeIndex <= 0}
              onClick={prevRule}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              ◀ Anterior
            </button>
            <button
              disabled={activeIndex >= ruleSlides.length - 1}
              onClick={nextRule}
              className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-900 hover:bg-blue-800 text-white shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Próxima ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
