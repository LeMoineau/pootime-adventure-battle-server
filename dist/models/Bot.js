"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const uuid_1 = require("uuid");
const battle_manager_1 = __importDefault(require("../manager/battle.manager"));
const bot_factory_1 = __importDefault(require("../factories/bot.factory"));
const utlis_1 = require("../config/constants/stats/utlis");
const Player_1 = require("./Player");
class Bot extends Player_1.Player {
    constructor({ pooTrophees, room, hittingRate, }) {
        super({ pooTrophees });
        this.botId = (0, uuid_1.v4)();
        this.room = room;
        this.hittingRate = hittingRate;
    }
    get socketId() {
        return this.botId;
    }
    get roomId() {
        return this.room.id;
    }
    join(_) { }
    /**
     * generate the bot stats according to the player battle state
     * @param player bot adv
     */
    generate(player) {
        var _a;
        const battleState = bot_factory_1.default.generateBattleState(player);
        if (battleState.stats.ultiSelected) {
            this.ulti = (_a = Object.entries(utlis_1.ultis).find(([k, _]) => k === battleState.stats.ultiSelected)) === null || _a === void 0 ? void 0 : _a[1].details;
        }
        battle_manager_1.default.sendingPlayerInfos(this.roomId, this.socketId, battleState);
    }
    start() {
        this.intervalId = setInterval(() => {
            battle_manager_1.default.hit(this.roomId, this.socketId);
            if (this.ulti && this.canSpell(this.ulti)) {
                battle_manager_1.default.spell(this.roomId, this.socketId, this.ulti);
            }
        }, this.hittingRate);
    }
    stop() {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
    }
}
exports.Bot = Bot;
