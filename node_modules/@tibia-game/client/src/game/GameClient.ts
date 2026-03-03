import { Application, Container, Graphics, Text } from 'pixi.js';
import { io, Socket } from 'socket.io-client';
import { Position, PlayerPosition, GameStateUpdate, MovePayload, ClientToServerEvents, ServerToClientEvents, MapData } from '../../../../shared/types';
import { MapRenderer } from './MapRenderer';

export class GameClient {
  private app: Application;
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private players: Map<string, Container> = new Map();
  private tileSize: number = 32;
  private mapWidth: number = 20;
  private mapHeight: number = 20;
  private viewportWidth: number = 15;
  private viewportHeight: number = 11;
  private cameraPosition: Position = { x: 0, y: 0, z: 0 };
  private localPlayerId: string = '';
  private playerName: string = '';
  private mapRenderer: MapRenderer;
  private mapData: MapData | null = null;

  constructor(canvas: HTMLCanvasElement, playerName: string) {
    this.playerName = playerName;
    this.app = new Application({
      view: canvas,
      width: this.viewportWidth * this.tileSize,
      height: this.viewportHeight * this.tileSize,
      backgroundColor: 0x1a1a1a,
    });

    this.socket = io('http://localhost:3001');
    this.mapRenderer = new MapRenderer(
      this.viewportWidth * this.tileSize,
      this.viewportHeight * this.tileSize
    );
    
    this.setupSocketListeners();
    this.setupKeyboardControls();
    
    // Add map renderer to stage
    this.app.stage.addChild(this.mapRenderer.getContainer());
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.localPlayerId = this.socket.id;
      this.socket.emit('PLAYER_JOIN', this.playerName);
    });

    this.socket.on('WORLD_UPDATE', (state: GameStateUpdate) => {
      this.updatePlayers(state.players);
    });

    this.socket.on('PLAYER_JOINED', (player) => {
      console.log(`Player ${player.name} joined the game`);
      this.createPlayerContainer(player.id, player.position, player.name);
    });

    this.socket.on('PLAYER_LEFT', (playerId: string) => {
      console.log(`Player ${playerId} left the game`);
      this.removePlayer(playerId);
    });

    this.socket.on('MOVE_CONFIRMED', (position: Position) => {
      // Movement confirmed by server - interpolation will handle smooth transition
      console.log('Move confirmed to:', position);
    });

    this.socket.on('MOVE_REJECTED', (reason: string) => {
      console.log('Move rejected:', reason);
    });

    this.socket.on('MAP_DATA', async (mapData: MapData) => {
      console.log('Received map data:', mapData);
      this.mapData = mapData;
      this.mapWidth = mapData.map.width;
      this.mapHeight = mapData.map.height;
      
      // Load and render the map
      await this.mapRenderer.loadMap(mapData.map);
      this.updateCamera();
    });
  }

  private createPlayerContainer(playerId: string, position: Position, name: string): void {
    const playerContainer = new Container();
    
    // Player body (rectangle)
    const body = new Graphics();
    body.beginFill(playerId === this.localPlayerId ? 0x00ff00 : 0xff0000);
    body.drawRect(0, 0, this.tileSize - 4, this.tileSize - 4);
    body.endFill();
    
    // Player name
    const nameText = new Text(name, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xffffff,
    });
    nameText.anchor.set(0.5, -0.5);
    nameText.x = (this.tileSize - 4) / 2;
    nameText.y = (this.tileSize - 4) / 2;
    
    playerContainer.addChild(body);
    playerContainer.addChild(nameText);
    playerContainer.x = position.x * this.tileSize + 2;
    playerContainer.y = position.y * this.tileSize + 2;
    
    this.players.set(playerId, playerContainer);
    this.app.stage.addChild(playerContainer);
  }

  private updatePlayers(playerPositions: PlayerPosition[]): void {
    playerPositions.forEach(playerPos => {
      let playerContainer = this.players.get(playerPos.id);
      
      if (!playerContainer) {
        // Create new player container if it doesn't exist
        this.createPlayerContainer(playerPos.id, playerPos.position, `Player ${playerPos.id.slice(0, 4)}`);
        playerContainer = this.players.get(playerPos.id)!;
      }
      
      // Update position with interpolation
      this.interpolatePlayerPosition(playerContainer, playerPos.position);
    });

    // Update camera to follow local player
    this.updateCamera();
  }

  private interpolatePlayerPosition(playerContainer: Container, targetPosition: Position): void {
    const targetX = targetPosition.x * this.tileSize + 2;
    const targetY = targetPosition.y * this.tileSize + 2;
    
    // Simple interpolation - in real implementation, use smooth easing
    const speed = 0.2;
    playerContainer.x += (targetX - playerContainer.x) * speed;
    playerContainer.y += (targetY - playerContainer.y) * speed;
  }

  private updateCamera(): void {
    const localPlayer = this.players.get(this.localPlayerId);
    if (!localPlayer) return;

    // Calculate camera position to center on local player
    const targetCameraX = localPlayer.x - (this.viewportWidth * this.tileSize) / 2;
    const targetCameraY = localPlayer.y - (this.viewportHeight * this.tileSize) / 2;

    // Smooth camera movement
    const cameraSpeed = 0.1;
    this.cameraPosition.x += (targetCameraX - this.cameraPosition.x) * cameraSpeed;
    this.cameraPosition.y += (targetCameraY - this.cameraPosition.y) * cameraSpeed;

    // Update map renderer position (viewport culling)
    this.mapRenderer.getContainer().x = -this.cameraPosition.x;
    this.mapRenderer.getContainer().y = -this.cameraPosition.y;
    
    // Render only visible tiles
    this.mapRenderer.render(this.cameraPosition.x, this.cameraPosition.y);

    // Update player positions relative to camera
    this.players.forEach((playerContainer) => {
      playerContainer.x -= this.cameraPosition.x;
      playerContainer.y -= this.cameraPosition.y;
    });
  }

  private removePlayer(playerId: string): void {
    const playerContainer = this.players.get(playerId);
    if (playerContainer) {
      this.app.stage.removeChild(playerContainer);
      this.players.delete(playerId);
    }
  }

  private setupKeyboardControls(): void {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!this.localPlayerId) return;

      let direction: 'north' | 'south' | 'east' | 'west' | null = null;

      switch (event.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          direction = 'north';
          break;
        case 'arrowdown':
        case 's':
          direction = 'south';
          break;
        case 'arrowleft':
        case 'a':
          direction = 'west';
          break;
        case 'arrowright':
        case 'd':
          direction = 'east';
          break;
      }

      if (direction) {
        event.preventDefault();
        this.requestMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
  }

  private requestMove(direction: 'north' | 'south' | 'east' | 'west'): void {
    const payload: MovePayload = { direction };
    this.socket.emit('PLAYER_MOVE', payload);
  }

  public destroy(): void {
    this.socket.disconnect();
    this.app.destroy(true);
  }
}
