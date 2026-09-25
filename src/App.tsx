/**
 * Four Souls Online - Aplicación Principal
 * Estética: Menú dibujado a mano sobre hojas de papel clavadas en la pared
 */

import React from 'react';
import { useRoom } from './hooks/useRoom';
import { HomeView } from './components/home/HomeView';
import { WaitingRoomView } from './components/lobby/WaitingRoomView';
import { DoodleBackground } from './components/ui/DoodleBackground';

export default function App() {
  const {
    currentRoom,
    currentPlayer,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    clearError,
  } = useRoom();

  return (
    <div className="min-h-screen bg-[#cac6bc] text-stone-900 flex flex-col justify-between wall-background relative overflow-x-hidden selection:bg-amber-300 selection:text-stone-900 font-hand">
      
      {/* Fondo con garabatos y bocetos tenues dibujados al lápiz */}
      <DoodleBackground />

      {/* Barra superior sutil tipo membrete artesanal */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-stone-400/40 bg-stone-100/30 backdrop-blur-[2px]">
        {/* Marca */}
        <div className="flex items-center gap-2">
          <span className="text-xl">☠</span>
          <span className="font-title font-bold text-lg sm:text-xl text-stone-900 tracking-wide">
            Four Souls Online
          </span>
        </div>

        {/* Indicador de estado de sala o versión */}
        <div className="flex items-center gap-3">
          {currentRoom ? (
            <div className="flex items-center gap-1.5 bg-[#fbf8ee] border border-stone-500 px-2.5 py-1 rounded shadow-xs text-sm font-hand">
              <span className="text-stone-600">Sala:</span>
              <span className="font-bold text-red-800 font-mono tracking-wider">{currentRoom.code}</span>
            </div>
          ) : (
            <span className="text-xs font-hand text-stone-700 bg-[#fbf8ee]/70 border border-stone-400/60 px-2 py-0.5 rounded shadow-2xs">
              Mesa multijugador · Fase 1
            </span>
          )}
        </div>
      </header>

      {/* Área Central: Menú principal o Sala de espera */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6">
        {!currentRoom ? (
          <HomeView
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
          />
        ) : (
          <WaitingRoomView
            room={currentRoom}
            currentPlayer={currentPlayer}
            onLeaveRoom={leaveRoom}
            onToggleReady={toggleReady}
          />
        )}
      </main>

      {/* Pie de página minimalista dibujado */}
      <footer className="relative z-10 w-full py-2.5 px-4 text-center text-xs text-stone-600 font-hand border-t border-stone-400/30 bg-stone-100/20 flex flex-col sm:flex-row items-center justify-between gap-1">
        <span>Four Souls Online — Prototipo artesanal en papel</span>
        <span className="text-stone-500 font-mono text-[11px]">Inspirado en estética indie de bocetos</span>
      </footer>
    </div>
  );
}
