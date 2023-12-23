"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = void 0;
var MathUtils;
(function (MathUtils) {
    function generateRoomId() {
        return Math.random().toString(36).toUpperCase().substring(2, 6);
    }
    MathUtils.generateRoomId = generateRoomId;
    function calculateRewardsWinner(winnerStats, loserStats) {
        const diffLvl = loserStats.level - winnerStats.level;
        return {
            stars: 1 + (diffLvl >= 0 ? Math.ceil(diffLvl / 2) : 0),
            pooCoins: 150 + (diffLvl >= 0 ? Math.ceil(diffLvl * 50) : 0),
        };
    }
    MathUtils.calculateRewardsWinner = calculateRewardsWinner;
    function calculateRewardsLoser(winnerStats, loserStats) {
        const diffLvl = loserStats.level - winnerStats.level;
        return {
            stars: diffLvl >= 0 ? Math.ceil(diffLvl / 4) : 0,
            pooCoins: 75 + (diffLvl >= 0 ? Math.ceil(diffLvl * 25) : 0),
        };
    }
    MathUtils.calculateRewardsLoser = calculateRewardsLoser;
})(MathUtils || (exports.MathUtils = MathUtils = {}));
