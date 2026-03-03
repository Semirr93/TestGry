import { Item, WorldItem, Position, ItemRarity, ItemType } from '../../../../shared/types';

export class ItemManager {
  private items: Map<string, WorldItem> = new Map();
  private nextItemId: number = 1;

  constructor() {
    this.spawnInitialItems();
  }

  private spawnInitialItems(): void {
    // Spawn some initial items on the map
    const initialItems = [
      { name: 'Sword', type: ItemType.EQUIPABLE, rarity: ItemRarity.COMMON, spriteId: 100 },
      { name: 'Health Potion', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON, spriteId: 101 },
      { name: 'Magic Scroll', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON, spriteId: 102 },
      { name: 'Gold Coin', type: ItemType.MISC, rarity: ItemRarity.COMMON, spriteId: 103 },
      { name: 'Shield', type: ItemType.EQUIPABLE, rarity: ItemRarity.UNCOMMON, spriteId: 104 },
      { name: 'Rare Gem', type: ItemType.MISC, rarity: ItemRarity.RARE, spriteId: 105 },
    ];

    initialItems.forEach(itemData => {
      const position = this.getRandomPosition();
      this.spawnItem(itemData, position);
    });
  }

  private getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * 18) + 1, // 1-18
      y: Math.floor(Math.random() * 18) + 1, // 1-18
      z: 0
    };
  }

  public spawnItem(itemData: Partial<Item>, position: Position): WorldItem {
    const item: Item = {
      id: `item_${this.nextItemId++}`,
      name: itemData.name || 'Unknown Item',
      type: itemData.type || ItemType.MISC,
      rarity: itemData.rarity || ItemRarity.COMMON,
      spriteId: itemData.spriteId || 0,
      description: itemData.description,
      value: itemData.value
    };

    const worldItem: WorldItem = {
      item,
      position,
      worldItemId: `world_${item.id}`,
      spawnTime: Date.now()
    };

    this.items.set(worldItem.worldItemId, worldItem);
    console.log(`Spawned item: ${item.name} at (${position.x}, ${position.y})`);

    return worldItem;
  }

  public pickupItem(worldItemId: string): WorldItem | null {
    const worldItem = this.items.get(worldItemId);
    if (worldItem) {
      this.items.delete(worldItemId);
      console.log(`Picked up item: ${worldItem.item.name}`);
    }
    return worldItem || null;
  }

  public dropItem(item: Item, position: Position): WorldItem {
    const worldItem: WorldItem = {
      item,
      position,
      worldItemId: `world_${item.id}`,
      spawnTime: Date.now()
    };

    this.items.set(worldItem.worldItemId, worldItem);
    console.log(`Dropped item: ${item.name} at (${position.x}, ${position.y})`);

    return worldItem;
  }

  public getItemsNearPosition(position: Position, range: number = 1): WorldItem[] {
    const nearbyItems: WorldItem[] = [];
    
    for (const worldItem of this.items.values()) {
      const distance = this.calculateDistance(position, worldItem.position);
      if (distance <= range) {
        nearbyItems.push(worldItem);
      }
    }
    
    return nearbyItems;
  }

  public getItemAtPosition(position: Position): WorldItem | null {
    for (const worldItem of this.items.values()) {
      if (worldItem.position.x === position.x && 
          worldItem.position.y === position.y && 
          worldItem.position.z === position.z) {
        return worldItem;
      }
    }
    return null;
  }

  public getAllItems(): WorldItem[] {
    return Array.from(this.items.values());
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Item definitions for easy access
  public static readonly ITEM_DEFINITIONS = {
    SWORD: { id: 'sword_001', name: 'Iron Sword', type: ItemType.EQUIPABLE, rarity: ItemRarity.COMMON, spriteId: 100, value: 50 },
    HEALTH_POTION: { id: 'potion_001', name: 'Health Potion', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON, spriteId: 101, value: 25 },
    MANA_POTION: { id: 'potion_002', name: 'Mana Potion', type: ItemType.CONSUMABLE, rarity: ItemRarity.COMMON, spriteId: 102, value: 30 },
    MAGIC_SCROLL: { id: 'scroll_001', name: 'Magic Scroll', type: ItemType.CONSUMABLE, rarity: ItemRarity.UNCOMMON, spriteId: 103, value: 100 },
    GOLD_COIN: { id: 'coin_001', name: 'Gold Coin', type: ItemType.MISC, rarity: ItemRarity.COMMON, spriteId: 104, value: 1 },
    SHIELD: { id: 'shield_001', name: 'Wooden Shield', type: ItemType.EQUIPABLE, rarity: ItemRarity.UNCOMMON, spriteId: 105, value: 75 },
    RARE_GEM: { id: 'gem_001', name: 'Rare Gem', type: ItemType.MISC, rarity: ItemRarity.RARE, spriteId: 106, value: 500 },
    EPIC_SWORD: { id: 'sword_002', name: 'Epic Sword', type: ItemType.EQUIPABLE, rarity: ItemRarity.EPIC, spriteId: 107, value: 1000 },
  };

  public static getRandomItem(): Partial<Item> {
    const definitions = Object.values(this.ITEM_DEFINITIONS);
    const randomDef = definitions[Math.floor(Math.random() * definitions.length)];
    return randomDef;
  }
}
