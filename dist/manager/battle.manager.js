"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultValues_1 = require("../config/DefaultValues");
const battle_service_1 = __importDefault(require("../service/battle.service"));
const room_controller_1 = __importDefault(require("../controller/room.controller"));
const Bot_1 = require("../models/Bot");
class BattleManager {
    use(io) {
        this.io = io;
    }
    sendingPlayerInfos(roomId, socketId, battleState) {
        const room = room_controller_1.default.get({ id: roomId });
        if (!room)
            return;
        const [player, adv] = room.getPlayerAndAdv({ socketId });
        if (room && player) {
            player.init(battleState);
            if (adv instanceof Bot_1.Bot && !adv.ready && player.ready) {
                adv.generate(player);
            }
            if (room.ready() && !room.started) {
                room.started = true;
                this.io.to(room.id).emit("room-ready", room.toDTO());
                setTimeout(() => {
                    this.io.to(room.id).emit("battle-begin");
                    room.begin();
                    console.log(`battle begin in room #${room.id}`);
                }, DefaultValues_1.DefaultValues.BATTLE_BEGIN_TIMEOUT);
            }
        }
    }
    hit(roomId, socketId) {
        const room = room_controller_1.default.get({ id: roomId });
        if (!room)
            return;
        const [player, adv] = room.getPlayerAndAdv({ socketId });
        if (player && adv) {
            player.hit(adv);
            this.updateBattleState(room, player, adv);
        }
    }
    spell(roomId, socketId, ulti) {
        const room = room_controller_1.default.get({ id: roomId });
        if (!room)
            return;
        const [player, adv] = room.getPlayerAndAdv({ socketId });
        if (player && adv && player.canSpell(ulti)) {
            player.spell(adv, ulti);
            this.updateBattleState(room, player, adv);
        }
    }
    updateBattleState(room, player, adv) {
        this.io
            .to(room.id)
            .emit("update-battle-state", battle_service_1.default.generateBattleUpdatePayload(player, adv));
        if (room.finished()) {
            console.log("finished");
            const winner = room.getWinner();
            room.stop();
            if (winner) {
                console.log("winner");
                this.io
                    .to(room.id)
                    .emit("battle-finish", battle_service_1.default.generateBattleEnding(room), room.toDTO());
                room_controller_1.default.remove({ id: room.id });
            }
        }
    }
}
exports.default = new BattleManager();
