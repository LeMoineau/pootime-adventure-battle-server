import { SocketEvent } from "./types/SocketEvent";
import { Room, RoomId } from "./types/Room";
import { MathUtils } from "./utils/math-utils";
import { RoomUtils } from "./utils/room-utils";
import { PlayerStyle } from "./types/PlayerStyle";
import { PlayerStats } from "./types/PlayerStats";

export const rooms: Room[] = [];

export default function onConnection(socket: any) {
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
        };
        RoomUtils.emitToOtherPlayer(
          socket,
          room,
          SocketEvent.SEND_PLAYER_INFOS,
          style,
          stats
        );
        if (Object.keys(room.battleState).length >= 2) {
          RoomUtils.emitToAllPlayers(socket, room, SocketEvent.BATTLE_BEGIN);
        }
      });
    }
  );

  socket.on(SocketEvent.DISCONNECT, () => {
    const roomIndex = rooms.findIndex((r) => r.owner === socket.id);
    if (roomIndex !== -1) {
      console.log(`destroying room #${rooms[roomIndex].id}`);
      rooms.splice(roomIndex, 1);
    }
    console.log(`#${socket.id} disconnect`);
  });
}
