import { Socket } from "socket.io";
import { rooms } from "../socket";
import { Room, RoomId, SocketId } from "../types/Room";
import { PlayerStats } from "../types/PlayerStats";
import { PlayerState } from "../types/PlayerState";
import { SocketEvent } from "../types/SocketEvent";
import { BattleUpdatePayload } from "../types/BattleUpdatePayload";
import { BattleUtils } from "./battle-utils";
import { UltiDetails } from "../types/UltiDetails";

export namespace RoomUtils {
  export function ifRoomExist(roomId: RoomId, callback: (room: Room) => void) {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) {
      return;
    }
    callback(room);
  }

  export function getOtherPlayer(socketId: SocketId, room: Room): SocketId {
    for (let p of room.players) {
      if (p !== socketId) {
        return p;
      }
    }
    throw new Error(`no other player in room #${room.id}`);
  }

  export function emitToOtherPlayer(
    socket: Socket,
    room: Room,
    event: string,
    ...args: any[]
  ) {
    socket.to(getOtherPlayer(socket.id, room)).emit(event, ...args);
  }

  export function emitToAllPlayers(
    socket: Socket,
    room: Room,
    event: string,
    ...args: any[]
  ) {
    socket.emit(event, ...args);
    emitToOtherPlayer(socket, room, event, ...args);
  }

  export function getPlayerStats(socketId: SocketId, room: Room): PlayerStats {
    return room.battleState[socketId].stats;
  }

  export function getPlayerState(socketId: SocketId, room: Room): PlayerState {
    return room.battleState[socketId].currentState;
  }

  export function setKeyPlayerState(
    socketId: SocketId,
    room: Room,
    key: string,
    value: any
  ) {
    room.battleState[socketId].currentState[key] = value;
  }

  export function removePvFromHitFromPlayer(
    hitterSocketId: SocketId,
    victimSocketId: SocketId,
    room: Room
  ) {
    const damage = BattleUtils.calculateHitDamage(
      RoomUtils.getPlayerStats(hitterSocketId, room),
      RoomUtils.getPlayerState(hitterSocketId, room),
      RoomUtils.getPlayerStats(victimSocketId, room),
      RoomUtils.getPlayerState(victimSocketId, room)
    );
    setKeyPlayerState(
      victimSocketId,
      room,
      "currentPv",
      getPlayerState(victimSocketId, room).currentPv - damage
    );
  }

  export function removePvFromSpellFromPlayer(
    hitterSocketId: SocketId,
    victimSocketId: SocketId,
    ulti: UltiDetails,
    room: Room
  ) {
    const damage = BattleUtils.calculateSpellDamage(
      ulti,
      RoomUtils.getPlayerStats(hitterSocketId, room),
      RoomUtils.getPlayerState(hitterSocketId, room),
      RoomUtils.getPlayerStats(victimSocketId, room),
      RoomUtils.getPlayerState(victimSocketId, room)
    );
    setKeyPlayerState(
      victimSocketId,
      room,
      "currentPv",
      getPlayerState(victimSocketId, room).currentPv - damage
    );
  }

  export function addManaToPlayer(
    hitterSocketId: SocketId,
    victimSocketId: SocketId,
    room: Room
  ) {
    const gainMana = BattleUtils.calculateGainMana(
      RoomUtils.getPlayerStats(hitterSocketId, room),
      RoomUtils.getPlayerState(hitterSocketId, room),
      RoomUtils.getPlayerStats(victimSocketId, room),
      RoomUtils.getPlayerState(victimSocketId, room)
    );
    const newValueMana =
      getPlayerState(hitterSocketId, room).currentMana + gainMana;
    setKeyPlayerState(
      hitterSocketId,
      room,
      "currentMana",
      newValueMana >= RoomUtils.getPlayerStats(hitterSocketId, room).mana
        ? RoomUtils.getPlayerStats(hitterSocketId, room).mana
        : newValueMana
    );
  }

  export function removeManaToPlayer(
    targetSocketId: SocketId,
    room: Room,
    amount: number
  ) {
    setKeyPlayerState(
      targetSocketId,
      room,
      "currentMana",
      getPlayerState(targetSocketId, room).currentMana - amount
    );
  }

  export function emitUpdatePvAndMana(
    socket: Socket,
    room: Room,
    pvLoser: SocketId,
    manaWinner: SocketId
  ) {
    RoomUtils.emitToAllPlayers(socket, room, SocketEvent.UPDATE_BATTLE_STATE, [
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
    ] as BattleUpdatePayload);
  }
}
