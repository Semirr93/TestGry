import { Application, Container, Graphics, Text } from 'pixi.js';
import { io, Socket } from 'socket.io-client';
import { Position, PlayerPosition, GameStateUpdate, MovePayload, ClientToServerEvents, ServerToClientEvents, MapData, ChatMessagePayload, WorldItem, ItemPickupPayload, ItemDropPayload, InventorySlot } from '../../../../shared/types';
import { MapRenderer } from './MapRenderer';
import { ItemRenderer } from './ItemRenderer';

interface PlayerContainer extends Container {
  playerName: Text;
  messageBubble?: Text;
  messageBubbleTimeout?: NodeJS.Timeout;
}

export class GameClient {
  private app: Application;
  private socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  private players: Map<string, PlayerContainer> = new Map();
  private tileSize: number = 32;
  private mapWidth: number = 20;
  private mapHeight: number = 20;
  private viewportWidth: number = 15;
  private viewportHeight: number = 11;
  private cameraPosition: Position = { x: 0, y: 0, z: 0 };
  private localPlayerId: string = '';
  private playerName: string = '';
  private mapRenderer: MapRenderer;
  private itemRenderer: ItemRenderer;
  private mapData: MapData | null = null;
  private wsUrl: string;
  private onChatMessage?: (message: ChatMessagePayload & { senderName: string }) => void;
  private onInventoryUpdate?: (inventory: InventorySlot[]) => void;
  private nearbyItems: WorldItem[] = [];

  constructor(canvas: HTMLCanvasElement, playerName: string) {
    this.playerName = playerName;
    this.wsUrl = (import.meta.env?.VITE_WS_URL || 'ws://gierka-gierka-bpoqsc-ec524f-57-129-120-62.traefik.me/').replace('ws://', 'http://');
    
    this.app = new Application({
      view: canvas,
      width: this.viewportWidth * this.tileSize,
      height: this.viewportHeight * this.tileSize,
      backgroundColor: 0x1a1a1a,
    });

    this.socket = io(this.wsUrl);
    this.mapRenderer = new MapRenderer(
      this.viewportWidth * this.tileSize,
      this.viewportHeight * this.tileSize
    );
    this.itemRenderer = new ItemRenderer();
    
    this.setupSocketListeners();
    this.setupKeyboardControls();
    
    // Add map renderer to stage (below players)
    this.app.stage.addChild(this.mapRenderer.getContainer());
    
    // Add item renderer to stage (above map, below players)
    this.app.stage.addChild(this.itemRenderer.getContainer());
  }

  public setChatMessageHandler(handler: (message: ChatMessagePayload & { senderName: string }) => void): void {
    this.onChatMessage = handler;
  }

  public setInventoryHandler(handler: (inventory: InventorySlot[]) => void): void {
    this.onInventoryUpdate = handler;
  }

  public dropItem(payload: ItemDropPayload): void {
    this.socket.emit('ITEM_DROP', payload);
  }

  public getLocalPlayer(): { position: Position } | null {
    const player = this.players.get(this.localPlayerId);
    return player ? { position: { x: player.position.x, y: player.position.y, z: player.position.z } } : null;
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

    this.socket.on('ITEM_PICKUP', (payload: any) => {
      console.log(`Item picked up: ${payload.item.name}`);
      if (this.onInventoryUpdate) {
        // Update inventory would be handled by INVENTORY_UPDATE event
      }
    });

    this.socket.on('ITEM_DROP', (payload: any) => {
      console.log(`Item dropped: ${payload.item.name}`);
    });

    this.socket.on('INVENTORY_UPDATE', (payload: any) => {
      console.log('Inventory updated');
      if (this.onInventoryUpdate) {
        this.onInventoryUpdate(payload.inventory);
      }
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

    this.socket.on('CHAT_MESSAGE', (message: any) => {
      console.log(`Chat message: ${message.senderName}: ${message.text}`);
      if (this.onChatMessage) {
        this.onChatMessage(message);
      }
      this.showMessageBubble(message.senderId, message.text);
    });
  }

  private createPlayerContainer(playerId: string, position: Position, name: string): void {
    const playerContainer: PlayerContainer = new Container() as PlayerContainer;
    
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
    playerContainer.playerName = nameText;
    playerContainer.x = position.x * this.tileSize + 2;
    playerContainer.y = position.y * this.tileSize + 2;
    
    this.players.set(playerId, playerContainer);
    this.app.stage.addChild(playerContainer);
  }

  private showMessageBubble(playerId: string, text: string): void {
    const playerContainer = this.players.get(playerId);
    if (!playerContainer) return;

    // Remove existing message bubble and timeout
    if (playerContainer.messageBubbleTimeout) {
      clearTimeout(playerContainer.messageBubbleTimeout);
      if (playerContainer.messageBubble) {
        playerContainer.removeChild(playerContainer.messageBubble);
      }
    }

    // Create new message bubble
    const messageBubble = new Text(text, {
      fontFamily: 'Arial',
      fontSize: 9,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2,
      align: 'center'
    });
    
    messageBubble.anchor.set(0.5, 1);
    messageBubble.x = (this.tileSize - 4) / 2;
    messageBubble.y = -5; // Above player
    
    playerContainer.addChild(messageBubble);
    playerContainer.messageBubble = messageBubble;

    // Remove bubble after 5 seconds
    playerContainer.messageBubbleTimeout = setTimeout(() => {
      if (playerContainer.messageBubble) {
        playerContainer.removeChild(playerContainer.messageBubble);
        playerContainer.messageBubble = undefined;
      }
    }, 5000);
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
