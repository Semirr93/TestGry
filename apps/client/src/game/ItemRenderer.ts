import { Container, Graphics, Text } from 'pixi.js';
import { WorldItem, Item, ItemRarity } from '../../../../shared/types';

export class ItemRenderer {
  private container: Container;
  private items: Map<string, Container> = new Map();

  constructor() {
    this.container = new Container();
  }

  public getContainer(): Container {
    return this.container;
  }

  public updateItems(worldItems: WorldItem[]): void {
    // Remove old items that no longer exist
    for (const [worldItemId, itemContainer] of this.items) {
      if (!worldItems.find(item => item.worldItemId === worldItemId)) {
        this.container.removeChild(itemContainer);
        this.items.delete(worldItemId);
      }
    }

    // Add or update existing items
    worldItems.forEach(worldItem => {
      let itemContainer = this.items.get(worldItem.worldItemId);
      
      if (!itemContainer) {
        itemContainer = this.createItemContainer(worldItem);
        this.items.set(worldItem.worldItemId, itemContainer);
        this.container.addChild(itemContainer);
      }
      
      // Update animation for rare items
      this.updateItemAnimation(itemContainer, worldItem.item);
    });
  }

  private createItemContainer(worldItem: WorldItem): Container {
    const itemContainer = new Container();
    
    // Create item sprite (colored rectangle based on rarity)
    const sprite = new Graphics();
    const color = this.getItemColor(worldItem.item.rarity);
    sprite.beginFill(color);
    sprite.drawRect(0, 0, 24, 24); // 24x24 pixels
    sprite.endFill();
    
    // Add border for better visibility
    sprite.lineStyle(1, 0x000000, 1);
    sprite.drawRect(0, 0, 24, 24);
    
    itemContainer.addChild(sprite);
    
    // Add item name (optional - show only for rare items)
    if (worldItem.item.rarity !== ItemRarity.COMMON) {
      const itemName = new Text(worldItem.item.name, {
        fontFamily: 'Arial',
        fontSize: 8,
        fill: 0xffffff,
        stroke: 0x000000,
        strokeThickness: 1,
        align: 'center'
      });
      itemName.anchor.set(0.5, 1);
      itemName.x = 12;
      itemName.y = -5; // Above the item
      itemContainer.addChild(itemName);
    }
    
    // Position item on tile
    itemContainer.x = worldItem.position.x * 32 + 4; // Center on tile
    itemContainer.y = worldItem.position.y * 32 + 4;
    
    return itemContainer;
  }

  private getItemColor(rarity: ItemRarity): number {
    switch (rarity) {
      case ItemRarity.COMMON:
        return 0x8B4513; // Brown
      case ItemRarity.UNCOMMON:
        return 0x0080FF; // Blue
      case ItemRarity.RARE:
        return 0x800080; // Green
      case ItemRarity.EPIC:
        return 0x9932CC; // Purple
      case ItemRarity.LEGENDARY:
        return 0xFFD700; // Gold
      default:
        return 0x808080; // Gray
    }
  }

  private updateItemAnimation(itemContainer: Container, item: Item): void {
    // Add floating animation for rare items
    if (item.rarity !== ItemRarity.COMMON) {
      const time = Date.now() / 1000; // Convert to seconds
      
      // Floating effect
      const floatY = Math.sin(time * 2) * 2; // Gentle floating
      itemContainer.y = itemContainer.y + floatY;
      
      // Pulsing effect for legendary items
      if (item.rarity === ItemRarity.LEGENDARY) {
        const scale = 1 + Math.sin(time * 3) * 0.1;
        itemContainer.scale.set(scale, scale);
      }
    }
  }

  public clear(): void {
    this.container.removeChildren();
    this.items.clear();
  }
}
