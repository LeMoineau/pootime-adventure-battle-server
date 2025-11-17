import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../config/socket-event-map";
import { RoomId } from "../Identifier";

export type BattleSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  { roomId: RoomId }
>;
