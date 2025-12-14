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
exports.useColorPicker = void 0;
var react_1 = require("react");
var interface_1 = require("../interface");
var color_1 = require("../../_util/color");
var useMergeValue_1 = __importDefault(require("../../_util/hooks/useMergeValue"));
var useIsFirstRender_1 = __importDefault(require("../../_util/hooks/useIsFirstRender"));
var mode_1 = require("../mode");
var utils_1 = require("../utils");
var useColorPicker = function (props) {
    var _a;
    var _b = props.mode, mode = _b === void 0 ? interface_1.ColorPickerMode.Single : _b, defaultValue = props.defaultValue, format = props.format, onChange = props.onChange, disabledAlpha = props.disabledAlpha;
    var isFirstRender = (0, useIsFirstRender_1.default)();
    var _c = __read((0, useMergeValue_1.default)(false, {
        defaultValue: props.defaultPopupVisible,
        value: props.popupVisible,
    }), 2), popupVisible = _c[0], setPopupVisible = _c[1];
    var _d = __read((0, react_1.useState)((0, mode_1.getModeByValue)(props.value, defaultValue, mode)), 2), activeMode = _d[0], setActiveMode = _d[1];
    var _e = __read((0, useMergeValue_1.default)(activeMode === interface_1.ColorPickerMode.Gradient ? undefined : '', props), 2), value = _e[0], setValue = _e[1];
    var _f = __read((0, react_1.useState)((0, mode_1.isGradientMode)(activeMode) && Array.isArray(value)
        ? (0, utils_1.mapValueToGradientColor)(value, disabledAlpha)
        : []), 2), _gradientColors = _f[0], _setGradientColors = _f[1];
    var _g = __read((0, react_1.useState)((_a = _gradientColors[0]) === null || _a === void 0 ? void 0 : _a.id), 2), _activeColorId = _g[0], _setActiveColorId = _g[1];
    var gradientColorsRef = (0, react_1.useRef)(_gradientColors);
    var activeColorIdRef = (0, react_1.useRef)(_activeColorId);
    var gradientColors = gradientColorsRef.current;
    var activeColorId = activeColorIdRef.current;
    var setGradientColors = function (newColors) {
        _setGradientColors(newColors);
        gradientColorsRef.current =
            typeof newColors === 'function' ? newColors(gradientColorsRef.current) : newColors;
    };
    var setActiveColorId = function (newId) {
        _setActiveColorId(newId);
        activeColorIdRef.current = newId;
    };
    var activeColorIndex = (0, react_1.useMemo)(function () {
        var activeIndex = gradientColors.findIndex(function (item) { return item.id === activeColorId; });
        return activeIndex !== -1 ? activeIndex : 0;
    }, [gradientColors, activeColorId]);
    var formatInput = Array.isArray(value)
        ? (0, color_1.formatInputToHSVA)(value[activeColorIndex].color)
        : (0, color_1.formatInputToHSVA)(value);
    var _h = __read((0, react_1.useState)({
        h: formatInput.h,
        s: formatInput.s,
        v: formatInput.v,
    }), 2), hsv = _h[0], setHsv = _h[1];
    var _j = __read((0, react_1.useState)(formatInput.a), 2), alpha = _j[0], setAlpha = _j[1];
    var color = (0, react_1.useMemo)(function () { return (0, utils_1.getColorFromHsv)(hsv); }, [hsv]);
    var formatSingleValue = (0, react_1.useCallback)(function (r, g, b, alpha) {
        return format === 'rgb' ? (0, utils_1.formatRgba)(r, g, b, alpha) : (0, utils_1.formatHex)(r, g, b, alpha);
    }, [format]);
    var formatValue = (0, react_1.useMemo)(function () {
        if ((0, mode_1.isSingleMode)(activeMode)) {
            var _a = color.rgb, r = _a.r, g = _a.g, b = _a.b;
            return formatSingleValue(r, g, b, alpha);
        }
        return gradientColors.map(function (item) {
            var _a = item.color.rgb, r = _a.r, g = _a.g, b = _a.b;
            return {
                color: formatSingleValue(r, g, b, item.alpha),
                percent: item.percent,
            };
        });
    }, [activeMode, gradientColors, color.rgb, formatSingleValue, alpha]);
    (0, react_1.useEffect)(function () {
        setValue(formatValue);
        if (!isFirstRender && !(0, utils_1.isEqualsColors)(value, formatValue)) {
            onChange === null || onChange === void 0 ? void 0 : onChange(formatValue);
        }
    }, [formatValue]);
    var onVisibleChange = (0, react_1.useCallback)(function (newVisible) {
        if (newVisible && value !== formatValue) {
            var h = formatInput.h, s = formatInput.s, v = formatInput.v, a = formatInput.a;
            setHsv({ h: h, s: s, v: v });
            setAlpha(a);
        }
        if (newVisible !== popupVisible) {
            props.onVisibleChange && props.onVisibleChange(newVisible);
            if (!('popupVisible' in props)) {
                setPopupVisible(newVisible);
            }
        }
    }, [props.onVisibleChange, popupVisible, value]);
    var onHsvChange = function (_value) {
        setHsv(_value);
        if (disabledAlpha && alpha !== 100) {
            setAlpha(100);
        }
    };
    var onAlphaChange = function (_value) {
        setAlpha(_value);
    };
    (0, react_1.useEffect)(function () {
        if (!(0, mode_1.isGradientMode)(activeMode) || !gradientColors.length)
            return;
        if ((0, utils_1.equalsHsv)(gradientColors[activeColorIndex].color.hsv, hsv))
            return;
        var newGradientColors = __spreadArray([], __read(gradientColors), false);
        newGradientColors[activeColorIndex] = __assign(__assign({}, newGradientColors[activeColorIndex]), { color: (0, utils_1.getColorFromHsv)(hsv) });
        setGradientColors(newGradientColors);
    }, [hsv]);
    (0, react_1.useEffect)(function () {
        if (!(0, mode_1.isGradientMode)(activeMode) || !gradientColors.length)
            return;
        if (gradientColors[activeColorIndex].alpha === alpha)
            return;
        var newGradientColors = __spreadArray([], __read(gradientColors), false);
        newGradientColors[activeColorIndex] = __assign(__assign({}, newGradientColors[activeColorIndex]), { alpha: disabledAlpha ? 100 : alpha });
        setGradientColors(newGradientColors);
    }, [alpha]);
    var onActiveModeChange = function (newMode) {
        var _a;
        if (newMode === activeMode) {
            return;
        }
        if (newMode === interface_1.ColorPickerMode.Single) {
            setActiveColorId((_a = gradientColors[0]) === null || _a === void 0 ? void 0 : _a.id);
        }
        else {
            setGradientColors([
                {
                    id: (0, utils_1.getRandomId)(),
                    color: color,
                    alpha: alpha,
                    percent: 0,
                },
                {
                    id: (0, utils_1.getRandomId)(),
                    color: color,
                    alpha: alpha,
                    percent: 100,
                },
            ]);
        }
        setActiveMode(newMode);
    };
    return {
        value: value,
        activeMode: activeMode,
        gradientColors: gradientColors,
        gradientColorsRef: gradientColorsRef,
        activeColorId: activeColorId,
        activeColorIdRef: activeColorIdRef,
        popupVisible: popupVisible,
        color: color,
        alpha: alpha,
        onHsvChange: onHsvChange,
        onAlphaChange: onAlphaChange,
        onVisibleChange: onVisibleChange,
        onActiveModeChange: onActiveModeChange,
        onActiveColorIdChange: setActiveColorId,
        onGradientColorsChange: setGradientColors,
    };
};
exports.useColorPicker = useColorPicker;
