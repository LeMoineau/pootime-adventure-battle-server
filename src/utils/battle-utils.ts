import { PlayerState } from "../types/PlayerState";
import { PlayerStats } from "../types/PlayerStats";
import { UltiDetails } from "../types/UltiDetails";

export namespace BattleUtils {
  export function calculateHitDamage(
    hitterStats: PlayerStats,
    hitterState: PlayerState,
    victimStats: PlayerStats,
    victimState: PlayerState
  ): number {
    return hitterStats.attaque / victimStats.defense;
  }

  export function calculateGainMana(
    hitterStats: PlayerStats,
    hitterState: PlayerState,
    victimStats: PlayerStats,
    victimState: PlayerState
  ): number {
    return 1 + hitterStats.recupMana;
  }

  export function calculateSpellDamage(
    ulti: UltiDetails,
    hitterStats: PlayerStats,
    hitterState: PlayerState,
    victimStats: PlayerStats,
    victimState: PlayerState
  ): number {
    return ulti.damage ? ulti.damage / victimStats.resMana : 0;
  }
}
