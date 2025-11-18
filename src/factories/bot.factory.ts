import { generateUsername } from "unique-username-generator";
import { bodyColors } from "../config/constants/style/body-colors";
import { heads } from "../config/constants/style/heads";
import { expressions } from "../config/constants/style/expressions";
import { BattleState } from "../types/battle/BattleState";
import { Bot } from "../types/player/Bot.impl";
import { Player } from "../types/player/Player.impl";
import { PlayerStats } from "../types/player/PlayerStats";
import { PlayerStyle } from "../types/player/PlayerStyle";
import { Room } from "../types/room/Room.impl";
import { ArrayUtils } from "../utils/array-utils";
import { MathUtils } from "../utils/math-utils";
import { xpNeededForNextLevel } from "../config/constants/stats/level";
import { ultis } from "../config/constants/stats/utlis";

class BotFactory {
  create({ player, room }: { player: Player; room: Room }): Bot {
    const bot = new Bot({
      pooTrophees: player.pooTrophees,
      room,
      hittingRate: this._generateHittingRate(),
    });
    return bot;
  }

  generateBattleState(player: Player): BattleState {
    const ultiName = this._generateUlti(player);
    const stats = this._generateBotStats(player, ultiName);
    return {
      stats,
      style: this._generateBotStyle(),
      currentState: {
        currentMana: 0,
        currentPv: stats.pv,
      },
    };
  }

  _generateHittingRate(): number {
    // Entre 5 hit par secondes et 15
    return Math.round(1000 / MathUtils.getRandomInt(15, 5));
  }

  _generateUlti(player: Player): string {
    const level = player.battleState!.stats.level;
    const ulti = ArrayUtils.getRandomItem(
      Object.entries(ultis)
        .filter(([_, i]) => i.unlockLevel <= level)
        .map(([k, _]) => k)
    );
    return ulti;
  }

  _getLevel(player: Player): number {
    return player.battleState!.stats.level;
  }

  _generateBotStyle(): PlayerStyle {
    return {
      bodyColor: ArrayUtils.getRandomItem(bodyColors),
      expression: ArrayUtils.getRandomItem(expressions),
      head: ArrayUtils.getRandomItem(heads),
      name: generateUsername("-", 0, 12, "Bot"),
    };
  }

  _generateBotStats(player: Player, ultiName: string): PlayerStats {
    const playerLevel = this._getLevel(player);
    let starsRemaning = 0;
    for (let i = 1; i < playerLevel; i++) {
      starsRemaning += xpNeededForNextLevel(i);
    }
    starsRemaning += MathUtils.getRandomInt(
      xpNeededForNextLevel(playerLevel + 1) - 1,
      xpNeededForNextLevel(playerLevel)
    );
    const keys = ArrayUtils.shuffle([
      "attaque",
      "defense",
      "mana",
      "pv",
      "recupMana",
      "resMana",
    ]);
    let stats: any = {};
    for (let k of keys) {
      const starsSpend = MathUtils.getRandomInt(starsRemaning);
      stats[k] = starsSpend;
      starsRemaning -= starsSpend;
    }
    return {
      attaque: stats.attaque + 1,
      defense: stats.defense + 1,
      level: playerLevel,
      mana: stats.mana * 5,
      pv: stats.pv * 5 + 20,
      recupMana: stats.recupMana,
      resMana: stats.resMana,
      ultiSelected: ultiName,
    };
  }
}

export default new BotFactory();
