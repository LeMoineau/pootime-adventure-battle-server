import { SocketId } from "./Room";

export interface BattleRewards {
  stars: number;
  pooCoins: number;
}

export type PlayerVictoryState = "winner" | "loser";

export interface BattleEnding {
  [socketId: SocketId]: {
    victoryState: PlayerVictoryState;
    rewards: BattleRewards;
  };
}
