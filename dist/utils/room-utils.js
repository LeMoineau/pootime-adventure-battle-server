"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomUtils = void 0;
const socket_1 = require("../socket");
var RoomUtils;
(function (RoomUtils) {
    function ifRoomExist(roomId, callback) {
        const room = socket_1.rooms.find((r) => r.id === roomId);
        if (!room) {
            return;
        }
        callback(room);
    }
    RoomUtils.ifRoomExist = ifRoomExist;
    function emitToOtherPlayer(socket, room, event, ...args) {
        for (let p of room.players) {
            if (p !== socket.id) {
                socket.to(p).emit(event, args);
                return;
            }
        }
    }
    RoomUtils.emitToOtherPlayer = emitToOtherPlayer;
    function emitToAllPlayers(socket, room, event, ...args) {
        socket.emit(event, args);
        emitToOtherPlayer(socket, room, event, args);
    }
    RoomUtils.emitToAllPlayers = emitToAllPlayers;
})(RoomUtils || (exports.RoomUtils = RoomUtils = {}));
