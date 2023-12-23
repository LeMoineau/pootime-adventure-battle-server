"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleController = void 0;
const room_utils_1 = require("./utils/room-utils");
const SocketEvent_1 = require("./types/SocketEvent");
const math_utils_1 = require("./utils/math-utils");
var BattleController;
(function (BattleController) {
    function checkVictoryState(socket, room) {
        for (let p of room.players) {
            if (room_utils_1.RoomUtils.getPlayerState(p, room).currentPv <= 0) {
                const winnerSocketId = room_utils_1.RoomUtils.getOtherPlayer(p, room);
                const winnerStats = room_utils_1.RoomUtils.getPlayerStats(winnerSocketId, room);
                const loserStats = room_utils_1.RoomUtils.getPlayerStats(p, room);
                room_utils_1.RoomUtils.emitToAllPlayers(socket, room, SocketEvent_1.SocketEvent.BATTLE_FINISH, {
                    [winnerSocketId]: {
                        victoryState: "winner",
                        rewards: math_utils_1.MathUtils.calculateRewardsWinner(winnerStats, loserStats),
                    },
                    [p]: {
                        victoryState: "loser",
                        rewards: math_utils_1.MathUtils.calculateRewardsLoser(winnerStats, loserStats),
                    },
                });
            }
        }
    }
    BattleController.checkVictoryState = checkVictoryState;
})(BattleController || (exports.BattleController = BattleController = {}));
