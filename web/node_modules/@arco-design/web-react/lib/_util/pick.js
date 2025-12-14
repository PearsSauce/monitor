"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickDataAttributes = void 0;
// pick item from object
function pick(obj, keys) {
    var clone = {};
    keys.forEach(function (key) {
        var k = key;
        if (key in obj) {
            clone[k] = obj[k];
        }
    });
    return clone;
}
exports.default = pick;
function pickDataAttributes(obj) {
    var clone = {};
    obj &&
        Object.keys(obj).forEach(function (key) {
            var k = String(key);
            if (k.indexOf('data-') === 0) {
                clone[k] = obj[k];
            }
            if (k.indexOf('aria-') === 0) {
                clone[k] = obj[k];
            }
        });
    return clone;
}
exports.pickDataAttributes = pickDataAttributes;
