"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportRef = exports.isReact19 = exports.isReact18 = exports.isDOMElement = exports.isClassComponent = exports.isReactComponent = exports.isBoolean = exports.isDayjs = exports.isWindow = exports.isExist = exports.isEmptyReactNode = exports.isEmptyObject = exports.isFunction = exports.isNullOrUndefined = exports.isNull = exports.isUndefined = exports.isColor = exports.isBlob = exports.isFile = exports.isRegExp = exports.isNumber = exports.isString = exports.isObject = exports.isArray = void 0;
var react_1 = require("react");
var react_dom_1 = __importDefault(require("react-dom"));
var react_is_1 = require("react-is");
var opt = Object.prototype.toString;
function isArray(obj) {
    return opt.call(obj) === '[object Array]';
}
exports.isArray = isArray;
function isObject(obj) {
    return opt.call(obj) === '[object Object]';
}
exports.isObject = isObject;
function isString(obj) {
    return opt.call(obj) === '[object String]';
}
exports.isString = isString;
function isNumber(obj) {
    return opt.call(obj) === '[object Number]' && obj === obj; // eslint-disable-line
}
exports.isNumber = isNumber;
function isRegExp(obj) {
    return opt.call(obj) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
function isFile(obj) {
    return opt.call(obj) === '[object File]';
}
exports.isFile = isFile;
function isBlob(obj) {
    return opt.call(obj) === '[object Blob]';
}
exports.isBlob = isBlob;
function isHex(color) {
    return /^#[a-fA-F0-9]{3}$|#[a-fA-F0-9]{6}$/.test(color);
}
function isRgb(color) {
    return /^rgb\((\s*\d+\s*,?){3}\)$/.test(color);
}
function isRgba(color) {
    return /^rgba\((\s*\d+\s*,\s*){3}\s*\d(\.\d+)?\s*\)$/.test(color);
}
function isColor(color) {
    return isHex(color) || isRgb(color) || isRgba(color);
}
exports.isColor = isColor;
function isUndefined(obj) {
    return obj === undefined;
}
exports.isUndefined = isUndefined;
function isNull(obj) {
    return obj === null;
}
exports.isNull = isNull;
function isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
}
exports.isNullOrUndefined = isNullOrUndefined;
function isFunction(obj) {
    return typeof obj === 'function';
}
exports.isFunction = isFunction;
function isEmptyObject(obj) {
    return isObject(obj) && Object.keys(obj).length === 0;
}
exports.isEmptyObject = isEmptyObject;
function isEmptyReactNode(content, trim) {
    if (content === null || content === undefined || content === false) {
        return true;
    }
    if (typeof content === 'string' && (trim ? content.trim() === '' : content === '')) {
        return true;
    }
    return false;
}
exports.isEmptyReactNode = isEmptyReactNode;
function isExist(obj) {
    return obj || obj === 0;
}
exports.isExist = isExist;
function isWindow(el) {
    return el === window;
}
exports.isWindow = isWindow;
function isDayjs(time) {
    // dayjs.isDayjs 在实际应用场景，比如多个版本的 dayjs 会失效
    return (isObject(time) &&
        (('$y' in time &&
            '$M' in time &&
            '$D' in time &&
            '$d' in time &&
            '$H' in time &&
            '$m' in time &&
            '$s' in time) ||
            time._isAMomentObject) // 兼容 moment 的验证
    );
}
exports.isDayjs = isDayjs;
function isBoolean(value) {
    return typeof value === 'boolean';
}
exports.isBoolean = isBoolean;
var isReactComponent = function (element) {
    return element && (0, react_1.isValidElement)(element) && typeof element.type === 'function';
};
exports.isReactComponent = isReactComponent;
var isClassComponent = function (element) {
    var _a;
    return (0, exports.isReactComponent)(element) && !!((_a = element.type.prototype) === null || _a === void 0 ? void 0 : _a.isReactComponent);
};
exports.isClassComponent = isClassComponent;
// element 是合成的 dom 元素或者字符串，数字等
var isDOMElement = function (element) {
    return (0, react_1.isValidElement)(element) && typeof element.type === 'string';
};
exports.isDOMElement = isDOMElement;
exports.isReact18 = Number((_a = react_dom_1.default.version) === null || _a === void 0 ? void 0 : _a.split('.')[0]) > 17;
exports.isReact19 = Number((_b = react_dom_1.default.version) === null || _b === void 0 ? void 0 : _b.split('.')[0]) > 18;
// 基本copy:  https://github.com/facebook/react/blob/main/packages/react-is/src/ReactIs.js
// 改动了点逻辑
var isForwardRefReact = function (object) {
    if (!exports.isReact19) {
        return (0, react_is_1.isForwardRef)(object);
    }
    // react 19 兜底走以下逻辑
    var REACT_ELEMENT_TYPE = Symbol.for('react.element');
    // react 19 改名了
    var NEW_REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element');
    var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
    if (typeof object === 'object' && object !== null) {
        var $$typeof = object.$$typeof;
        if ($$typeof === REACT_ELEMENT_TYPE || $$typeof === NEW_REACT_ELEMENT_TYPE) {
            var type = object.type;
            var $$typeofType = type && type.$$typeof;
            return $$typeofType === REACT_FORWARD_REF_TYPE;
        }
    }
    return false;
};
// 传入的元素是否可以设置 ref 饮用
var supportRef = function (element) {
    if ((0, exports.isDOMElement)(element)) {
        return true;
    }
    if (isForwardRefReact(element)) {
        return true;
    }
    if ((0, exports.isReactComponent)(element)) {
        return (0, exports.isClassComponent)(element); // 函数组件且没有被 forwardRef，无法设置 ref
    }
    return false;
};
exports.supportRef = supportRef;
