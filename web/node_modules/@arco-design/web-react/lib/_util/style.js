"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyle = exports.setTransformStyle = exports.fixedWidth = void 0;
var transformNames = [
    'transform',
    'WebkitTransform',
    'msTransform',
    'MozTransform',
    'OTransform',
];
function fixedWidth(width) {
    return {
        maxWidth: width,
        minWidth: width,
        width: width,
    };
}
exports.fixedWidth = fixedWidth;
function setTransformStyle(value) {
    var style = {};
    transformNames.forEach(function (name) {
        style[name] = value;
    });
    return style;
}
exports.setTransformStyle = setTransformStyle;
function getStyle(element, prop) {
    if (!element || !prop)
        return null;
    var styleName = prop;
    if (styleName === 'float') {
        styleName = 'cssFloat';
    }
    try {
        if (document.defaultView) {
            var computed = document.defaultView.getComputedStyle(element, '');
            return element.style[styleName] || computed ? computed[styleName] : '';
        }
    }
    catch (e) {
        return element.style[styleName];
    }
}
exports.getStyle = getStyle;
