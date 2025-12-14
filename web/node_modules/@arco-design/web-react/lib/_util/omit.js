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
// delete keys from object
function omit(obj, keys // string 为了某些没有声明的属性被omit
) {
    var clone = __assign({}, obj);
    keys.forEach(function (key) {
        if (key in clone) {
            delete clone[key];
        }
    });
    return clone;
}
exports.default = omit;
