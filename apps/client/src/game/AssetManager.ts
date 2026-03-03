import { Texture, Spritesheet } from 'pixi.js';
import { TileType } from '@shared/types';

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
    this.createTileTexture(TileType.GRASS, '#2d5016', tileSize);
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
      // Add grass texture
      ctx.strokeStyle = '#1a3409';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 2, y - 4);
        ctx.stroke();
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
