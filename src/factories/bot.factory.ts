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
import { UltiDetails } from "../types/player/UltiDetails";

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
    const stats = this._generateBotStats(player);
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
    return Math.round(1000 / MathUtils.getRandomInt(12, 5));
  }

  /**
   * choose an ulti from player level
   * @param player adv of the bot
   * @returns [ultiName, ultiDetails] or undefined
   */
  _generateUlti(player: Player): [string, UltiDetails] | undefined {
    const level = player.battleState!.stats.level;
    const ulti = ArrayUtils.getRandomItem([
      undefined,
      ...Object.entries(ultis)
        .filter(([_, i]) => i.unlockLevel <= level)
        .map(([k, i]) => ({ ultiName: k, details: i.details })),
    ]);
    return ulti ? [ulti.ultiName, ulti.details] : undefined;
  }

  _generateBotStyle(): PlayerStyle {
    return {
      bodyColor: ArrayUtils.getRandomItem(bodyColors),
      expression: ArrayUtils.getRandomItem(expressions),
      head: ArrayUtils.getRandomItem(heads),
      name: generateUsername("-", 0, 12, "Bot"),
    };
  }

  _generateBotStats(player: Player): PlayerStats {
    const ulti = this._generateUlti(player);
    let starsRemaining = this._calculateStarsToSpend(player.level!);
    const stats = this._divideStarsAmongStats({
      starsAvailable: starsRemaining,
      ...(ulti ? { ultiName: ulti[0], ultiDetails: ulti[1] } : {}),
    });
    return {
      ...stats,
      level: player.level!,
      ultiSelected: ulti ? ulti[0] : null,
    };
  }

  _divideStarsAmongStats({
    starsAvailable,
    ultiName,
    ultiDetails,
  }: {
    starsAvailable: number;
    ultiName?: string;
    ultiDetails?: UltiDetails;
  }): Omit<PlayerStats, "level" | "ultiSelected"> {
    let starsRemaining = starsAvailable;
    const keys = ArrayUtils.shuffle(["attaque", "defense", "pv", "resMana"]);
    let stats: any = {};
    if (ultiName && ultiDetails) {
      stats.mana = ultiDetails.mana / 5;
      stats.recupMana = 1;
      keys.push("recupMana");
      starsRemaining -= ultiDetails.mana / 5 - 1;
    } else {
      stats.mana = 0;
      stats.recupMana = 0;
    }
    for (let i = 0; i < keys.length; i++) {
      const starsSpend =
        i === keys.length - 1
          ? starsRemaining
          : MathUtils.getRandomInt(starsRemaining);
      stats[keys[i]] = (stats[keys[i]] ?? 0) + starsSpend;
      starsRemaining -= starsSpend;
    }
    return {
      attaque: stats.attaque + 1,
      defense: stats.defense + 1,
      mana: stats.mana * 5,
      pv: stats.pv * 5 + 20,
      recupMana: stats.recupMana,
      resMana: stats.resMana,
    };
  }

  _calculateStarsToSpend(playerLevel: number): number {
    let starsRemaining = 0;
    for (let i = 1; i < playerLevel!; i++) {
      starsRemaining += xpNeededForNextLevel(i);
    }
    starsRemaining += MathUtils.getRandomInt(
      xpNeededForNextLevel(playerLevel!) - 1
    );
    return starsRemaining;
  }
}

export default new BotFactory();
