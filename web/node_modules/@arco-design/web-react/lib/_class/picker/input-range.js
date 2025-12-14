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
var react_1 = __importStar(require("react"));
var IconClose_1 = __importDefault(require("../../../icon/react-icon-cjs/IconClose"));
var icon_hover_1 = __importDefault(require("../../_class/icon-hover"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var keycode_1 = require("../../_util/keycode");
var omit_1 = __importDefault(require("../../_util/omit"));
var ConfigProvider_1 = require("../../ConfigProvider");
var is_1 = require("../../_util/is");
function DateInput(_a, ref) {
    var _b;
    var allowClear = _a.allowClear, error = _a.error, status = _a.status, style = _a.style, className = _a.className, disabled = _a.disabled, _c = _a.placeholder, placeholder = _c === void 0 ? [] : _c, _d = _a.value, value = _d === void 0 ? [] : _d, popupVisible = _a.popupVisible, format = _a.format, propSize = _a.size, onClear = _a.onClear, editable = _a.editable, inputValue = _a.inputValue, onPressEnter = _a.onPressEnter, onPressTab = _a.onPressTab, onChange = _a.onChange, separator = _a.separator, suffixIcon = _a.suffixIcon, changeFocusedInputIndex = _a.changeFocusedInputIndex, focusedInputIndex = _a.focusedInputIndex, isPlaceholder = _a.isPlaceholder, prefix = _a.prefix, _e = _a.inputProps, inputProps = _e === void 0 ? [] : _e, onBlur = _a.onBlur, rest = __rest(_a, ["allowClear", "error", "status", "style", "className", "disabled", "placeholder", "value", "popupVisible", "format", "size", "onClear", "editable", "inputValue", "onPressEnter", "onPressTab", "onChange", "separator", "suffixIcon", "changeFocusedInputIndex", "focusedInputIndex", "isPlaceholder", "prefix", "inputProps", "onBlur"]);
    var _f = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _f.getPrefixCls, ctxSize = _f.size, locale = _f.locale, rtl = _f.rtl;
    var input0 = (0, react_1.useRef)(null);
    var input1 = (0, react_1.useRef)(null);
    var refRootWrapper = (0, react_1.useRef)(null);
    var _g = __read((0, react_1.useState)([false, false]), 2), focused = _g[0], setFocused = _g[1];
    var disabled1 = (0, is_1.isArray)(disabled) ? disabled[0] : disabled;
    var disabled2 = (0, is_1.isArray)(disabled) ? disabled[1] : disabled;
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        focus: function (index) {
            var focusedIndex = typeof index === 'number' ? index : focusedInputIndex;
            var focusElement = focusedIndex === 0 ? input0 : input1;
            if ((focusedInputIndex === 0 && !disabled1) || (focusedInputIndex === 1 && !disabled2)) {
                focusElement.current && focusElement.current.focus && focusElement.current.focus();
            }
        },
        blur: function () {
            if (focusedInputIndex === 0) {
                input0.current && input0.current.blur && input0.current.blur();
            }
            if (focusedInputIndex === 1) {
                input1.current && input1.current.blur && input1.current.blur();
            }
        },
        getRootDOMNode: function () {
            return refRootWrapper.current;
        },
    }); });
    function changeFocusedInput(e, index) {
        var _a, _b;
        (_b = (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps[index]) === null || _a === void 0 ? void 0 : _a.onClick) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        if (focusedInputIndex !== index) {
            changeFocusedInputIndex(index);
        }
    }
    function onKeyDown(e, index) {
        var _a, _b;
        var keyCode = e.keyCode || e.which;
        (_b = (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps[index]) === null || _a === void 0 ? void 0 : _a.onKeyDown) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        if (keyCode === keycode_1.Enter.code) {
            onPressEnter === null || onPressEnter === void 0 ? void 0 : onPressEnter();
        }
        if (keyCode === keycode_1.Tab.code) {
            // e.preventDefault(); // fix: cannot move focus away from the component with tab
            onPressTab && onPressTab(e);
        }
    }
    function onChangeInput(e, index) {
        var _a, _b;
        e.stopPropagation();
        (_b = (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps[index]) === null || _a === void 0 ? void 0 : _a.onChange) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        onChange && onChange(e);
    }
    function onBlurInput(e, index) {
        var _a, _b;
        setFocused(function (prev) {
            prev[index] = false;
            return __spreadArray([], __read(prev), false);
        });
        (_b = (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps[index]) === null || _a === void 0 ? void 0 : _a.onBlur) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
    }
    function onFocusInput(e, index) {
        var _a, _b;
        if (index === 0 || index === 1) {
            setFocused(function (prev) {
                prev[index] = true;
                return __spreadArray([], __read(prev), false);
            });
            if (focusedInputIndex !== index) {
                changeFocusedInputIndex(index, true);
            }
        }
        (_b = (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps[index]) === null || _a === void 0 ? void 0 : _a.onFocus) === null || _b === void 0 ? void 0 : _b.call(_a, e);
    }
    var prefixCls = getPrefixCls('picker');
    var size = propSize || ctxSize;
    var mergedFocused = focused[0] || focused[1] || !!popupVisible;
    var inputStatus = status || (error ? 'error' : undefined);
    var inputClassNames = (0, classNames_1.default)(prefixCls, prefixCls + "-range", prefixCls + "-size-" + size, (_b = {},
        _b[prefixCls + "-focused"] = mergedFocused,
        _b[prefixCls + "-disabled"] = disabled1 && disabled2,
        _b[prefixCls + "-" + inputStatus] = inputStatus,
        _b[prefixCls + "-rtl"] = rtl,
        _b[prefixCls + "-has-prefix"] = prefix,
        _b), className);
    var getInputValue = function (index) {
        var valueText = value[index]
            ? value[index].locale(locale.dayjsLocale).format((0, is_1.isArray)(format) ? format[index] : format)
            : '';
        if (inputValue) {
            return index === focusedInputIndex ? inputValue : valueText;
        }
        return valueText;
    };
    var readOnlyProps = editable ? {} : { readOnly: true };
    function getFocusInputClassName(index) {
        var _a;
        return (0, classNames_1.default)(prefixCls + "-input", (_a = {},
            _a[prefixCls + "-input-active"] = focusedInputIndex === index,
            _a[prefixCls + "-input-placeholder"] = isPlaceholder && focusedInputIndex === index,
            _a));
    }
    return (react_1.default.createElement("div", __assign({ style: style, ref: refRootWrapper, className: inputClassNames }, (0, omit_1.default)(rest, ['onChange', 'onPressEnter'])),
        prefix && react_1.default.createElement("div", { className: prefixCls + "-prefix" }, prefix),
        react_1.default.createElement("div", { className: getFocusInputClassName(0) },
            react_1.default.createElement("input", __assign({ ref: input0 }, inputProps[0], { disabled: disabled1, placeholder: placeholder[0], value: getInputValue(0), onChange: function (e) { return onChangeInput(e, 0); }, onKeyDown: function (e) { return onKeyDown(e, 0); }, onClick: function (e) { return changeFocusedInput(e, 0); }, onBlur: function (e) { return onBlurInput(e, 0); }, onFocus: function (e) { return onFocusInput(e, 0); } }, readOnlyProps))),
        react_1.default.createElement("span", { className: prefixCls + "-separator" }, separator || '-'),
        react_1.default.createElement("div", { className: getFocusInputClassName(1) },
            react_1.default.createElement("input", __assign({ ref: input1 }, inputProps[1], { disabled: disabled2, placeholder: placeholder[1], value: getInputValue(1), onChange: function (e) { return onChangeInput(e, 1); }, onKeyDown: function (e) { return onKeyDown(e, 1); }, onClick: function (e) { return changeFocusedInput(e, 1); }, onBlur: function (e) { return onBlurInput(e, 1); }, onFocus: function (e) { return onFocusInput(e, 1); } }, readOnlyProps))),
        react_1.default.createElement("div", { className: prefixCls + "-suffix" },
            allowClear && value.length === 2 && (react_1.default.createElement(icon_hover_1.default, { prefix: prefixCls, onClick: onClear, className: prefixCls + "-clear-icon" },
                react_1.default.createElement(IconClose_1.default, null))),
            react_1.default.createElement("span", { className: prefixCls + "-suffix-icon" }, suffixIcon))));
}
exports.default = (0, react_1.forwardRef)(DateInput);
