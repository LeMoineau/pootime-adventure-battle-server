import battleManager from "../manager/battle.manager";
import { BattleSocket } from "../types/socket/BattleSocket";

export default function routeBattle(socket: BattleSocket) {
  socket.on("send-player-infos", (style, stats) => {
    battleManager.sendingPlayerInfos(socket.data.roomId, socket.id, {
      stats,
      style,
      currentState: { currentPv: stats.pv, currentMana: 0 },
    });
  });

  socket.on("hit", () => {
    battleManager.hit(socket.data.roomId, socket.id);
  });

  socket.on("spell", (ulti) => {
    battleManager.spell(socket.data.roomId, socket.id, ulti);
  });
}
