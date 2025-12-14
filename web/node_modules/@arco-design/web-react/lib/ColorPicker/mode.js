"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModeByValue = exports.getInitialActiveMode = exports.isMultiMode = exports.isGradientMode = exports.isSingleMode = exports.getMode = void 0;
var interface_1 = require("./interface");
var getMode = function (mode) {
    if (Array.isArray(mode) && mode.length === 1) {
        return mode[0];
    }
    return mode;
};
exports.getMode = getMode;
var isSingleMode = function (mode) {
    return (0, exports.getMode)(mode) === interface_1.ColorPickerMode.Single;
};
exports.isSingleMode = isSingleMode;
var isGradientMode = function (mode) {
    return (0, exports.getMode)(mode) === interface_1.ColorPickerMode.Gradient;
};
exports.isGradientMode = isGradientMode;
var isMultiMode = function (mode) {
    return Array.isArray((0, exports.getMode)(mode));
};
exports.isMultiMode = isMultiMode;
var getInitialActiveMode = function (mode) {
    if ((0, exports.isMultiMode)(mode)) {
        return interface_1.ColorPickerMode.Gradient;
    }
    return mode;
};
exports.getInitialActiveMode = getInitialActiveMode;
var getModeByValue = function (value, defaultValue, mode) {
    if (value && Array.isArray(value)) {
        return interface_1.ColorPickerMode.Gradient;
    }
    if (value && typeof value === 'string') {
        return interface_1.ColorPickerMode.Single;
    }
    if (defaultValue && Array.isArray(defaultValue)) {
        return interface_1.ColorPickerMode.Gradient;
    }
    if (defaultValue && typeof defaultValue === 'string') {
        return interface_1.ColorPickerMode.Single;
    }
    return (0, exports.getInitialActiveMode)(mode);
};
exports.getModeByValue = getModeByValue;
