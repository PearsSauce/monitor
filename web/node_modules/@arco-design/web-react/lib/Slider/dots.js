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
var is_1 = require("../_util/is");
var utils_1 = require("./utils");
var classNames_1 = __importDefault(require("../_util/classNames"));
var Dots = function (props) {
    var _a = props.data, data = _a === void 0 ? [] : _a, _b = props.valueRange, valueRange = _b === void 0 ? [] : _b, vertical = props.vertical, prefixCls = props.prefixCls, reverse = props.reverse, intervalConfigs = props.intervalConfigs;
    if (!data.length)
        return null;
    return (react_1.default.createElement("div", { className: prefixCls + "-dots" }, data.map(function (_a) {
        var _b, _c, _d;
        var key = _a.key, content = _a.content;
        var offset = (0, utils_1.formatPercent)((0, utils_1.getIntervalOffset)(+key, intervalConfigs));
        return (react_1.default.createElement("div", { className: prefixCls + "-dot-wrapper", key: key, style: __assign({}, (vertical
                ? (_b = {}, _b[reverse ? 'top' : 'bottom'] = offset, _b) : (_c = {}, _c[reverse ? 'right' : 'left'] = offset, _c))), onMouseDown: function (e) {
                e.stopPropagation();
                (0, is_1.isFunction)(props.onMouseDown) && props.onMouseDown(parseFloat(key));
            } }, (0, is_1.isObject)(content) && content.dot ? (content.dot) : (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-dot", (_d = {},
                _d[prefixCls + "-dot-active"] = (0, utils_1.valueInRange)(key, valueRange),
                _d)) }))));
    })));
};
exports.default = (0, react_1.memo)(Dots);
