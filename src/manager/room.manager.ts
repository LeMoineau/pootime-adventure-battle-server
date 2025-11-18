import playerController from "../controller/player.controller";
import roomController from "../controller/room.controller";
import { QueueService } from "../service/queue.service";
import { RoomId, SocketId } from "../types/Identifier";
import { Room } from "../types/room/Room.impl";
import { BattleSocket } from "../types/socket/BattleSocket";
import { BattleSocketServer } from "../types/socket/BattleSocketServer";
import battleManager from "./battle.manager";

class RoomManager {
  io!: BattleSocketServer;
  queueService!: QueueService;

  use(io: BattleSocketServer) {
    this.io = io;
    this.queueService = new QueueService(io);
  }

  createARoom(socket: BattleSocket) {
    const owner = playerController.create({ socket });
    const room = roomController.create({ owner });
    socket.emit("room-created", room.toDTO());
    console.log(`#${socket.id} create the room #${room.id}`, room.toDTO());
  }

  joinTheQueue(socket: BattleSocket, pooTrophees: number) {
    const player = playerController.create({ socket, pooTrophees });
    this.queueService.join(player);
  }

  joinARoom(socket: BattleSocket, roomId: RoomId) {
    const player = playerController.create({ socket });
    const room = roomController.get({ id: roomId });
    if (room && !room.contains({ socketId: socket.id })) {
      room.add(player);
      socket.emit("find-the-room", room.toDTO());
      socket
        .to(room.owner.socketId)
        .emit("player-join-your-room", room.toDTO());
      console.log(`#${socket.id} join the room #${room.id}`, room.toDTO());
    } else {
      socket.emit("not-find-the-room");
    }
  }

  leave(socket: BattleSocket) {
    const room = roomController.remove({ playerId: socket.id });
    if (room && !room.finished() && room.ready()) {
      this._handleDisconnectDuringBattle(room, socket.id);
    } else {
      playerController.remove({ socketId: socket.id });
    }
    const player = this.queueService.remove({ socketId: socket.id });
    if (player) {
      console.log(`player removed from the queue`);
    }
    console.log(`#${socket.id} disconnect`);
  }

  _handleDisconnectDuringBattle(room: Room, leaverId: SocketId) {
    const [player, adv] = room.getPlayerAndAdv({ socketId: leaverId });
    if (player && adv && player.battleState) {
      player.losePv(player.battleState.currentState.currentPv);
      battleManager.updateBattleState(room, player, adv);
      console.log(`player #${player.socketId} leave the battle before the end`);
    }
  }
}

export default new RoomManager();
