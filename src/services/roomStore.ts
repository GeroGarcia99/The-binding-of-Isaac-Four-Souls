/**
 * Four Souls Online - Servicio de Sincronización y Almacenamiento de Salas
 * 
 * Gestiona el almacenamiento temporal de las salas.
 * Proporciona sincronización en tiempo real:
 * 1. Intenta sincronizar con el backend Express (/api/rooms) si está disponible.
 * 2. Mantiene sincronización entre pestañas en el navegador usando BroadcastChannel y LocalStorage.
 * Esto asegura que dos jugadores (en pestañas o dispositivos) se sincronicen perfectamente.
 */

import { Room, Player, RoomActionResult } from '../types/room';
import { RoomManager } from '../game/roomManager';
import { normalizeRoomCode, isValidRoomCode } from '../game/codeGenerator';

const STORAGE_PREFIX = 'fso_room_';
const BROADCAST_CHANNEL_NAME = 'fso_rooms_channel';

type RoomListener = (room: Room | null) => void;

class RoomStore {
  private memoryRooms: Map<string, Room> = new Map(); // Key: code
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<RoomListener>> = new Map(); // Key: code

  constructor() {
    this.initBroadcastChannel();
    this.loadFromStorage();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const { type, room, code } = event.data || {};
        if (type === 'ROOM_UPDATED' && room) {
          this.memoryRooms.set(room.code, room);
          this.saveToStorage(room);
          this.notifyListeners(room.code, room);
        } else if (type === 'ROOM_DELETED' && code) {
          this.memoryRooms.delete(code);
          this.removeFromStorage(code);
          this.notifyListeners(code, null);
        }
      };
    }
  }

  private broadcastUpdate(room: Room) {
    if (this.channel) {
      this.channel.postMessage({ type: 'ROOM_UPDATED', room });
    }
  }

  private broadcastDelete(code: string) {
    if (this.channel) {
      this.channel.postMessage({ type: 'ROOM_DELETED', code });
    }
  }

  private saveToStorage(room: Room) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${room.code}`, JSON.stringify(room));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  private removeFromStorage(code: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${code}`);
    } catch {
      // Ignore
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            const room: Room = JSON.parse(item);
            this.memoryRooms.set(room.code, room);
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  private notifyListeners(code: string, room: Room | null) {
    const codeListeners = this.listeners.get(code);
    if (codeListeners) {
      codeListeners.forEach((listener) => listener(room));
    }
  }

  /**
   * Suscribe un listener a cambios en una sala específica
   */
  public subscribeToRoom(code: string, listener: RoomListener): () => void {
    const normalized = normalizeRoomCode(code);
    if (!this.listeners.has(normalized)) {
      this.listeners.set(normalized, new Set());
    }
    this.listeners.get(normalized)!.add(listener);

    // Enviar estado actual de inmediato
    const current = this.getRoom(normalized);
    listener(current);

    return () => {
      const set = this.listeners.get(normalized);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(normalized);
        }
      }
    };
  }

  /**
   * Obtiene una sala por su código
   */
  public getRoom(code: string): Room | null {
    const normalized = normalizeRoomCode(code);
    const room = this.memoryRooms.get(normalized);
    if (room) return room;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${normalized}`);
        if (stored) {
          const parsed = JSON.parse(stored) as Room;
          this.memoryRooms.set(normalized, parsed);
          return parsed;
        }
      } catch {
        // Ignore
      }
    }
    return null;
  }

  /**
   * Crea una nueva sala temporal
   */
  public async createRoom(options?: { maxPlayers?: number }): Promise<RoomActionResult<{ room: Room; player: Player }>> {
    try {
      // Intentar API backend primero si responde
      const serverResponse = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      }).catch(() => null);

      if (serverResponse && serverResponse.ok) {
        const result = await serverResponse.json();
        if (result.room && result.player) {
          this.memoryRooms.set(result.room.code, result.room);
          this.saveToStorage(result.room);
          this.broadcastUpdate(result.room);
          return { success: true, data: result };
        }
      }
    } catch {
      // Fallback a almacenamiento local / cliente
    }

    // Creación local
    const { room, hostPlayer } = RoomManager.createRoom(options);
    this.memoryRooms.set(room.code, room);
    this.saveToStorage(room);
    this.broadcastUpdate(room);
    this.notifyListeners(room.code, room);

    return {
      success: true,
      data: { room, player: hostPlayer },
    };
  }

  /**
   * Unirse a una sala mediante código de 6 caracteres
   */
  public async joinRoom(code: string): Promise<RoomActionResult<{ room: Room; player: Player }>> {
    const normalized = normalizeRoomCode(code);

    if (!isValidRoomCode(normalized)) {
      return { success: false, error: 'El código debe tener exactamente 6 caracteres' };
    }

    // Intentar API backend primero
    try {
      const serverResponse = await fetch(`/api/rooms/${normalized}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (serverResponse && serverResponse.ok) {
        const result = await serverResponse.json();
        if (result.room && result.player) {
          this.memoryRooms.set(result.room.code, result.room);
          this.saveToStorage(result.room);
          this.broadcastUpdate(result.room);
          this.notifyListeners(result.room.code, result.room);
          return { success: true, data: result };
        }
      } else if (serverResponse && !serverResponse.ok) {
        const errData = await serverResponse.json().catch(() => null);
        if (errData?.error) {
          return { success: false, error: errData.error };
        }
      }
    } catch {
      // Fallback local
    }

    // Buscar sala localmente
    const room = this.getRoom(normalized);
    if (!room) {
      return {
        success: false,
        error: `No se encontró ninguna sala con el código "${normalized}"`,
      };
    }

    const joinResult = RoomManager.joinRoom(room);
    if (!joinResult.success || !joinResult.room || !joinResult.player) {
      return {
        success: false,
        error: joinResult.error || 'No fue posible unirse a la sala',
      };
    }

    this.memoryRooms.set(joinResult.room.code, joinResult.room);
    this.saveToStorage(joinResult.room);
    this.broadcastUpdate(joinResult.room);
    this.notifyListeners(joinResult.room.code, joinResult.room);

    return {
      success: true,
      data: { room: joinResult.room, player: joinResult.player },
    };
  }

  /**
   * Salir de la sala actual
   */
  public async leaveRoom(code: string, playerId: string): Promise<void> {
    const normalized = normalizeRoomCode(code);

    try {
      fetch(`/api/rooms/${normalized}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      }).catch(() => null);
    } catch {
      // Ignore
    }

    const room = this.getRoom(normalized);
    if (!room) return;

    const { room: updatedRoom, isEmpty } = RoomManager.removePlayer(room, playerId);

    if (isEmpty) {
      this.memoryRooms.delete(normalized);
      this.removeFromStorage(normalized);
      this.broadcastDelete(normalized);
      this.notifyListeners(normalized, null);
    } else {
      this.memoryRooms.set(normalized, updatedRoom);
      this.saveToStorage(updatedRoom);
      this.broadcastUpdate(updatedRoom);
      this.notifyListeners(normalized, updatedRoom);
    }
  }

  /**
   * Alternar estado Listo de un jugador
   */
  public async toggleReady(code: string, playerId: string): Promise<Room | null> {
    const normalized = normalizeRoomCode(code);

    try {
      const serverResponse = await fetch(`/api/rooms/${normalized}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      }).catch(() => null);

      if (serverResponse && serverResponse.ok) {
        const result = await serverResponse.json();
        if (result.room) {
          this.memoryRooms.set(result.room.code, result.room);
          this.saveToStorage(result.room);
          this.broadcastUpdate(result.room);
          this.notifyListeners(result.room.code, result.room);
          return result.room;
        }
      }
    } catch {
      // Fallback
    }

    const room = this.getRoom(normalized);
    if (!room) return null;

    const updated = RoomManager.togglePlayerReady(room, playerId);
    this.memoryRooms.set(normalized, updated);
    this.saveToStorage(updated);
    this.broadcastUpdate(updated);
    this.notifyListeners(normalized, updated);

    return updated;
  }
}

export const roomStore = new RoomStore();
