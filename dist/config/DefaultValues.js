"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultValues = void 0;
var DefaultValues;
(function (DefaultValues) {
    DefaultValues.BATTLE_BEGIN_TIMEOUT = 3000;
    DefaultValues.QUEUE_MATCHER_INTERVAL_DURATION = 5000;
    DefaultValues.CREATING_BOT_DURATION = 2 * 1000; //at 30s
    DefaultValues.MAX_WAITING_TIME = 4 * 1000; //4s
    // distance between player trophees to be considerate fine
    DefaultValues.TROPHEE_BEST_DISTANCE = 50;
})(DefaultValues || (exports.DefaultValues = DefaultValues = {}));
