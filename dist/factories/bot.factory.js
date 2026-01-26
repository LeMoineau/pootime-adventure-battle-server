"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unique_username_generator_1 = require("unique-username-generator");
const body_colors_1 = require("../config/constants/style/body-colors");
const heads_1 = require("../config/constants/style/heads");
const expressions_1 = require("../config/constants/style/expressions");
const Bot_1 = require("../models/Bot");
const array_utils_1 = require("../utils/array-utils");
const math_utils_1 = require("../utils/math-utils");
const level_1 = require("../config/constants/stats/level");
const utlis_1 = require("../config/constants/stats/utlis");
const MAX_HIT_PER_SECOND = 12;
const MIN_HIT_PER_SECOND = 5;
class BotFactory {
    create({ player, room }) {
        const bot = new Bot_1.Bot({
            pooTrophees: player.pooTrophees,
            room,
            hittingRate: this._generateHittingRate(),
        });
        return bot;
    }
    generateBattleState(player) {
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
    /**
     * Genere le nombre de hit par seconde (par défaut entre 12 et 5)
     */
    _generateHittingRate() {
        return Math.round(1000 / math_utils_1.MathUtils.getRandomInt(MAX_HIT_PER_SECOND, MIN_HIT_PER_SECOND));
    }
    /**
     * choose an ulti from player level
     * @param player adv of the bot
     * @returns [ultiName, ultiDetails] or undefined
     */
    _generateUlti(player) {
        const level = player.battleState.stats.level;
        const ulti = array_utils_1.ArrayUtils.getRandomItem([
            undefined,
            ...Object.entries(utlis_1.ultis)
                .filter(([_, i]) => i.unlockLevel <= level)
                .map(([k, i]) => ({ ultiName: k, details: i.details })),
        ]);
        return ulti ? [ulti.ultiName, ulti.details] : undefined;
    }
    _generateBotStyle() {
        return {
            bodyColor: array_utils_1.ArrayUtils.getRandomItem(body_colors_1.bodyColors),
            expression: array_utils_1.ArrayUtils.getRandomItem(expressions_1.expressions),
            head: array_utils_1.ArrayUtils.getRandomItem(heads_1.heads),
            name: (0, unique_username_generator_1.generateUsername)("-", 0, 12, "Bot"),
        };
    }
    _generateBotStats(player) {
        const ulti = this._generateUlti(player);
        let starsRemaining = this._calculateStarsToSpend(player.level);
        const stats = this._divideStarsAmongStats(Object.assign({ starsAvailable: starsRemaining }, (ulti ? { ultiName: ulti[0], ultiDetails: ulti[1] } : {})));
        return Object.assign(Object.assign({}, stats), { level: player.level, ultiSelected: ulti ? ulti[0] : null });
    }
    _divideStarsAmongStats({ starsAvailable, ultiName, ultiDetails, }) {
        var _a;
        let starsRemaining = starsAvailable;
        const keys = array_utils_1.ArrayUtils.shuffle(["attaque", "defense", "pv", "resMana"]);
        let stats = {};
        if (ultiName && ultiDetails) {
            stats.mana = ultiDetails.mana / 5;
            stats.recupMana = 1;
            keys.push("recupMana");
            starsRemaining -= ultiDetails.mana / 5 - 1;
        }
        else {
            stats.mana = 0;
            stats.recupMana = 0;
        }
        for (let i = 0; i < keys.length; i++) {
            const starsSpend = i === keys.length - 1
                ? starsRemaining
                : math_utils_1.MathUtils.getRandomInt(starsRemaining);
            stats[keys[i]] = ((_a = stats[keys[i]]) !== null && _a !== void 0 ? _a : 0) + starsSpend;
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
    _calculateStarsToSpend(playerLevel) {
        let starsRemaining = 0;
        for (let i = 1; i < playerLevel; i++) {
            starsRemaining += (0, level_1.xpNeededForNextLevel)(i);
        }
        starsRemaining += math_utils_1.MathUtils.getRandomInt((0, level_1.xpNeededForNextLevel)(playerLevel) - 1);
        return starsRemaining;
    }
}
exports.default = new BotFactory();
