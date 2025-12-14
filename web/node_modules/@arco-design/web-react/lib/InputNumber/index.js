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
var IconUp_1 = __importDefault(require("../../icon/react-icon-cjs/IconUp"));
var IconDown_1 = __importDefault(require("../../icon/react-icon-cjs/IconDown"));
var IconPlus_1 = __importDefault(require("../../icon/react-icon-cjs/IconPlus"));
var IconMinus_1 = __importDefault(require("../../icon/react-icon-cjs/IconMinus"));
var is_1 = require("../_util/is");
var classNames_1 = __importDefault(require("../_util/classNames"));
var keycode_1 = require("../_util/keycode");
var ConfigProvider_1 = require("../ConfigProvider");
var Input_1 = __importDefault(require("../Input"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var omit_1 = __importDefault(require("../_util/omit"));
var useSelectionRange_1 = __importDefault(require("./useSelectionRange"));
var Decimal_1 = require("./Decimal");
// Value's auto change speed when user holds on plus or minus
var AUTO_CHANGE_INTERVAL = 200;
// Delay to auto change value when user holds on plus or minus
var AUTO_CHANGE_START_DELAY = 1000;
var defaultProps = {
    max: Infinity,
    min: -Infinity,
    step: 1,
    mode: 'embed',
    parser: function (input) { return (input === null || input === void 0 ? void 0 : input.replace(/[^\w\.-]+/g, '')) || ''; },
};
function InputNumber(baseProps, ref) {
    var _a;
    var _b;
    var _c = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _c.getPrefixCls, ctxSize = _c.size, componentConfig = _c.componentConfig, rtl = _c.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.InputNumber);
    var className = props.className, style = props.style, defaultValue = props.defaultValue, disabled = props.disabled, error = props.error, readOnly = props.readOnly, strictMode = props.strictMode, placeholder = props.placeholder, hideControl = props.hideControl, suffix = props.suffix, prefix = props.prefix, icons = props.icons, mode = props.mode, size = props.size, step = props.step, precision = props.precision, min = props.min, max = props.max, parser = props.parser, formatter = props.formatter, onBlur = props.onBlur, onFocus = props.onFocus, onChange = props.onChange, onKeyDown = props.onKeyDown, rest = __rest(props, ["className", "style", "defaultValue", "disabled", "error", "readOnly", "strictMode", "placeholder", "hideControl", "suffix", "prefix", "icons", "mode", "size", "step", "precision", "min", "max", "parser", "formatter", "onBlur", "onFocus", "onChange", "onKeyDown"]);
    var prefixCls = getPrefixCls('input-number');
    var mergedSize = size || ctxSize;
    var mergedPrecision = (function () {
        if ((0, is_1.isNumber)(precision)) {
            var decimal = ("" + step).split('.')[1];
            var stepPrecision = (decimal && decimal.length) || 0;
            return Math.max(stepPrecision, precision);
        }
        return null;
    })();
    var _d = __read((0, react_1.useState)(function () {
        return (0, Decimal_1.getDecimal)('value' in props ? props.value : 'defaultValue' in props ? defaultValue : undefined);
    }), 2), innerValue = _d[0], setInnerValue = _d[1];
    var _e = __read((0, react_1.useState)(''), 2), inputValue = _e[0], setInputValue = _e[1];
    var _f = __read((0, react_1.useState)(false), 2), isOutOfRange = _f[0], setIsOutOfRange = _f[1];
    var _g = __read((0, react_1.useState)(false), 2), isUserTyping = _g[0], setIsUserTyping = _g[1];
    var refAutoTimer = (0, react_1.useRef)(null);
    var refInput = (0, react_1.useRef)(null);
    // Ref to keep track of whether user has taken operations since the last change of prop value
    var refHasOperateSincePropValueChanged = (0, react_1.useRef)(false);
    var value = (0, react_1.useMemo)(function () {
        return 'value' in props ? (0, Decimal_1.getDecimal)(props.value) : innerValue;
    }, [props.value, innerValue]);
    var _h = __read((0, react_1.useMemo)(function () {
        return [(0, Decimal_1.getDecimal)(max), (0, Decimal_1.getDecimal)(min)];
    }, [max, min]), 2), maxDecimal = _h[0], minDecimal = _h[1];
    (0, react_1.useImperativeHandle)(ref, function () { return refInput.current; }, []);
    var setValue = function (newValue, reason) {
        setInnerValue(newValue);
        if (!newValue.equals(value) && onChange) {
            var newValueStr = newValue.toString({ safe: true, precision: mergedPrecision });
            onChange(newValue.isEmpty
                ? undefined
                : strictMode
                    ? newValueStr
                    : newValue.isNaN
                        ? NaN
                        : Number(newValueStr), reason);
        }
    };
    var stop = function () {
        refAutoTimer.current && clearTimeout(refAutoTimer.current);
        refAutoTimer.current = null;
    };
    var getLegalValue = (0, react_1.useCallback)(function (changedValue) {
        var finalValue = changedValue;
        if (finalValue.less(minDecimal)) {
            finalValue = minDecimal;
        }
        else if (maxDecimal.less(finalValue)) {
            finalValue = maxDecimal;
        }
        return finalValue;
    }, [minDecimal, maxDecimal]);
    (0, react_1.useEffect)(function () {
        return function () { return stop(); };
    }, []);
    (0, react_1.useEffect)(function () {
        refHasOperateSincePropValueChanged.current = false;
    }, [props.value]);
    (0, react_1.useEffect)(function () {
        var _isOutOfRange = value.less(minDecimal) || maxDecimal.less(value);
        // Don't correct the illegal value caused by prop value. Wait for user to take actions.
        if (_isOutOfRange && refHasOperateSincePropValueChanged.current) {
            setValue(getLegalValue(value), 'outOfRange');
        }
        setIsOutOfRange(_isOutOfRange);
    }, [minDecimal, maxDecimal, value, getLegalValue]);
    var handleArrowKey = function (event, method, needRepeat) {
        if (needRepeat === void 0) { needRepeat = false; }
        event.persist();
        event.preventDefault();
        setIsUserTyping(false);
        if (disabled || readOnly) {
            return;
        }
        var finalValue = value.isInvalid
            ? (0, Decimal_1.getDecimal)(min === -Infinity || (min <= 0 && max >= 0) ? 0 : min)
            : value.add(method === 'plus' ? step : -step);
        setValue(getLegalValue(finalValue), method === 'plus' ? 'increase' : 'decrease');
        refInput.current && refInput.current.focus();
        // auto change while holding
        if (needRepeat) {
            var isFirstRepeat = refAutoTimer.current === null;
            refAutoTimer.current = setTimeout(function () { return event.target.dispatchEvent(event.nativeEvent); }, isFirstRepeat ? AUTO_CHANGE_START_DELAY : AUTO_CHANGE_INTERVAL);
        }
    };
    var displayedInputValue = (0, react_1.useMemo)(function () {
        var _value;
        if (isUserTyping) {
            _value = parser ? "" + parser(inputValue) : inputValue;
        }
        else if ((0, is_1.isNumber)(mergedPrecision)) {
            _value = value.toString({ safe: true, precision: mergedPrecision });
        }
        else if (value.isInvalid) {
            _value = '';
        }
        else {
            _value = value.toString();
        }
        return formatter ? formatter(_value, { userTyping: isUserTyping, input: inputValue }) : _value;
    }, [value, inputValue, isUserTyping, mergedPrecision, parser, formatter]);
    var updateSelectionRangePosition = (0, useSelectionRange_1.default)({
        inputElement: (_b = refInput.current) === null || _b === void 0 ? void 0 : _b.dom,
        inputValue: displayedInputValue,
    });
    var inputEventHandlers = {
        onChange: function (rawText, event) {
            setIsUserTyping(true);
            rawText = rawText.trim().replace(/。/g, '.');
            var parsedValue = parser ? parser(rawText) : rawText;
            if ((0, is_1.isNumber)(+parsedValue) || parsedValue === '-' || !parsedValue || parsedValue === '.') {
                setInputValue(rawText);
                setValue(getLegalValue((0, Decimal_1.getDecimal)(parsedValue)), 'manual');
                updateSelectionRangePosition(event);
            }
        },
        onKeyDown: function (e) {
            var key = e.key;
            if (key === keycode_1.ArrowDown.key) {
                e.stopPropagation();
                handleArrowKey(e, 'minus');
            }
            else if (key === keycode_1.ArrowUp.key) {
                e.stopPropagation();
                handleArrowKey(e, 'plus');
            }
            stop();
            onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
        },
        onFocus: function (e) {
            var _a, _b;
            // Both tab and button click trigger focus event. This can be used to determine whether user has taken operations
            refHasOperateSincePropValueChanged.current = true;
            setInputValue((_b = (_a = refInput.current) === null || _a === void 0 ? void 0 : _a.dom) === null || _b === void 0 ? void 0 : _b.value);
            onFocus === null || onFocus === void 0 ? void 0 : onFocus(e);
        },
        onBlur: function (e) {
            setValue(getLegalValue(value), 'outOfRange');
            setIsUserTyping(false);
            onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
        },
    };
    var getControlButtonEventsHandlers = function (method) {
        return readOnly
            ? {}
            : {
                onMouseDown: function (e) { return handleArrowKey(e, method, true); },
            };
    };
    var shouldRenderButton = !hideControl && mode === 'button';
    var shouldRenderLayer = !hideControl && !readOnly && mode === 'embed';
    var renderStepButton = function (method, icon) {
        var _a;
        var isStepButtonValid = !disabled &&
            (value.isInvalid ||
                (method === 'plus'
                    ? maxDecimal.isInvalid || value.less(maxDecimal)
                    : minDecimal.isInvalid || minDecimal.less(value)));
        return (react_1.default.createElement("div", __assign({ className: (0, classNames_1.default)(prefixCls + "-step-button", (_a = {},
                _a[prefixCls + "-step-button-disabled"] = !isStepButtonValid,
                _a)), onMouseLeave: stop, onMouseUp: stop }, (isStepButtonValid ? getControlButtonEventsHandlers(method) : {})), icon));
    };
    return (react_1.default.createElement(Input_1.default, __assign({ _ignorePropsFromGlobal: true, role: "spinbutton", "aria-valuemax": max, "aria-valuemin": min, "aria-valuenow": value.isEmpty ? undefined : value.toNumber() }, (0, omit_1.default)(rest, ['allowClear']), inputEventHandlers, { style: style, className: (0, classNames_1.default)(prefixCls, prefixCls + "-mode-" + mode, prefixCls + "-size-" + mergedSize, (_a = {},
            _a[prefixCls + "-rtl"] = rtl,
            _a[prefixCls + "-readonly"] = readOnly,
            _a[prefixCls + "-illegal-value"] = !value.isEmpty && isOutOfRange,
            _a), className), ref: refInput, size: mergedSize, error: error, disabled: disabled, readOnly: readOnly, value: displayedInputValue, placeholder: placeholder, prefix: prefix && react_1.default.createElement("div", { className: prefixCls + "-prefix" }, prefix), suffix: react_1.default.createElement(react_1.default.Fragment, null,
            shouldRenderLayer && (react_1.default.createElement("div", { className: prefixCls + "-step-layer" },
                renderStepButton('plus', icons && icons.up ? icons.up : react_1.default.createElement(IconUp_1.default, null)),
                renderStepButton('minus', icons && icons.down ? icons.down : react_1.default.createElement(IconDown_1.default, null)))),
            suffix && react_1.default.createElement("div", { className: prefixCls + "-suffix" }, suffix)), addBefore: shouldRenderButton &&
            renderStepButton('minus', icons && icons.minus ? icons.minus : react_1.default.createElement(IconMinus_1.default, null)), addAfter: shouldRenderButton &&
            renderStepButton('plus', icons && icons.plus ? icons.plus : react_1.default.createElement(IconPlus_1.default, null)) })));
}
var InputNumberComponent = react_1.default.forwardRef(InputNumber);
InputNumberComponent.displayName = 'InputNumber';
exports.default = InputNumberComponent;
