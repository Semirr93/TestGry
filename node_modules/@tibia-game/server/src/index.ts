import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameEngine } from './game/GameEngine';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize game engine
const gameEngine = new GameEngine(io);
gameEngine.start();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Handle player joining
  socket.on('PLAYER_JOIN', (playerName: string) => {
    const player = gameEngine.addPlayer(socket.id, playerName);
    
    // Notify all players about the new player
    socket.broadcast.emit('PLAYER_JOINED', player);
    
    // Send current game state to the new player
    socket.emit('MOVE_CONFIRMED', player.position);
  });

  // Handle player movement
  socket.on('PLAYER_MOVE', (payload) => {
    const result = gameEngine.movePlayer(socket.id, payload);
    
    if (result.success) {
      socket.emit('MOVE_CONFIRMED', result.newPosition!);
    } else {
      socket.emit('MOVE_REJECTED', result.reason || 'Unknown error');
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    gameEngine.removePlayer(socket.id);
    
    // Notify other players
    socket.broadcast.emit('PLAYER_LEFT', socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', players: gameEngine.getAllPlayers().length });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
