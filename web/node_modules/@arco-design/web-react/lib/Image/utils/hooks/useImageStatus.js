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
function useImageStatus(defaultValue) {
    var _a = __read((0, react_1.useState)(defaultValue), 2), status = _a[0], setStatus = _a[1];
    var isBeforeLoad = status === 'beforeLoad';
    var isLoading = status === 'loading';
    var isError = status === 'error';
    var isLoaded = status === 'loaded';
    var isLazyLoad = status === 'lazyload';
    return {
        status: status,
        isBeforeLoad: isBeforeLoad,
        isLoading: isLoading,
        isError: isError,
        isLoaded: isLoaded,
        isLazyLoad: isLazyLoad,
        setStatus: setStatus,
    };
}
exports.default = useImageStatus;
