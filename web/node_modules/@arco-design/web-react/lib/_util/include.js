"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// return an object with specify keys
function include(obj, keys) {
    var clone = {};
    Object.keys(obj).forEach(function (key) {
        if (keys.indexOf(key) !== -1) {
            clone[key] = obj[key];
        }
    });
    return clone;
}
exports.default = include;
