import React, { useState } from 'react';
import { Room, Player } from '../../types/room';
import { PushPin } from '../ui/PushPin';
import { Copy, Check } from 'lucide-react';

interface WaitingRoomViewProps {
  room: Room;
  currentPlayer: Player | null;
  onLeaveRoom: () => void;
  onToggleReady: () => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  room,
  currentPlayer,
  onLeaveRoom,
  onToggleReady,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = currentPlayer?.isHost ?? false;
  const isReady = currentPlayer?.isReady ?? false;

  // Condiciones de inicio dinámicas según maxPlayers
  const isRoomFull = room.players.length === room.maxPlayers;
  const allReady = isRoomFull && room.players.every((p) => p.isReady);
  const canHostStart = isHost && isRoomFull && allReady;

  // Renderizado dinámico de asientos según maxPlayers (2, 3 o 4)
  const totalSlots = Array.from({ length: room.maxPlayers }, (_, index) => {
    const slotNumber = (index + 1) as 1 | 2 | 3 | 4;
    const playerInSlot = room.players.find((p) => p.slot === slotNumber);
    return {
      slot: slotNumber,
      player: playerInSlot || null,
    };
  });

  const firstAvailableSlot = totalSlots.find((s) => !s.player)?.slot;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 py-4 px-3 font-hand">
      
      {/* Hoja Principal Pinned de la Sala */}
      <div className="relative w-full paper-sheet border border-stone-400/70 p-6 sm:p-9 transform rotate-[-0.4deg]">
        
        {/* Dos chinchetas/tachuelas en la parte superior */}
        <div className="absolute -top-3 left-10 sm:left-14">
          <PushPin color="red" />
        </div>
        <div className="absolute -top-3 right-10 sm:right-14">
          <PushPin color="blue" />
        </div>

        {/* Encabezado de la Sala */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-dashed border-stone-800 pb-4 mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-title font-bold text-stone-900">
                Sala de Espera
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-200 border border-stone-400 font-mono text-stone-700">
                {room.status === 'waiting' ? 'Esperando jugadores' : room.status}
              </span>
            </div>
            <p className="text-sm text-stone-600">
              {currentPlayer?.name} · {isHost ? 'Anfitrión (Jugador 1)' : `Invitado (${currentPlayer?.name})`}
            </p>
          </div>

          {/* Opción para Salir */}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="text-stone-700 hover:text-red-900 font-title text-base underline cursor-pointer hover:bg-stone-200/50 px-2 py-1 rounded transition-colors"
          >
            ← Desclavar y salir
          </button>
        </div>

        {/* ============================================================== */}
        {/* RECUADRO DESTACADO CON CÓDIGO DE SALA                          */}
        {/* ============================================================== */}
        <div className="flex flex-col items-center text-center p-5 rounded-lg bg-amber-50/70 border-2 border-stone-800 shadow-sm mb-6">
          <span className="font-hand text-sm text-stone-700 uppercase tracking-widest">
            Código para compartir:
          </span>

          <div className="flex items-center justify-center gap-3 my-2 flex-wrap">
            <span className="text-4xl sm:text-5xl font-mono font-black tracking-[0.25em] text-red-900 selection:bg-amber-300">
              {room.code}
            </span>

            <button
              onClick={handleCopyCode}
              title="Copiar código"
              className="py-1.5 px-3 bg-white hover:bg-stone-100 border-2 border-stone-800 rounded font-title text-sm cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 text-stone-800"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span className="text-emerald-800 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-700" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-stone-600 max-w-md">
            Pasa este código a los participantes para que ingresen desde la opción{' '}
            <strong className="text-stone-900">“2. Unirse a partida”</strong>.
          </p>
        </div>

        {/* ============================================================== */}
        {/* LISTA DE ASIENTOS / JUGADORES DIBUJADOS DINÁMICAMENTE         */}
        {/* ============================================================== */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 text-stone-800">
            <span className="font-title text-lg font-bold">
              ✦ Asientos en la mesa ({room.players.length}/{room.maxPlayers}):
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {totalSlots.map(({ slot, player }) => {
              const isSelf = player && currentPlayer && player.id === currentPlayer.id;

              return (
                <div
                  key={slot}
                  className={`p-4 rounded border-2 transition-all flex flex-col justify-between min-h-[110px] ${
                    player
                      ? isSelf
                        ? 'border-red-900 bg-red-50/50 shadow-sm'
                        : 'border-stone-800 bg-white/70 shadow-sm'
                      : 'border-dashed border-stone-400 bg-stone-100/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase text-stone-500 block">
                        Asiento #{slot}
                      </span>
                      <span className="font-title text-xl font-bold text-stone-900 block leading-tight">
                        {player ? player.name : `Esperando Jugador ${slot}...`}
                      </span>
                    </div>

                    {player?.isHost && (
                      <span className="text-xs font-hand font-bold bg-amber-200/80 border border-amber-500 px-2 py-0.5 rounded text-amber-900">
                        ♔ Anfitrión
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-300 border-dotted">
                    <span className="text-xs text-stone-600">
                      {isSelf ? '(Tu asiento)' : player ? 'Conectado' : 'Vacío'}
                    </span>

                    {player ? (
                      player.isReady ? (
                        <span className="text-xs font-title font-bold text-emerald-800 bg-emerald-100 border border-emerald-500 px-2 py-0.5 rounded">
                          ✓ Listo
                        </span>
                      ) : (
                        <span className="text-xs font-title text-stone-600 bg-stone-200 border border-stone-400 px-2 py-0.5 rounded">
                          ⏳ Esperando
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-hand text-stone-400 italic">
                        {slot === firstAvailableSlot ? 'Siguiente en unirse' : 'Disponible'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTONES DE ACCIÓN                                             */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {/* Botón de alternar Listo (disponible para todos) */}
          <button
            type="button"
            onClick={onToggleReady}
            className={`w-full sm:flex-1 py-3 px-4 font-title text-lg rounded border-2 shadow-md cursor-pointer transition-all active:scale-[0.98] ${
              isReady
                ? 'bg-emerald-800 hover:bg-emerald-900 text-emerald-50 border-emerald-950'
                : 'bg-stone-900 hover:bg-black text-amber-50 border-stone-950'
            }`}
          >
            {isReady ? '✓ Estoy Listo (Hacer clic para desmarcar)' : '➔ Marcar como Listo'}
          </button>

          {/* Botón de Iniciar Partida (Solo el anfitrión puede iniciar) */}
          {isHost ? (
            <button
              type="button"
              disabled={!canHostStart}
              title={
                !isRoomFull
                  ? `Esperando que se ocupen todos los asientos (${room.players.length}/${room.maxPlayers})`
                  : !allReady
                  ? `Esperando que todos los participantes marquen Listo (${room.players.filter((p) => p.isReady).length}/${room.maxPlayers})`
                  : `Comenzar partida con ${room.maxPlayers} jugadores`
              }
              className={`w-full sm:flex-1 py-3 px-4 font-title text-lg rounded border-2 shadow-md transition-all ${
                canHostStart
                  ? 'bg-red-800 hover:bg-red-700 text-amber-50 border-red-950 cursor-pointer active:scale-[0.98]'
                  : 'bg-stone-200 text-stone-500 border-stone-400 cursor-not-allowed opacity-60'
              }`}
            >
              Iniciar partida ({room.players.length}/{room.maxPlayers})
            </button>
          ) : (
            <div className="w-full sm:flex-1 py-3 px-4 bg-stone-100/70 text-stone-600 font-title text-base text-center rounded border border-stone-300">
              Esperando al anfitrión para iniciar ({room.players.length}/{room.maxPlayers})
            </div>
          )}
        </div>

        {/* Nota al pie */}
        <div className="mt-6 pt-3 border-t border-stone-300 text-center text-xs text-stone-600">
          <span>Sala: {room.id}</span> · <span>Capacidad: {room.maxPlayers} jugadores</span>
        </div>

      </div>

    </div>
  );
};
