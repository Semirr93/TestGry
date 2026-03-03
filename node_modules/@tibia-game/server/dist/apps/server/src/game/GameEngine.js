"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const types_1 = require("../../../../shared/types");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ItemManager_1 = require("./ItemManager");
class GameEngine {
    constructor(io) {
        this.players = new Map();
        this.tickRate = 100; // 10 ticks per second
        this.currentTick = 0;
        this.gameLoop = null;
        this.io = io;
        this.itemManager = new ItemManager_1.ItemManager();
        this.initializeMap();
        this.initializeTileTypes();
    }
    initializeMap() {
        try {
            const mapPath = path.join(__dirname, 'testMap.json');
            const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
            // Convert numeric tile types to Tile objects
            const tiles = mapData.tiles.map((row) => row.map((tileType) => ({
                type: tileType,
                isWalkable: tileType !== types_1.TileType.WALL && tileType !== types_1.TileType.WATER
            })));
            this.map = {
                width: mapData.width,
                height: mapData.height,
                tiles
            };
            console.log(`Map loaded: ${this.map.width}x${this.map.height}`);
        }
        catch (error) {
            console.error('Failed to load map:', error);
            // Fallback to empty map
            this.map = {
                width: 20,
                height: 20,
                tiles: Array(20).fill(null).map(() => Array(20).fill(null).map(() => ({
                    type: types_1.TileType.GRASS,
                    isWalkable: true
                })))
            };
        }
    }
    initializeTileTypes() {
        this.tileTypes = {
            [types_1.TileType.GRASS]: { name: 'Grass', color: '#2d5016' },
            [types_1.TileType.WALL]: { name: 'Wall', color: '#8b7355' },
            [types_1.TileType.WATER]: { name: 'Water', color: '#1e90ff' },
            [types_1.TileType.STONE]: { name: 'Stone', color: '#696969' },
            [types_1.TileType.DIRT]: { name: 'Dirt', color: '#8b4513' },
            [types_1.TileType.SAND]: { name: 'Sand', color: '#f4a460' }
        };
    }
    start() {
        if (this.gameLoop)
            return;
        console.log(`Starting game loop at ${1000 / this.tickRate} ticks per second`);
        this.gameLoop = setInterval(() => {
            this.tick();
        }, this.tickRate);
    }
    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            console.log('Game loop stopped');
        }
    }
    tick() {
        this.currentTick++;
        // Create game state update
        const playerPositions = Array.from(this.players.values()).map(player => ({
            id: player.id,
            position: { ...player.position }
        }));
        const gameStateUpdate = {
            tick: this.currentTick,
            players: playerPositions,
            timestamp: Date.now()
        };
        // Broadcast to all connected clients
        this.io.emit('WORLD_UPDATE', gameStateUpdate);
    }
    addPlayer(socketId, playerName) {
        // Find a random empty spawn position
        const spawnPosition = this.findEmptySpawnPosition();
        const player = {
            id: socketId,
            name: playerName,
            position: spawnPosition,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            level: 1,
            experience: 0,
            inventory: this.createEmptyInventory()
        };
        this.players.set(socketId, player);
        console.log(`Player ${playerName} joined at position (${spawnPosition.x}, ${spawnPosition.y})`);
        return player;
    }
    createEmptyInventory() {
        const inventory = [];
        for (let i = 0; i < 20; i++) {
            inventory.push({
                slot: i,
                item: null,
                quantity: 0
            });
        }
        return inventory;
    }
    removePlayer(socketId) {
        const player = this.players.get(socketId);
        if (player) {
            this.players.delete(socketId);
            console.log(`Player ${player.name} left the game`);
        }
    }
    movePlayer(socketId, payload) {
        const player = this.players.get(socketId);
        if (!player) {
            return { success: false, reason: 'Player not found' };
        }
        const newPosition = this.calculateNewPosition(player.position, payload.direction);
        // Validate movement
        if (!this.isValidPosition(newPosition)) {
            return { success: false, reason: 'Invalid position' };
        }
        if (this.isPositionOccupied(newPosition, socketId)) {
            return { success: false, reason: 'Position occupied' };
        }
        // Check if tile is walkable
        if (!this.isTileWalkable(newPosition)) {
            return { success: false, reason: 'Cannot walk on this tile' };
        }
        // Update player position
        player.position = newPosition;
        console.log(`Player ${player.name} moved to (${newPosition.x}, ${newPosition.y})`);
        return { success: true, newPosition };
    }
    calculateNewPosition(currentPosition, direction) {
        const newPosition = { ...currentPosition };
        switch (direction) {
            case 'north':
                newPosition.y -= 1;
                break;
            case 'south':
                newPosition.y += 1;
                break;
            case 'east':
                newPosition.x += 1;
                break;
            case 'west':
                newPosition.x -= 1;
                break;
        }
        return newPosition;
    }
    isValidPosition(position) {
        return position.x >= 0 &&
            position.x < this.map.width &&
            position.y >= 0 &&
            position.y < this.map.height &&
            position.z >= 0;
    }
    isTileWalkable(position) {
        if (!this.isValidPosition(position))
            return false;
        const tile = this.map.tiles[position.y][position.x];
        return tile.isWalkable;
    }
    isPositionOccupied(position, excludePlayerId) {
        for (const [playerId, player] of this.players) {
            if (playerId !== excludePlayerId &&
                player.position.x === position.x &&
                player.position.y === position.y &&
                player.position.z === position.z) {
                return true;
            }
        }
        return false;
    }
    findEmptySpawnPosition() {
        let attempts = 0;
        const maxAttempts = 100;
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * this.map.width);
            const y = Math.floor(Math.random() * this.map.height);
            const position = { x, y, z: 0 };
            if (this.isTileWalkable(position) && !this.isPositionOccupied(position, '')) {
                return position;
            }
            attempts++;
        }
        // Fallback to origin if no empty position found
        return { x: 1, y: 1, z: 0 };
    }
    getPlayer(socketId) {
        return this.players.get(socketId);
    }
    getAllPlayers() {
        return Array.from(this.players.values());
    }
    handleItemPickup(socketId, payload) {
        const player = this.players.get(socketId);
        if (!player) {
            return { success: false, reason: 'Player not found' };
        }
        const worldItem = this.itemManager.getItemAtPosition(player.position);
        if (!worldItem) {
            return { success: false, reason: 'No item at this position' };
        }
        // Check if player is close enough to the item (same tile or adjacent)
        const distance = this.calculateDistance(player.position, worldItem.position);
        if (distance > 1) { // Allow pickup from adjacent tiles
            return { success: false, reason: 'Too far from item' };
        }
        // Check if player has inventory space
        const emptySlot = player.inventory.find(slot => slot.item === null);
        if (!emptySlot) {
            return { success: false, reason: 'Inventory is full' };
        }
        // Pickup the item
        this.itemManager.pickupItem(payload.worldItemId);
        // Add to inventory
        emptySlot.item = worldItem.item;
        emptySlot.quantity = 1;
        console.log(`Player ${player.name} picked up ${worldItem.item.name}`);
        // Notify player
        return { success: true, item: worldItem.item };
    }
    handleItemDrop(socketId, payload) {
        const player = this.players.get(socketId);
        if (!player) {
            return { success: false, reason: 'Player not found' };
        }
        // Find the item in player's inventory
        const itemSlot = player.inventory.find(slot => slot.item && slot.item.id === payload.item.id);
        if (!itemSlot) {
            return { success: false, reason: 'Item not in inventory' };
        }
        // Remove from inventory
        itemSlot.item = null;
        itemSlot.quantity = 0;
        // Drop to world
        this.itemManager.dropItem(payload.item, payload.position);
        console.log(`Player ${player.name} dropped ${payload.item.name}`);
        return { success: true };
    }
    getMapData() {
        return {
            map: this.map,
            tileTypes: this.tileTypes
        };
    }
    handleChatMessage(socketId, payload) {
        const sender = this.players.get(socketId);
        if (!sender)
            return;
        console.log(`Chat message from ${sender.name}: ${payload.text}`);
        // Find all players within chat range
        const recipients = [];
        for (const [playerId, player] of this.players) {
            const distance = this.calculateDistance(sender.position, player.position);
            if (distance <= types_1.CHAT_RANGE) {
                recipients.push(playerId);
            }
        }
        // Send message to recipients
        const messagePayload = {
            ...payload,
            senderName: sender.name
        };
        recipients.forEach(playerId => {
            this.io.to(playerId).emit('CHAT_MESSAGE', messagePayload);
        });
    }
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=GameEngine.js.map