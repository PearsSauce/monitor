"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeValueToArray = void 0;
var is_1 = require("../_util/is");
var normalizeValueToArray = function (val) {
    var value = val;
    if (!(0, is_1.isArray)(val)) {
        value = val === null || val === undefined ? [] : [val];
    }
    return value.map(function (x) {
        if ((0, is_1.isObject)(x)) {
            return x.value;
        }
        return x;
    });
};
exports.normalizeValueToArray = normalizeValueToArray;
