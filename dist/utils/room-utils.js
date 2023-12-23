"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomUtils = void 0;
const socket_1 = require("../socket");
const SocketEvent_1 = require("../types/SocketEvent");
const battle_utils_1 = require("./battle-utils");
var RoomUtils;
(function (RoomUtils) {
    function ifRoomExist(roomId, callback) {
        const room = socket_1.rooms.find((r) => r.id === roomId);
        if (!room) {
            return;
        }
        callback(room);
    }
    RoomUtils.ifRoomExist = ifRoomExist;
    function getOtherPlayer(socketId, room) {
        for (let p of room.players) {
            if (p !== socketId) {
                return p;
            }
        }
        throw new Error(`no other player in room #${room.id}`);
    }
    RoomUtils.getOtherPlayer = getOtherPlayer;
    function emitToOtherPlayer(socket, room, event, ...args) {
        socket.to(getOtherPlayer(socket.id, room)).emit(event, ...args);
    }
    RoomUtils.emitToOtherPlayer = emitToOtherPlayer;
    function emitToAllPlayers(socket, room, event, ...args) {
        socket.emit(event, ...args);
        emitToOtherPlayer(socket, room, event, ...args);
    }
    RoomUtils.emitToAllPlayers = emitToAllPlayers;
    function getPlayerStats(socketId, room) {
        return room.battleState[socketId].stats;
    }
    RoomUtils.getPlayerStats = getPlayerStats;
    function getPlayerState(socketId, room) {
        return room.battleState[socketId].currentState;
    }
    RoomUtils.getPlayerState = getPlayerState;
    function setKeyPlayerState(socketId, room, key, value) {
        room.battleState[socketId].currentState[key] = value;
    }
    RoomUtils.setKeyPlayerState = setKeyPlayerState;
    function removePvFromHitFromPlayer(hitterSocketId, victimSocketId, room) {
        const damage = battle_utils_1.BattleUtils.calculateHitDamage(RoomUtils.getPlayerStats(hitterSocketId, room), RoomUtils.getPlayerState(hitterSocketId, room), RoomUtils.getPlayerStats(victimSocketId, room), RoomUtils.getPlayerState(victimSocketId, room));
        setKeyPlayerState(victimSocketId, room, "currentPv", getPlayerState(victimSocketId, room).currentPv - damage);
    }
    RoomUtils.removePvFromHitFromPlayer = removePvFromHitFromPlayer;
    function removePvFromSpellFromPlayer(hitterSocketId, victimSocketId, ulti, room) {
        const damage = battle_utils_1.BattleUtils.calculateSpellDamage(ulti, RoomUtils.getPlayerStats(hitterSocketId, room), RoomUtils.getPlayerState(hitterSocketId, room), RoomUtils.getPlayerStats(victimSocketId, room), RoomUtils.getPlayerState(victimSocketId, room));
        setKeyPlayerState(victimSocketId, room, "currentPv", getPlayerState(victimSocketId, room).currentPv - damage);
    }
    RoomUtils.removePvFromSpellFromPlayer = removePvFromSpellFromPlayer;
    function addManaToPlayer(hitterSocketId, victimSocketId, room) {
        const gainMana = battle_utils_1.BattleUtils.calculateGainMana(RoomUtils.getPlayerStats(hitterSocketId, room), RoomUtils.getPlayerState(hitterSocketId, room), RoomUtils.getPlayerStats(victimSocketId, room), RoomUtils.getPlayerState(victimSocketId, room));
        setKeyPlayerState(hitterSocketId, room, "currentMana", (getPlayerState(hitterSocketId, room).currentMana + gainMana) %
            RoomUtils.getPlayerStats(hitterSocketId, room).mana);
    }
    RoomUtils.addManaToPlayer = addManaToPlayer;
    function removeManaToPlayer(targetSocketId, room, amount) {
        setKeyPlayerState(targetSocketId, room, "currentMana", getPlayerState(targetSocketId, room).currentMana - amount);
    }
    RoomUtils.removeManaToPlayer = removeManaToPlayer;
    function emitUpdatePvAndMana(socket, room, pvLoser, manaWinner) {
        RoomUtils.emitToAllPlayers(socket, room, SocketEvent_1.SocketEvent.UPDATE_BATTLE_STATE, [
            {
                target: pvLoser,
                update: {
                    currentPv: RoomUtils.getPlayerState(pvLoser, room).currentPv,
                },
            },
            {
                target: manaWinner,
                update: {
                    currentMana: RoomUtils.getPlayerState(manaWinner, room).currentMana,
                },
            },
        ]);
    }
    RoomUtils.emitUpdatePvAndMana = emitUpdatePvAndMana;
})(RoomUtils || (exports.RoomUtils = RoomUtils = {}));
