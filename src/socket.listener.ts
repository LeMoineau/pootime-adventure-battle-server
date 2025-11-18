import { Server } from "http";
import cors from "cors";
import { BattleSocketServer } from "./types/socket/BattleSocketServer";
import { BattleSocket } from "./types/socket/BattleSocket";
import roomController from "./controller/room.controller";
import { RoomId, SocketId } from "./types/Identifier";
import { PlayerStyle } from "./types/player/PlayerStyle";
import { PlayerStats } from "./types/player/PlayerStats";
import { DefaultValues } from "./config/DefaultValues";
import { Player } from "./types/player/Player.impl";
import battleService from "./service/battle.service";
import { UltiDetails } from "./types/player/UltiDetails";
import { Room } from "./types/room/Room.impl";
import { QueueService } from "./service/queue.service";
import playerController from "./controller/player.controller";

export class SocketListener {
  io: BattleSocketServer;
  queueService: QueueService;

  constructor(httpServer: Server) {
    this.io = new BattleSocketServer(httpServer, { cors: { ...cors() } });
    this.queueService = new QueueService(this.io);
  }

  listen() {
    this.io.on("connection", (socket: BattleSocket) => {
      console.log(`#${socket.id} connect`);
      this._listeningCreatingARoom(socket);
      this._listeningJoiningARoom(socket);
      this._listeningJoiningTheQueue(socket);
      this._listeningSendingPlayerInfos(socket);
      this._listeningHit(socket);
      this._listeningSpell(socket);
      this._listeningDisconnection(socket);
    });
  }

  _listeningCreatingARoom(socket: BattleSocket) {
    socket.on("create-a-room", () => {
      const owner = playerController.create({ socket });
      const room = roomController.create({ owner });
      socket.emit("room-created", room.toDTO());
      console.log(`#${socket.id} create the room #${room.id}`, room.toDTO());
    });
  }

  _listeningJoiningTheQueue(socket: BattleSocket) {
    socket.on("join-the-queue", (pooTrophees) => {
      const player = playerController.create({ socket, pooTrophees });
      this.queueService.join(player);
    });
  }

  _listeningJoiningARoom(socket: BattleSocket) {
    socket.on("join-a-room", (id: RoomId) => {
      const player = playerController.create({ socket });
      const room = roomController.get({ id });
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
    });
  }

  _listeningSendingPlayerInfos(socket: BattleSocket) {
    socket.on("send-player-infos", (style: PlayerStyle, stats: PlayerStats) => {
      const room = roomController.get({ id: socket.data.roomId });
      const player = room?.get({ socketId: socket.id });
      if (room && player) {
        player.init({
          style: style,
          stats: stats,
          currentState: {
            currentPv: stats.pv,
            currentMana: 0,
          },
        });
        if (room.ready()) {
          this.io.to(room.id).emit("room-ready", room.toDTO());
          setTimeout(() => {
            this.io.to(room.id).emit("battle-begin");
            room.begin();
            console.log(`battle begin in room #${room.id}`);
          }, DefaultValues.BATTLE_BEGIN_TIMEOUT);
        }
      }
    });
  }

  _listeningHit(socket: BattleSocket) {
    socket.on("hit", () => {
      const room = roomController.get({ id: socket.data.roomId });
      if (!room) return;
      const [player, adv] = room.getPlayerAndAdv({ socketId: socket.id });
      if (player && adv) {
        player.hit(adv);
        this._handleBattleUpdate(room, player, adv);
      }
    });
  }

  _listeningSpell(socket: BattleSocket) {
    socket.on("spell", (ulti: UltiDetails) => {
      const room = roomController.get({ id: socket.data.roomId });
      if (!room) return;
      const [player, adv] = room.getPlayerAndAdv({ socketId: socket.id });
      if (player && adv && player.canSpell(ulti)) {
        player.spell(adv, ulti);
        this._handleBattleUpdate(room, player, adv);
      }
    });
  }

  _listeningDisconnection(socket: BattleSocket) {
    socket.on("disconnect", () => {
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
    });
  }

  _handleDisconnectDuringBattle(room: Room, leaverId: SocketId) {
    const [player, adv] = room.getPlayerAndAdv({ socketId: leaverId });
    if (player && adv && player.battleState) {
      player.losePv(player.battleState.currentState.currentPv);
      this._handleBattleUpdate(room, player, adv);
      console.log(`player #${player.socketId} leave the battle before the end`);
    }
  }

  _handleBattleUpdate(room: Room, player: Player, adv: Player) {
    this.io
      .to(room.id)
      .emit(
        "update-battle-state",
        battleService.generateBattleUpdatePayload(player, adv)
      );
    if (room.finished()) {
      const winner = room.getWinner();
      if (winner) {
        room.stop();
        this.io
          .to(room.id)
          .emit(
            "battle-finish",
            battleService.generateBattleEnding(room),
            room.toDTO()
          );
        roomController.remove({ id: room.id });
      }
    }
  }
}
