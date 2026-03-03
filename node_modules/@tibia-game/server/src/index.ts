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

// Test endpoint
app.get('/', (req, res) => {
  res.send('Game Server is Running!');
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // Handle player joining
  socket.on('PLAYER_JOIN', (playerName: string) => {
    const player = gameEngine.addPlayer(socket.id, playerName);
    
    // Send map data to the new player
    const mapData = gameEngine.getMapData();
    socket.emit('MAP_DATA', mapData);
    
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

  // Handle item pickup
  socket.on('ITEM_PICKUP', (payload) => {
    const result = gameEngine.handleItemPickup(socket.id, payload);
    
    if (result.success && result.item) {
      socket.emit('INVENTORY_UPDATE', { 
        playerId: socket.id, 
        inventory: gameEngine.getPlayer(socket.id)?.inventory || [] 
      });
      
      // Notify other players
      socket.broadcast.emit('ITEM_PICKUP', {
        playerId: socket.id,
        item: result.item,
        worldItemId: payload.worldItemId
      });
    } else {
      socket.emit('MOVE_REJECTED', result.reason || 'Cannot pickup item');
    }
  });

  // Handle item drop
  socket.on('ITEM_DROP', (payload) => {
    const result = gameEngine.handleItemDrop(socket.id, payload);
    
    if (result.success) {
      socket.emit('INVENTORY_UPDATE', { 
        playerId: socket.id, 
        inventory: gameEngine.getPlayer(socket.id)?.inventory || [] 
      });
      
      // Notify other players
      socket.broadcast.emit('ITEM_DROP', payload);
    } else {
      socket.emit('MOVE_REJECTED', result.reason || 'Cannot drop item');
    }
  });
  
  // Handle chat messages
  socket.on('CHAT_MESSAGE', (payload) => {
    gameEngine.handleChatMessage(socket.id, payload);
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
