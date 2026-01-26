"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_manager_1 = __importDefault(require("../manager/room.manager"));
function routeRoom(socket) {
    socket.on("create-a-room", () => {
        room_manager_1.default.createARoom(socket);
    });
    socket.on("join-a-room", (roomId) => {
        room_manager_1.default.joinARoom(socket, roomId);
    });
    socket.on("join-the-queue", (pooTrophees) => {
        room_manager_1.default.joinTheQueue(socket, pooTrophees);
    });
    socket.on("disconnect", () => {
        room_manager_1.default.leave(socket);
    });
}
exports.default = routeRoom;
