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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqualsColors = exports.equalsRgba = exports.equalsHsv = exports.getColorByGradients = exports.mapValueToGradientColor = exports.getRandomId = exports.getColorFromHsv = exports.formatHex = exports.formatRgba = exports.renderBackground = exports.renderGradientBackground = exports.getGradientString = exports.mix = exports.sortGradientColors = void 0;
var color_1 = require("../_util/color");
var sortGradientColors = function (gradientColors) {
    return gradientColors.sort(function (a, b) {
        return a.percent - b.percent;
    });
};
exports.sortGradientColors = sortGradientColors;
var mix = function (source, target, progress) {
    return Object.keys(source).reduce(function (previousObject, currentKey) {
        var _a;
        return (__assign(__assign({}, previousObject), (_a = {}, _a[currentKey] = source[currentKey] + (target[currentKey] - source[currentKey]) * progress, _a)));
    }, __assign({}, source));
};
exports.mix = mix;
var getGradientString = function (value) {
    return value.map(function (_a) {
        var color = _a.color, percent = _a.percent;
        return color + " " + percent + "%";
    }).join(', ');
};
exports.getGradientString = getGradientString;
var renderGradientBackground = function (value) {
    return "linear-gradient(to right, " + (0, exports.getGradientString)(value) + ")";
};
exports.renderGradientBackground = renderGradientBackground;
var renderBackground = function (value) {
    return Array.isArray(value) ? (0, exports.renderGradientBackground)(value) : value;
};
exports.renderBackground = renderBackground;
var formatRgba = function (r, g, b, a) {
    return a < 1 ? "rgba(" + r + ", " + g + ", " + b + ", " + a.toFixed(2) + ")" : "rgb(" + r + ", " + g + ", " + b + ")";
};
exports.formatRgba = formatRgba;
var formatHex = function (r, g, b, a) {
    return a < 1 ? "#" + (0, color_1.rgbaToHex)(r, g, b, a) : "#" + (0, color_1.rgbToHex)(r, g, b);
};
exports.formatHex = formatHex;
var getColorFromHsv = function (hsv) {
    var rgb = (0, color_1.hsvToRgb)(hsv.h, hsv.s, hsv.v);
    var hex = (0, color_1.rgbToHex)(rgb.r, rgb.g, rgb.b);
    return {
        hsv: hsv,
        rgb: rgb,
        hex: hex,
    };
};
exports.getColorFromHsv = getColorFromHsv;
var getRandomId = function () { return Math.random().toFixed(10).slice(2); };
exports.getRandomId = getRandomId;
var mapValueToGradientColor = function (value, disabledAlpha) {
    return value.map(function (item) {
        var formatInput = (0, color_1.formatInputToHSVA)(item.color);
        return {
            id: (0, exports.getRandomId)(),
            color: (0, exports.getColorFromHsv)(formatInput),
            alpha: disabledAlpha ? 100 : formatInput.a,
            percent: item.percent,
        };
    });
};
exports.mapValueToGradientColor = mapValueToGradientColor;
var getColorByGradients = function (gradientColors, percent, id) {
    var index = gradientColors.findIndex(function (item) { return item.percent === percent; });
    if (index !== -1) {
        return __assign(__assign({}, gradientColors[index]), { id: id !== null && id !== void 0 ? id : (0, exports.getRandomId)() });
    }
    var latterColorIndex = gradientColors.findIndex(function (item) { return item.percent > percent; });
    var previousColorIndex = latterColorIndex - 1;
    var _a = gradientColors[previousColorIndex], previousColor = _a.color, previousAlpha = _a.alpha, previousPercent = _a.percent;
    var _b = gradientColors[latterColorIndex], latterColor = _b.color, latterAlpha = _b.alpha, latterPercent = _b.percent;
    var interpolatedColor = (0, exports.mix)(__assign(__assign({}, previousColor.rgb), { a: previousAlpha }), __assign(__assign({}, latterColor.rgb), { a: latterAlpha }), (percent - previousPercent) / (latterPercent - previousPercent));
    var r = interpolatedColor.r, g = interpolatedColor.g, b = interpolatedColor.b, a = interpolatedColor.a;
    return {
        id: id !== null && id !== void 0 ? id : (0, exports.getRandomId)(),
        color: (0, exports.getColorFromHsv)((0, color_1.rgbToHsv)(r, g, b)),
        alpha: a,
        percent: percent,
    };
};
exports.getColorByGradients = getColorByGradients;
var equalsHsv = function (a, b) {
    return a.h === b.h && a.s === b.s && a.v === b.v;
};
exports.equalsHsv = equalsHsv;
var equalsRgba = function (a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
};
exports.equalsRgba = equalsRgba;
var isEqualsColors = function (colorA, colorB) {
    if (typeof colorA === 'string' && typeof colorB === 'string') {
        return colorA === colorB;
    }
    if (Array.isArray(colorA) && Array.isArray(colorB)) {
        return (colorA.length === colorB.length &&
            colorA.every(function (itemA, index) {
                var itemB = colorB[index];
                return ((0, exports.equalsRgba)((0, color_1.formatInputToRGBA)(itemA.color), (0, color_1.formatInputToRGBA)(itemB.color)) &&
                    itemA.percent === itemB.percent);
            }));
    }
    return false;
};
exports.isEqualsColors = isEqualsColors;
