/**
 * Four Souls Online - Hook de Gestión de Sala
 * Encapsula el estado de la sala activa y los métodos de creación, unión y salida.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, Player } from '../types/room';
import { roomStore } from '../services/roomStore';
import { normalizeRoomCode } from '../game/codeGenerator';

export function useRoom() {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeCodeRef = useRef<string | null>(null);

  // Escuchar actualizaciones en tiempo real de la sala actual
  useEffect(() => {
    if (!currentRoom?.code) {
      activeCodeRef.current = null;
      return;
    }

    activeCodeRef.current = currentRoom.code;

    const unsubscribe = roomStore.subscribeToRoom(currentRoom.code, (updatedRoom) => {
      if (!updatedRoom) {
        // La sala fue cerrada o eliminada
        setCurrentRoom(null);
        setCurrentPlayer(null);
        setError('La sala ha sido cerrada.');
      } else {
        setCurrentRoom(updatedRoom);
        // Actualizar datos del jugador local si cambiaron
        if (currentPlayer) {
          const updatedSelf = updatedRoom.players.find((p) => p.id === currentPlayer.id);
          if (updatedSelf) {
            setCurrentPlayer(updatedSelf);
          } else {
            // El jugador fue removido
            setCurrentRoom(null);
            setCurrentPlayer(null);
            setError('Has salido o has sido desconectado de la sala.');
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoom?.code, currentPlayer?.id]);

  const createRoom = useCallback(async (maxPlayers: number = 2): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await roomStore.createRoom({ maxPlayers });
      if (result.success && result.data) {
        setCurrentRoom(result.data.room);
        setCurrentPlayer(result.data.player);
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'No se pudo crear la sala');
        setIsLoading(false);
        return false;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al crear sala');
      setIsLoading(false);
      return false;
    }
  }, []);

  const joinRoom = useCallback(async (code: string): Promise<boolean> => {
    const cleanCode = normalizeRoomCode(code);
    if (!cleanCode) {
      setError('Por favor introduce un código de sala');
      return false;
    }

    if (cleanCode.length !== 6) {
      setError('El código de sala debe contener exactamente 6 caracteres');
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await roomStore.joinRoom(cleanCode);
      if (result.success && result.data) {
        setCurrentRoom(result.data.room);
        setCurrentPlayer(result.data.player);
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || 'No fue posible unirse a la sala');
        setIsLoading(false);
        return false;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al unirse a la sala');
      setIsLoading(false);
      return false;
    }
  }, []);

  const leaveRoom = useCallback(async () => {
    if (currentRoom && currentPlayer) {
      await roomStore.leaveRoom(currentRoom.code, currentPlayer.id);
    }
    setCurrentRoom(null);
    setCurrentPlayer(null);
    setError(null);
  }, [currentRoom, currentPlayer]);

  const toggleReady = useCallback(async () => {
    if (currentRoom && currentPlayer) {
      const updated = await roomStore.toggleReady(currentRoom.code, currentPlayer.id);
      if (updated) {
        setCurrentRoom(updated);
        const me = updated.players.find((p) => p.id === currentPlayer.id);
        if (me) setCurrentPlayer(me);
      }
    }
  }, [currentRoom, currentPlayer]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentRoom,
    currentPlayer,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    clearError,
  };
}
