import { PlayerState } from "../player/PlayerState";
import { PlayerStats } from "../player/PlayerStats";
import { PlayerStyle } from "../player/PlayerStyle";

export type BattleState = {
  style: PlayerStyle;
  stats: PlayerStats;
  currentState: PlayerState;
};
