"use strict";
// Game types shared between client and server
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileType = exports.ItemRarity = exports.ItemType = exports.CHAT_RANGE = void 0;
// Chat range constant
exports.CHAT_RANGE = 10;
// Item types
var ItemType;
(function (ItemType) {
    ItemType["EQUIPABLE"] = "EQUIPABLE";
    ItemType["CONSUMABLE"] = "CONSUMABLE";
    ItemType["MISC"] = "MISC";
})(ItemType || (exports.ItemType = ItemType = {}));
var ItemRarity;
(function (ItemRarity) {
    ItemRarity["COMMON"] = "COMMON";
    ItemRarity["UNCOMMON"] = "UNCOMMON";
    ItemRarity["RARE"] = "RARE";
    ItemRarity["EPIC"] = "EPIC";
    ItemRarity["LEGENDARY"] = "LEGENDARY";
})(ItemRarity || (exports.ItemRarity = ItemRarity = {}));
// Tile types dictionary
var TileType;
(function (TileType) {
    TileType[TileType["GRASS"] = 0] = "GRASS";
    TileType[TileType["WALL"] = 1] = "WALL";
    TileType[TileType["WATER"] = 2] = "WATER";
    TileType[TileType["STONE"] = 3] = "STONE";
    TileType[TileType["DIRT"] = 4] = "DIRT";
    TileType[TileType["SAND"] = 5] = "SAND";
})(TileType || (exports.TileType = TileType = {}));
//# sourceMappingURL=index.js.map