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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function useStateCallback(initialState) {
    var _a = __read((0, react_1.useState)(initialState), 2), state = _a[0], _setState = _a[1];
    var callbackRef = (0, react_1.useRef)();
    var setState = (0, react_1.useCallback)(function (setStateAction, callback) {
        callbackRef.current = callback;
        _setState(setStateAction);
    }, []);
    (0, react_1.useEffect)(function () {
        callbackRef.current && callbackRef.current(state);
    }, [state]);
    return [state, setState];
}
exports.default = useStateCallback;
