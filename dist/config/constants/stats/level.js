"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpNeededForNextLevel = void 0;
const xpNeededForNextLevel = (currentLevel) => {
    return Math.round(1.5 + currentLevel * 1.2);
};
exports.xpNeededForNextLevel = xpNeededForNextLevel;
