"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor({ socket, pooTrophees = 0, joiningDate, }) {
        this.socket = socket;
        this.createdAt = new Date();
        this.pooTrophees = pooTrophees;
        this.joiningDate = joiningDate;
    }
    get socketId() {
        return this.socket.id;
    }
    /**
     * Return true if the player has defined its battle state
     */
    get ready() {
        return !!this.battleState;
    }
    get died() {
        console.log("died?", this.battleState, this.battleState && this.battleState.currentState.currentPv <= 0);
        return this.battleState && this.battleState.currentState.currentPv <= 0;
    }
    get level() {
        var _a;
        return (_a = this.battleState) === null || _a === void 0 ? void 0 : _a.stats.level;
    }
    join(roomId) {
        if (this.socket) {
            this.socket.join(roomId);
            this.socket.data.roomId = roomId;
        }
    }
    init(battleState) {
        this.battleState = battleState;
    }
    losePv(pvLost) {
        if (!this.battleState)
            return;
        this.battleState.currentState.currentPv -= pvLost;
    }
    receiveAttaque(attaque) {
        if (!this.battleState)
            return;
        const defense = this.battleState.stats.defense;
        this.battleState.currentState.currentPv -=
            attaque / (defense === 0 ? 1 : defense);
    }
    receiveSpell(spell) {
        if (!this.battleState)
            return;
        if (spell.rage) {
            this.rage = spell.rage;
        }
        if (spell.damage) {
            const resMana = this.battleState.stats.resMana;
            this.battleState.currentState.currentPv -=
                spell.damage / (resMana === 0 ? 1 : resMana);
        }
    }
    gainMana(manaGained) {
        if (!this.battleState)
            return;
        this.battleState.currentState.currentMana += manaGained;
        if (this.battleState.currentState.currentMana > this.battleState.stats.mana) {
            this.battleState.currentState.currentMana = this.battleState.stats.mana;
        }
    }
    loseMana(manaLose) {
        if (!this.battleState)
            return;
        this.battleState.currentState.currentMana -= manaLose;
        if (this.battleState.currentState.currentMana <= 0) {
            this.battleState.currentState.currentMana = 0;
        }
    }
    canSpell(ulti) {
        if (!this.battleState)
            return false;
        return this.battleState.currentState.currentMana >= ulti.mana;
    }
    hit(adv) {
        if (!this.battleState)
            return;
        let multiplier = 1;
        if (this.rage && this.rage > 0) {
            multiplier += 1;
            this.rage -= 1;
            if (this.rage <= 0)
                this.rage = undefined;
        }
        adv.receiveAttaque(this.battleState.stats.attaque * multiplier);
        this.gainMana(this.battleState.stats.recupMana);
    }
    spell(adv, ulti) {
        adv.receiveSpell(ulti);
        this.loseMana(ulti.mana);
    }
}
exports.Player = Player;
