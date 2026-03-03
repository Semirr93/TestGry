import { Server } from 'socket.io';
import { Position, Player, MovePayload, ClientToServerEvents, ServerToClientEvents, MapData, ChatMessagePayload, Item, ItemPickupPayload, ItemDropPayload } from '../../../../shared/types';
export declare class GameEngine {
    private players;
    private map;
    private tileTypes;
    private tickRate;
    private currentTick;
    private gameLoop;
    private io;
    private itemManager;
    constructor(io: Server<ClientToServerEvents, ServerToClientEvents>);
    private initializeMap;
    private initializeTileTypes;
    start(): void;
    stop(): void;
    private tick;
    addPlayer(socketId: string, playerName: string): Player;
    private createEmptyInventory;
    removePlayer(socketId: string): void;
    movePlayer(socketId: string, payload: MovePayload): {
        success: boolean;
        newPosition?: Position;
        reason?: string;
    };
    private calculateNewPosition;
    private isValidPosition;
    private isTileWalkable;
    private isPositionOccupied;
    private findEmptySpawnPosition;
    getPlayer(socketId: string): Player | undefined;
    getAllPlayers(): Player[];
    handleItemPickup(socketId: string, payload: ItemPickupPayload): {
        success: boolean;
        item?: Item;
        reason?: string;
    };
    handleItemDrop(socketId: string, payload: ItemDropPayload): {
        success: boolean;
        reason?: string;
    };
    getMapData(): MapData;
    handleChatMessage(socketId: string, payload: ChatMessagePayload): void;
    private calculateDistance;
}
//# sourceMappingURL=GameEngine.d.ts.map