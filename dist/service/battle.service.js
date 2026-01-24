"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reward_factory_1 = __importDefault(require("../factories/reward.factory"));
class BattleService {
    generateBattleUpdatePayload(hitter, victim) {
        var _a, _b;
        const currentPv = (_a = victim.battleState) === null || _a === void 0 ? void 0 : _a.currentState.currentPv;
        const currentMana = (_b = hitter.battleState) === null || _b === void 0 ? void 0 : _b.currentState.currentMana;
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
    generateBattleEnding(room) {
        const winner = room.getWinner();
        if (!winner)
            throw new Error(`no winner in room #${room.id}`);
        const looser = room.getAdvOf({ socketId: winner.socketId });
        if (!looser)
            throw new Error(`no adv of the winner in room #${room.id}`);
        const [winReward, loseReward] = reward_factory_1.default.create({
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
exports.default = new BattleService();
