import { Socket } from "socket.io";
import { rooms } from "../socket";
import { Room, RoomId, SocketId } from "../types/Room";

export namespace RoomUtils {
  export function ifRoomExist(roomId: RoomId, callback: (room: Room) => void) {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) {
      return;
    }
    callback(room);
  }

  export function emitToOtherPlayer(
    socket: Socket,
    room: Room,
    event: string,
    ...args: any[]
  ) {
    for (let p of room.players) {
      if (p !== socket.id) {
        socket.to(p).emit(event, args);
        return;
      }
    }
  }

  export function emitToAllPlayers(
    socket: Socket,
    room: Room,
    event: string,
    ...args: any[]
  ) {
    socket.emit(event, args);
    emitToOtherPlayer(socket, room, event, args);
  }
}
