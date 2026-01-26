"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = require("../models/Player");
class PlayerController {
    constructor() {
        this.players = [];
    }
    create({ socket, pooTrophees, }) {
        const alreadyExisting = this.get({ socketId: socket.id });
        if (alreadyExisting)
            return alreadyExisting;
        const player = new Player_1.Player({ socket, pooTrophees });
        this.players.push(player);
        return player;
    }
    get({ socketId }) {
        return this.players.find((p) => p.socketId === socketId);
    }
    exists({ socketId }) {
        return !!this.players.find((p) => p.socketId === socketId);
    }
    remove({ socketId }) {
        const index = this.players.findIndex((p) => p.socketId === socketId);
        if (index !== -1) {
            return this.players.splice(index, 1)[0];
        }
    }
}
exports.default = new PlayerController();
