"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_controller_1 = __importDefault(require("../controller/player.controller"));
const room_controller_1 = __importDefault(require("../controller/room.controller"));
const queue_service_1 = require("../service/queue.service");
const battle_manager_1 = __importDefault(require("./battle.manager"));
class RoomManager {
    use(io) {
        this.io = io;
        this.queueService = new queue_service_1.QueueService(io);
    }
    createARoom(socket) {
        const owner = player_controller_1.default.create({ socket });
        const room = room_controller_1.default.create({ owner });
        socket.emit("room-created", room.toDTO());
        console.log(`#${socket.id} create the room #${room.id}`, room.toDTO());
    }
    joinTheQueue(socket, pooTrophees) {
        const player = player_controller_1.default.create({ socket, pooTrophees });
        this.queueService.join(player);
    }
    joinARoom(socket, roomId) {
        const player = player_controller_1.default.create({ socket });
        const room = room_controller_1.default.get({ id: roomId });
        if (room && !room.contains({ socketId: socket.id })) {
            room.add(player);
            socket.emit("find-the-room", room.toDTO());
            socket
                .to(room.owner.socketId)
                .emit("player-join-your-room", room.toDTO());
            console.log(`#${socket.id} join the room #${room.id}`, room.toDTO());
        }
        else {
            socket.emit("not-find-the-room");
        }
    }
    leave(socket) {
        const room = room_controller_1.default.remove({ playerId: socket.id });
        if (room && !room.finished() && room.ready()) {
            this._handleDisconnectDuringBattle(room, socket.id);
        }
        else {
            player_controller_1.default.remove({ socketId: socket.id });
        }
        const player = this.queueService.remove({ socketId: socket.id });
        if (player) {
            console.log(`player removed from the queue`);
        }
        console.log(`#${socket.id} disconnect`);
    }
    _handleDisconnectDuringBattle(room, leaverId) {
        const [player, adv] = room.getPlayerAndAdv({ socketId: leaverId });
        if (player && adv && player.battleState) {
            player.losePv(player.battleState.currentState.currentPv);
            battle_manager_1.default.updateBattleState(room, player, adv);
            console.log(`player #${player.socketId} leave the battle before the end`);
        }
    }
}
exports.default = new RoomManager();
