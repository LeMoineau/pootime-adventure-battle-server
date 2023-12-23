"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleUtils = void 0;
var BattleUtils;
(function (BattleUtils) {
    function calculateHitDamage(hitterStats, hitterState, victimStats, victimState) {
        return hitterStats.attaque / victimStats.defense;
    }
    BattleUtils.calculateHitDamage = calculateHitDamage;
    function calculateGainMana(hitterStats, hitterState, victimStats, victimState) {
        return 1 + hitterStats.recupMana;
    }
    BattleUtils.calculateGainMana = calculateGainMana;
    function calculateSpellDamage(ulti, hitterStats, hitterState, victimStats, victimState) {
        return ulti.damage ? ulti.damage / victimStats.resMana : 0;
    }
    BattleUtils.calculateSpellDamage = calculateSpellDamage;
})(BattleUtils || (exports.BattleUtils = BattleUtils = {}));
