"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const battle_routes_1 = __importDefault(require("./battle.routes"));
const room_routes_1 = __importDefault(require("./room.routes"));
function routeSockets(io) {
    io.on("connection", (socket) => {
        console.log(`#${socket.id} connect`);
        (0, battle_routes_1.default)(socket);
        (0, room_routes_1.default)(socket);
    });
}
exports.default = routeSockets;
