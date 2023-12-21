import { Server } from "socket.io";
import { SocketEvent } from "./types/SocketEvent";
import { Room } from "./types/Room";
import { MathUtils } from "./utils/math-utils";
import cors from "cors";
import { httpServer } from ".";

const rooms: Room[] = [];

export default function onConnection(socket: any) {
  console.log(`#${socket.id} connect`);

  socket.on(SocketEvent.CREATE_A_ROOM, () => {
    const room: Room = {
      owner: socket.id,
      id: MathUtils.generateRoomId(),
      players: [socket.id],
    };
    rooms.push(room);
    socket.emit(SocketEvent.ROOM_CREATED, room);
    console.log(`#${socket.id} create the room #${room.id}`, room);
  });

  socket.on(SocketEvent.JOIN_A_ROOM, (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.owner !== socket.id) {
      room.players.push(socket.id);
      socket.emit(SocketEvent.FIND_THE_ROOM, room);
      socket.to(room.owner).emit(SocketEvent.PLAYER_JOIN_YOUR_ROOM, room);
      console.log(`#${socket.id} join the room #${room.id}`, room);
    } else {
      socket.emit(SocketEvent.NOT_FIND_THE_ROOM);
    }
  });

  socket.on(SocketEvent.DISCONNECT, () => {
    const roomIndex = rooms.findIndex((r) => r.owner === socket.id);
    if (roomIndex !== -1) {
      console.log(`destroying room #${rooms[roomIndex].id}`);
      rooms.splice(roomIndex, 1);
    }
    console.log(`#${socket.id} disconnect`);
  });
}
