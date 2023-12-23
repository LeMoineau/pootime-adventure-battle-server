"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.rooms = void 0;
const SocketEvent_1 = require("./types/SocketEvent");
const math_utils_1 = require("./utils/math-utils");
const room_utils_1 = require("./utils/room-utils");
const DefaultValues_1 = require("./config/DefaultValues");
const battle_controller_1 = require("./battle-controller");
exports.rooms = [];
exports.queue = [];
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
                currentState: {
                    currentPv: stats.pv,
                    currentMana: 0,
                },
            };
            if (Object.keys(room.battleState).length >= 2) {
                room_utils_1.RoomUtils.emitToAllPlayers(socket, room, SocketEvent_1.SocketEvent.ROOM_READY, room);
                setTimeout(() => {
                    room_utils_1.RoomUtils.emitToAllPlayers(socket, room, SocketEvent_1.SocketEvent.BATTLE_BEGIN);
                    console.log(`battle begin in room #${room.id}`);
                }, DefaultValues_1.DefaultValues.TimeoutBattleBegin);
            }
        });
    });
    socket.on(SocketEvent_1.SocketEvent.HIT, () => {
        room_utils_1.RoomUtils.ifRoomExist(socket.data.roomId, (room) => {
            const advSocketId = room_utils_1.RoomUtils.getOtherPlayer(socket.id, room);
            room_utils_1.RoomUtils.removePvFromHitFromPlayer(socket.id, advSocketId, room);
            room_utils_1.RoomUtils.addManaToPlayer(socket.id, advSocketId, room);
            room_utils_1.RoomUtils.emitUpdatePvAndMana(socket, room, advSocketId, socket.id);
            battle_controller_1.BattleController.checkVictoryState(socket, room);
        });
    });
    socket.on(SocketEvent_1.SocketEvent.SPELL, (ulti) => {
        room_utils_1.RoomUtils.ifRoomExist(socket.data.roomId, (room) => {
            if (ulti.mana <= room_utils_1.RoomUtils.getPlayerState(socket.id, room).currentMana) {
                const advSocketId = room_utils_1.RoomUtils.getOtherPlayer(socket.id, room);
                room_utils_1.RoomUtils.removePvFromSpellFromPlayer(socket.id, advSocketId, ulti, room);
                room_utils_1.RoomUtils.removeManaToPlayer(socket.id, room, ulti.mana);
                room_utils_1.RoomUtils.emitToAllPlayers(socket, room, SocketEvent_1.SocketEvent.UPDATE_BATTLE_STATE, [
                    {
                        target: advSocketId,
                        update: {
                            currentPv: room_utils_1.RoomUtils.getPlayerState(advSocketId, room)
                                .currentPv,
                        },
                    },
                    {
                        target: socket.id,
                        update: {
                            currentMana: room_utils_1.RoomUtils.getPlayerState(socket.id, room)
                                .currentMana,
                        },
                    },
                ]);
                battle_controller_1.BattleController.checkVictoryState(socket, room);
            }
        });
    });
    socket.on(SocketEvent_1.SocketEvent.JOIN_THE_QUEUE, () => {
        if (exports.queue.length >= 1) {
            const adv = exports.queue[0];
            exports.queue.splice(0, 1);
            const room = {
                id: math_utils_1.MathUtils.generateRoomId(),
                owner: socket.id,
                players: [socket.id, adv.id],
                battleState: {},
            };
            exports.rooms.push(room);
            socket.data.roomId = room.id;
            adv.data.roomId = room.id;
            socket.emit(SocketEvent_1.SocketEvent.FIND_THE_ROOM, room);
            adv.emit(SocketEvent_1.SocketEvent.FIND_THE_ROOM, room);
        }
        else if (exports.queue.findIndex((s) => socket.id === s.id) === -1) {
            exports.queue.push(socket);
        }
    });
    socket.on(SocketEvent_1.SocketEvent.DISCONNECT, () => {
        const roomIndex = exports.rooms.findIndex((r) => r.owner === socket.id);
        if (roomIndex !== -1) {
            console.log(`destroying room #${exports.rooms[roomIndex].id}`);
            exports.rooms.splice(roomIndex, 1);
        }
        const queueIndex = exports.queue.findIndex((s) => s.id === socket.id);
        if (queueIndex !== -1) {
            console.log(`removing from queue`);
            exports.queue.splice(queueIndex, 1);
        }
        console.log(`#${socket.id} disconnect`);
    });
}
exports.default = onConnection;
