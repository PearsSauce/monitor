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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var omit_1 = __importDefault(require("../omit"));
function useMergeProps(componentProps, defaultProps, globalComponentConfig) {
    var _ignorePropsFromGlobal = componentProps._ignorePropsFromGlobal;
    var _defaultProps = (0, react_1.useMemo)(function () {
        return __assign(__assign({}, defaultProps), (_ignorePropsFromGlobal ? {} : globalComponentConfig));
    }, [defaultProps, globalComponentConfig, _ignorePropsFromGlobal]);
    var props = (0, react_1.useMemo)(function () {
        // Must remove property of MergePropsOptions before passing it to component
        var mProps = (0, omit_1.default)(componentProps, ['_ignorePropsFromGlobal']);
        // https://github.com/facebook/react/blob/cae635054e17a6f107a39d328649137b83f25972/packages/react/src/ReactElement.js#L312
        for (var propName in _defaultProps) {
            if (mProps[propName] === undefined) {
                mProps[propName] = _defaultProps[propName];
            }
        }
        return mProps;
    }, [componentProps, _defaultProps]);
    return props;
}
exports.default = useMergeProps;
