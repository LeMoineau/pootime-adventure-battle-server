import { BattleEnding } from "../types/battle/BattleEnding";
import { BattleUpdatePayload } from "../types/battle/BattleUpdatePayload";
import { RoomDTO } from "../types/room/Room.dto";
import { RoomId } from "../types/Identifier";
import { PlayerStats } from "../types/player/PlayerStats";
import { PlayerStyle } from "../types/player/PlayerStyle";
import { UltiDetails } from "../types/player/UltiDetails";

// export const SocketEvent = {
//   CONNECTION: "connection",
//   DISCONNECT: "disconnect",
// };

export interface ClientToServerEvents {
  "create-a-room": () => void;
  "join-a-room": (id: RoomId) => void;
  "join-the-queue": () => void;
  "send-player-infos": (style: PlayerStyle, stats: PlayerStats) => void;
  hit: () => void;
  spell: (ulti: UltiDetails) => void;
}

export interface ServerToClientEvents {
  "room-created": (r: RoomDTO) => void;
  "find-the-room": (r: RoomDTO) => void;
  "not-find-the-room": () => void;
  "player-join-your-room": (r: RoomDTO) => void;
  "room-ready": (r: RoomDTO) => void;
  "battle-begin": () => void;
  "update-battle-state": (update: BattleUpdatePayload) => void;
  "battle-finish": (ending: BattleEnding, room: RoomDTO) => void;
}
