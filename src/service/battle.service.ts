import { BattleUpdatePayload } from "../types/battle/BattleUpdatePayload";
import { BattleEnding, BattleRewards } from "../types/battle/BattleEnding";
import { Player } from "../types/player/Player.impl";
import { UltiDetails } from "../types/player/UltiDetails";
import { MathUtils } from "../utils/math-utils";
import { Room } from "../types/room/Room.impl";

class BattleService {
  constructor() {}

  calculateDamage(hitter: Player, victim: Player): number {
    if (!hitter.battleState || !victim.battleState) return 0;
    return (
      hitter.battleState.stats.attaque /
      (victim.battleState.stats.defense === 0
        ? 1
        : victim.battleState.stats.defense)
    );
  }

  calculateSpellDamage(_: Player, victim: Player, ulti: UltiDetails): number {
    return ulti.damage
      ? ulti.damage /
          (victim.battleState?.currentState.resMana === 0
            ? 1
            : victim.battleState?.currentState.resMana)
      : 0;
  }

  generateBattleUpdatePayload(
    hitter: Player,
    victim: Player
  ): BattleUpdatePayload {
    return [
      {
        target: victim.socketId,
        update: {
          currentPv: victim.battleState?.currentState.currentPv,
        },
      },
      {
        target: hitter.socketId,
        update: {
          currentMana: hitter.battleState?.currentState.currentMana,
        },
      },
    ];
  }

  generateBattleReward(
    room: Room,
    winner: Player,
    looser: Player
  ): [BattleRewards, BattleRewards] {
    return [
      MathUtils.calculateRewardsWinner(
        winner.battleState!.stats,
        looser.battleState!.stats
      ),
      MathUtils.calculateRewardsLoser(
        winner.battleState!.stats,
        looser.battleState!.stats
      ),
    ];
  }

  generateBattleEnding(room: Room): BattleEnding {
    const winner = room.getWinner();
    if (!winner) throw new Error(`no winner in room #${room.id}`);
    const looser = room.getAdvOf({ socketId: winner.socketId });
    if (!looser) throw new Error(`no adv of the winner in room #${room.id}`);
    const [winReward, loseReward] = this.generateBattleReward(
      room,
      winner,
      looser
    );
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
