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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Palette = void 0;
var react_1 = __importStar(require("react"));
var ConfigProvider_1 = require("../ConfigProvider");
var useControlBlock_1 = require("./hooks/useControlBlock");
var color_1 = require("../_util/color");
var Palette = function (_a) {
    var color = _a.color, onChange = _a.onChange;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('color-picker');
    var _b = color.hsv, h = _b.h, s = _b.s, v = _b.v;
    var _c = (0, useControlBlock_1.useControlBlock)({
        value: [s, 1 - v],
        onChange: function (value) { return onChange(value[0], 1 - value[1]); },
    }), blockRef = _c.blockRef, handlerRef = _c.handlerRef, onMouseDown = _c.onMouseDown;
    var hueColor = (0, react_1.useMemo)(function () {
        var rgb = (0, color_1.hsvToRgb)(h, 1, 1);
        return "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    }, [h]);
    var renderHandler = function () {
        return (react_1.default.createElement("div", { ref: handlerRef, className: prefixCls + "-handler", style: {
                top: (1 - v) * 100 + "%",
                left: s * 100 + "%",
            } }));
    };
    return (react_1.default.createElement("div", { ref: blockRef, className: prefixCls + "-palette", style: { backgroundColor: hueColor }, onMouseDown: onMouseDown }, renderHandler()));
};
exports.Palette = Palette;
