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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var react_1 = __importStar(require("react"));
var throttleByRaf_1 = __importDefault(require("../_util/throttleByRaf"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var dom_1 = require("../_util/dom");
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var is_1 = require("../_util/is");
var useIsomorphicLayoutEffect_1 = __importDefault(require("../_util/hooks/useIsomorphicLayoutEffect"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
function getTargetRect(target) {
    return (0, is_1.isWindow)(target)
        ? {
            top: 0,
            bottom: window.innerHeight,
        }
        : target.getBoundingClientRect();
}
var defaultProps = {
    offsetTop: 0,
    target: function () { return window; },
};
function Affix(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Affix);
    var className = props.className, style = props.style, affixClassName = props.affixClassName, affixStyle = props.affixStyle, offsetTop = props.offsetTop, offsetBottom = props.offsetBottom, target = props.target, targetContainer = props.targetContainer, children = props.children, onChange = props.onChange, rest = __rest(props, ["className", "style", "affixClassName", "affixStyle", "offsetTop", "offsetBottom", "target", "targetContainer", "children", "onChange"]);
    var _c = __read((0, react_1.useState)({
        status: 'MEASURE_DONE',
        isFixed: false,
        sizeStyles: {},
        fixedStyles: {},
    }), 2), state = _c[0], setState = _c[1];
    var isFixed = state.isFixed, sizeStyles = state.sizeStyles, fixedStyles = state.fixedStyles;
    var lastIsFixed = (0, react_1.useRef)(isFixed);
    var prefixCls = getPrefixCls('affix');
    var classNames = (0, classNames_1.default)((_a = {}, _a[prefixCls] = isFixed, _a[prefixCls + "-rtl"] = rtl, _a), affixClassName);
    var wrapperRef = (0, react_1.useRef)(null);
    var targetRef = (0, react_1.useRef)(null);
    var updatePosition = (0, react_1.useCallback)((0, throttleByRaf_1.default)(function () {
        setState({
            status: 'MEASURE_START',
            isFixed: false,
            fixedStyles: {},
            sizeStyles: {},
        });
    }), []);
    (0, useIsomorphicLayoutEffect_1.default)(function () {
        var status = state.status;
        if (status !== 'MEASURE_START' || !wrapperRef.current || !targetRef.current)
            return;
        var offsetType = (0, is_1.isUndefined)(offsetBottom) ? 'top' : 'bottom';
        var wrapperRect = wrapperRef.current.getBoundingClientRect();
        var targetRect = getTargetRect(targetRef.current);
        var newIsFixed = false;
        var newFixedStyles = {};
        if (offsetType === 'top') {
            newIsFixed = wrapperRect.top - targetRect.top < (offsetTop || 0);
            newFixedStyles = newIsFixed
                ? {
                    position: 'fixed',
                    top: targetRect.top + (offsetTop || 0),
                }
                : {};
        }
        else {
            newIsFixed = targetRect.bottom - wrapperRect.bottom < (offsetBottom || 0);
            newFixedStyles = newIsFixed
                ? {
                    position: 'fixed',
                    bottom: window.innerHeight - targetRect.bottom + (offsetBottom || 0),
                }
                : {};
        }
        var newSizeStyles = newIsFixed
            ? {
                width: wrapperRef.current.offsetWidth,
                height: wrapperRef.current.offsetHeight,
            }
            : {};
        setState({
            status: 'MEASURE_DONE',
            isFixed: newIsFixed,
            sizeStyles: newSizeStyles,
            fixedStyles: __assign(__assign({}, newFixedStyles), newSizeStyles),
        });
        if (newIsFixed !== lastIsFixed.current) {
            lastIsFixed.current = newIsFixed;
            (0, is_1.isFunction)(onChange) && onChange(newIsFixed);
        }
    }, [state, offsetBottom, offsetTop, onChange]);
    (0, react_1.useEffect)(function () {
        updatePosition();
        return function () {
            var _a;
            (_a = updatePosition === null || updatePosition === void 0 ? void 0 : updatePosition.cancel) === null || _a === void 0 ? void 0 : _a.call(updatePosition);
        };
    }, [target, targetContainer, offsetBottom, offsetTop, updatePosition]);
    // listen to scroll and resize event of target and update position correspondingly
    (0, react_1.useEffect)(function () {
        targetRef.current = target && (0, is_1.isFunction)(target) ? target() : null;
        if (targetRef.current) {
            (0, dom_1.on)(targetRef.current, 'scroll', updatePosition);
            (0, dom_1.on)(targetRef.current, 'resize', updatePosition);
            return function () {
                (0, dom_1.off)(targetRef.current, 'scroll', updatePosition);
                (0, dom_1.off)(targetRef.current, 'resize', updatePosition);
            };
        }
    }, [target, updatePosition]);
    (0, react_1.useEffect)(function () {
        var container = targetContainer && (0, is_1.isFunction)(targetContainer) ? targetContainer() : null;
        // listen to scroll event of container if target is not window
        if (targetRef.current !== window && container) {
            (0, dom_1.on)(container, 'scroll', updatePosition);
            return function () {
                (0, dom_1.off)(container, 'scroll', updatePosition);
            };
        }
    }, [targetContainer, updatePosition]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        updatePosition: updatePosition,
        getRootDOMNode: function () {
            return wrapperRef.current;
        },
    }); });
    return (react_1.default.createElement(resizeObserver_1.default, { onResize: updatePosition, getTargetDOMNode: function () { return wrapperRef.current; } },
        react_1.default.createElement("div", __assign({ className: (0, classNames_1.default)(className), style: style, ref: wrapperRef }, rest),
            isFixed && react_1.default.createElement("div", { style: sizeStyles }),
            react_1.default.createElement("div", { className: classNames, style: __assign(__assign({}, fixedStyles), ((0, is_1.isObject)(affixStyle) ? affixStyle : {})) },
                react_1.default.createElement(resizeObserver_1.default, { onResize: updatePosition }, children || react_1.default.createElement("span", null))))));
}
var AffixComponent = (0, react_1.forwardRef)(Affix);
AffixComponent.displayName = 'Affix';
exports.default = AffixComponent;
