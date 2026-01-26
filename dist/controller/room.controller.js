"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Room_1 = require("../models/Room");
const math_utils_1 = require("../utils/math-utils");
const player_controller_1 = __importDefault(require("./player.controller"));
class RoomController {
    constructor() {
        this.rooms = [];
    }
    /**
     * create a new room, save it in all rooms then return it
     * @param owner owner socket id
     * @returns created room
     */
    create({ owner, ranked }) {
        const alreadyExistingRoom = this.get({ ownerId: owner.socketId });
        if (alreadyExistingRoom)
            return alreadyExistingRoom;
        const room = new Room_1.Room({
            id: math_utils_1.MathUtils.generateRoomId(),
            owner,
            ranked,
        });
        this.rooms.push(room);
        return room;
    }
    /**
     * Get a specific room
     * @param id targeted room id
     * @returns the found room or undefined
     */
    get({ id, ownerId }) {
        return id !== undefined || ownerId != undefined
            ? this.rooms.find((r) => (id ? r.id === id : r.ownerId === ownerId))
            : undefined;
    }
    exists({ id, ownerId }) {
        return !!this.get({ id, ownerId });
    }
    /**
     * Destroy a room and return it
     * @param id targeted room id
     * @param ownerId ownerId of the targeted room id
     * @returns the removed room if found, else undefined
     */
    remove({ id, ownerId, playerId, }) {
        if (id === undefined && ownerId === undefined && playerId === undefined) {
            return;
        }
        const index = this.rooms.findIndex((r) => {
            if (id)
                return r.id === id;
            if (ownerId)
                return r.ownerId === ownerId;
            if (playerId)
                return r.contains({ socketId: playerId });
        });
        if (index !== -1) {
            for (let p of this.rooms[index].players) {
                player_controller_1.default.remove({ socketId: p.socketId });
            }
            console.log(`room #${this.rooms[index].id} destroyed`);
            return this.rooms.splice(index, 1)[0];
        }
    }
}
exports.default = new RoomController();
