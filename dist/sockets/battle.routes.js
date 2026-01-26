"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const battle_manager_1 = __importDefault(require("../manager/battle.manager"));
function routeBattle(socket) {
    socket.on("send-player-infos", (style, stats) => {
        battle_manager_1.default.sendingPlayerInfos(socket.data.roomId, socket.id, {
            stats,
            style,
            currentState: { currentPv: stats.pv, currentMana: 0 },
        });
    });
    socket.on("hit", () => {
        battle_manager_1.default.hit(socket.data.roomId, socket.id);
    });
    socket.on("spell", (ulti) => {
        battle_manager_1.default.spell(socket.data.roomId, socket.id, ulti);
    });
}
exports.default = routeBattle;
