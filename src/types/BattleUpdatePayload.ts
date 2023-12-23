import { SocketId } from "./Room";

export interface BattleUpdate {
  target: SocketId;
  update: { [key: string]: any };
}

export type BattleUpdatePayload = BattleUpdate[];
