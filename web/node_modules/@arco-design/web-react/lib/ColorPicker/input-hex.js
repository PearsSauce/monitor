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
exports.InputHex = void 0;
var react_1 = __importStar(require("react"));
var Input_1 = __importDefault(require("../Input"));
var input_alpha_1 = require("./input-alpha");
var color_1 = require("../_util/color");
var ConfigProvider_1 = require("../ConfigProvider");
var InputHex = function (_a) {
    var color = _a.color, alpha = _a.alpha, onHsvChange = _a.onHsvChange, onAlphaChange = _a.onAlphaChange, disabledAlpha = _a.disabledAlpha;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('color-picker');
    var _b = __read((0, react_1.useState)(color.hex), 2), hex = _b[0], setHex = _b[1];
    (0, react_1.useEffect)(function () {
        if (color.hex !== hex) {
            setHex(color.hex);
        }
    }, [color]);
    var onInputChange = function (value) {
        var _a, _b;
        var matchValue = (_b = (_a = value.match(/[a-fA-F0-9]*/g)) === null || _a === void 0 ? void 0 : _a.join('')) !== null && _b !== void 0 ? _b : '';
        if (matchValue !== hex) {
            setHex(matchValue.toUpperCase());
        }
    };
    var onBlur = function () {
        var _rgb = (0, color_1.hexToRgb)(hex) || {
            r: 255,
            g: 0,
            b: 0,
        };
        var _hsv = (0, color_1.rgbToHsv)(_rgb.r, _rgb.g, _rgb.b);
        onHsvChange(_hsv);
    };
    var onPaste = function (ev) {
        var text = ev.clipboardData.getData('Text');
        if (text.startsWith('#')) {
            text = text.slice(1);
        }
        onInputChange(text);
        ev.preventDefault();
    };
    return (react_1.default.createElement(Input_1.default.Group, { className: prefixCls + "-input-group", compact: true },
        react_1.default.createElement(Input_1.default, { className: prefixCls + "-input-hex", prefix: "#", size: "mini", maxLength: 6, value: hex, onChange: onInputChange, onBlur: onBlur, onPressEnter: onBlur, onPaste: onPaste }),
        !disabledAlpha && react_1.default.createElement(input_alpha_1.InputAlpha, { value: alpha, onChange: onAlphaChange })));
};
exports.InputHex = InputHex;
