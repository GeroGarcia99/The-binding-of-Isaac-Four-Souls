/**
 * Four Souls Online - Room & Player Types
 * Define las entidades fundamentales de sala y jugadores requeridas para la fase inicial.
 */

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export type PlayerSlot = 1 | 2 | 3 | 4;

export interface Player {
  /** Identificador único temporal de la sesión del jugador */
  id: string;
  /** Nombre representativo (ej: 'Jugador 1', 'Jugador 2') */
  name: string;
  /** Posición/Asiento del jugador en la mesa (1 a 4) */
  slot: PlayerSlot;
  /** Indica si es el anfitrión y creador de la sala */
  isHost: boolean;
  /** Estado de preparación del jugador en la sala de espera */
  isReady: boolean;
  /** Marca de tiempo de unión */
  joinedAt: number;
}

export interface Room {
  /** ID interno único de la sala */
  id: string;
  /** Código de 6 caracteres alfanumérico para compartir y unirse */
  code: string;
  /** Lista de jugadores presentes en la sala */
  players: Player[];
  /** Número máximo permitido de jugadores (base: 2, escalable hasta 4) */
  maxPlayers: number;
  /** Estado del ciclo de vida de la sala */
  status: RoomStatus;
  /** Marca de tiempo de creación */
  createdAt: number;
  /** Última actualización de la sala */
  updatedAt: number;
}

export interface CreateRoomOptions {
  maxPlayers?: number;
  hostName?: string;
}

export interface JoinRoomPayload {
  code: string;
  playerName?: string;
}

export interface RoomActionResult<T = Room> {
  success: boolean;
  data?: T;
  error?: string;
}
