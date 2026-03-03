import { Container, Sprite, Graphics } from 'pixi.js';
import { GameMap, TileType, Tile } from '../../../../shared/types';
import { AssetManager } from './AssetManager';

export class MapRenderer {
  private container: Container;
  private map: GameMap | null = null;
  private tileSize: number = 32;
  private viewportWidth: number;
  private viewportHeight: number;
  private tileSprites: Map<string, Sprite> = new Map();

  constructor(viewportWidth: number, viewportHeight: number) {
    this.container = new Container();
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public async loadMap(map: GameMap): Promise<void> {
    this.map = map;
    
    // Wait for assets to be loaded
    await AssetManager.getInstance().loadAssets();
    
    console.log(`Map loaded: ${map.width}x${map.height}`);
  }

  public render(cameraX: number = 0, cameraY: number = 0): void {
    if (!this.map) return;

    // Clear previous tiles
    this.container.removeChildren();
    this.tileSprites.clear();

    // Calculate visible tile range (viewport culling)
    const startTileX = Math.max(0, Math.floor(cameraX / this.tileSize));
    const endTileX = Math.min(this.map.width, Math.ceil((cameraX + this.viewportWidth) / this.tileSize));
    const startTileY = Math.max(0, Math.floor(cameraY / this.tileSize));
    const endTileY = Math.min(this.map.height, Math.ceil((cameraY + this.viewportHeight) / this.tileSize));

    // Render visible tiles
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = this.map.tiles[y][x];
        this.renderTile(x, y, tile);
      }
    }
  }

  private renderTile(x: number, y: number, tile: Tile): void {
    const assetManager = AssetManager.getInstance();
    
    try {
      const texture = assetManager.getTileTexture(tile.type);
      const sprite = new Sprite(texture);
      
      sprite.x = x * this.tileSize;
      sprite.y = y * this.tileSize;
      
      // Add visual indicator for non-walkable tiles
      if (!tile.isWalkable) {
        sprite.alpha = 0.8;
        
        // Add border for walls
        if (tile.type === TileType.WALL) {
          const border = new Graphics();
          border.lineStyle(2, 0x000000, 0.5);
          border.drawRect(sprite.x, sprite.y, this.tileSize, this.tileSize);
          this.container.addChild(border);
        }
      }
      
      this.container.addChild(sprite);
      this.tileSprites.set(`${x},${y}`, sprite);
    } catch (error) {
      console.error(`Failed to render tile at (${x}, ${y}):`, error);
      
      // Fallback to colored rectangle
      const fallback = new Graphics();
      const color = this.getFallbackColor(tile.type);
      fallback.beginFill(color);
      fallback.drawRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      fallback.endFill();
      
      if (!tile.isWalkable) {
        fallback.alpha = 0.8;
      }
      
      this.container.addChild(fallback);
    }
  }

  private getFallbackColor(tileType: TileType): number {
    const colors: Record<TileType, number> = {
      [TileType.GRASS]: 0x2d5016,
      [TileType.WALL]: 0x8b7355,
      [TileType.WATER]: 0x1e90ff,
      [TileType.STONE]: 0x696969,
      [TileType.DIRT]: 0x8b4513,
      [TileType.SAND]: 0xf4a460
    };
    
    return colors[tileType] || 0x000000;
  }

  public getContainer(): Container {
    return this.container;
  }

  public getTileAt(worldX: number, worldY: number): Tile | null {
    if (!this.map) return null;
    
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);
    
    if (tileX < 0 || tileX >= this.map.width || tileY < 0 || tileY >= this.map.height) {
      return null;
    }
    
    return this.map.tiles[tileY][tileX];
  }

  public isTileWalkable(worldX: number, worldY: number): boolean {
    const tile = this.getTileAt(worldX, worldY);
    return tile ? tile.isWalkable : false;
  }
}
