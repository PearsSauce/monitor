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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var is_1 = require("./is");
var warning_1 = __importDefault(require("./warning"));
function default_1() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var length = args.length;
    var classNames = [];
    var _loop_1 = function (i) {
        var v = args[i];
        if (!v) {
            return "continue";
        }
        if ((0, is_1.isString)(v)) {
            classNames.push(v);
        }
        else if ((0, is_1.isArray)(v)) {
            classNames = classNames.concat(v);
        }
        else if ((0, is_1.isObject)(v)) {
            Object.keys(v).forEach(function (k) {
                if (v[k]) {
                    classNames.push(k);
                }
            });
        }
        else {
            (0, warning_1.default)(true, 'arguments must be one of string/array/object.');
        }
    };
    for (var i = 0; i < length; i++) {
        _loop_1(i);
    }
    return __spreadArray([], __read(new Set(classNames)), false).join(' ');
}
exports.default = default_1;
