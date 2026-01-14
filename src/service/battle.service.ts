import { BattleUpdatePayload } from "../types/battle/BattleUpdatePayload";
import { BattleEnding } from "../types/battle/BattleEnding";
import { Player } from "../models/Player";
import { Room } from "../models/Room";
import rewardFactory from "../factories/reward.factory";

class BattleService {
  generateBattleUpdatePayload(
    hitter: Player,
    victim: Player
  ): BattleUpdatePayload {
    const currentPv = victim.battleState?.currentState.currentPv;
    const currentMana = hitter.battleState?.currentState.currentMana;
    return [
      {
        target: victim.socketId,
        update: { currentPv },
      },
      {
        target: hitter.socketId,
        update: { currentMana },
      },
    ];
  }

  generateBattleEnding(room: Room): BattleEnding {
    const winner = room.getWinner();
    if (!winner) throw new Error(`no winner in room #${room.id}`);
    const looser = room.getAdvOf({ socketId: winner.socketId });
    if (!looser) throw new Error(`no adv of the winner in room #${room.id}`);
    const [winReward, loseReward] = rewardFactory.create({
      winner,
      looser,
      room,
    });
    return {
      [winner.socketId]: {
        victoryState: "winner",
        rewards: winReward,
      },
      [looser.socketId]: {
        victoryState: "loser",
        rewards: loseReward,
      },
    };
  }
}

export default new BattleService();
