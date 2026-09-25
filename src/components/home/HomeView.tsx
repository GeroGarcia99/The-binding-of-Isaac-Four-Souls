import React, { useState } from 'react';
import { PushPin } from '../ui/PushPin';
import { normalizeRoomCode } from '../../game/codeGenerator';
import { Loader2 } from 'lucide-react';

interface HomeViewProps {
  onCreateRoom: (maxPlayers: number) => Promise<boolean>;
  onJoinRoom: (code: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

type MenuMode = 'main' | 'join' | 'create_options' | 'options_modal';

export const HomeView: React.FC<HomeViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  isLoading,
  error,
  onClearError,
}) => {
  const [menuMode, setMenuMode] = useState<MenuMode>('main');
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState<number>(2);
  const [joinCode, setJoinCode] = useState<string>('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinRoom(joinCode);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onClearError();
    const clean = normalizeRoomCode(e.target.value).slice(0, 6);
    setJoinCode(clean);
  };

  const handleCreateGame = (maxPlayers: number) => {
    onClearError();
    onCreateRoom(maxPlayers);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-4 sm:py-8 px-3">
      
      {/* ============================================================== */}
      {/* HOJA PRINCIPAL CENTRAL DEL MENÚ                               */}
      {/* ============================================================== */}
      <div className="relative w-full max-w-md sm:max-w-lg paper-sheet border border-stone-400/60 p-6 sm:p-9 transform rotate-[-0.6deg] transition-transform duration-200">
        
        {/* Dos chinchetas/tachuelas visibles en la parte superior */}
        <div className="absolute -top-3 left-10 sm:left-14">
          <PushPin color="red" />
        </div>
        <div className="absolute -top-3 right-10 sm:right-14">
          <PushPin color="red" />
        </div>

        {/* Pequeño rasgado/marca de desgaste decorativa */}
        <div className="absolute -bottom-1.5 right-12 w-8 h-2 bg-stone-400/20 transform rotate-3 rounded-full pointer-events-none" />

        {/* Cabecera / Título de la Hoja */}
        <div className="text-center pt-2 pb-5 border-b-2 border-stone-800/80 border-dashed mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-title font-bold text-stone-900 tracking-wide select-none drop-shadow-[1px_1px_0px_rgba(0,0,0,0.15)] leading-tight">
            Four Souls
            <span className="block text-2xl sm:text-3xl text-stone-700 font-title mt-0.5">
              ~ Online ~
            </span>
          </h1>

          <div className="mt-2 flex items-center justify-center gap-2 text-stone-600 font-hand text-sm sm:text-base">
            <span>⚔</span>
            <span>Edición de mesa multijugador</span>
            <span>⚔</span>
          </div>
        </div>

        {/* Mensaje de Error estilo nota o tachón de tinta */}
        {error && (
          <div className="mb-6 p-3 bg-red-100/90 border-2 border-dashed border-red-700/80 rounded text-stone-900 font-hand text-sm flex items-start justify-between gap-2 shadow-sm">
            <div>
              <span className="font-bold text-red-800 block text-base font-title">
                ¡Atención!
              </span>
              <span>{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-stone-700 hover:text-black font-bold font-mono text-xs px-1.5 py-0.5 border border-stone-500 rounded bg-white/60 cursor-pointer"
            >
              [X]
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* VISTA 1: MENÚ PRINCIPAL                                      */}
        {/* ------------------------------------------------------------ */}
        {menuMode === 'main' && (
          <div className="flex flex-col gap-4 py-2">
            <nav className="flex flex-col gap-3 font-hand text-xl sm:text-2xl text-stone-900 select-none">
              
              {/* Opción 1: Crear partida */}
              <button
                type="button"
                onMouseEnter={() => setHoveredOption(1)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => setMenuMode('create_options')}
                className="group relative flex items-center w-full text-left py-2.5 px-3 rounded cursor-pointer transition-all hover:bg-stone-200/50"
              >
                {/* Flecha indicadora dibujada a mano */}
                <span
                  className={`inline-block mr-2 font-title text-red-700 text-2xl transition-transform duration-150 ${
                    hoveredOption === 1 ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-2'
                  }`}
                >
                  ➔
                </span>
                
                <span
                  className={`font-title font-bold text-stone-900 transition-colors ${
                    hoveredOption === 1 ? 'text-red-900 underline decoration-wavy decoration-red-700/70' : ''
                  }`}
                >
                  1. Crear partida
                </span>

                <span className="ml-auto text-xs sm:text-sm font-hand text-stone-600 group-hover:text-stone-800 hidden sm:inline">
                  (Iniciar sala nueva)
                </span>
              </button>

              {/* Opción 2: Unirse a partida */}
              <button
                type="button"
                onMouseEnter={() => setHoveredOption(2)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => {
                  onClearError();
                  setMenuMode('join');
                }}
                className="group relative flex items-center w-full text-left py-2.5 px-3 rounded cursor-pointer transition-all hover:bg-stone-200/50"
              >
                <span
                  className={`inline-block mr-2 font-title text-red-700 text-2xl transition-transform duration-150 ${
                    hoveredOption === 2 ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-2'
                  }`}
                >
                  ➔
                </span>

                <span
                  className={`font-title font-bold text-stone-900 transition-colors ${
                    hoveredOption === 2 ? 'text-red-900 underline decoration-wavy decoration-red-700/70' : ''
                  }`}
                >
                  2. Unirse a partida
                </span>

                <span className="ml-auto text-xs sm:text-sm font-hand text-stone-600 group-hover:text-stone-800 hidden sm:inline">
                  (Con código de 6 letras)
                </span>
              </button>

              {/* Opción 3: Opciones / Próximamente */}
              <button
                type="button"
                onMouseEnter={() => setHoveredOption(3)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => setMenuMode('options_modal')}
                className="group relative flex items-center w-full text-left py-2.5 px-3 rounded cursor-pointer transition-all hover:bg-stone-200/50"
              >
                <span
                  className={`inline-block mr-2 font-title text-stone-600 text-2xl transition-transform duration-150 ${
                    hoveredOption === 3 ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-2'
                  }`}
                >
                  ➔
                </span>

                <span
                  className={`font-title font-bold text-stone-600 transition-colors ${
                    hoveredOption === 3 ? 'text-stone-800 underline decoration-dotted' : ''
                  }`}
                >
                  3. Opciones
                </span>

                <span className="ml-auto text-xs sm:text-sm font-hand text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded border border-dashed border-stone-400">
                  Próximamente
                </span>
              </button>
            </nav>

            {/* Doodles inferiores decorativos sobre la hoja */}
            <div className="mt-4 pt-4 border-t border-stone-400/50 border-dotted flex items-center justify-between text-stone-500 text-xs sm:text-sm font-hand">
              <span className="flex items-center gap-1.5">
                <span>☠</span> Partidas de 2 a 4 jugadores
              </span>
              <span>v0.1.0 (Boceto)</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* VISTA 2: PANEL DE CREAR PARTIDA (CONFIGURAR AFORO)            */}
        {/* ------------------------------------------------------------ */}
        {menuMode === 'create_options' && (
          <div className="flex flex-col gap-4 py-1 font-hand">
            <div className="flex items-center justify-between border-b border-stone-400 pb-2">
              <h2 className="font-title text-2xl font-bold text-stone-900">
                ✦ Nueva partida
              </h2>
              <button
                onClick={() => setMenuMode('main')}
                className="text-stone-600 hover:text-black font-hand text-base underline cursor-pointer"
              >
                ← Volver al menú
              </button>
            </div>

            <p className="text-stone-700 text-base">
              Selecciona el número de jugadores para la mesa:
            </p>

            {/* Selector dibujado a mano de jugadores (2, 3 o 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-1">
              {/* Opción: 2 Jugadores */}
              <button
                type="button"
                onClick={() => setSelectedMaxPlayers(2)}
                className={`p-3 text-left rounded border-2 transition-all cursor-pointer ${
                  selectedMaxPlayers === 2
                    ? 'border-red-800 bg-red-50/70 shadow-sm'
                    : 'border-stone-400 bg-white/40 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-title font-bold text-red-900">
                    {selectedMaxPlayers === 2 ? '[X]' : '[ ]'}
                  </span>
                  <span className="font-title text-base sm:text-lg font-bold text-stone-900">
                    2 Jugadores
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Duelo 1 vs 1
                </p>
              </button>

              {/* Opción: 3 Jugadores */}
              <button
                type="button"
                onClick={() => setSelectedMaxPlayers(3)}
                className={`p-3 text-left rounded border-2 transition-all cursor-pointer ${
                  selectedMaxPlayers === 3
                    ? 'border-red-800 bg-red-50/70 shadow-sm'
                    : 'border-stone-400 bg-white/40 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-title font-bold text-red-900">
                    {selectedMaxPlayers === 3 ? '[X]' : '[ ]'}
                  </span>
                  <span className="font-title text-base sm:text-lg font-bold text-stone-900">
                    3 Jugadores
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Mesa de 3
                </p>
              </button>

              {/* Opción: 4 Jugadores */}
              <button
                type="button"
                onClick={() => setSelectedMaxPlayers(4)}
                className={`p-3 text-left rounded border-2 transition-all cursor-pointer ${
                  selectedMaxPlayers === 4
                    ? 'border-red-800 bg-red-50/70 shadow-sm'
                    : 'border-stone-400 bg-white/40 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-title font-bold text-red-900">
                    {selectedMaxPlayers === 4 ? '[X]' : '[ ]'}
                  </span>
                  <span className="font-title text-base sm:text-lg font-bold text-stone-900">
                    4 Jugadores
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Mesa completa
                </p>
              </button>
            </div>

            {/* Botón artesanal de confirmación */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleCreateGame(selectedMaxPlayers)}
              className="mt-2 w-full py-3 px-4 bg-stone-900 hover:bg-black text-amber-100 font-title text-xl rounded border-2 border-stone-950 shadow-md cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Dibujando sala...</span>
                </>
              ) : (
                <>
                  <span>➔ Clavar sala en la pared</span>
                </>
              )}
            </button>

            <p className="text-xs text-stone-500 text-center italic">
              Serás el Jugador 1 y obtendrás un código para compartir.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* VISTA 3: PANEL PARA UNIRSE CON CÓDIGO                        */}
        {/* ------------------------------------------------------------ */}
        {menuMode === 'join' && (
          <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4 py-1 font-hand">
            <div className="flex items-center justify-between border-b border-stone-400 pb-2">
              <h2 className="font-title text-2xl font-bold text-stone-900">
                ✦ Unirse con código
              </h2>
              <button
                type="button"
                onClick={() => setMenuMode('main')}
                className="text-stone-600 hover:text-black font-hand text-base underline cursor-pointer"
              >
                ← Volver al menú
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-stone-800 text-base font-hand">
                Escribe las 6 letras del código de sala:
              </label>

              {/* Input estilo cajón de papel */}
              <div className="relative">
                <input
                  type="text"
                  value={joinCode}
                  onChange={handleCodeChange}
                  placeholder="EJ: 7K2M9X"
                  maxLength={6}
                  autoFocus
                  className="w-full bg-white/80 border-2 border-stone-800 text-stone-950 font-mono text-2xl sm:text-3xl text-center tracking-[0.3em] uppercase py-2.5 px-3 rounded shadow-inner focus:outline-none focus:ring-2 focus:ring-red-700/50"
                />
              </div>

              <span className="text-xs text-stone-600">
                (El creador de la partida debe proporcionarte este código).
              </span>
            </div>

            {/* Botón de Unirse */}
            <button
              type="submit"
              disabled={joinCode.length !== 6 || isLoading}
              className="mt-2 w-full py-3 px-4 bg-red-800 hover:bg-red-700 text-amber-50 font-title text-xl rounded border-2 border-red-950 shadow-md cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Buscando sala...</span>
                </>
              ) : (
                <>
                  <span>➔ Unirse a la partida</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------ */}
        {/* VISTA 4: SUB-MODAL DE OPCIONES                               */}
        {/* ------------------------------------------------------------ */}
        {menuMode === 'options_modal' && (
          <div className="flex flex-col gap-4 py-2 font-hand">
            <div className="flex items-center justify-between border-b border-stone-400 pb-2">
              <h2 className="font-title text-2xl font-bold text-stone-900">
                ✦ Opciones del Juego
              </h2>
              <button
                type="button"
                onClick={() => setMenuMode('main')}
                className="text-stone-600 hover:text-black font-hand text-base underline cursor-pointer"
              >
                ← Volver al menú
              </button>
            </div>

            <div className="p-4 bg-amber-50/60 border border-dashed border-stone-400 rounded text-stone-800 text-base leading-relaxed">
              <p className="font-title font-bold text-stone-900 mb-1">
                En desarrollo (Próximamente):
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-stone-700">
                <li>Volumen de efectos y música de ambiente.</li>
                <li>Velocidad de animaciones de cartas y dados.</li>
                <li>Modo daltónico y temas de papel.</li>
                <li>Selector de avatares dibujados a mano.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setMenuMode('main')}
              className="w-full py-2 bg-stone-200 hover:bg-stone-300 border border-stone-400 text-stone-800 font-title text-lg rounded cursor-pointer"
            >
              Entendido, volver
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
