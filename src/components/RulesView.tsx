import React from 'react';
import { Compass, Sparkles, FileText, Award, CheckCircle2, FastForward, Flame } from 'lucide-react';

export const RulesView: React.FC = () => {
  const rules = [
    {
      icon: <Compass className="w-8 h-8 text-amber-400" />,
      title: '1. Mesa de Envelopes e Sorteio (8 Cards)',
      desc: 'Cada rodada conta com 8 cards de perguntas na mesa de escolha. Ao ser sorteada na roleta, a equipe escolhe livremente um envelope, que é revelado e fica esgotado para as demais equipes daquela rodada.',
      badge: 'Dinâmica da Rodada',
      border: 'border-[#1d5740]',
      glow: 'shadow-[0_0_20px_rgba(0,99,65,0.3)]',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      title: '2. Cartas de Ação (Arsenal da Equipe)',
      desc: 'Cada sociedade recebe 4 cartas para toda a gincana: Pular Pergunta (2 unidades), Consulta Bíblica de 30s (1 unidade) e Carta 50/50 (1 unidade, elimina 2 alternativas erradas).',
      badge: 'Arsenal Estratégico',
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    },
    {
      icon: <FastForward className="w-8 h-8 text-orange-400" />,
      title: '3. Carta Pular: Adultos vs. Crianças (UCP)',
      desc: 'Adultos: ao pular, a equipe libera aquela pergunta para as rivais pontuarem no papel, mas volta à mesa e escolhe outro envelope para responder no microfone e disputar os pontos cheios! UCP (Crianças): ao pular, as crianças têm nova escolha de card, sem abrir pontuação de papel para os adultos.',
      badge: 'Mecânica do Pulo',
      border: 'border-orange-500/40',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    },
    {
      icon: <FileText className="w-8 h-8 text-cyan-400" />,
      title: '4. Resposta no Papel',
      desc: 'Quando uma equipe pular, as outras equipes terão 30s para escrever a resposta no papel e entregar a mesa avaliadora para disputar por uma parte dos pontos da rodada.',
      badge: 'Pontuação no Papel',
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    },
    {
      icon: <Flame className="w-8 h-8 text-rose-400" />,
      title: '5. Pontuação Progressiva das 6 Rodadas',
      desc: 'R1: 15 / 5 pts • R2: 20 / 8 pts • R3: 25 / 10 pts • R4: 30 / 12 pts • R5: 40 / 15 pts • R6: 50 / 20 pts. Resposta no microfone vale pontos cheios; no papel vale metade dos pontos. (Em caso de empate no 1º lugar ao final da R6, haverá Rodada de Desempate).',
      badge: 'Valores Oficiais',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-400" />,
      title: '6. Bônus Final no Pódio (+10 pts por Carta)',
      desc: 'Economizar ajuda compensa: ao término da gincana, cada carta de ação que a equipe conseguiu poupar concede +10 pontos automáticos somados ao Placar Geral no Pódio das Campeãs (potencial de até +40 pontos extras se guardar as 4 cartas)!',
      badge: 'Bônus Final (+10 pts)',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8 py-6 px-4 animate-fadeIn">
      {/* Rules Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006341]/40 border border-emerald-500/50 text-emerald-300 font-bold uppercase tracking-widest text-xs sm:text-sm mb-3">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          Regulamento Oficial da Gincana
        </div>
        <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight drop-shadow-md">
          Regras e Cartas de Ação
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mt-2">
          Gincana Bíblica IPBNB sobre Gálatas • Mecânicas estratégicas e sistema de pontuação oficial.
        </p>
      </div>

      {/* Rules Grid (2 cols on md, 3 cols on xl) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl bg-[#0c231a] border-2 ${rule.border} ${rule.glow} flex flex-col justify-between transition-all hover:scale-[1.01]`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gray-800/80 border border-gray-700">
                  {rule.icon}
                </div>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                  {rule.badge}
                </span>
              </div>

              <h3 className="text-xl font-black text-white mb-2">
                {rule.title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed font-normal">
                {rule.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Alert Note */}
      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-center text-xs sm:text-sm text-gray-300 max-w-3xl shadow-lg">
        🎯 <strong className="text-amber-300">Resumo Estratégico:</strong> Responda no microfone para faturar pontos cheios. Se a equipe travar, pode usar a Bíblia (+30s), o 50/50 ou Pular (que dá 30s para as rivais responderem no papel e permite escolher outro envelope). Cartas guardadas rendem +10 pts cada no Pódio!
      </div>
    </div>
  );
};
