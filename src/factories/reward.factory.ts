import { BattleRewards } from "../types/battle/BattleEnding";
import { Player } from "../types/player/Player.impl";
import { Room } from "../types/room/Room.impl";
import { MathUtils } from "../utils/math-utils";

class RewardFactory {
  //pooCoins
  PRIVATE_POOCOINS_REWARD = 100;
  RANKED_POOCOINS_REWARD = 150;
  //stars
  RANKED_LOOSER_STARS_REWARD = 1;
  RANKED_WINNER_STARS_REWARD = 0;
  //trophees
  TROPHEE_DISTANCE_EQUAL_STRENGTH = 20;

  create({
    winner,
    looser,
    room,
  }: {
    winner: Player;
    looser: Player;
    room: Room;
  }): [BattleRewards, BattleRewards] {
    return room.ranked
      ? this._generateRankedReward(winner, looser)
      : this._generatePrivateReward();
  }

  /**
   * Calculate distance between winner and looser then
   * - give trophee to winner and remove some to looser depending of this distance
   * - give 1 star for looser and 0 to winner
   * - give equal pooCoins
   * @param winner
   * @param looser
   */
  _generateRankedReward(
    winner: Player,
    looser: Player
  ): [BattleRewards, BattleRewards] {
    const distance = winner.pooTrophees - looser.pooTrophees;

    let winnerTrophee = 0;
    let looserTrophee = 0;
    if (Math.abs(distance) <= this.TROPHEE_DISTANCE_EQUAL_STRENGTH) {
      //equal strength
      winnerTrophee = 10;
      looserTrophee = -10;
    } else if (distance > this.TROPHEE_DISTANCE_EQUAL_STRENGTH) {
      //boring win (winner lot more strong than looser)
      winnerTrophee = MathUtils.range(20, 250, 8, 1, distance);
      looserTrophee = -MathUtils.range(20, 250, 8, 1, distance);
    } else if (distance < -this.TROPHEE_DISTANCE_EQUAL_STRENGTH) {
      //exceptionnal win (winner lot less strong than looser)
      winnerTrophee = MathUtils.range(20, 250, 12, 40, Math.abs(distance));
      looserTrophee = -MathUtils.range(20, 250, 12, 30, Math.abs(distance));
    }

    return [
      {
        pooTrophees: Math.round(winnerTrophee),
        pooCoins: this.RANKED_POOCOINS_REWARD,
        stars: this.RANKED_WINNER_STARS_REWARD,
      },
      {
        pooTrophees: Math.round(looserTrophee),
        pooCoins: this.RANKED_POOCOINS_REWARD,
        stars: this.RANKED_LOOSER_STARS_REWARD,
      },
    ];
  }

  /**
   * Private battle gives only equal pooCoins for both players
   */
  _generatePrivateReward(): [BattleRewards, BattleRewards] {
    return [
      { pooCoins: this.PRIVATE_POOCOINS_REWARD },
      { pooCoins: this.PRIVATE_POOCOINS_REWARD },
    ];
  }
}

export default new RewardFactory();
