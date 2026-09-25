import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './src/game/roomManager.ts';
import { normalizeRoomCode, isValidRoomCode } from './src/game/codeGenerator.ts';
import { Room } from './src/types/room.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rooms = new Map<string, Room>();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Endpoints
  app.post('/api/rooms', (req: Request, res: Response) => {
    try {
      const maxPlayers = req.body.maxPlayers ? parseInt(req.body.maxPlayers, 10) : 2;
      const { room, hostPlayer } = RoomManager.createRoom({ maxPlayers });
      rooms.set(room.code, room);
      res.status(201).json({ room, player: hostPlayer });
    } catch {
      res.status(500).json({ error: 'Error al crear la sala' });
    }
  });

  app.get('/api/rooms/:code', (req: Request, res: Response) => {
    const code = normalizeRoomCode(req.params.code);
    const room = rooms.get(code);
    if (!room) {
      res.status(404).json({ error: 'Sala no encontrada' });
      return;
    }
    res.json({ room });
  });

  app.post('/api/rooms/:code/join', (req: Request, res: Response) => {
    const code = normalizeRoomCode(req.params.code);
    if (!isValidRoomCode(code)) {
      res.status(400).json({ error: 'Código de sala inválido (debe tener 6 caracteres)' });
      return;
    }

    const room = rooms.get(code);
    if (!room) {
      res.status(404).json({ error: `No existe ninguna sala con el código "${code}"` });
      return;
    }

    const result = RoomManager.joinRoom(room);
    if (!result.success || !result.room || !result.player) {
      res.status(400).json({ error: result.error || 'No fue posible unirse a la sala' });
      return;
    }

    rooms.set(code, result.room);
    res.json({ room: result.room, player: result.player });
  });

  app.post('/api/rooms/:code/leave', (req: Request, res: Response) => {
    const code = normalizeRoomCode(req.params.code);
    const { playerId } = req.body;
    const room = rooms.get(code);

    if (room && playerId) {
      const { room: updatedRoom, isEmpty } = RoomManager.removePlayer(room, playerId);
      if (isEmpty) {
        rooms.delete(code);
      } else {
        rooms.set(code, updatedRoom);
      }
    }

    res.json({ success: true });
  });

  app.post('/api/rooms/:code/ready', (req: Request, res: Response) => {
    const code = normalizeRoomCode(req.params.code);
    const { playerId } = req.body;
    const room = rooms.get(code);

    if (!room) {
      res.status(404).json({ error: 'Sala no encontrada' });
      return;
    }

    if (!playerId) {
      res.status(400).json({ error: 'Identificador de jugador no proporcionado' });
      return;
    }

    const updated = RoomManager.togglePlayerReady(room, playerId);
    rooms.set(code, updated);
    res.json({ room: updated });
  });

  // Modo desarrollo con Vite middlewares o producción estática
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Four Souls Online server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
