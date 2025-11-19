import { DefaultValues } from "../config/DefaultValues";
import battleService from "../service/battle.service";
import { BattleState } from "../types/battle/BattleState";
import { RoomId, SocketId } from "../types/Identifier";
import { Player } from "../types/player/Player.impl";
import { UltiDetails } from "../types/player/UltiDetails";
import { Room } from "../types/room/Room.impl";
import { BattleSocketServer } from "../types/socket/BattleSocketServer";
import roomController from "../controller/room.controller";
import { Bot } from "../types/player/Bot.impl";

class BattleManager {
  io!: BattleSocketServer;

  use(io: BattleSocketServer) {
    this.io = io;
  }

  sendingPlayerInfos(
    roomId: RoomId,
    socketId: SocketId,
    battleState: BattleState
  ) {
    const room = roomController.get({ id: roomId });
    if (!room) return;
    const [player, adv] = room.getPlayerAndAdv({ socketId });
    if (room && player) {
      player.init(battleState);
      if (adv instanceof Bot && !adv.ready && player.ready) {
        adv.generate(player);
      }
      if (room.ready() && !room.started) {
        room.started = true;
        this.io.to(room.id).emit("room-ready", room.toDTO());
        setTimeout(() => {
          this.io.to(room.id).emit("battle-begin");
          room.begin();
          console.log(`battle begin in room #${room.id}`);
        }, DefaultValues.BATTLE_BEGIN_TIMEOUT);
      }
    }
  }

  hit(roomId: RoomId, socketId: SocketId) {
    const room = roomController.get({ id: roomId });
    if (!room) return;
    const [player, adv] = room.getPlayerAndAdv({ socketId });
    if (player && adv) {
      player.hit(adv);
      this.updateBattleState(room, player, adv);
    }
  }

  spell(roomId: RoomId, socketId: SocketId, ulti: UltiDetails) {
    const room = roomController.get({ id: roomId });
    if (!room) return;
    const [player, adv] = room.getPlayerAndAdv({ socketId });
    if (player && adv && player.canSpell(ulti)) {
      player.spell(adv, ulti);
      this.updateBattleState(room, player, adv);
    }
  }

  updateBattleState(room: Room, player: Player, adv: Player) {
    this.io
      .to(room.id)
      .emit(
        "update-battle-state",
        battleService.generateBattleUpdatePayload(player, adv)
      );
    if (room.finished()) {
      console.log("finished");
      const winner = room.getWinner();
      room.stop();
      if (winner) {
        console.log("winner");
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

export default new BattleManager();
