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
exports.ControlBar = void 0;
var react_1 = __importStar(require("react"));
var ConfigProvider_1 = require("../ConfigProvider");
var useControlBlock_1 = require("./hooks/useControlBlock");
var classNames_1 = __importDefault(require("../_util/classNames"));
var ControlBar = function (_a) {
    var className = _a.className, style = _a.style, _b = _a.multiple, multiple = _b === void 0 ? false : _b, value = _a.value, onActive = _a.onActive, onAdd = _a.onAdd, onChange = _a.onChange, renderHandlerStyle = _a.renderHandlerStyle, renderHandlerCenterStyle = _a.renderHandlerCenterStyle;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('color-picker');
    var _c = (0, useControlBlock_1.useControlBlock)({
        multiple: multiple,
        value: multiple
            ? value.map(function (item) { return ({
                value: [item.value / 100, 0],
                key: item.key,
            }); })
            : [value, 0],
        onChange: function (pos) { return onChange(pos[0]); },
        onAdd: function (pos) { return onAdd(pos[0]); },
        onActive: onActive,
    }), blockRef = _c.blockRef, handlerRef = _c.handlerRef, onMouseDown = _c.onMouseDown;
    var renderHandler = function () {
        var render = function (x, key, index) {
            return (react_1.default.createElement("div", { key: key, ref: handlerRef, className: prefixCls + "-handler", style: __assign({ left: x * 100 + "%" }, renderHandlerStyle === null || renderHandlerStyle === void 0 ? void 0 : renderHandlerStyle(key, index)), "data-key": key },
                react_1.default.createElement("div", { className: prefixCls + "-handler-center", style: renderHandlerCenterStyle === null || renderHandlerCenterStyle === void 0 ? void 0 : renderHandlerCenterStyle(key, index), "data-key": key })));
        };
        return multiple
            ? value.map(function (item, index) {
                return render(item.value, item.key, index);
            })
            : render(value);
    };
    return (react_1.default.createElement("div", { ref: blockRef, style: style, className: (0, classNames_1.default)(prefixCls + "-control-bar", className), onMouseDown: onMouseDown }, renderHandler()));
};
exports.ControlBar = ControlBar;
