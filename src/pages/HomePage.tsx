import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Tv, Settings, ShieldCheck, Flame } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06140e] text-white flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#006341]/25 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between border-b border-[#1d5740]/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#006341]/40 flex items-center justify-center p-1.5 border border-emerald-400/40 shadow-[0_0_20px_rgba(0,99,65,0.6)]">
            <img src="/logo_ump.webp" alt="UMP" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              Gincana Gálatas <span className="text-emerald-400">• Federação de UMPs</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              União de Mocidade Presbiteriana
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c231a] border border-[#1d5740] text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          BroadcastChannel Sincronizado
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006341]/40 border border-emerald-400/50 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Flame className="w-4 h-4 text-emerald-400" />
          Federação de UMPs • Livro de Gálatas
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 uppercase tracking-tight">
          Painel de Controle e Telão
        </h2>

        <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
          Selecione a tela desejada abaixo. O sistema sincroniza automaticamente todas as ações em tempo real entre a mesa do operador e o telão do auditório.
        </p>

        {/* 2 Big Action Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Card 1: Telão */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0c231a] to-[#081c13] border-2 border-[#1d5740] shadow-[0_0_35px_rgba(0,99,65,0.3)] flex flex-col justify-between items-center text-center transition-all hover:scale-[1.02] hover:border-emerald-500/60">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#006341]/40 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,99,65,0.4)]">
                <Tv className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                Tela do Telão
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-sm">
                Exibição limpa para a igreja e plateia. Sorteio de perguntas aleatórias de Gálatas, cronômetro de 30s, gabarito ARA e pódio com confetes.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/telao"
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#006341] to-emerald-600 hover:from-[#007a50] hover:to-emerald-500 text-white font-black uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(0,99,65,0.5)] transition-all flex items-center justify-center gap-2 border border-emerald-400/40"
              >
                Abrir Telão
              </Link>
              <button
                onClick={() => window.open('/telao', '_blank')}
                className="p-4 rounded-2xl bg-[#133829] hover:bg-[#1a4a37] text-gray-300 border border-[#1d5740] transition-colors flex items-center justify-center gap-1 text-xs font-bold"
                title="Abrir Telão em Nova Janela"
              >
                <ExternalLink className="w-4 h-4" />
                Nova Janela
              </button>
            </div>
          </div>

          {/* Card 2: Painel Admin */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0c231a] to-[#081c13] border-2 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.2)] flex flex-col justify-between items-center text-center transition-all hover:scale-[1.02] hover:border-emerald-400">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                Painel do Administrador
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-sm">
                Configuração de equipes e ícones, visualização de gabaritos oficiais, cronômetro de 30s, disparo de cartas de ação e avaliação imediata.
              </p>
            </div>

            <div className="mt-8 w-full">
              <Link
                to="/admin"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 border border-emerald-300/40"
              >
                Abrir Painel Admin
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto pt-6 border-t border-[#1d5740]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
        <span>Gincana Bíblica • Carta aos Gálatas (ARA)</span>
        <span className="font-semibold text-emerald-400">Federação de UMPs • Mocidade Presbiteriana</span>
      </footer>
    </div>
  );
};
