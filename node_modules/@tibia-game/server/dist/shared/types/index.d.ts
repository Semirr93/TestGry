export interface Position {
    x: number;
    y: number;
    z: number;
}
export interface Player {
    id: string;
    name: string;
    position: Position;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    level: number;
    experience: number;
    inventory: InventorySlot[];
}
export interface PlayerPosition {
    id: string;
    position: Position;
}
export interface MovePayload {
    direction: 'north' | 'south' | 'east' | 'west';
}
export interface ChatMessagePayload {
    senderId: string;
    text: string;
    timestamp: number;
}
export interface GameStateUpdate {
    tick: number;
    players: PlayerPosition[];
    timestamp: number;
}
export declare const CHAT_RANGE = 10;
export declare enum ItemType {
    EQUIPABLE = "EQUIPABLE",
    CONSUMABLE = "CONSUMABLE",
    MISC = "MISC"
}
export declare enum ItemRarity {
    COMMON = "COMMON",
    UNCOMMON = "UNCOMMON",
    RARE = "RARE",
    EPIC = "EPIC",
    LEGENDARY = "LEGENDARY"
}
export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    spriteId: number;
    description?: string;
    value?: number;
}
export interface WorldItem {
    item: Item;
    position: Position;
    worldItemId: string;
    spawnTime: number;
}
export interface InventorySlot {
    slot: number;
    item: Item | null;
    quantity: number;
}
export interface ItemSpawnPayload {
    item: Item;
    position: Position;
}
export interface ItemPickupPayload {
    worldItemId: string;
}
export interface ItemDropPayload {
    item: Item;
    position: Position;
}
export declare enum TileType {
    GRASS = 0,
    WALL = 1,
    WATER = 2,
    STONE = 3,
    DIRT = 4,
    SAND = 5
}
export interface Tile {
    type: TileType;
    isWalkable: boolean;
}
export interface GameMap {
    width: number;
    height: number;
    tiles: Tile[][];
}
export interface MapData {
    map: GameMap;
    tileTypes: Record<TileType, {
        name: string;
        color: string;
    }>;
}
export interface GameState {
    players: Map<string, Player>;
    map: GameMap;
    items: Map<string, WorldItem>;
    tick: number;
}
export interface ClientToServerEvents {
    PLAYER_MOVE: (payload: MovePayload) => void;
    PLAYER_JOIN: (playerName: string) => void;
    PLAYER_DISCONNECT: () => void;
    CHAT_MESSAGE: (payload: ChatMessagePayload) => void;
    ITEM_PICKUP: (payload: ItemPickupPayload) => void;
    ITEM_DROP: (payload: ItemDropPayload) => void;
}
export interface ServerToClientEvents {
    WORLD_UPDATE: (state: GameStateUpdate) => void;
    PLAYER_JOINED: (player: Player) => void;
    PLAYER_LEFT: (playerId: string) => void;
    PLAYER_MOVED: (playerId: string, position: Position) => void;
    MOVE_CONFIRMED: (position: Position) => void;
    MOVE_REJECTED: (reason: string) => void;
    MAP_DATA: (mapData: MapData) => void;
    CHAT_MESSAGE: (payload: ChatMessagePayload & {
        senderName: string;
    }) => void;
    ITEM_SPAWN: (payload: ItemSpawnPayload) => void;
    ITEM_PICKUP: (payload: {
        playerId: string;
        item: Item;
        worldItemId: string;
    }) => void;
    ITEM_DROP: (payload: ItemDropPayload) => void;
    INVENTORY_UPDATE: (payload: {
        playerId: string;
        inventory: InventorySlot[];
    }) => void;
}
//# sourceMappingURL=index.d.ts.map