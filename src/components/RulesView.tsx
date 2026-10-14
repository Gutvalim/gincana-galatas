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
      subtitle: 'Transparência total e ordem permanente pela gincana toda',
      icon: <Shuffle className="w-12 h-12 text-blue-700" />,
      color: 'blue',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            Antes de começar a disputa, todas as equipes participam do <strong className="text-blue-900 font-black">sorteio oficial ao vivo na Roleta</strong> para definir a ordem exata de participação.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-blue-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-blue-900 text-base">Ordem Fixa e Imparcial</h4>
                <p className="text-sm text-slate-600 mt-1">A sequência sorteada permanece rigorosamente a mesma em todas as rodadas até o fim.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-red-50/80 border-2 border-red-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-red-900 text-base">Mesmas Oportunidades</h4>
                <p className="text-sm text-slate-600 mt-1">Todas as UMPs respondem o mesmo número de perguntas de forma equilibrada.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      badge: 'Rodadas & Pontuação',
      title: 'Rodadas Dinâmicas & 10 Pontos Fixos',
      subtitle: 'Perguntas divididas igualmente entre as equipes e pontuação justa',
      icon: <BookOpen className="w-12 h-12 text-red-600" />,
      color: 'red',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            O número de rodadas é calculado automaticamente dividindo o <strong className="text-blue-900 font-black">total de perguntas pelo número de equipes</strong>. Cada questão aberta é <strong className="text-blue-900 font-black">100% aleatória</strong> sem repetições.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">Valor do Acerto</span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono">+10 PONTOS</span>
              </div>
              <Award className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 flex flex-col justify-center">
              <span className="text-xs font-black uppercase text-blue-900 tracking-wider block">Sorteio Aleatório</span>
              <p className="text-sm text-slate-700 font-semibold mt-1">Todas as perguntas vêm do livro de Gálatas (ARA) em ordem imprevisível e dinâmica.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '03',
      badge: 'Dinâmica do Tempo',
      title: 'Cronômetro de 60s & Leitura de 12s',
      subtitle: 'Tempo de leitura inicial e debate completo da equipe',
      icon: <Clock className="w-12 h-12 text-blue-700" />,
      color: 'blue',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            Ao abrir a pergunta, há <strong className="text-blue-900 font-black">12 segundos para a leitura em voz alta</strong>. Se o apresentador não disparar antes, o cronômetro oficial de <strong className="text-blue-900 font-black">60 segundos</strong> começa automaticamente!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-blue-900 text-base">Início Inteligente</h4>
                <p className="text-sm text-slate-600 mt-1">12 segundos prévios de tolerância para leitura tranquila da questão pelo apresentador.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-amber-950 text-base">Tempo de Debate (60s)</h4>
                <p className="text-sm text-slate-600 mt-1">O líder deve se levantar antes do cronômetro zerar para ter sua resposta validada.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '04',
      badge: 'Resposta & Repasse',
      title: 'Microfone & Repasse de 30s',
      subtitle: 'Errou? O gabarito não é revelado e as outras equipes disputam o repasse!',
      icon: <Award className="w-12 h-12 text-red-600" />,
      color: 'red',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            O líder responde no microfone. Se a equipe acertar, ganha os 10 pontos. <strong className="text-red-700 font-black">Se errar, o gabarito NÃO é revelado</strong> e começa um cronômetro de <strong className="text-blue-900 font-black">30 segundos de Repasse</strong>!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-emerald-950 text-base">Acerto Imediato</h4>
                <p className="text-sm text-emerald-900 mt-1">Gabarito revelado na hora e os 10 pontos são creditados instantaneamente para a equipe.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-red-950 text-base">Repasse Aberto (30s)</h4>
                <p className="text-sm text-red-900 mt-1">Se a 1ª equipe errar, as outras equipes podem se manifestar e roubar os 10 pontos da questão!</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '05',
      badge: 'Recursos Especiais',
      title: 'Baralho de Cartas de Ação',
      subtitle: 'Estratégia exclusiva para a equipe da vez',
      icon: <Sparkles className="w-12 h-12 text-blue-700" />,
      color: 'blue',
      content: (
        <div className="flex flex-col gap-4 text-left">
          <p className="text-lg sm:text-xl text-slate-700 font-medium">
            Cada equipe possui um baralho tático com cartas especiais para serem ativadas na sua vez:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
            <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-700 font-black mb-1">
                  <FastForward className="w-5 h-5" />
                  <span>Pular (2x)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                  Descarta a questão atual e sorteia imediatamente uma nova pergunta aleatória para a equipe.
                </p>
              </div>
              <span className="text-[11px] font-black uppercase text-orange-800 mt-2 block">2 Unidades</span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-700 font-black mb-1">
                  <BookOpen className="w-5 h-5" />
                  <span>Bíblia (1x)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                  Adiciona +30 segundos extras no relógio para pesquisar o texto bíblico na Bíblia impressa.
                </p>
              </div>
              <span className="text-[11px] font-black uppercase text-sky-800 mt-2 block">1 Unidade • 30 Segundos</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-700 font-black mb-1">
                  <Sparkles className="w-5 h-5" />
                  <span>50/50 (1x)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                  Elimina duas opções erradas na hora em perguntas de múltipla escolha, restando apenas 2 alternativas.
                </p>
              </div>
              <span className="text-[11px] font-black uppercase text-purple-800 mt-2 block">1 Unidade</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '06',
      badge: 'Placares Parciais & Pódio',
      title: 'Placares em 1/3 e 2/3 & Pódio Final',
      subtitle: 'Acompanhamento da classificação e bônus de cartas guardadas',
      icon: <Trophy className="w-12 h-12 text-amber-500" />,
      color: 'amber',
      content: (
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium">
            O placar parcial surge na tela ao completar <strong className="text-blue-900 font-black">1/3 das rodadas</strong> e novamente ao completar <strong className="text-blue-900 font-black">2/3 das rodadas</strong>. No pódio final, cada carta guardada rende <strong className="text-emerald-700 font-black">+10 PONTOS DE BÔNUS</strong>!
          </p>
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-emerald-100 border-2 border-amber-400 flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Bônus no Pódio
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                +10 PTS por cada carta guardada
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                Se guardar as 4 cartas = <strong className="text-emerald-700 font-bold">+40 pontos extras</strong> na apuração final!
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
