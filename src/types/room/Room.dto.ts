import { RoomId, SocketId } from "../Identifier";
import { PlayerState } from "../player/PlayerState";
import { PlayerStats } from "../player/PlayerStats";
import { PlayerStyle } from "../player/PlayerStyle";

export interface RoomDTO {
  id: RoomId;
  owner: SocketId;
  players: SocketId[];
  battleState: {
    [socketId: SocketId]: {
      style: PlayerStyle;
      stats: PlayerStats;
      currentState: PlayerState;
    };
  };
  battleFinish?: boolean;
}
