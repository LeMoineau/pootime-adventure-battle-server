import roomManager from "../manager/room.manager";
import { BattleSocket } from "../types/socket/BattleSocket";

export default function routeRoom(socket: BattleSocket) {
  socket.on("create-a-room", () => {
    roomManager.createARoom(socket);
  });

  socket.on("join-a-room", (roomId) => {
    roomManager.joinARoom(socket, roomId);
  });

  socket.on("join-the-queue", (pooTrophees) => {
    roomManager.joinTheQueue(socket, pooTrophees);
  });

  socket.on("disconnect", () => {
    roomManager.leave(socket);
  });
}
