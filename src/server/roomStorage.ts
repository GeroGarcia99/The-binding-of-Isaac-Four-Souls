/**
 * Four Souls Online - Almacenamiento Compartido Distribuido para Salas
 * 
 * Utiliza Upstash Redis / Vercel KV como fuente de verdad compartida entre instancias Serverless.
 * - Compatible con todas las regiones y cold starts de Vercel.
 * - Expiración automática (TTL) tras 2 horas de inactividad.
 * - No depende de variables de memoria de un único proceso.
 */

import { Redis } from '@upstash/redis';
import { Room } from '../types/room.ts';

// Tiempo de vida de la sala tras inactividad: 2 horas (en segundos)
const ROOM_TTL_SECONDS = 7200;
const ROOM_KEY_PREFIX = 'fso_room:';

class RoomStorageService {
  private redis: Redis | null = null;
  private isConfigured: boolean = false;
  // Almacén de contingencia únicamente para desarrollo local sin conexión/sin env vars
  private localFallbackMap: Map<string, Room> = new Map();

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (url && token) {
      try {
        this.redis = new Redis({ url, token });
        this.isConfigured = true;
      } catch (err) {
        console.error('Error al inicializar cliente Upstash Redis:', err);
        this.redis = null;
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
    }
  }

  /**
   * Indica si la base de datos externa compartida está configurada
   */
  public hasSharedStore(): boolean {
    return this.isConfigured && this.redis !== null;
  }

  /**
   * Guarda o actualiza una sala en el almacenamiento compartido con TTL de expiración automática
   */
  public async saveRoom(room: Room): Promise<void> {
    const key = `${ROOM_KEY_PREFIX}${room.code.toUpperCase()}`;
    room.updatedAt = Date.now();

    if (this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(room), { ex: ROOM_TTL_SECONDS });
        return;
      } catch (err) {
        console.error(`[Redis] Error al guardar sala ${room.code}:`, err);
      }
    }

    // Fallback de desarrollo local si no hay credenciales configuradas
    this.localFallbackMap.set(room.code.toUpperCase(), room);
  }

  /**
   * Obtiene una sala por su código desde el almacenamiento compartido
   */
  public async getRoom(code: string): Promise<Room | null> {
    const key = `${ROOM_KEY_PREFIX}${code.toUpperCase()}`;

    if (this.redis) {
      try {
        const raw = await this.redis.get<string | Room>(key);
        if (!raw) return null;

        if (typeof raw === 'string') {
          return JSON.parse(raw) as Room;
        }
        return raw as Room;
      } catch (err) {
        console.error(`[Redis] Error al consultar sala ${code}:`, err);
      }
    }

    // Fallback de desarrollo local
    return this.localFallbackMap.get(code.toUpperCase()) || null;
  }

  /**
   * Elimina una sala del almacenamiento compartido (ej. cuando queda vacía)
   */
  public async deleteRoom(code: string): Promise<void> {
    const key = `${ROOM_KEY_PREFIX}${code.toUpperCase()}`;

    if (this.redis) {
      try {
        await this.redis.del(key);
        return;
      } catch (err) {
        console.error(`[Redis] Error al eliminar sala ${code}:`, err);
      }
    }

    this.localFallbackMap.delete(code.toUpperCase());
  }
}

export const roomStorage = new RoomStorageService();
