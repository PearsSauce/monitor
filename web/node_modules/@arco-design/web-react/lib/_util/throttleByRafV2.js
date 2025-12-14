"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var raf_1 = require("./raf");
function default_1(cb) {
    var timer = null;
    var throttle = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!timer) {
            cb.apply(void 0, __spreadArray([], __read(args), false));
            timer = (0, raf_1.raf)(function () { });
        }
        timer && (0, raf_1.caf)(timer);
        timer = (0, raf_1.raf)(function () {
            cb.apply(void 0, __spreadArray([], __read(args), false));
            timer = null;
        });
    };
    throttle.cancel = function () {
        (0, raf_1.caf)(timer);
        timer = null;
    };
    return throttle;
}
exports.default = default_1;
