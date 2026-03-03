import { Item, WorldItem, Position, ItemRarity, ItemType } from '../../../../shared/types';
export declare class ItemManager {
    private items;
    private nextItemId;
    constructor();
    private spawnInitialItems;
    private getRandomPosition;
    spawnItem(itemData: Partial<Item>, position: Position): WorldItem;
    pickupItem(worldItemId: string): WorldItem | null;
    dropItem(item: Item, position: Position): WorldItem;
    getItemsNearPosition(position: Position, range?: number): WorldItem[];
    getItemAtPosition(position: Position): WorldItem | null;
    getAllItems(): WorldItem[];
    private calculateDistance;
    static readonly ITEM_DEFINITIONS: {
        SWORD: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
        HEALTH_POTION: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
        MANA_POTION: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
        MAGIC_SCROLL: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
        GOLD_COIN: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
        SHIELD: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
        RARE_GEM: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
        EPIC_SWORD: {
            id: string;
            name: string;
            type: ItemType;
            rarity: ItemRarity;
            spriteId: number;
            value: number;
        };
    };
    static getRandomItem(): Partial<Item>;
}
//# sourceMappingURL=ItemManager.d.ts.map