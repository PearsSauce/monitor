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
var react_1 = require("react");
var useForceUpdate_1 = __importDefault(require("../../_util/hooks/useForceUpdate"));
var useUpdate_1 = __importDefault(require("../../_util/hooks/useUpdate"));
function useCurrentRef(initFunc, deps) {
    var ref = (0, react_1.useRef)(null);
    var forceUpdate = (0, useForceUpdate_1.default)();
    if (!ref.current) {
        ref.current = initFunc();
    }
    (0, useUpdate_1.default)(function () {
        ref.current = initFunc();
        forceUpdate();
    }, __spreadArray([], __read(deps), false));
    return ref.current;
}
exports.default = useCurrentRef;
