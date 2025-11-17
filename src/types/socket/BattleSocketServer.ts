import { Server } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../config/socket-event-map";

export class BattleSocketServer extends Server<
  ClientToServerEvents,
  ServerToClientEvents
> {}
