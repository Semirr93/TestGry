import { Server, Socket } from 'socket.io';
import { Position, Player, PlayerPosition, MovePayload, GameStateUpdate, ClientToServerEvents, ServerToClientEvents } from '../../../../shared/types';

export class GameEngine {
  private players: Map<string, Player> = new Map();
  private mapWidth: number = 20;
  private mapHeight: number = 20;
  private tickRate: number = 100; // 10 ticks per second
  private currentTick: number = 0;
  private gameLoop: NodeJS.Timeout | null = null;
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.initializeMap();
  }

  private initializeMap(): void {
    // In the future, this will load from database
    console.log(`Map initialized: ${this.mapWidth}x${this.mapHeight}`);
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
           position.x < this.mapWidth && 
           position.y >= 0 && 
           position.y < this.mapHeight &&
           position.z >= 0;
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
      const x = Math.floor(Math.random() * this.mapWidth);
      const y = Math.floor(Math.random() * this.mapHeight);
      const position = { x, y, z: 0 };
      
      if (!this.isPositionOccupied(position, '')) {
        return position;
      }
      
      attempts++;
    }
    
    // Fallback to origin if no empty position found
    return { x: 0, y: 0, z: 0 };
  }

  public getPlayer(socketId: string): Player | undefined {
    return this.players.get(socketId);
  }

  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}
