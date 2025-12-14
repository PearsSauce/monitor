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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var IconQuestionCircle_1 = __importDefault(require("../../icon/react-icon-cjs/IconQuestionCircle"));
var is_1 = require("../_util/is");
var utils_1 = require("./utils");
var Tooltip_1 = __importDefault(require("../Tooltip"));
var classNames_1 = __importDefault(require("../_util/classNames"));
// 标签
var FormItemLabel = function (_a) {
    var htmlFor = _a.htmlFor, showColon = _a.showColon, label = _a.label, requiredSymbol = _a.requiredSymbol, required = _a.required, rules = _a.rules, prefix = _a.prefix, tooltip = _a.tooltip;
    var isRequiredRule = (0, is_1.isArray)(rules) && rules.some(function (rule) { return rule && rule.required; });
    var symbolPosition = (0, is_1.isObject)(requiredSymbol) ? requiredSymbol.position : 'start';
    var symbolNode = (required || isRequiredRule) && !!requiredSymbol && (react_1.default.createElement("strong", { className: prefix + "-form-item-symbol" },
        react_1.default.createElement("svg", { fill: "currentColor", viewBox: "0 0 1024 1024", width: "1em", height: "1em" },
            react_1.default.createElement("path", { d: "M583.338667 17.066667c18.773333 0 34.133333 15.36 34.133333 34.133333v349.013333l313.344-101.888a34.133333 34.133333 0 0 1 43.008 22.016l42.154667 129.706667a34.133333 34.133333 0 0 1-21.845334 43.178667l-315.733333 102.4 208.896 287.744a34.133333 34.133333 0 0 1-7.509333 47.786666l-110.421334 80.213334a34.133333 34.133333 0 0 1-47.786666-7.509334L505.685333 706.218667 288.426667 1005.226667a34.133333 34.133333 0 0 1-47.786667 7.509333l-110.421333-80.213333a34.133333 34.133333 0 0 1-7.509334-47.786667l214.186667-295.253333L29.013333 489.813333a34.133333 34.133333 0 0 1-22.016-43.008l42.154667-129.877333a34.133333 34.133333 0 0 1 43.008-22.016l320.512 104.106667L412.672 51.2c0-18.773333 15.36-34.133333 34.133333-34.133333h136.533334z" }))));
    var renderTooltip = function () {
        if (!tooltip) {
            return null;
        }
        var tooltipIconClassName = prefix + "-form-item-tooltip";
        var tooltipProps = {};
        var tooltipIcon = react_1.default.createElement(IconQuestionCircle_1.default, { className: tooltipIconClassName });
        if (!(0, is_1.isObject)(tooltip) || (0, react_1.isValidElement)(tooltip)) {
            tooltipProps = {
                content: tooltip,
            };
        }
        else {
            var _a = tooltip, icon = _a.icon, rest = __rest(_a, ["icon"]);
            tooltipProps = rest;
            if (icon) {
                tooltipIcon = (0, react_1.isValidElement)(icon)
                    ? react_1.default.cloneElement(icon, {
                        className: (0, classNames_1.default)(tooltipIconClassName, icon.props.className),
                    })
                    : icon;
            }
        }
        return react_1.default.createElement(Tooltip_1.default, __assign({}, tooltipProps), tooltipIcon);
    };
    return label ? (react_1.default.createElement("label", { htmlFor: htmlFor && "" + htmlFor + utils_1.ID_SUFFIX },
        symbolPosition !== 'end' && symbolNode,
        " ",
        label,
        renderTooltip(),
        symbolPosition === 'end' && react_1.default.createElement(react_1.default.Fragment, null,
            " ",
            symbolNode),
        showColon ? (showColon === true ? ':' : showColon) : '')) : null;
};
exports.default = FormItemLabel;
