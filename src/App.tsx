import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { TelaoPage } from './pages/TelaoPage';

export const App: React.FC = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/telao" element={<TelaoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;
