import { Server, Socket } from 'socket.io';
import { Position, Player, PlayerPosition, MovePayload, GameStateUpdate, ClientToServerEvents, ServerToClientEvents, TileType, Tile, GameMap, MapData, ChatMessagePayload, CHAT_RANGE } from '../../../../shared/types';
import * as fs from 'fs';
import * as path from 'path';

export class GameEngine {
  private players: Map<string, Player> = new Map();
  private map: GameMap;
  private tileTypes: Record<TileType, { name: string; color: string }>;
  private tickRate: number = 100; // 10 ticks per second
  private currentTick: number = 0;
  private gameLoop: NodeJS.Timeout | null = null;
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.initializeMap();
    this.initializeTileTypes();
  }

  private initializeMap(): void {
    try {
      const mapPath = path.join(__dirname, 'testMap.json');
      const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      
      // Convert numeric tile types to Tile objects
      const tiles: Tile[][] = mapData.tiles.map((row: number[]) =>
        row.map((tileType: number) => ({
          type: tileType as TileType,
          isWalkable: tileType !== TileType.WALL && tileType !== TileType.WATER
        }))
      );

      this.map = {
        width: mapData.width,
        height: mapData.height,
        tiles
      };

      console.log(`Map loaded: ${this.map.width}x${this.map.height}`);
    } catch (error) {
      console.error('Failed to load map:', error);
      // Fallback to empty map
      this.map = {
        width: 20,
        height: 20,
        tiles: Array(20).fill(null).map(() => 
          Array(20).fill(null).map(() => ({
            type: TileType.GRASS,
            isWalkable: true
          }))
        )
      };
    }
  }

  private initializeTileTypes(): void {
    this.tileTypes = {
      [TileType.GRASS]: { name: 'Grass', color: '#2d5016' },
      [TileType.WALL]: { name: 'Wall', color: '#8b7355' },
      [TileType.WATER]: { name: 'Water', color: '#1e90ff' },
      [TileType.STONE]: { name: 'Stone', color: '#696969' },
      [TileType.DIRT]: { name: 'Dirt', color: '#8b4513' },
      [TileType.SAND]: { name: 'Sand', color: '#f4a460' }
    };
  }

  public start(): void {
    if (this.gameLoop) return;

    console.log(`Starting game loop at ${1000/this.tickRate} ticks per second`);
    
    this.gameLoop = setInterval(() => {
      this.tick();
    }, this.tickRate);
  }

  public stop(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
      console.log('Game loop stopped');
    }
  }

  private tick(): void {
    this.currentTick++;
    
    // Create game state update
    const playerPositions: PlayerPosition[] = Array.from(this.players.values()).map(player => ({
      id: player.id,
      position: { ...player.position }
    }));

    const gameStateUpdate: GameStateUpdate = {
      tick: this.currentTick,
      players: playerPositions,
      timestamp: Date.now()
    };

    // Broadcast to all connected clients
    this.io.emit('WORLD_UPDATE', gameStateUpdate);
  }

  public addPlayer(socketId: string, playerName: string): Player {
    // Find a random empty spawn position
    const spawnPosition = this.findEmptySpawnPosition();
    
    const player: Player = {
      id: socketId,
      name: playerName,
      position: spawnPosition,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      experience: 0
    };

    this.players.set(socketId, player);
    console.log(`Player ${playerName} joined at position (${spawnPosition.x}, ${spawnPosition.y})`);
    
    return player;
  }

  public removePlayer(socketId: string): void {
    const player = this.players.get(socketId);
    if (player) {
      this.players.delete(socketId);
      console.log(`Player ${player.name} left the game`);
    }
  }

  public movePlayer(socketId: string, payload: MovePayload): { success: boolean; newPosition?: Position; reason?: string } {
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

  private calculateNewPosition(currentPosition: Position, direction: string): Position {
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

  private isValidPosition(position: Position): boolean {
    return position.x >= 0 && 
           position.x < this.map.width && 
           position.y >= 0 && 
           position.y < this.map.height &&
           position.z >= 0;
  }

  private isTileWalkable(position: Position): boolean {
    if (!this.isValidPosition(position)) return false;
    
    const tile = this.map.tiles[position.y][position.x];
    return tile.isWalkable;
  }

  private isPositionOccupied(position: Position, excludePlayerId: string): boolean {
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

  private findEmptySpawnPosition(): Position {
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

  public getPlayer(socketId: string): Player | undefined {
    return this.players.get(socketId);
  }

  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  public getMapData(): MapData {
    return {
      map: this.map,
      tileTypes: this.tileTypes
    };
  }

  public handleChatMessage(socketId: string, payload: ChatMessagePayload): void {
    const sender = this.players.get(socketId);
    if (!sender) return;

    console.log(`Chat message from ${sender.name}: ${payload.text}`);

    // Find all players within chat range
    const recipients: string[] = [];
    for (const [playerId, player] of this.players) {
      const distance = this.calculateDistance(sender.position, player.position);
      if (distance <= CHAT_RANGE) {
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

  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
