"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.useResponsiveState = void 0;
var react_1 = require("react");
var responsiveObserve_1 = __importStar(require("../../_util/responsiveObserve"));
var is_1 = require("../../_util/is");
function isResponsiveValue(val) {
    return (0, is_1.isObject)(val);
}
var useResponsiveState = function (val, defaultValue, fallbackToXs) {
    if (fallbackToXs === void 0) { fallbackToXs = false; }
    var token = (0, react_1.useRef)();
    var _a = __read((0, react_1.useState)({
        xs: true,
        sm: true,
        md: true,
        lg: true,
        xl: true,
        xxl: true,
        xxxl: true,
    }), 2), screens = _a[0], setScreens = _a[1];
    (0, react_1.useEffect)(function () {
        token.current = responsiveObserve_1.default.subscribe(function (screens) {
            if (isResponsiveValue(val)) {
                setScreens(screens);
            }
        });
        return function () {
            responsiveObserve_1.default.unsubscribe(token.current);
        };
    }, []);
    var result = (0, react_1.useMemo)(function () {
        var res = defaultValue;
        if (isResponsiveValue(val)) {
            for (var i = 0; i < responsiveObserve_1.responsiveArray.length; i++) {
                var breakpoint = responsiveObserve_1.responsiveArray[i];
                if ((screens[breakpoint] || (breakpoint === 'xs' && fallbackToXs)) &&
                    val[breakpoint] !== undefined) {
                    res = val[breakpoint];
                    break;
                }
            }
        }
        else {
            res = val;
        }
        return res;
    }, [screens, val, defaultValue, fallbackToXs]);
    return result;
};
exports.useResponsiveState = useResponsiveState;
