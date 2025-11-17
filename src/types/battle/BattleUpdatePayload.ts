import { SocketId } from "../Identifier";

export interface BattleUpdate {
  target: SocketId;
  update: { [key: string]: any };
}

export type BattleUpdatePayload = BattleUpdate[];
