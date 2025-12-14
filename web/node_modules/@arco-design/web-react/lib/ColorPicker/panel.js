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
exports.Panel = void 0;
var react_1 = __importStar(require("react"));
var control_bar_1 = require("./control-bar");
var ConfigProvider_1 = require("../ConfigProvider");
var palette_1 = require("./palette");
var Radio_1 = __importDefault(require("../Radio"));
var Select_1 = __importDefault(require("../Select"));
var input_rgb_1 = require("./input-rgb");
var input_hex_1 = require("./input-hex");
var interface_1 = require("./interface");
var color_1 = require("../_util/color");
var mode_1 = require("./mode");
var utils_1 = require("./utils");
var RadioGroup = Radio_1.default.Group;
var Panel = function (_a) {
    var value = _a.value, mode = _a.mode, activeMode = _a.activeMode, gradientColors = _a.gradientColors, activeColorId = _a.activeColorId, activeColorIdRef = _a.activeColorIdRef, color = _a.color, alpha = _a.alpha, disabledAlpha = _a.disabledAlpha, historyColors = _a.historyColors, presetColors = _a.presetColors, showHistory = _a.showHistory, showPreset = _a.showPreset, renderPreset = _a.renderPreset, renderHistory = _a.renderHistory, renderPickSection = _a.renderPickSection, renderFooter = _a.renderFooter, onHsvChange = _a.onHsvChange, onAlphaChange = _a.onAlphaChange, onActiveModeChange = _a.onActiveModeChange, onGradientColorsChange = _a.onGradientColorsChange, onActiveColorIdChange = _a.onActiveColorIdChange;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, locale = _b.locale;
    var prefixCls = getPrefixCls('color-picker');
    var _c = __read((0, react_1.useState)('hex'), 2), format = _c[0], setFormat = _c[1];
    var history = (0, react_1.useMemo)(function () {
        var set = new Set(historyColors !== null && historyColors !== void 0 ? historyColors : []);
        return Array.from(set);
    }, [historyColors]);
    var _d = color.hsv, h = _d.h, s = _d.s, v = _d.v;
    var _e = color.rgb, r = _e.r, g = _e.g, b = _e.b;
    var onHexInputChange = function (_value) {
        var _rgb = (0, color_1.hexToRgb)(_value) || {
            r: 255,
            g: 0,
            b: 0,
        };
        var _hsv = (0, color_1.rgbToHsv)(_rgb.r, _rgb.g, _rgb.b);
        onHsvChange(_hsv);
    };
    var renderModeTag = function () {
        return (react_1.default.createElement(RadioGroup, { className: prefixCls + "-panel-control-gradient-tag", type: "button", size: "small", value: activeMode, onChange: onActiveModeChange },
            react_1.default.createElement(Radio_1.default, { value: interface_1.ColorPickerMode.Single }, locale.ColorPicker.singleColor),
            react_1.default.createElement(Radio_1.default, { value: interface_1.ColorPickerMode.Gradient }, locale.ColorPicker.gradientColor)));
    };
    var handleChange = function (x) {
        var percent = Math.round(x * 100);
        onGradientColorsChange(function (gradientColors) {
            return (0, utils_1.sortGradientColors)(gradientColors.map(function (item) {
                if (item.id === activeColorIdRef.current) {
                    return __assign(__assign({}, item), { percent: percent });
                }
                return item;
            }));
        });
    };
    var renderGradientBar = function () {
        var handleAdd = function (x) {
            var percent = Math.round(x * 100);
            var newColor = (0, utils_1.getColorByGradients)(gradientColors, percent);
            var newColors = (0, utils_1.sortGradientColors)(gradientColors.concat(newColor));
            onGradientColorsChange(newColors);
            onActiveColorIdChange(newColor.id);
            onHsvChange(newColor.color.hsv);
            onAlphaChange(newColor.alpha);
        };
        var handleActive = function (key) {
            var activeColor = gradientColors.find(function (item) { return item.id === key; });
            onActiveColorIdChange(key);
            onHsvChange(activeColor.color.hsv);
            onAlphaChange(activeColor.alpha);
        };
        return (react_1.default.createElement("div", { className: prefixCls + "-control-bar-gradient" },
            react_1.default.createElement(control_bar_1.ControlBar, { multiple: true, value: gradientColors.map(function (_a) {
                    var percent = _a.percent, id = _a.id;
                    return ({
                        value: percent / 100,
                        key: id,
                    });
                }), onAdd: handleAdd, onChange: handleChange, onActive: handleActive, style: {
                    background: (0, utils_1.renderBackground)(value),
                }, renderHandlerStyle: function (key) {
                    if (activeColorId === key) {
                        return {
                            outline: '1px solid rgb(var(--primary-6))',
                        };
                    }
                    return {};
                }, renderHandlerCenterStyle: function (key) {
                    var _a = gradientColors.find(function (item) { return item.id === key; }), _b = _a.color.rgb, r = _b.r, g = _b.g, b = _b.b, alpha = _a.alpha;
                    return {
                        background: (0, color_1.getColorString)(r, g, b, alpha),
                    };
                } })));
    };
    var renderInput = function () {
        if (format === 'rgb') {
            return (react_1.default.createElement(input_rgb_1.InputRgb, { color: color, alpha: alpha, onHsvChange: onHsvChange, onAlphaChange: onAlphaChange, disabledAlpha: disabledAlpha }));
        }
        return (react_1.default.createElement(input_hex_1.InputHex, { color: color, alpha: alpha, onHsvChange: onHsvChange, onAlphaChange: onAlphaChange, disabledAlpha: disabledAlpha }));
    };
    var renderColorBlock = function (color) {
        return (react_1.default.createElement("div", { key: color, className: prefixCls + "-color-block", onClick: function () {
                onHexInputChange(color);
            } },
            react_1.default.createElement("div", { className: prefixCls + "-block", style: { backgroundColor: color } })));
    };
    var renderHistorySec = function () {
        if (renderHistory) {
            return renderHistory();
        }
        if (showHistory) {
            return (react_1.default.createElement("div", { className: prefixCls + "-colors-section" },
                react_1.default.createElement("div", { className: prefixCls + "-colors-text" }, locale.ColorPicker.history),
                react_1.default.createElement("div", { className: prefixCls + "-colors-wrapper" }, (history === null || history === void 0 ? void 0 : history.length) ? (react_1.default.createElement("div", { className: prefixCls + "-colors-list" }, history.map(renderColorBlock))) : (react_1.default.createElement("span", { className: prefixCls + "-colors-empty" }, locale.ColorPicker.empty)))));
        }
        return null;
    };
    var renderPresetSec = function () {
        if (renderPreset) {
            return renderPreset();
        }
        if (showPreset) {
            return (react_1.default.createElement("div", { className: prefixCls + "-colors-section" },
                react_1.default.createElement("div", { className: prefixCls + "-colors-text" }, locale.ColorPicker.preset),
                react_1.default.createElement("div", { className: prefixCls + "-colors-wrapper" },
                    react_1.default.createElement("div", { className: prefixCls + "-colors-list" }, presetColors === null || presetColors === void 0 ? void 0 : presetColors.map(renderColorBlock)))));
        }
        return null;
    };
    var renderColorSec = function () {
        if (renderPickSection) {
            return renderPickSection();
        }
        if (showHistory || showPreset) {
            return (react_1.default.createElement("div", { className: prefixCls + "-panel-colors" },
                renderHistorySec(),
                renderPresetSec()));
        }
        return null;
    };
    return (react_1.default.createElement("div", { className: prefixCls + "-panel" },
        react_1.default.createElement("div", { className: ((0, mode_1.isMultiMode)(mode) || (0, mode_1.isGradientMode)(activeMode)) && prefixCls + "-panel-control-gradient" },
            (0, mode_1.isMultiMode)(mode) && renderModeTag(),
            (0, mode_1.isGradientMode)(activeMode) && renderGradientBar(),
            react_1.default.createElement(palette_1.Palette, { color: color, onChange: function (s, v) {
                    onHsvChange({ h: h, s: s, v: v });
                } })),
        react_1.default.createElement("div", { className: prefixCls + "-panel-control" },
            react_1.default.createElement("div", { className: prefixCls + "-control-wrapper" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement(control_bar_1.ControlBar, { className: prefixCls + "-control-bar-hue", value: h, onChange: function (h) { return onHsvChange({ h: h, s: s, v: v }); }, renderHandlerCenterStyle: function () { return ({
                            background: (0, color_1.getColorString)(r, g, b, 1),
                        }); } }),
                    !disabledAlpha && (react_1.default.createElement("div", { className: prefixCls + "-control-bar-bg" },
                        react_1.default.createElement(control_bar_1.ControlBar, { className: prefixCls + "-control-bar-alpha", style: {
                                background: "linear-gradient(to right, rgba(0, 0, 0, 0), rgb(" + r + ", " + g + ", " + b + "))",
                            }, value: alpha, onChange: onAlphaChange, renderHandlerCenterStyle: function () { return ({
                                background: (0, color_1.getColorString)(r, g, b, alpha),
                            }); } })))),
                react_1.default.createElement("div", { className: prefixCls + "-preview", style: { backgroundColor: (0, color_1.getColorString)(r, g, b, alpha) } })),
            react_1.default.createElement("div", { className: prefixCls + "-input-wrapper" },
                react_1.default.createElement(Select_1.default, { className: prefixCls + "-select-type", size: "mini", options: [
                        {
                            value: 'hex',
                            label: 'Hex',
                        },
                        {
                            value: 'rgb',
                            label: 'RGB',
                        },
                    ], value: format, triggerProps: {
                        className: prefixCls + "-type-dropdown",
                    }, onChange: setFormat }),
                react_1.default.createElement("div", { className: prefixCls + "-group-wrapper" }, renderInput()))),
        renderColorSec(),
        typeof renderFooter === 'function' ? renderFooter() : null));
};
exports.Panel = Panel;
