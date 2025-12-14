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
exports.StepsProgress = void 0;
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var IconExclamationCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconExclamationCircleFill"));
var StepsProgress = function (props) {
    var _a;
    var prefixCls = props.prefixCls, percent = props.percent, color = props.color, type = props.type, formatText = props.formatText, trailColor = props.trailColor, _b = props.showText, showText = _b === void 0 ? true : _b, _c = props.size, size = _c === void 0 ? 'default' : _c, _d = props.status, status = _d === void 0 ? 'normal' : _d;
    var strokeWidth = props.strokeWidth || (size === 'small' ? 8 : 4);
    var cls = prefixCls + "-" + type;
    var height = strokeWidth;
    var getText = (0, react_1.useCallback)(function () {
        if ((0, is_1.isFunction)(formatText)) {
            return formatText(percent);
        }
        switch (status) {
            case 'error':
                return (react_1.default.createElement("span", null,
                    percent,
                    "% ",
                    react_1.default.createElement(IconExclamationCircleFill_1.default, null)));
            default:
                return percent + "%";
        }
    }, [formatText, percent, status]);
    return (react_1.default.createElement("div", { className: cls + "-wrapper" },
        react_1.default.createElement("div", { className: cls + "-outer", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent, style: { height: height } }, __spreadArray([], __read(new Array(props.steps)), false).map(function (_, index) {
            var _a;
            var isActive = percent > (100 / props.steps) * index;
            return (react_1.default.createElement("div", { key: index, className: (0, classNames_1.default)(cls + "-item", (_a = {},
                    _a[cls + "-item-active"] = isActive,
                    _a)), style: {
                    backgroundColor: isActive ? color : trailColor || '',
                } }));
        })),
        showText && (react_1.default.createElement("div", { className: (0, classNames_1.default)(cls + "-text", (_a = {}, _a[cls + "-text-with-icon"] = status, _a)) }, getText()))));
};
exports.StepsProgress = StepsProgress;
exports.default = exports.StepsProgress;
