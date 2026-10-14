import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Tv, Settings, ShieldCheck, BookOpen } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-100 text-slate-800 flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-blue-600 selection:text-white">
      {/* Subtle Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white p-2 border-2 border-blue-900/15 shadow-md flex items-center justify-center shrink-0">
            <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
              Gincana Gálatas <span className="text-blue-900">• Federação de UMPs</span>
            </h1>
            <p className="text-xs sm:text-sm text-red-600 font-bold uppercase tracking-wider">
              Alegres na Esperança • Fortes na Fé
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Sincronização em Tempo Real Ativa
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black uppercase tracking-widest mb-6 shadow-sm">
          <BookOpen className="w-4 h-4 text-red-600" />
          Livro de Gálatas • Versão ARA
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 font-display uppercase tracking-tight">
          Painel de Controle e Telão
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-medium">
          Sistema oficial da Gincana da Federação de UMPs. Todas as ações do operador no painel administrativo são refletidas instantaneamente no telão principal do auditório.
        </p>

        {/* 2 Big Action Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Card 1: Telão */}
          <div className="p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xl flex flex-col justify-between items-center text-center transition-all hover:scale-[1.02] hover:border-blue-700 hover:shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 border-2 border-blue-200 flex items-center justify-center mb-6 shadow-sm">
                <Tv className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-wide">
                Tela do Telão
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-sm">
                Exibição oficial para o público e participantes: regulamento em slides, sorteio ao vivo na roleta com lista lateral, perguntas de Gálatas, cronômetro de 30s e pódio com confetes.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/telao"
                className="flex-1 py-4 px-6 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black uppercase tracking-wider text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Abrir Telão
              </Link>
              <button
                onClick={() => window.open('/telao', '_blank')}
                className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
                title="Abrir Telão em Nova Janela"
              >
                <ExternalLink className="w-4 h-4 text-blue-900" />
                Nova Janela
              </button>
            </div>
          </div>

          {/* Card 2: Painel Admin */}
          <div className="p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xl flex flex-col justify-between items-center text-center transition-all hover:scale-[1.02] hover:border-red-600 hover:shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border-2 border-red-200 flex items-center justify-center mb-6 shadow-sm">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-wide">
                Painel do Administrador
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-sm">
                Controle completo para o apresentador: passar slides de regras, disparar sorteio na roleta, cronômetro de 30s, conferência de gabaritos ARA, cartas de ação e pontuação imediata.
              </p>
            </div>

            <div className="mt-8 w-full">
              <Link
                to="/admin"
                className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                Abrir Painel Admin
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <span>Gincana Bíblica • Carta aos Gálatas (ARA)</span>
        <span className="font-bold text-blue-900">Federação de UMPs • União de Mocidade Presbiteriana</span>
      </footer>
    </div>
  );
};
