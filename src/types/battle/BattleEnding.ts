import { SocketId } from "../Identifier";

export interface BattleRewards {
  pooCoins: number;
  stars?: number;
  pooTrophees?: number;
}

export type PlayerVictoryState = "winner" | "loser";

export interface BattleEnding {
  [socketId: SocketId]: {
    victoryState: PlayerVictoryState;
    rewards: BattleRewards;
  };
}
