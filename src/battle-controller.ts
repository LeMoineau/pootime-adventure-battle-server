import { Socket } from "socket.io";
import { Room } from "./types/Room";
import { RoomUtils } from "./utils/room-utils";
import { SocketEvent } from "./types/SocketEvent";
import { BattleEnding } from "./types/BattleEnding";
import { MathUtils } from "./utils/math-utils";

export namespace BattleController {
  export function checkVictoryState(socket: Socket, room: Room) {
    for (let p of room.players) {
      if (
        RoomUtils.getPlayerState(p, room).currentPv <= 0 &&
        !room.battleFinish
      ) {
        room.battleFinish = true;
        const winnerSocketId = RoomUtils.getOtherPlayer(p, room);
        const winnerStats = RoomUtils.getPlayerStats(winnerSocketId, room);
        const loserStats = RoomUtils.getPlayerStats(p, room);
        RoomUtils.emitToAllPlayers(socket, room, SocketEvent.BATTLE_FINISH, {
          [winnerSocketId]: {
            victoryState: "winner",
            rewards: MathUtils.calculateRewardsWinner(winnerStats, loserStats),
          },
          [p]: {
            victoryState: "loser",
            rewards: MathUtils.calculateRewardsLoser(winnerStats, loserStats),
          },
        } as BattleEnding);
      }
    }
  }
}
