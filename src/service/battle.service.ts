import { BattleUpdatePayload } from "../types/battle/BattleUpdatePayload";
import { BattleEnding, BattleRewards } from "../types/battle/BattleEnding";
import { Player } from "../types/player/Player.impl";
import { UltiDetails } from "../types/player/UltiDetails";
import { Room } from "../types/room/Room.impl";
import rewardFactory from "../factories/reward.factory";

class BattleService {
  calculateDamage(hitter: Player, victim: Player): number {
    if (!hitter.battleState || !victim.battleState) return 0;
    const hitterAttaque = hitter.battleState.stats.attaque;
    const victimDefense = victim.battleState.stats.defense;
    return hitterAttaque / (victimDefense === 0 ? 1 : victimDefense);
  }

  calculateSpellDamage(_: Player, victim: Player, ulti: UltiDetails): number {
    const ultiDamage = ulti.damage;
    if (!ultiDamage) return 0;
    const victimResMana = victim.battleState?.currentState.resMana;
    return ultiDamage / (victimResMana === 0 ? 1 : victimResMana);
  }

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
