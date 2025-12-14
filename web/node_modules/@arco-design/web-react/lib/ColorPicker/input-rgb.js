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
exports.InputRgb = void 0;
var react_1 = __importStar(require("react"));
var Input_1 = __importDefault(require("../Input"));
var InputNumber_1 = __importDefault(require("../InputNumber"));
var ConfigProvider_1 = require("../ConfigProvider");
var input_alpha_1 = require("./input-alpha");
var color_1 = require("../_util/color");
var InputRgb = function (_a) {
    var color = _a.color, alpha = _a.alpha, onHsvChange = _a.onHsvChange, onAlphaChange = _a.onAlphaChange, disabledAlpha = _a.disabledAlpha;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('color-picker');
    var onInputChange = function (_value) {
        var hsv = (0, color_1.rgbToHsv)(_value.r, _value.g, _value.b);
        onHsvChange(hsv);
    };
    var _b = color.rgb, r = _b.r, g = _b.g, b = _b.b;
    return (react_1.default.createElement(Input_1.default.Group, { className: prefixCls + "-input-group", compact: true },
        react_1.default.createElement(InputNumber_1.default, { size: "mini", min: 0, max: 255, hideControl: true, value: r, onChange: function (r) { return onInputChange({ r: r, g: g, b: b }); } }),
        react_1.default.createElement(InputNumber_1.default, { size: "mini", min: 0, max: 255, hideControl: true, value: g, onChange: function (g) { return onInputChange({ r: r, g: g, b: b }); } }),
        react_1.default.createElement(InputNumber_1.default, { size: "mini", min: 0, max: 255, hideControl: true, value: b, onChange: function (b) { return onInputChange({ r: r, g: g, b: b }); } }),
        !disabledAlpha && react_1.default.createElement(input_alpha_1.InputAlpha, { value: alpha, onChange: onAlphaChange })));
};
exports.InputRgb = InputRgb;
