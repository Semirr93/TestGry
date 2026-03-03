// Game types shared between client and server

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

// Chat range constant
export const CHAT_RANGE = 10;

// Tile types dictionary
export enum TileType {
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
  tileTypes: Record<TileType, { name: string; color: string }>;
}

export interface GameState {
  players: Map<string, Player>;
  map: GameMap;
  tick: number;
}

// Socket events
export interface ClientToServerEvents {
  PLAYER_MOVE: (payload: MovePayload) => void;
  PLAYER_JOIN: (playerName: string) => void;
  PLAYER_DISCONNECT: () => void;
  CHAT_MESSAGE: (payload: ChatMessagePayload) => void;
}

export interface ServerToClientEvents {
  WORLD_UPDATE: (state: GameStateUpdate) => void;
  PLAYER_JOINED: (player: Player) => void;
  PLAYER_LEFT: (playerId: string) => void;
  PLAYER_MOVED: (playerId: string, position: Position) => void;
  MOVE_CONFIRMED: (position: Position) => void;
  MOVE_REJECTED: (reason: string) => void;
  MAP_DATA: (mapData: MapData) => void;
  CHAT_MESSAGE: (payload: ChatMessagePayload & { senderName: string }) => void;
}
