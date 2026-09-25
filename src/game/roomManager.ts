/**
 * Four Souls Online - Lógica de Dominio para Gestión de Salas
 * 
 * Contiene reglas de negocio puras, independientes de la interfaz de usuario:
 * - Creación de sala temporal
 * - Asignación de Jugador 1 (Anfitrión) y Jugador 2 (Invitado)
 * - Verificación de cupo máximo (base 2, escalable hasta 4)
 * - Gestión de estados: 'waiting' | 'playing' | 'finished'
 */

import { Room, Player, PlayerSlot, RoomStatus } from '../types/room';
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from './codeGenerator';

export class RoomManager {
  /**
   * Crea una nueva sala temporal e inicializa al creador como Jugador 1
   */
  public static createRoom(options?: { maxPlayers?: number; hostId?: string }): { room: Room; hostPlayer: Player } {
    const maxPlayers = options?.maxPlayers ?? 2;
    const now = Date.now();
    const roomId = `room_${now}_${Math.random().toString(36).substring(2, 8)}`;
    const code = generateRoomCode();

    const hostPlayer: Player = {
      id: options?.hostId || `player_${now}_1`,
      name: 'Jugador 1',
      slot: 1,
      isHost: true,
      isReady: true,
      joinedAt: now,
    };

    const room: Room = {
      id: roomId,
      code,
      players: [hostPlayer],
      maxPlayers: Math.min(Math.max(maxPlayers, 2), 4), // Rango permitido: 2 a 4 jugadores
      status: 'waiting',
      createdAt: now,
      updatedAt: now,
    };

    return { room, hostPlayer };
  }

  /**
   * Agrega un nuevo jugador a la sala existente
   */
  public static joinRoom(
    room: Room,
    playerId?: string
  ): { success: boolean; room?: Room; player?: Player; error?: string } {
    if (room.status !== 'waiting') {
      return { success: false, error: 'La partida ya no está en sala de espera' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: `La sala está llena (máximo ${room.maxPlayers} jugadores)` };
    }

    // Determinar siguiente slot libre (2, 3 o 4)
    const occupiedSlots = new Set(room.players.map((p) => p.slot));
    let nextSlot: PlayerSlot = 2;
    for (let s = 1; s <= room.maxPlayers; s++) {
      if (!occupiedSlots.has(s as PlayerSlot)) {
        nextSlot = s as PlayerSlot;
        break;
      }
    }

    const now = Date.now();
    const newPlayer: Player = {
      id: playerId || `player_${now}_${nextSlot}`,
      name: `Jugador ${nextSlot}`,
      slot: nextSlot,
      isHost: false,
      isReady: false,
      joinedAt: now,
    };

    const updatedRoom: Room = {
      ...room,
      players: [...room.players, newPlayer],
      updatedAt: now,
    };

    return {
      success: true,
      room: updatedRoom,
      player: newPlayer,
    };
  }

  /**
   * Remueve a un jugador de la sala
   */
  public static removePlayer(
    room: Room,
    playerId: string
  ): { room: Room; wasHost: boolean; isEmpty: boolean } {
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      return { room, wasHost: false, isEmpty: room.players.length === 0 };
    }

    const removedPlayer = room.players[playerIndex];
    const remainingPlayers = room.players.filter((p) => p.id !== playerId);

    // Si era el host y aún quedan jugadores, transferir el rol de anfitrión
    if (removedPlayer.isHost && remainingPlayers.length > 0) {
      remainingPlayers[0] = {
        ...remainingPlayers[0],
        isHost: true,
      };
    }

    const updatedRoom: Room = {
      ...room,
      players: remainingPlayers,
      updatedAt: Date.now(),
    };

    return {
      room: updatedRoom,
      wasHost: removedPlayer.isHost,
      isEmpty: remainingPlayers.length === 0,
    };
  }

  /**
   * Cambia el estado de preparación de un jugador
   */
  public static togglePlayerReady(room: Room, playerId: string): Room {
    const updatedPlayers = room.players.map((player) => {
      if (player.id === playerId) {
        return { ...player, isReady: !player.isReady };
      }
      return player;
    });

    return {
      ...room,
      players: updatedPlayers,
      updatedAt: Date.now(),
    };
  }

  /**
   * Actualiza el estado de la sala ('waiting' | 'playing' | 'finished')
   */
  public static updateRoomStatus(room: Room, newStatus: RoomStatus): Room {
    return {
      ...room,
      status: newStatus,
      updatedAt: Date.now(),
    };
  }

  /**
   * Valida si la sala está lista para comenzar (todos los cupos ocupados y todos listos)
   */
  public static canStartGame(room: Room): boolean {
    return (
      room.status === 'waiting' &&
      room.players.length === room.maxPlayers &&
      room.players.every((p) => p.isReady)
    );
  }
}
