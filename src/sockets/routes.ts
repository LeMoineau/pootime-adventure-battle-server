import { BattleSocketServer } from "../types/socket/BattleSocketServer";
import routeBattle from "./battle.routes";
import routeRoom from "./room.routes";

export default function routeSockets(io: BattleSocketServer) {
  io.on("connection", (socket) => {
    console.log(`#${socket.id} connect`);
    routeBattle(socket);
    routeRoom(socket);
  });
}
