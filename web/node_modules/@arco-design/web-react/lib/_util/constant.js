"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickTriggerPropsFromRest = exports.newArray = exports.NOOP = void 0;
var pick_1 = __importDefault(require("./pick"));
var NOOP = function () { };
exports.NOOP = NOOP;
function newArray(length) {
    return Array.apply(null, Array(length));
}
exports.newArray = newArray;
function pickTriggerPropsFromRest(rest) {
    return (0, pick_1.default)(rest, [
        'onMouseEnter',
        'onMouseLeave',
        'onMouseMove',
        'onContextMenu',
        'onClick',
        'onFocus',
        'onBlur',
        'tabIndex',
    ]);
}
exports.pickTriggerPropsFromRest = pickTriggerPropsFromRest;
