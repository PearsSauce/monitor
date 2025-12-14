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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var is_1 = require("../_util/is");
var IconCheck_1 = __importDefault(require("../../icon/react-icon-cjs/IconCheck"));
var IconExclamation_1 = __importDefault(require("../../icon/react-icon-cjs/IconExclamation"));
var Tooltip_1 = __importDefault(require("../Tooltip"));
var useId_1 = __importDefault(require("../_util/hooks/useId"));
var defaultStrokeWidth = {
    mini: 4,
    small: 3,
    default: 4,
    large: 4,
};
var defaultWidth = {
    mini: 16,
    small: 48,
    default: 64,
    large: 80,
};
var CircleProgress = function (props) {
    var size = props.size, _a = props.percent, percent = _a === void 0 ? 0 : _a, prefixCls = props.prefixCls, showText = props.showText, status = props.status, formatText = props.formatText;
    var isLinearGradient = (0, is_1.isObject)(props.color);
    var width = props.width || defaultWidth[size];
    var strokeWidth = props.strokeWidth || (size === 'mini' ? width / 2 : defaultStrokeWidth[size]);
    var radius = (width - strokeWidth) / 2;
    var perimeter = Math.PI * 2 * radius;
    var center = width / 2;
    var cls = prefixCls + "-circle";
    var svgCls = cls + "-svg";
    var getText = (0, react_1.useCallback)(function (status) {
        if ((0, is_1.isFunction)(formatText)) {
            return formatText(percent);
        }
        switch (status) {
            case 'success':
                return react_1.default.createElement(IconCheck_1.default, null);
            case 'error':
                return react_1.default.createElement(IconExclamation_1.default, null);
            default:
                return percent + "%";
        }
    }, [formatText, percent]);
    var linearGradientId = (0, useId_1.default)(prefixCls + "-linear-gradient-");
    var color = isLinearGradient ? "url(#" + linearGradientId + ")" : props.color;
    var dom = (react_1.default.createElement("div", { className: cls + "-wrapper", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent, style: { width: width, height: width } },
        react_1.default.createElement("svg", { viewBox: "0 0 " + width + " " + width, className: "" + svgCls },
            isLinearGradient && (react_1.default.createElement("defs", null,
                react_1.default.createElement("linearGradient", { id: linearGradientId, x1: "0", y1: "1", x2: "0", y2: "0" }, Object.keys(props.color)
                    .sort()
                    .map(function (key) {
                    return react_1.default.createElement("stop", { offset: key, key: key, stopColor: props.color[key] });
                })))),
            react_1.default.createElement("circle", { className: cls + "-mask", fill: "none", cx: center, cy: center, r: radius, strokeWidth: props.pathStrokeWidth || (size === 'mini' ? strokeWidth : Math.max(2, strokeWidth - 2)), style: {
                    stroke: props.pathStrokeColor,
                } }),
            react_1.default.createElement("circle", { className: cls + "-path", fill: "none", cx: center, cy: center, r: radius, strokeWidth: strokeWidth, style: {
                    stroke: color,
                    strokeDasharray: perimeter,
                    strokeDashoffset: (percent > 100 ? 100 : 1 - percent / 100) * perimeter,
                } })),
        showText && size !== 'mini' && react_1.default.createElement("div", { className: cls + "-text" }, getText(status))));
    // type === line 时候，返回的是一个圆环
    if (size === 'mini' && status === 'success' && props.type === 'circle') {
        dom = (react_1.default.createElement("div", { className: cls + "-wrapper", style: { width: width, height: width } },
            react_1.default.createElement(IconCheck_1.default, { style: { fontSize: width - 2, color: color } })));
    }
    return size === 'mini' && showText ? (react_1.default.createElement(Tooltip_1.default, { content: react_1.default.createElement("div", { className: cls + "-text" }, getText('normal')) }, dom)) : (dom);
};
exports.default = CircleProgress;
