import { SocketId } from "../types/Identifier";
import { Player } from "../types/player/Player.impl";
import { BattleSocket } from "../types/socket/BattleSocket";

class PlayerController {
  players: Player[];

  constructor() {
    this.players = [];
  }

  create({ socket }: { socket: BattleSocket }): Player {
    const alreadyExisting = this.get({ socketId: socket.id });
    if (alreadyExisting) return alreadyExisting;
    const player = new Player(socket);
    this.players.push(player);
    return player;
  }

  get({ socketId }: { socketId: SocketId }): Player | undefined {
    return this.players.find((p) => p.socketId === socketId);
  }

  exists({ socketId }: { socketId: SocketId }): boolean {
    return !!this.players.find((p) => p.socketId === socketId);
  }

  remove({ socketId }: { socketId: SocketId }): Player | undefined {
    const index = this.players.findIndex((p) => p.socketId === socketId);
    if (index !== -1) {
      return this.players.splice(index, 1)[0];
    }
  }
}

export default new PlayerController();
