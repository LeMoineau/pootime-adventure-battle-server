"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const Bot_1 = require("./Bot");
class Room {
    constructor({ id, owner, ranked = false, }) {
        this.id = id;
        this.owner = owner;
        this.players = [];
        this.ranked = ranked;
        this.add(owner);
    }
    get ownerId() {
        return this.owner.socketId;
    }
    get playerIds() {
        return this.players.map((p) => p.socketId);
    }
    get playerBattleStates() {
        return Object.keys(this.battleStateByPlayerId);
    }
    get battleStateByPlayerId() {
        let res = {};
        for (let p of this.players) {
            if (p.battleState)
                res[p.socketId] = p.battleState;
        }
        return res;
    }
    add(player) {
        if (!this.contains({ socketId: player.socketId })) {
            this.players.push(player);
            player.join(this.id);
        }
    }
    get({ socketId }) {
        return this.players.find((p) => p.socketId === socketId);
    }
    contains({ socketId }) {
        return !!this.get({ socketId });
    }
    /**
     * Get the adv of targeted socket player
     * @param socketId current player
     * @returns adv socket or undefined if current player is alone
     */
    getAdvOf({ socketId }) {
        return this.players.find((p) => p.socketId !== socketId);
    }
    /**
     * Get the current player and its adv
     * @param socketId the current player socket id
     * @returns [current player, adv] where both can be undefined if not found
     */
    getPlayerAndAdv({ socketId, }) {
        return [this.get({ socketId }), this.getAdvOf({ socketId })];
    }
    getWinner() {
        return this.finished()
            ? this.players.find((p) => p.battleState && p.battleState.currentState.currentPv > 0)
            : undefined;
    }
    ready() {
        return this.players.every((p) => p.ready);
    }
    /**
     * alert that the battle begin to trigger bot if exists
     */
    begin() {
        for (let p of this.players) {
            if (p instanceof Bot_1.Bot)
                p.start();
        }
    }
    /**
     * altert that the battle is finished to trigger bot if exists
     */
    stop() {
        for (let p of this.players) {
            if (p instanceof Bot_1.Bot)
                p.stop();
        }
    }
    finished() {
        return !!this.players.find((p) => p.died);
    }
    toDTO() {
        return {
            id: this.id,
            owner: this.ownerId,
            players: this.playerIds,
            battleState: this.battleStateByPlayerId,
            battleFinish: this.finished(),
        };
    }
}
exports.Room = Room;
