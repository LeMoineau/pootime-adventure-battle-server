"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = void 0;
var MathUtils;
(function (MathUtils) {
    function generateRoomId() {
        return Math.random().toString(36).toUpperCase().substring(2, 6);
    }
    MathUtils.generateRoomId = generateRoomId;
})(MathUtils || (exports.MathUtils = MathUtils = {}));
