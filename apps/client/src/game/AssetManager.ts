import { Texture, Spritesheet } from 'pixi.js';

// Define TileType locally to avoid shared types issues
export enum TileType {
  GRASS = 0,
  WALL = 1,
  WATER = 2,
  STONE = 3,
  DIRT = 4,
  SAND = 5,
}

export class AssetManager {
  private static instance: AssetManager;
  private tileTextures: Map<TileType, Texture> = new Map();
  private loaded: boolean = false;

  private constructor() {}

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  public async loadAssets(): Promise<void> {
    if (this.loaded) return;

    // Create colored rectangles as placeholder textures
    const tileSize = 32;
    
    // Create textures for each tile type
    this.createTileTexture(TileType.GRASS, '#4a7c23', tileSize);
    this.createTileTexture(TileType.WALL, '#8b7355', tileSize);
    this.createTileTexture(TileType.WATER, '#1e90ff', tileSize);
    this.createTileTexture(TileType.STONE, '#696969', tileSize);
    this.createTileTexture(TileType.DIRT, '#8b4513', tileSize);
    this.createTileTexture(TileType.SAND, '#f4a460', tileSize);

    this.loaded = true;
    console.log('Assets loaded successfully');
  }

  private createTileTexture(tileType: TileType, color: string, size: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Fill with base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Add some texture/pattern
    if (tileType === TileType.GRASS) {
      // Add detailed grass texture with multiple shades
      const grassColors = ['#3d6b1a', '#538a2b', '#6ba835', '#4a7c23'];
      
      // Add grass blades
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const height = 3 + Math.random() * 5;
        const color = grassColors[Math.floor(Math.random() * grassColors.length)];
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 2, y - height);
        ctx.stroke();
      }
      
      // Add some random dots for texture
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    } else if (tileType === TileType.WALL) {
      // Add brick pattern
      ctx.strokeStyle = '#6b5345';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, size, size);
      ctx.strokeRect(0, size/2, size, size/2);
      ctx.strokeRect(size/2, 0, size/2, size/2);
    } else if (tileType === TileType.WATER) {
      // Add wave pattern
      ctx.strokeStyle = '#4169e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, size/2);
      ctx.quadraticCurveTo(size/4, size/3, size/2, size/2);
      ctx.quadraticCurveTo(3*size/4, 2*size/3, size, size/2);
      ctx.stroke();
    }

    const texture = Texture.from(canvas);
    this.tileTextures.set(tileType, texture);
  }

  public getTileTexture(tileType: TileType): Texture {
    const texture = this.tileTextures.get(tileType);
    if (!texture) {
      throw new Error(`Texture not found for tile type: ${tileType}`);
    }
    return texture;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }
}
