import React from 'react';
import { Compass, Clock, Mic, FileText, CheckCircle2 } from 'lucide-react';

export const RulesView: React.FC = () => {
  const rules = [
    {
      icon: <Compass className="w-8 h-8 text-cyan-400" />,
      title: '1. Sorteio por Roleta',
      desc: 'A cada pergunta, uma equipe é sorteada pela roleta digital. A equipe sorteada é destacada e não repete até a próxima rodada.',
      badge: 'Dinâmica',
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    },
    {
      icon: <Mic className="w-8 h-8 text-amber-400" />,
      title: '2. Resposta no Microfone',
      desc: 'A equipe sorteada responde ao vivo no microfone. Se acertar, conquista os PONTOS CHEIOS da rodada (10 a 60 pts). Se errar, recebe 0.',
      badge: 'Pontos Cheios',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-400" />,
      title: '3. Resposta no Papel',
      desc: 'Simultaneamente, as outras 4 equipes anotam sua resposta no papel e entregam aos jurados para concorrer à METADE DOS PONTOS.',
      badge: 'Metade dos Pontos',
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    },
    {
      icon: <Clock className="w-8 h-8 text-emerald-400" />,
      title: '4. Cronômetro de 60 Segundos',
      desc: 'O tempo é acionado pelo moderador após a leitura da pergunta. Fica vermelho e com alerta sonoro urgente nos últimos 10 segundos.',
      badge: 'Tempo Limite',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 py-6 px-4 animate-fadeIn">
      {/* Rules Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold uppercase tracking-widest text-xs sm:text-sm mb-3">
          <CheckCircle2 className="w-4 h-4" />
          Regulamento Oficial da Gincana
        </div>
        <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight drop-shadow-md">
          Como Funciona a Disputa
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mt-2">
          Gincana Bíblica IPBNB sobre a Epístola aos Gálatas • Regras gerais para as 6 rodadas.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl bg-[#111827]/90 border-2 ${rule.border} ${rule.glow} flex flex-col justify-between transition-all hover:scale-[1.01]`}
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
      <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 text-center text-xs sm:text-sm text-gray-400 max-w-2xl">
        💡 <strong className="text-gray-200">Atenção:</strong> Se a equipe sorteada errar no microfone, ela zera a rodada, mas as equipes que acertaram no papel garantem a pontuação de metade dos pontos!
      </div>
    </div>
  );
};
