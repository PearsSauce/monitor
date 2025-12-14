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
var globalInstanceIdMap = {};
/**
 * Provide unique component name while using this hook
 * In react 18, React.useId is a better way to choose
 * Related issue: https://github.com/arco-design/arco-design/issues/958
 */
function useId(prefix) {
    var _a = __read((0, react_1.useState)(), 2), id = _a[0], setId = _a[1];
    // Update ID in next render to avoid SSR [prop dit not match] error
    (0, react_1.useEffect)(function () {
        globalInstanceIdMap[prefix] = prefix in globalInstanceIdMap ? globalInstanceIdMap[prefix] : 0;
        setId(globalInstanceIdMap[prefix]);
        globalInstanceIdMap[prefix] += 1;
    }, []);
    return typeof id === 'number' ? "" + prefix + id : undefined;
}
exports.default = useId;
