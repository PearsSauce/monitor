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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var usePrevious_1 = __importDefault(require("../_util/hooks/usePrevious"));
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
function Count(_a) {
    var _b;
    var prefixCls = _a.prefixCls, maxCount = _a.maxCount, count = _a.count, className = _a.className, style = _a.style;
    var _c = __read((0, react_1.useState)(false), 2), isEntered = _c[0], setIsEntered = _c[1];
    var oldCount = (0, usePrevious_1.default)(count);
    var isChanged = count !== oldCount;
    return (react_1.default.createElement(CSSTransition_1.default, { classNames: "badge-zoom", in: count > 0, timeout: 300, appear: true, mountOnEnter: true, unmountOnExit: true, onEntered: function () {
            setIsEntered(true);
        } },
        react_1.default.createElement("span", { className: className, style: style },
            react_1.default.createElement("span", { key: count, className: (0, classNames_1.default)((_b = {}, _b[prefixCls + "-number-text"] = isEntered && isChanged, _b)) }, maxCount && count > maxCount ? maxCount + "+" : count))));
}
exports.default = Count;
