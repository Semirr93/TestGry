"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemManager = void 0;
const types_1 = require("../../../../shared/types");
class ItemManager {
    constructor() {
        this.items = new Map();
        this.nextItemId = 1;
        this.spawnInitialItems();
    }
    spawnInitialItems() {
        // Spawn some initial items on the map
        const initialItems = [
            { name: 'Sword', type: types_1.ItemType.EQUIPABLE, rarity: types_1.ItemRarity.COMMON, spriteId: 100 },
            { name: 'Health Potion', type: types_1.ItemType.CONSUMABLE, rarity: types_1.ItemRarity.COMMON, spriteId: 101 },
            { name: 'Magic Scroll', type: types_1.ItemType.CONSUMABLE, rarity: types_1.ItemRarity.UNCOMMON, spriteId: 102 },
            { name: 'Gold Coin', type: types_1.ItemType.MISC, rarity: types_1.ItemRarity.COMMON, spriteId: 103 },
            { name: 'Shield', type: types_1.ItemType.EQUIPABLE, rarity: types_1.ItemRarity.UNCOMMON, spriteId: 104 },
            { name: 'Rare Gem', type: types_1.ItemType.MISC, rarity: types_1.ItemRarity.RARE, spriteId: 105 },
        ];
        initialItems.forEach(itemData => {
            const position = this.getRandomPosition();
            this.spawnItem(itemData, position);
        });
    }
    getRandomPosition() {
        return {
            x: Math.floor(Math.random() * 18) + 1, // 1-18
            y: Math.floor(Math.random() * 18) + 1, // 1-18
            z: 0
        };
    }
    spawnItem(itemData, position) {
        const item = {
            id: `item_${this.nextItemId++}`,
            name: itemData.name || 'Unknown Item',
            type: itemData.type || types_1.ItemType.MISC,
            rarity: itemData.rarity || types_1.ItemRarity.COMMON,
            spriteId: itemData.spriteId || 0,
            description: itemData.description,
            value: itemData.value
        };
        const worldItem = {
            item,
            position,
            worldItemId: `world_${item.id}`,
            spawnTime: Date.now()
        };
        this.items.set(worldItem.worldItemId, worldItem);
        console.log(`Spawned item: ${item.name} at (${position.x}, ${position.y})`);
        return worldItem;
    }
    pickupItem(worldItemId) {
        const worldItem = this.items.get(worldItemId);
        if (worldItem) {
            this.items.delete(worldItemId);
            console.log(`Picked up item: ${worldItem.item.name}`);
        }
        return worldItem || null;
    }
    dropItem(item, position) {
        const worldItem = {
            item,
            position,
            worldItemId: `world_${item.id}`,
            spawnTime: Date.now()
        };
        this.items.set(worldItem.worldItemId, worldItem);
        console.log(`Dropped item: ${item.name} at (${position.x}, ${position.y})`);
        return worldItem;
    }
    getItemsNearPosition(position, range = 1) {
        const nearbyItems = [];
        for (const worldItem of this.items.values()) {
            const distance = this.calculateDistance(position, worldItem.position);
            if (distance <= range) {
                nearbyItems.push(worldItem);
            }
        }
        return nearbyItems;
    }
    getItemAtPosition(position) {
        for (const worldItem of this.items.values()) {
            if (worldItem.position.x === position.x &&
                worldItem.position.y === position.y &&
                worldItem.position.z === position.z) {
                return worldItem;
            }
        }
        return null;
    }
    getAllItems() {
        return Array.from(this.items.values());
    }
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static getRandomItem() {
        const definitions = Object.values(this.ITEM_DEFINITIONS);
        const randomDef = definitions[Math.floor(Math.random() * definitions.length)];
        return randomDef;
    }
}
exports.ItemManager = ItemManager;
// Item definitions for easy access
ItemManager.ITEM_DEFINITIONS = {
    SWORD: { id: 'sword_001', name: 'Iron Sword', type: types_1.ItemType.EQUIPABLE, rarity: types_1.ItemRarity.COMMON, spriteId: 100, value: 50 },
    HEALTH_POTION: { id: 'potion_001', name: 'Health Potion', type: types_1.ItemType.CONSUMABLE, rarity: types_1.ItemRarity.COMMON, spriteId: 101, value: 25 },
    MANA_POTION: { id: 'potion_002', name: 'Mana Potion', type: types_1.ItemType.CONSUMABLE, rarity: types_1.ItemRarity.COMMON, spriteId: 102, value: 30 },
    MAGIC_SCROLL: { id: 'scroll_001', name: 'Magic Scroll', type: types_1.ItemType.CONSUMABLE, rarity: types_1.ItemRarity.UNCOMMON, spriteId: 103, value: 100 },
    GOLD_COIN: { id: 'coin_001', name: 'Gold Coin', type: types_1.ItemType.MISC, rarity: types_1.ItemRarity.COMMON, spriteId: 104, value: 1 },
    SHIELD: { id: 'shield_001', name: 'Wooden Shield', type: types_1.ItemType.EQUIPABLE, rarity: types_1.ItemRarity.UNCOMMON, spriteId: 105, value: 75 },
    RARE_GEM: { id: 'gem_001', name: 'Rare Gem', type: types_1.ItemType.MISC, rarity: types_1.ItemRarity.RARE, spriteId: 106, value: 500 },
    EPIC_SWORD: { id: 'sword_002', name: 'Epic Sword', type: types_1.ItemType.EQUIPABLE, rarity: types_1.ItemRarity.EPIC, spriteId: 107, value: 1000 },
};
//# sourceMappingURL=ItemManager.js.map