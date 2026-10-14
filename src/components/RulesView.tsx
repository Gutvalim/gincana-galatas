import React from 'react';
import { Sparkles, Award, CheckCircle2, FastForward, BookOpen, Clock, Users } from 'lucide-react';

export const RulesView: React.FC = () => {
  const rules = [
    {
      icon: <Users className="w-8 h-8 text-amber-400" />,
      title: '1. Ordem Fixa por Sorteio & Perguntas Diretas',
      desc: 'A ordem das equipes é definida por sorteio e mantida pela gincana inteira. Não há mesa de envelopes: as perguntas são sorteadas diretamente do questionário oficial de Gálatas sem repetições nem desperdício!',
      badge: 'Dinâmica das Equipes',
      border: 'border-[#1d5740]',
      glow: 'shadow-[0_0_20px_rgba(0,99,65,0.3)]',
    },
    {
      icon: <Clock className="w-8 h-8 text-cyan-400" />,
      title: '2. Tempo de 30s & Resposta do Líder',
      desc: 'A equipe da vez tem 30 segundos no cronômetro. O líder deve se levantar dentro dos 30s, aguardar o apresentador autorizar a fala e dizer a resposta imediatamente, sem tempo adicional!',
      badge: 'Tempo e Resposta',
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-400" />,
      title: '3. Pontuação Fixa (10 pts por Pergunta)',
      desc: 'Todas as perguntas têm valor igual de 10 pontos cheios. Não há respostas no papel: acertou no microfone dentro do tempo e dos critérios, pontua!',
      badge: '10 pts por Acerto',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
    {
      icon: <FastForward className="w-8 h-8 text-orange-400" />,
      title: '4. Carta Pular Pergunta (2 unidades)',
      desc: 'Se a equipe não souber a questão, pode acionar a carta Pular. Uma nova pergunta é sorteada imediatamente no telão e o cronômetro é reiniciado para a equipe.',
      badge: '2x Pular',
      border: 'border-orange-500/40',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    },
    {
      icon: <BookOpen className="w-8 h-8 text-sky-400" />,
      title: '5. Consulta Bíblica (1 unidade • 30s)',
      desc: 'Concede 30 segundos exclusivos para que a equipe abra as Bíblias impressas e pesquise a passagem e a resposta.',
      badge: '1x Bíblia (30s)',
      border: 'border-sky-500/40',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      title: '6. Carta 50/50 & Bônus no Pódio (+10 pts)',
      desc: 'Carta 50/50 (1x): elimina 2 alternativas erradas em perguntas de múltipla escolha. Bônus Final: cada carta poupada ao término concede +10 pts somados no Pódio!',
      badge: '50/50 & Bônus Final',
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between gap-3 sm:gap-4 py-1 sm:py-2 px-3 animate-fadeIn">
      {/* Rules Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#006341]/40 border border-emerald-500/50 text-emerald-300 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1.5 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          Regulamento Oficial • Federação de UMPs
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight drop-shadow-md leading-tight">
          Regras da Gincana & Cartas de Ação
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mt-1">
          Gincana Bíblica sobre o Livro de Gálatas • União de Mocidade Presbiteriana.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`p-3.5 sm:p-4 rounded-2xl bg-[#0c231a] border-2 ${rule.border} ${rule.glow} flex flex-col justify-between transition-all hover:scale-[1.01]`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2 rounded-xl bg-gray-800/80 border border-gray-700 shrink-0">
                  {React.cloneElement(rule.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5 text-current' })}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-800/90 text-gray-300 border border-gray-700">
                  {rule.badge}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-white mb-1 leading-snug">
                {rule.title}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                {rule.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
