"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var IconExclamationCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconExclamationCircleFill"));
var getBackground = function (color, percent) {
    if ((0, is_1.isObject)(color)) {
        var val = Object.keys(color)
            .map(function (key) { return color[key] + " " + key; })
            .join(',');
        var sizeProps = percent ? { backgroundSize: (100 * 100) / percent + "%" } : {};
        return __assign({ backgroundImage: "linear-gradient(to right, " + val + ")" }, sizeProps);
    }
    return {
        backgroundColor: color,
    };
};
var defaultStrokeWidth = {
    small: 3,
    default: 4,
    large: 8,
};
function LineProgress(props) {
    var _a, _b;
    var 
    // textInside,
    type = props.type, prefixCls = props.prefixCls, buffer = props.buffer, percent = props.percent, color = props.color, animation = props.animation, bufferColor = props.bufferColor, formatText = props.formatText, trailColor = props.trailColor, _c = props.showText, showText = _c === void 0 ? true : _c, _d = props.size, size = _d === void 0 ? 'default' : _d, _e = props.status, status = _e === void 0 ? 'normal' : _e;
    var strokeWidth = props.strokeWidth || defaultStrokeWidth[size];
    var cls = prefixCls + "-" + type;
    var height = strokeWidth;
    var isFinish = status === 'success' || status === 'error' || percent >= 100;
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
        react_1.default.createElement("div", { className: cls + "-outer", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent, style: { height: height, backgroundColor: trailColor } },
            buffer && !isFinish && (react_1.default.createElement("div", { className: cls + "-inner-buffer", style: __assign({ width: (percent > 0 ? percent + 10 : 0) + "%" }, getBackground(bufferColor)) })),
            react_1.default.createElement("div", { className: (0, classNames_1.default)(cls + "-inner", (_a = {}, _a[cls + "-inner-animate"] = animation, _a)), style: __assign({ width: percent + "%" }, getBackground(color, percent)) })),
        showText && (react_1.default.createElement("div", { className: (0, classNames_1.default)(cls + "-text", (_b = {}, _b[cls + "-text-with-icon"] = status, _b)) }, getText()))));
}
exports.default = LineProgress;
