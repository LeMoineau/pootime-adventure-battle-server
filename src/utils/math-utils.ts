import { BattleRewards } from "../types/BattleEnding";
import { PlayerStats } from "../types/PlayerStats";

export namespace MathUtils {
  export function generateRoomId() {
    return Math.random().toString(36).toUpperCase().substring(2, 6);
  }

  export function calculateRewardsWinner(
    winnerStats: PlayerStats,
    loserStats: PlayerStats
  ): BattleRewards {
    const diffLvl = loserStats.level - winnerStats.level;
    return {
      stars: 1 + (diffLvl >= 0 ? Math.ceil(diffLvl / 2) : 0),
      pooCoins: 150 + (diffLvl >= 0 ? Math.ceil(diffLvl * 50) : 0),
    };
  }

  export function calculateRewardsLoser(
    winnerStats: PlayerStats,
    loserStats: PlayerStats
  ): BattleRewards {
    const diffLvl = loserStats.level - winnerStats.level;
    return {
      stars: diffLvl >= 0 ? Math.ceil(diffLvl / 4) : 0,
      pooCoins: 75 + (diffLvl >= 0 ? Math.ceil(diffLvl * 25) : 0),
    };
  }
}
