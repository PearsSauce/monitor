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
var omit_1 = __importDefault(require("../../_util/omit"));
var keycode_1 = require("../../_util/keycode");
var ConfigProvider_1 = require("../../ConfigProvider");
var IconClose_1 = __importDefault(require("../../../icon/react-icon-cjs/IconClose"));
var icon_hover_1 = __importDefault(require("../../_class/icon-hover"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var is_1 = require("../../_util/is");
function DateInput(_a, ref) {
    var _b, _c;
    var style = _a.style, className = _a.className, propPrefixCls = _a.prefixCls, allowClear = _a.allowClear, status = _a.status, error = _a.error, disabled = _a.disabled, placeholder = _a.placeholder, format = _a.format, propSize = _a.size, onClear = _a.onClear, editable = _a.editable, value = _a.value, inputValue = _a.inputValue, onPressEnter = _a.onPressEnter, suffixIcon = _a.suffixIcon, prefix = _a.prefix, onChange = _a.onChange, popupVisible = _a.popupVisible, isPlaceholder = _a.isPlaceholder, inputProps = _a.inputProps, rest = __rest(_a, ["style", "className", "prefixCls", "allowClear", "status", "error", "disabled", "placeholder", "format", "size", "onClear", "editable", "value", "inputValue", "onPressEnter", "suffixIcon", "prefix", "onChange", "popupVisible", "isPlaceholder", "inputProps"]);
    var _d = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _d.getPrefixCls, ctxSize = _d.size, locale = _d.locale, rtl = _d.rtl;
    var input = (0, react_1.useRef)(null);
    var _e = __read((0, react_1.useState)(false), 2), focused = _e[0], setFocused = _e[1];
    var size = propSize || ctxSize;
    var inputWrapperRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        focus: function () {
            input.current && input.current.focus && input.current.focus();
        },
        blur: function () {
            input.current && input.current.blur && input.current.blur();
        },
        getRootDOMNode: function () { return inputWrapperRef.current; },
    }); });
    function onKeyDown(e) {
        var _a;
        (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onKeyDown) === null || _a === void 0 ? void 0 : _a.call(inputProps, e);
        var keyCode = e.keyCode || e.which;
        if (keyCode === keycode_1.Enter.code) {
            onPressEnter === null || onPressEnter === void 0 ? void 0 : onPressEnter();
        }
    }
    function onChangeInput(e) {
        var _a;
        (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onChange) === null || _a === void 0 ? void 0 : _a.call(inputProps, e);
        onChange === null || onChange === void 0 ? void 0 : onChange(e);
    }
    var showValue = '';
    if (inputValue !== undefined) {
        showValue = inputValue;
    }
    else if (value && !(0, is_1.isArray)(value)) {
        showValue =
            typeof format === 'function'
                ? format(value)
                : value.locale(locale.dayjsLocale).format(format);
    }
    var readOnlyProps = editable ? {} : { readOnly: true };
    var prefixCls = propPrefixCls || getPrefixCls('picker');
    var inputStatus = status || (error ? 'error' : undefined);
    var mergedFocused = focused || popupVisible;
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-size-" + size, (_b = {},
        _b[prefixCls + "-focused"] = mergedFocused,
        _b[prefixCls + "-disabled"] = disabled,
        _b[prefixCls + "-has-prefix"] = prefix,
        _b[prefixCls + "-" + inputStatus] = inputStatus,
        _b[prefixCls + "-rtl"] = rtl,
        _b), className);
    return (react_1.default.createElement("div", __assign({ style: style, className: classNames, ref: inputWrapperRef }, (0, omit_1.default)(rest, ['onChange', 'onPressEnter'])),
        prefix && react_1.default.createElement("div", { className: prefixCls + "-prefix" }, prefix),
        react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-input", (_c = {}, _c[prefixCls + "-input-placeholder"] = isPlaceholder, _c)) },
            react_1.default.createElement("input", __assign({ ref: input }, inputProps, { disabled: disabled, placeholder: placeholder, className: prefixCls + "-start-time", value: showValue, onKeyDown: onKeyDown, onChange: onChangeInput }, readOnlyProps, { onFocus: function (e) {
                    var _a;
                    setFocused(true);
                    (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onFocus) === null || _a === void 0 ? void 0 : _a.call(inputProps, e);
                }, onBlur: function (e) {
                    var _a;
                    setFocused(false);
                    (_a = inputProps === null || inputProps === void 0 ? void 0 : inputProps.onBlur) === null || _a === void 0 ? void 0 : _a.call(inputProps, e);
                } }))),
        react_1.default.createElement("div", { className: prefixCls + "-suffix" },
            allowClear && showValue && (react_1.default.createElement(icon_hover_1.default, { prefix: prefixCls, onClick: onClear, className: prefixCls + "-clear-icon" },
                react_1.default.createElement(IconClose_1.default, null))),
            react_1.default.createElement("span", { className: prefixCls + "-suffix-icon" }, suffixIcon))));
}
exports.default = (0, react_1.forwardRef)(DateInput);
