import { SocketEvent } from "./types/SocketEvent";
import { Room, SocketId } from "./types/Room";
import { MathUtils } from "./utils/math-utils";
import { RoomUtils } from "./utils/room-utils";
import { PlayerStyle } from "./types/PlayerStyle";
import { PlayerStats } from "./types/PlayerStats";
import { DefaultValues } from "./config/DefaultValues";
import { BattleUpdatePayload } from "./types/BattleUpdatePayload";
import { UltiDetails } from "./types/UltiDetails";
import { BattleController } from "./battle-controller";
import { Socket } from "socket.io";

export const rooms: Room[] = [];
export const queue: Socket[] = [];

export default function onConnection(socket: Socket) {
  console.log(`#${socket.id} connect`);

  socket.on(SocketEvent.CREATE_A_ROOM, () => {
    const room: Room = {
      owner: socket.id,
      id: MathUtils.generateRoomId(),
      players: [socket.id],
      battleState: {},
    };
    rooms.push(room);
    socket.data.roomId = room.id;
    socket.emit(SocketEvent.ROOM_CREATED, room);
    console.log(`#${socket.id} create the room #${room.id}`, room);
  });

  socket.on(SocketEvent.JOIN_A_ROOM, (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.owner !== socket.id) {
      room.players.push(socket.id);
      socket.data.roomId = roomId;
      socket.emit(SocketEvent.FIND_THE_ROOM, room);
      socket.to(room.owner).emit(SocketEvent.PLAYER_JOIN_YOUR_ROOM, room);
      console.log(`#${socket.id} join the room #${room.id}`, room);
    } else {
      socket.emit(SocketEvent.NOT_FIND_THE_ROOM);
    }
  });

  socket.on(
    SocketEvent.SEND_PLAYER_INFOS,
    (style: PlayerStyle, stats: PlayerStats) => {
      RoomUtils.ifRoomExist(socket.data.roomId, (room) => {
        room.battleState[socket.id] = {
          style: style,
          stats: stats,
          currentState: {
            currentPv: stats.pv,
            currentMana: 0,
          },
        };
        if (Object.keys(room.battleState).length >= 2) {
          RoomUtils.emitToAllPlayers(
            socket,
            room,
            SocketEvent.ROOM_READY,
            room
          );
          setTimeout(() => {
            RoomUtils.emitToAllPlayers(socket, room, SocketEvent.BATTLE_BEGIN);
            console.log(`battle begin in room #${room.id}`);
          }, DefaultValues.TimeoutBattleBegin);
        }
      });
    }
  );

  socket.on(SocketEvent.HIT, () => {
    RoomUtils.ifRoomExist(socket.data.roomId, (room) => {
      const advSocketId = RoomUtils.getOtherPlayer(socket.id, room);
      RoomUtils.removePvFromHitFromPlayer(socket.id, advSocketId, room);
      RoomUtils.addManaToPlayer(socket.id, advSocketId, room);
      RoomUtils.emitUpdatePvAndMana(socket, room, advSocketId, socket.id);
      BattleController.checkVictoryState(socket, room);
    });
  });

  socket.on(SocketEvent.SPELL, (ulti: UltiDetails) => {
    RoomUtils.ifRoomExist(socket.data.roomId, (room) => {
      if (ulti.mana <= RoomUtils.getPlayerState(socket.id, room).currentMana) {
        const advSocketId = RoomUtils.getOtherPlayer(socket.id, room);
        RoomUtils.removePvFromSpellFromPlayer(
          socket.id,
          advSocketId,
          ulti,
          room
        );
        RoomUtils.removeManaToPlayer(socket.id, room, ulti.mana);
        RoomUtils.emitToAllPlayers(
          socket,
          room,
          SocketEvent.UPDATE_BATTLE_STATE,
          [
            {
              target: advSocketId,
              update: {
                currentPv: RoomUtils.getPlayerState(advSocketId, room)
                  .currentPv,
              },
            },
            {
              target: socket.id,
              update: {
                currentMana: RoomUtils.getPlayerState(socket.id, room)
                  .currentMana,
              },
            },
          ] as BattleUpdatePayload
        );
        BattleController.checkVictoryState(socket, room);
      }
    });
  });

  socket.on(SocketEvent.JOIN_THE_QUEUE, () => {
    if (queue.length >= 1) {
      const adv = queue[0];
      queue.splice(0, 1);
      const room = {
        id: MathUtils.generateRoomId(),
        owner: socket.id,
        players: [socket.id, adv.id],
        battleState: {},
      };
      rooms.push(room);
      socket.data.roomId = room.id;
      adv.data.roomId = room.id;
      socket.emit(SocketEvent.FIND_THE_ROOM, room);
      adv.emit(SocketEvent.FIND_THE_ROOM, room);
    } else if (queue.findIndex((s) => socket.id === s.id) === -1) {
      queue.push(socket);
    }
  });

  socket.on(SocketEvent.DISCONNECT, () => {
    const roomIndex = rooms.findIndex((r) => r.owner === socket.id);
    if (roomIndex !== -1) {
      console.log(`destroying room #${rooms[roomIndex].id}`);
      rooms.splice(roomIndex, 1);
    }
    const queueIndex = queue.findIndex((s) => s.id === socket.id);
    if (queueIndex !== -1) {
      console.log(`removing from queue`);
      queue.splice(queueIndex, 1);
    }
    console.log(`#${socket.id} disconnect`);
  });
}
