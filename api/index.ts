import express, { Request, Response, Router } from 'express';
import { RoomManager } from '../src/game/roomManager.ts';
import { normalizeRoomCode, isValidRoomCode } from '../src/game/codeGenerator.ts';
import { roomStorage } from '../src/server/roomStorage.ts';

const app = express();
app.use(express.json());

// Enable CORS for flexibility across client/server requests
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Router with all Room API endpoints backed by distributed storage
const router = Router();

// POST /rooms - Crear nueva sala
router.post('/rooms', async (req: Request, res: Response) => {
  try {
    const rawMax = req.body?.maxPlayers ? parseInt(req.body.maxPlayers, 10) : 2;
    const maxPlayers = Math.min(Math.max(isNaN(rawMax) ? 2 : rawMax, 2), 4);
    const { room, hostPlayer } = RoomManager.createRoom({ maxPlayers });

    await roomStorage.saveRoom(room);
    res.status(201).json({ room, player: hostPlayer });
  } catch (err) {
    console.error('Error al crear sala:', err);
    res.status(500).json({ error: 'Error al crear la sala en el almacenamiento compartido' });
  }
});

// GET /rooms/:code - Consultar estado actual de una sala
router.get('/rooms/:code', async (req: Request, res: Response) => {
  try {
    const code = normalizeRoomCode(req.params.code);
    const room = await roomStorage.getRoom(code);

    if (!room) {
      res.status(404).json({ error: 'Sala no encontrada' });
      return;
    }
    res.json({ room });
  } catch (err) {
    console.error('Error al consultar sala:', err);
    res.status(500).json({ error: 'Error al consultar la sala' });
  }
});

// POST /rooms/:code/join - Unirse a una sala
router.post('/rooms/:code/join', async (req: Request, res: Response) => {
  try {
    const code = normalizeRoomCode(req.params.code);
    if (!isValidRoomCode(code)) {
      res.status(400).json({ error: 'El código de sala debe contener exactamente 6 caracteres' });
      return;
    }

    const room = await roomStorage.getRoom(code);
    if (!room) {
      res.status(404).json({ error: `No existe ninguna sala con el código "${code}"` });
      return;
    }

    const result = RoomManager.joinRoom(room);
    if (!result.success || !result.room || !result.player) {
      res.status(400).json({ error: result.error || 'No fue posible unirse a la sala' });
      return;
    }

    await roomStorage.saveRoom(result.room);
    res.json({ room: result.room, player: result.player });
  } catch (err) {
    console.error('Error al unirse a la sala:', err);
    res.status(500).json({ error: 'Error al unirse a la sala' });
  }
});

// POST /rooms/:code/leave - Salir de una sala
router.post('/rooms/:code/leave', async (req: Request, res: Response) => {
  try {
    const code = normalizeRoomCode(req.params.code);
    const { playerId } = req.body || {};
    const room = await roomStorage.getRoom(code);

    if (room && playerId) {
      const { room: updatedRoom, isEmpty } = RoomManager.removePlayer(room, playerId);
      if (isEmpty) {
        await roomStorage.deleteRoom(code);
      } else {
        await roomStorage.saveRoom(updatedRoom);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error al salir de la sala:', err);
    res.status(500).json({ error: 'Error al salir de la sala' });
  }
});

// POST /rooms/:code/ready - Alternar estado listo
router.post('/rooms/:code/ready', async (req: Request, res: Response) => {
  try {
    const code = normalizeRoomCode(req.params.code);
    const { playerId } = req.body || {};
    const room = await roomStorage.getRoom(code);

    if (!room) {
      res.status(404).json({ error: 'Sala no encontrada' });
      return;
    }

    if (!playerId) {
      res.status(400).json({ error: 'Identificador de jugador no proporcionado' });
      return;
    }

    const updated = RoomManager.togglePlayerReady(room, playerId);
    await roomStorage.saveRoom(updated);
    res.json({ room: updated });
  } catch (err) {
    console.error('Error al alternar estado listo:', err);
    res.status(500).json({ error: 'Error al actualizar estado del jugador' });
  }
});

// GET /health - Verificación de estado del backend
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    sharedStore: roomStorage.hasSharedStore() ? 'upstash_redis' : 'local_fallback',
  });
});

// Mount router on both /api and / to handle any rewrite style seamlessly
app.use('/api', router);
app.use('/', router);

export default app;
