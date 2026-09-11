import React from 'react';
import { Compass, Sparkles, FileText, Award, CheckCircle2 } from 'lucide-react';

export const RulesView: React.FC = () => {
  const rules = [
    {
      icon: <Compass className="w-8 h-8 text-amber-400" />,
      title: '1. Sorteio e Arsenal de Cartas',
      desc: 'Ao ser sorteada na roleta, o arsenal de cartas de ação da equipe é exibido na tela. Em seguida, a equipe escolhe o Card da rodada, revelado em 3D e bloqueado para as demais equipes.',
      badge: 'Dinâmica da Rodada',
      border: 'border-[#1d5740]',
      glow: 'shadow-[0_0_20px_rgba(0,99,65,0.3)]',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-400" />,
      title: '2. Cartas de Ação (Power-Ups)',
      desc: 'Cada sociedade recebe 4 cartas para toda a gincana: Pular Pergunta (2 unidades), Consulta Bíblica de 30s (1 unidade) e Carta 50/50 (1 unidade, elimina 2 alternativas erradas).',
      badge: 'Arsenal Estratégico',
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    },
    {
      icon: <FileText className="w-8 h-8 text-orange-400" />,
      title: '3. Resposta no Papel (Só ao Pular)',
      desc: 'A resposta e pontuação no papel só acontecem quando a equipe sorteada decidir PULAR a pergunta. Se a equipe responder no microfone (acertando ou errando), o papel NÃO pontua.',
      badge: 'Exclusivo ao Pular',
      border: 'border-orange-500/40',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-400" />,
      title: '4. Bônus de +15 pts por Carta Guardada',
      desc: 'Cartas não utilizadas valem ouro: ao término da gincana, cada carta de ação preservada concede +15 pontos automáticos no Placar Final e no Pódio das Campeãs!',
      badge: 'Bônus Final (+15 pts)',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 py-6 px-4 animate-fadeIn">
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

      {/* Rules Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                {rule.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                {rule.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Alert Note */}
      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-center text-xs sm:text-sm text-gray-300 max-w-2xl shadow-lg">
        🎯 <strong className="text-amber-300">Resumo Estratégico:</strong> Resposta no microfone vale pontos cheios. Se a equipe travar, pode usar Consulta Bíblica (+30s), Carta 50/50 ou Pular. Pular transfere os pontos para o papel das rivais. Cada carta guardada até o fim vale +15 pts extras!
      </div>
    </div>
  );
};
