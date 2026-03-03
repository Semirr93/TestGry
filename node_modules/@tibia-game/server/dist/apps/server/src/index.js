"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const GameEngine_1 = require("./game/GameEngine");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 3001;
// Initialize game engine
const gameEngine = new GameEngine_1.GameEngine(io);
gameEngine.start();
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    // Handle player joining
    socket.on('PLAYER_JOIN', (playerName) => {
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
            socket.emit('MOVE_CONFIRMED', result.newPosition);
        }
        else {
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
        }
        else {
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
        }
        else {
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
//# sourceMappingURL=index.js.map