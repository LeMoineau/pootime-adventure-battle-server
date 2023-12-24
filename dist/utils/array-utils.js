"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtils = void 0;
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
})(ArrayUtils || (exports.ArrayUtils = ArrayUtils = {}));
