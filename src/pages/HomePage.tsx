import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Tv, Settings, BookOpen, ShieldCheck, Flame } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between border-b border-gray-800/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            📖
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              Gincana Gálatas <span className="text-cyan-400">• IPBNB</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              Igreja Presbiteriana do Brasil em Nova Brasília
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-bold text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          BroadcastChannel + LocalStorage Sincronizado
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-6">
          <Flame className="w-4 h-4 text-amber-400" />
          Sistema Gamificado e-Sports
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
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#111827] to-[#1f2937] border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.2)] flex flex-col justify-between items-center text-center transition-all hover:scale-[1.02] hover:border-cyan-400">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Tv className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                Tela do Telão
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-sm">
                Exibição imersiva e limpa para os participantes e congregação. Roleta, cronômetro de 60s, gabarito ARA e pódio com confetes.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
              <Link
                to="/telao"
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2"
              >
                Abrir Telão
              </Link>
              <button
                onClick={() => window.open('/telao', '_blank')}
                className="p-4 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors flex items-center justify-center gap-1 text-xs font-bold"
                title="Abrir Telão em Nova Janela"
              >
                <ExternalLink className="w-4 h-4" />
                Nova Janela
              </button>
            </div>
          </div>

          {/* Card 2: Painel Admin */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#111827] to-[#1f2937] border-2 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.2)] flex flex-col justify-between items-center text-center transition-all hover:scale-[1.02] hover:border-amber-400">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                Painel do Administrador
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-sm">
                Mesa de controle com visualização do gabarito oficial, controles do timer, disparo de roleta, modal de pontuação e ajustes manuais.
              </p>
            </div>

            <div className="mt-8 w-full">
              <Link
                to="/admin"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2"
              >
                Acessar Mesa Admin
              </Link>
            </div>
          </div>
        </div>

        {/* How to use info */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-900/60 border border-gray-800 text-left max-w-3xl w-full flex items-start gap-4">
          <BookOpen className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-gray-400 space-y-1">
            <p className="font-bold text-gray-200">
              Dica de operação para auditório / projeção:
            </p>
            <p>
              Abra a <strong>Mesa de Controle Admin (/admin)</strong> na tela do notebook do operador e abra a <strong>Tela do Telão (/telao)</strong> estendida no projetor/segundo monitor. Pressione <strong>F</strong> no Telão para alternar tela cheia!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto border-t border-gray-800/80 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
        <span>Gincana Bíblica Gálatas • Igreja Presbiteriana do Brasil em Nova Brasília</span>
        <span>Tecnologia React + Vite + Tailwind + BroadcastChannel</span>
      </footer>
    </div>
  );
};
