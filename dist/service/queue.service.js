"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const DefaultValues_1 = require("../config/DefaultValues");
const room_controller_1 = __importDefault(require("../controller/room.controller"));
const bot_factory_1 = __importDefault(require("../factories/bot.factory"));
class QueueService {
    constructor(io) {
        this.queue = [];
        this._io = io;
    }
    /**
     * State if the queue is currently looking for matching players
     */
    get running() {
        return !!this._intervalId;
    }
    /**
     * Start the queue matcher.
     *
     * *Method*:
     * - will look each 5 seconds
     * -
     */
    start() {
        console.log("queue matcher starting");
        this._intervalId = setInterval(() => {
            const now = new Date();
            //trier les players selon leur trophees
            const playersByTrophees = [...this._sortPlayersByTrophees()];
            //si des personnes a moins de 50 trophees -> direct match en commençant par les plus hauts trophées
            for (let i = 0; i < playersByTrophees.length - 1; i++) {
                const stronger = playersByTrophees[i];
                const weaker = playersByTrophees[i + 1];
                if (stronger.pooTrophees - weaker.pooTrophees <=
                    DefaultValues_1.DefaultValues.TROPHEE_BEST_DISTANCE) {
                    this._matchPlayersTogether(stronger, weaker);
                    i++;
                }
            }
            //pour les autres sans trophee-match: tri par durée d'attente > 4s et on match ensemble les joueurs qui attendes depuis le plus de temps
            const playersByJoiningDate = [...this._sortPlayersByJoiningDate()];
            for (let i = 0; i < playersByJoiningDate.length - 1; i += 2) {
                if (now.getTime() - playersByJoiningDate[i].joiningDate.getTime() >=
                    DefaultValues_1.DefaultValues.MAX_WAITING_TIME) {
                    const waitmore = playersByJoiningDate[i];
                    const waitless = playersByJoiningDate[i + 1];
                    this._matchPlayersTogether(waitmore, waitless);
                    i++;
                }
                else {
                    break;
                }
            }
            //si qu'un seul joueur depuis plus de 15s -> bot
            if (this.queue.length === 1) {
                const lastPlayer = this.queue[0];
                if (now.getTime() - this.queue[0].joiningDate.getTime() >=
                    DefaultValues_1.DefaultValues.CREATING_BOT_DURATION) {
                    this._matchPlayerWithABot(lastPlayer);
                }
            }
        }, DefaultValues_1.DefaultValues.QUEUE_MATCHER_INTERVAL_DURATION);
    }
    _matchPlayerWithABot(player) {
        this.remove({ socketId: player.socketId });
        const room = room_controller_1.default.create({ owner: player, ranked: true });
        const bot = bot_factory_1.default.create({ player, room });
        room.add(bot);
        this._io.to(room.id).emit("find-the-room", room.toDTO());
    }
    _sortPlayersByJoiningDate() {
        return this.queue.sort((a, b) => b.joiningDate.getTime() - a.joiningDate.getTime());
    }
    _matchPlayersTogether(p1, p2) {
        this.remove({ socketId: p1.socketId });
        this.remove({ socketId: p2.socketId });
        const room = room_controller_1.default.create({ owner: p1, ranked: true });
        room.add(p2);
        this._io.to(room.id).emit("find-the-room", room.toDTO());
    }
    _sortPlayersByTrophees() {
        return this.queue.sort((a, b) => b.pooTrophees - a.pooTrophees);
    }
    /**
     * Stop the queue matcher
     */
    stop() {
        console.log("queue matcher stopping");
        clearInterval(this._intervalId);
        this._intervalId = undefined;
    }
    /**
     * Join the queue.
     * @param player the new player to add to the queue
     * @param onRoomCreated if enough players in queue when joining, will call this callback with the created room
     */
    join(player) {
        if (!this.running)
            this.start();
        if (!this.contains({ socketId: player.socketId })) {
            player.joiningDate = new Date();
            this.queue.push(player);
            console.log(`#${player.socketId} join the queue`);
        }
    }
    /**
     * Remove a player from the queue
     * @param socketId socketId of the targeted player to remove from the queue
     * @param index index of the targeted player to remove from the queue
     * @returns the removed player if found
     */
    remove({ socketId, index, }) {
        if (socketId === undefined && index === undefined)
            return;
        const _index = index !== null && index !== void 0 ? index : this.queue.findIndex((p) => p.socketId === socketId);
        if (typeof _index === "number" && _index !== -1) {
            const res = this.queue.splice(_index, 1)[0];
            if (this.queue.length <= 0 && this.running) {
                this.stop();
            }
            return res;
        }
    }
    contains({ socketId }) {
        return !!this.queue.find((p) => p.socketId === socketId);
    }
}
exports.QueueService = QueueService;
