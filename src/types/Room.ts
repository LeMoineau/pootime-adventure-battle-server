import { PlayerStats } from "./PlayerStats";
import { PlayerStyle } from "./PlayerStyle";

export type SocketId = string;
export type RoomId = string;

export interface Room {
  id: RoomId;
  owner: SocketId;
  players: SocketId[];
  battleState: {
    [socketId: SocketId]: { style: PlayerStyle; stats: PlayerStats };
  };
}
