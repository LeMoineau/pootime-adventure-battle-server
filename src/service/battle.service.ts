import { BattleUpdatePayload } from "../types/battle/BattleUpdatePayload";
import { BattleEnding, BattleRewards } from "../types/battle/BattleEnding";
import { Player } from "../types/player/Player.impl";
import { UltiDetails } from "../types/player/UltiDetails";
import { MathUtils } from "../utils/math-utils";

class BattleService {
  constructor() {}

  calculateDamage(hitter: Player, victim: Player): number {
    if (!hitter.battleState || !victim.battleState) return 0;
    return hitter.battleState.stats.attaque / victim.battleState.stats.defense;
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

  generateBattleEnding(winner: Player, looser: Player): BattleEnding {
    const [winReward, loseReward] = this.generateBattleReward(winner, looser);
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

  generateBattleReward(
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
}

export default new BattleService();
