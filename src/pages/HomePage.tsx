import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Tv, Settings, BookOpen, ShieldCheck, Flame } from 'lucide-react';

import { TEAMS } from '../types/game';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06140e] text-white flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#006341]/25 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between border-b border-[#1d5740]/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#006341]/40 flex items-center justify-center p-1 border border-amber-400/40 shadow-[0_0_20px_rgba(0,99,65,0.6)]">
            <img src="/logo.png" alt="IPBNB" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              Gincana Gálatas <span className="text-amber-400">• IPBNB</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              Igreja Presbiteriana do Brasil em Nova Brasília
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c231a] border border-[#1d5740] text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          BroadcastChannel + LocalStorage Sincronizado
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006341]/40 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Flame className="w-4 h-4 text-amber-400" />
          Igreja Presbiteriana do Brasil
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
                Exibição imersiva e limpa para os participantes e congregação. Roleta, escolha de cards 3D, cronômetro de 60s, gabarito ARA e pódio com confetes.
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
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0c231a] to-[#081c13] border-2 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.2)] flex flex-col justify-between items-center text-center transition-all hover:scale-[1.02] hover:border-amber-400">
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

        {/* Teams Participating Showcase */}
        <div className="mt-12 w-full max-w-4xl">
          <span className="text-xs uppercase tracking-widest font-black text-amber-300 block mb-4">
            Sociedades e Equipes Participantes
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.values(TEAMS).map((team) => (
              <div
                key={team.id}
                className="p-3.5 rounded-2xl bg-[#0c231a] border border-[#1d5740] flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 shadow-md hover:border-emerald-500/50"
              >
                {team.logo ? (
                  <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center">
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl border flex items-center justify-center font-black text-lg"
                    style={{ backgroundColor: `${team.color}20`, borderColor: team.color, color: team.color }}
                  >
                    {team.name}
                  </div>
                )}
                <span className="font-black text-sm uppercase tracking-wide" style={{ color: team.color }}>
                  {team.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How to use info */}
        <div className="mt-10 p-6 rounded-2xl bg-[#0c231a]/80 border border-[#1d5740] text-left max-w-3xl w-full flex items-start gap-4 shadow-lg">
          <BookOpen className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-gray-300 space-y-1">
            <p className="font-bold text-amber-300">
              Dica de operação para auditório / projeção:
            </p>
            <p>
              Abra a <strong>Mesa de Controle Admin (/admin)</strong> na tela do notebook do operador e abra a <strong>Tela do Telão (/telao)</strong> estendida no projetor/segundo monitor. Pressione <strong>F</strong> no Telão para alternar tela cheia!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto border-t border-[#1d5740]/80 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
        <span>Gincana Bíblica Gálatas • Igreja Presbiteriana do Brasil em Nova Brasília</span>
        <span>Tecnologia React + Vite + Tailwind + BroadcastChannel</span>
      </footer>
    </div>
  );
};
