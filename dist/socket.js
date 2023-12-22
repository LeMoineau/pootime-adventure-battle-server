"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
const SocketEvent_1 = require("./types/SocketEvent");
const math_utils_1 = require("./utils/math-utils");
const room_utils_1 = require("./utils/room-utils");
exports.rooms = [];
function onConnection(socket) {
    console.log(`#${socket.id} connect`);
    socket.on(SocketEvent_1.SocketEvent.CREATE_A_ROOM, () => {
        const room = {
            owner: socket.id,
            id: math_utils_1.MathUtils.generateRoomId(),
            players: [socket.id],
            battleState: {},
        };
        exports.rooms.push(room);
        socket.data.roomId = room.id;
        socket.emit(SocketEvent_1.SocketEvent.ROOM_CREATED, room);
        console.log(`#${socket.id} create the room #${room.id}`, room);
    });
    socket.on(SocketEvent_1.SocketEvent.JOIN_A_ROOM, (roomId) => {
        const room = exports.rooms.find((r) => r.id === roomId);
        if (room && room.owner !== socket.id) {
            room.players.push(socket.id);
            socket.data.roomId = roomId;
            socket.emit(SocketEvent_1.SocketEvent.FIND_THE_ROOM, room);
            socket.to(room.owner).emit(SocketEvent_1.SocketEvent.PLAYER_JOIN_YOUR_ROOM, room);
            console.log(`#${socket.id} join the room #${room.id}`, room);
        }
        else {
            socket.emit(SocketEvent_1.SocketEvent.NOT_FIND_THE_ROOM);
        }
    });
    socket.on(SocketEvent_1.SocketEvent.SEND_PLAYER_INFOS, (style, stats) => {
        room_utils_1.RoomUtils.ifRoomExist(socket.data.roomId, (room) => {
            room.battleState[socket.id] = {
                style: style,
                stats: stats,
            };
            room_utils_1.RoomUtils.emitToOtherPlayer(socket, room, SocketEvent_1.SocketEvent.SEND_PLAYER_INFOS, style, stats);
            if (Object.keys(room.battleState).length >= 2) {
                room_utils_1.RoomUtils.emitToAllPlayers(socket, room, SocketEvent_1.SocketEvent.BATTLE_BEGIN);
            }
        });
    });
    socket.on(SocketEvent_1.SocketEvent.DISCONNECT, () => {
        const roomIndex = exports.rooms.findIndex((r) => r.owner === socket.id);
        if (roomIndex !== -1) {
            console.log(`destroying room #${exports.rooms[roomIndex].id}`);
            exports.rooms.splice(roomIndex, 1);
        }
        console.log(`#${socket.id} disconnect`);
    });
}
exports.default = onConnection;
