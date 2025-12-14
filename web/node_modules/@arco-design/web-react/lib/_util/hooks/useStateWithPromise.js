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
function useStateWithPromise(defaultVal) {
    var _a = __read((0, react_1.useState)({
        value: defaultVal,
        resolve: function (e) {
            // eslint-disable-next-line no-unused-expressions
            e;
        },
    }), 2), state = _a[0], setState = _a[1];
    (0, react_1.useEffect)(function () {
        state.resolve(state.value);
    }, [state]);
    return [
        state.value,
        function (updater) {
            return new Promise(function (resolve) {
                setState(function (prevState) {
                    var nextVal = updater;
                    if (typeof updater === 'function') {
                        nextVal = updater(prevState.value);
                    }
                    return {
                        value: nextVal,
                        resolve: resolve,
                    };
                });
            });
        },
    ];
}
exports.default = useStateWithPromise;
