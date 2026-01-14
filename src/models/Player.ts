import battleService from "../service/battle.service";
import { BattleState } from "../types/battle/BattleState";
import { RoomId } from "../types/Identifier";
import { BattleSocket } from "../types/socket/BattleSocket";
import { UltiDetails } from "../types/player/UltiDetails";

export class Player {
  socket?: BattleSocket;
  battleState?: BattleState;
  createdAt: Date;
  pooTrophees: number;
  joiningDate?: Date;
  rage?: number;

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
    console.log(
      "died?",
      this.battleState,
      this.battleState && this.battleState.currentState.currentPv <= 0
    );
    return this.battleState && this.battleState.currentState.currentPv <= 0;
  }

  get level(): number | undefined {
    return this.battleState?.stats.level;
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

  losePv(pvLost: number) {
    if (!this.battleState) return;
    this.battleState.currentState.currentPv -= pvLost;
  }

  receiveAttaque(attaque: number) {
    if (!this.battleState) return;
    const defense = this.battleState.stats.defense;
    this.battleState.currentState.currentPv -=
      attaque / (defense === 0 ? 1 : defense);
  }

  receiveSpell(spell: UltiDetails) {
    if (!this.battleState) return;
    if (spell.rage) {
      this.rage = spell.rage;
    }
    if (spell.damage) {
      const resMana = this.battleState.stats.resMana;
      this.battleState.currentState.currentPv -=
        spell.damage / (resMana === 0 ? 1 : resMana);
    }
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

  hit(adv: Player) {
    if (!this.battleState) return;
    let multiplier = 1;
    if (this.rage && this.rage > 0) {
      multiplier += 1;
      this.rage -= 1;
      if (this.rage <= 0) this.rage = undefined;
    }
    adv.receiveAttaque(this.battleState.stats.attaque * multiplier);
    this.gainMana(this.battleState.stats.recupMana);
  }

  spell(adv: Player, ulti: UltiDetails) {
    adv.receiveSpell(ulti);
    this.loseMana(ulti.mana);
  }
}
