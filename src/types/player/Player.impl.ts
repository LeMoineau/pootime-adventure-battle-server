import battleService from "../../service/battle.service";
import { BattleState } from "../battle/BattleState";
import { RoomId } from "../Identifier";
import { BattleSocket } from "../socket/BattleSocket";
import { UltiDetails } from "./UltiDetails";

export class Player {
  socket?: BattleSocket;
  battleState?: BattleState;
  createdAt: Date;
  pooTrophees: number;
  joiningDate?: Date;

  constructor({
    socket,
    pooTrophees = 0,
    joiningDate,
  }: {
    socket?: BattleSocket;
    pooTrophees?: number;
    joiningDate?: Date;
  }) {
    this.socket = socket;
    this.createdAt = new Date();
    this.pooTrophees = pooTrophees;
    this.joiningDate = joiningDate;
  }

  get socketId() {
    return this.socket!.id;
  }

  /**
   * Return true if the player has defined its battle state
   */
  get ready() {
    return !!this.battleState;
  }

  get died() {
    return this.battleState && this.battleState.currentState.currentPv <= 0;
  }

  join(roomId: RoomId) {
    if (this.socket) {
      this.socket.join(roomId);
      this.socket.data.roomId = roomId;
    }
  }

  init(battleState: BattleState) {
    this.battleState = battleState;
  }

  hit(adv: Player) {
    if (!this.battleState) return;
    const damage = battleService.calculateDamage(this, adv);
    adv.losePv(damage);
    this.gainMana(this.battleState.stats.recupMana);
  }

  losePv(pvLost: number) {
    if (!this.battleState) return;
    this.battleState.currentState.currentPv -= pvLost;
  }

  gainMana(manaGained: number) {
    if (!this.battleState) return;
    this.battleState.currentState.currentMana += manaGained;
    if (
      this.battleState.currentState.currentMana > this.battleState.stats.mana
    ) {
      this.battleState.currentState.currentMana = this.battleState.stats.mana;
    }
  }

  loseMana(manaLose: number) {
    if (!this.battleState) return;
    this.battleState.currentState.currentMana -= manaLose;
    if (this.battleState.currentState.currentMana <= 0) {
      this.battleState.currentState.currentMana = 0;
    }
  }

  canSpell(ulti: UltiDetails): boolean {
    if (!this.battleState) return false;
    return this.battleState.currentState.currentMana >= ulti.mana;
  }

  spell(adv: Player, ulti: UltiDetails) {
    if (!this.battleState) return;
    const damage = battleService.calculateSpellDamage(this, adv, ulti);
    adv.losePv(damage);
    this.loseMana(ulti.mana);
  }
}
