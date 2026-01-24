"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtils = void 0;
const math_utils_1 = require("./math-utils");
var ArrayUtils;
(function (ArrayUtils) {
    function includesAll(arrSrc, arrTarget) {
        for (let t of arrSrc) {
            if (!arrTarget.includes(t)) {
                return false;
            }
        }
        return true;
    }
    ArrayUtils.includesAll = includesAll;
    function getRandomItem(arr) {
        const index = math_utils_1.MathUtils.getRandomInt(arr.length);
        return arr[index];
    }
    ArrayUtils.getRandomItem = getRandomItem;
    function shuffle(arr) {
        let array = [...arr];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    ArrayUtils.shuffle = shuffle;
})(ArrayUtils || (exports.ArrayUtils = ArrayUtils = {}));
