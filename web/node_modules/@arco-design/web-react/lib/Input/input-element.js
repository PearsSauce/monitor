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
var classNames_1 = __importDefault(require("../_util/classNames"));
var omit_1 = __importDefault(require("../_util/omit"));
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var IconClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconClose"));
var icon_hover_1 = __importDefault(require("../_class/icon-hover"));
var is_1 = require("../_util/is");
var useComposition_1 = __importDefault(require("./useComposition"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var fillNBSP_1 = __importDefault(require("../_util/fillNBSP"));
// 设置 input 元素缓冲宽度，避免 autoWidth.minWidth < padding + border 时，content 区域宽度为0，光标会看不到
// 后续可考虑是否作为 autoWidth 的一个配置项暴露
var inputContentWidth = 2;
// 从 input 标签获取影响到宽度计算的"文本样式属性"和“布局”属性 https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_text
// 为什么不是直接把 input 标签的类名设置给 mirror 元素？避免用户对 input 类名自定义样式会影响到 mirror
// 仅在 mounted 的时候执行一次
var getStyleFromInput = function (input) {
    if (!input) {
        return {};
    }
    var computeStyle = window.getComputedStyle(input);
    var cssKeys = [
        'font',
        'letterSpacing',
        'overflow',
        'tabSize',
        'textIndent',
        'textTransform',
        'whiteSpace',
        'wordBreak',
        'wordSpacing',
        'paddingLeft',
        'paddingRight',
        'borderLeft',
        'borderRight',
        'boxSizing',
    ];
    return cssKeys.reduce(function (t, n) {
        t[n] = computeStyle[n];
        return t;
    }, {});
};
var InputComponent = react_1.default.forwardRef(function (props, ref) {
    var _a;
    var allowClear = props.allowClear, disabled = props.disabled, placeholder = props.placeholder, className = props.className, style = props.style, height = props.height, prefixCls = props.prefixCls, hasParent = props.hasParent, size = props.size, value = props.value, autoFitWidth = props.autoFitWidth, onClear = props.onClear, readOnly = props.readOnly, onChange = props.onChange, onKeyDown = props.onKeyDown, onPressEnter = props.onPressEnter, propMaxLength = props.maxLength, clearIcon = props.clearIcon, rest = __rest(props, ["allowClear", "disabled", "placeholder", "className", "style", "height", "prefixCls", "hasParent", "size", "value", "autoFitWidth", "onClear", "readOnly", "onChange", "onKeyDown", "onPressEnter", "maxLength", "clearIcon"]);
    var otherProps = (0, omit_1.default)(rest, [
        'error',
        'status',
        'showWordLimit',
        'className',
        'defaultValue',
        'addBefore',
        'addAfter',
        'afterStyle',
        'beforeStyle',
        'prefix',
        'suffix',
        'normalize',
        'normalizeTrigger',
        'autoWidth',
    ]);
    var _b = __read((0, react_1.useState)(), 2), inputComputeStyle = _b[0], setInputComputeStyle = _b[1];
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var refInput = (0, react_1.useRef)();
    var refInputMirror = (0, react_1.useRef)();
    var refPrevInputWidth = (0, react_1.useRef)(null);
    var maxLength = (0, is_1.isObject)(propMaxLength)
        ? propMaxLength.errorOnly
            ? undefined
            : propMaxLength.length
        : propMaxLength;
    var normalizeHandler = function (type) {
        var handler;
        var normalizeTrigger = props.normalizeTrigger || ['onBlur'];
        if (Array.isArray(normalizeTrigger) &&
            normalizeTrigger.indexOf(type) > -1 &&
            (0, is_1.isFunction)(props.normalize)) {
            handler = props.normalize;
        }
        return handler;
    };
    var _c = (0, useComposition_1.default)({
        value: value,
        maxLength: maxLength,
        onChange: onChange,
        onKeyDown: onKeyDown,
        onPressEnter: onPressEnter,
        normalizeHandler: normalizeHandler,
    }), compositionValue = _c.compositionValue, valueChangeHandler = _c.valueChangeHandler, compositionHandler = _c.compositionHandler, keyDownHandler = _c.keyDownHandler, triggerValueChangeCallback = _c.triggerValueChangeCallback;
    var inputClassNames = (0, classNames_1.default)(prefixCls, prefixCls && (_a = {},
        _a[prefixCls + "-size-" + size] = size,
        _a[prefixCls + "-" + props.status] = props.status,
        _a[prefixCls + "-disabled"] = disabled,
        _a[prefixCls + "-autowidth"] = autoFitWidth,
        _a), hasParent ? undefined : className);
    var inputProps = __assign(__assign({ 'aria-invalid': props.status === 'error' || undefined }, otherProps), { readOnly: readOnly, maxLength: maxLength, disabled: disabled, placeholder: placeholder, value: compositionValue || value || '', className: inputClassNames, onKeyDown: keyDownHandler, onChange: valueChangeHandler, onCompositionStart: function (e) {
            var _a;
            (_a = rest.onCompositionStart) === null || _a === void 0 ? void 0 : _a.call(rest, e);
            compositionHandler(e);
        }, onCompositionUpdate: function (e) {
            var _a;
            (_a = rest.onCompositionUpdate) === null || _a === void 0 ? void 0 : _a.call(rest, e);
            compositionHandler(e);
        }, onCompositionEnd: function (e) {
            var _a;
            (_a = rest.onCompositionEnd) === null || _a === void 0 ? void 0 : _a.call(rest, e);
            compositionHandler(e);
        }, onBlur: function (e) {
            var _a;
            (_a = props.onBlur) === null || _a === void 0 ? void 0 : _a.call(props, e);
            var normalize = normalizeHandler('onBlur');
            normalize && triggerValueChangeCallback(normalize(e.target.value), e);
        } });
    (0, react_1.useImperativeHandle)(ref, function () {
        return {
            dom: refInput.current,
            getRootDOMNode: function () { return refInput.current; },
            focus: function () {
                refInput.current && refInput.current.focus && refInput.current.focus();
            },
            blur: function () {
                refInput.current && refInput.current.blur && refInput.current.blur();
            },
        };
    }, []);
    var updateInputWidth = function () {
        if (refInputMirror.current && refInput.current) {
            var width = refInputMirror.current.offsetWidth;
            refInput.current.style.width = width + inputContentWidth + "px";
        }
    };
    // Set the initial width of <input>, and subsequent updates are triggered by ResizeObserver
    (0, react_1.useEffect)(function () {
        if (autoFitWidth) {
            if (!(0, is_1.isObject)(autoFitWidth) || !autoFitWidth.pure) {
                setInputComputeStyle(getStyleFromInput(refInput === null || refInput === void 0 ? void 0 : refInput.current));
            }
            updateInputWidth();
        }
    }, [autoFitWidth]);
    // Here also need placeholder to trigger updateInputWidth after user-input is cleared
    var mirrorValue = inputProps.value || placeholder;
    var handleClear = function (e) {
        if (refInput.current && refInput.current.focus) {
            refInput.current.focus();
        }
        triggerValueChangeCallback('', e);
        onClear === null || onClear === void 0 ? void 0 : onClear();
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        allowClear ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("input", __assign({ ref: refInput }, inputProps)),
            !readOnly && !disabled && allowClear && value ? (clearIcon !== undefined ? (react_1.default.createElement("span", __assign({ tabIndex: 0, className: prefixCls + "-clear-icon" }, getKeyboardEvents({ onPressEnter: handleClear }), { onClick: function (e) {
                    e.stopPropagation();
                    handleClear(e);
                }, onMouseDown: function (e) {
                    e.preventDefault();
                } }), clearIcon)) : (react_1.default.createElement(icon_hover_1.default, __assign({ tabIndex: 0, className: prefixCls + "-clear-icon" }, getKeyboardEvents({ onPressEnter: handleClear }), { onClick: function (e) {
                    e.stopPropagation();
                    handleClear(e);
                } }),
                react_1.default.createElement(IconClose_1.default
                // keep focus status
                , { 
                    // keep focus status
                    onMouseDown: function (e) {
                        e.preventDefault();
                    } })))) : null)) : (react_1.default.createElement("input", __assign({ ref: refInput }, inputProps, { style: hasParent
                ? {}
                : __assign(__assign({ minWidth: (0, is_1.isObject)(autoFitWidth) ? autoFitWidth.minWidth : undefined, maxWidth: (0, is_1.isObject)(autoFitWidth) ? autoFitWidth.maxWidth : undefined }, style), ('height' in props ? { height: height } : {})) }))),
        autoFitWidth && (react_1.default.createElement(resizeObserver_1.default, { getTargetDOMNode: function () { return refInputMirror.current; }, onResize: function () {
                var inputWidth = refInputMirror.current.offsetWidth;
                if (typeof autoFitWidth === 'object') {
                    var delay = typeof autoFitWidth.delay === 'function'
                        ? autoFitWidth.delay(inputWidth, refPrevInputWidth.current)
                        : autoFitWidth.delay;
                    delay ? setTimeout(updateInputWidth, delay) : updateInputWidth();
                }
                else {
                    updateInputWidth();
                }
                refPrevInputWidth.current = inputWidth;
            } },
            react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-mirror"), style: hasParent
                    ? inputComputeStyle
                    : __assign(__assign(__assign({}, inputComputeStyle), style), ('height' in props ? { height: height } : {})), ref: refInputMirror }, (0, fillNBSP_1.default)(mirrorValue))))));
});
InputComponent.displayName = 'InputComponent';
exports.default = InputComponent;
