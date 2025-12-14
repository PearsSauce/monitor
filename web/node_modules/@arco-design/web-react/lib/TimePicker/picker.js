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
var classNames_1 = __importDefault(require("../_util/classNames"));
var Trigger_1 = __importDefault(require("../Trigger"));
var is_1 = require("../_util/is");
var ConfigProvider_1 = require("../ConfigProvider");
var dayjs_1 = require("../_util/dayjs");
var IconClockCircle_1 = __importDefault(require("../../icon/react-icon-cjs/IconClockCircle"));
var input_1 = __importDefault(require("../_class/picker/input"));
var input_range_1 = __importDefault(require("../_class/picker/input-range"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var usePrevious_1 = __importDefault(require("../_util/hooks/usePrevious"));
var useUpdate_1 = __importDefault(require("../_util/hooks/useUpdate"));
var context_1 = __importDefault(require("./context"));
var util_1 = require("./util");
var pick_1 = require("../_util/pick");
function getFormat(props) {
    return props.format || 'HH:mm:ss';
}
var defaultProps = {
    allowClear: true,
    position: 'bl',
    format: 'HH:mm:ss',
    editable: true,
    order: true,
    scrollSticky: true,
};
var triggerPopupAlign = { bottom: 4 };
var Picker = function (baseProps) {
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), locale = _a.locale, getPrefixCls = _a.getPrefixCls, componentConfig = _a.componentConfig, rtl = _a.rtl;
    if (rtl) {
        defaultProps.position = 'br';
    }
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.TimePicker);
    var _b = props.allowClear, allowClear = _b === void 0 ? true : _b, className = props.className, disableConfirm = props.disableConfirm, style = props.style, placeholder = props.placeholder, getPopupContainer = props.getPopupContainer, disabled = props.disabled, position = props.position, isRangePicker = props.isRangePicker, picker = props.picker, error = props.error, status = props.status, triggerElement = props.triggerElement, triggerProps = props.triggerProps, propsValue = props.value, onChange = props.onChange, icons = props.icons, size = props.size, editable = props.editable, unmountOnExit = props.unmountOnExit, order = props.order, utcOffset = props.utcOffset, timezone = props.timezone;
    var format = getFormat(props);
    var prefixCls = getPrefixCls('timepicker');
    function getDefaultValue() {
        var value;
        if (props.value) {
            value = (0, dayjs_1.getDayjsValue)(props.value, format, utcOffset, timezone);
        }
        else if (props.defaultValue) {
            value = (0, dayjs_1.getDayjsValue)(props.defaultValue, format, utcOffset, timezone);
        }
        return value;
    }
    var _c = __read((0, react_1.useState)(false), 2), popupVisible = _c[0], setPopupVisible = _c[1];
    var _d = __read((0, react_1.useState)(getDefaultValue()), 2), value = _d[0], setValue = _d[1];
    var _e = __read((0, react_1.useState)(), 2), valueShow = _e[0], setValueShow = _e[1];
    var _f = __read((0, react_1.useState)(), 2), inputValue = _f[0], setInputValue = _f[1];
    var _g = __read((0, react_1.useState)(0), 2), focusedInputIndex = _g[0], setFocusedInputIndex = _g[1];
    // controlled mode / uncontrolled mode
    var mergedValue = 'value' in props ? (0, dayjs_1.getDayjsValue)(propsValue, format, utcOffset, timezone) : value;
    var mergedPopupVisible = 'popupVisible' in props ? props.popupVisible : popupVisible;
    var previousUtcOffset = (0, usePrevious_1.default)(utcOffset);
    var previousTimezone = (0, usePrevious_1.default)(timezone);
    // when timezone or utcOffset change changed
    (0, useUpdate_1.default)(function () {
        if (value && (previousUtcOffset !== utcOffset || timezone !== previousTimezone)) {
            var localValue = (0, is_1.isArray)(value)
                ? value.map(function (v) { return (0, dayjs_1.toLocal)(v, previousUtcOffset, previousTimezone); })
                : (0, dayjs_1.toLocal)(value, previousUtcOffset, previousTimezone);
            var zoneValue = (0, is_1.isArray)(localValue)
                ? localValue.map(function (v) { return (0, dayjs_1.toTimezone)(v, utcOffset, timezone); })
                : (0, dayjs_1.toTimezone)(localValue, utcOffset, timezone);
            setValue(zoneValue);
        }
    }, [utcOffset, previousUtcOffset, timezone, previousTimezone]);
    var refInput = (0, react_1.useRef)(null);
    function focusInput(index) {
        refInput.current && refInput.current.focus && refInput.current.focus(index);
    }
    function changeFocusedInputIndex(index) {
        setFocusedInputIndex(index);
        setTimeout(function () { return focusInput(index); });
    }
    function onVisibleChange(visible) {
        if (visible) {
            setOpen(visible, function () {
                setTimeout(function () { return focusInput(); });
            });
        }
        else {
            setOpen(false);
        }
    }
    function setOpen(visible, callback) {
        setPopupVisible(visible);
        setInputValue(undefined);
        callback === null || callback === void 0 ? void 0 : callback();
        if (!visible) {
            setValueShow(undefined);
        }
    }
    function onConfirmValue(vs) {
        var newValue = isRangePicker && order && (0, is_1.isArray)(vs)
            ? (0, dayjs_1.getSortedDayjsArray)(vs.map(function (v) { return (0, util_1.getFormatTime)(v); }))
            : vs;
        setValue(newValue);
        setValueShow(undefined);
        setInputValue(undefined);
        onHandleChange(newValue);
        if (!disableConfirm) {
            setOpen(false);
        }
    }
    function onHandleChange(vs) {
        if ((0, is_1.isArray)(vs) && (0, dayjs_1.isDayjsArrayChange)(mergedValue, vs)) {
            onChange &&
                onChange(vs.map(function (t) { return (0, dayjs_1.toLocal)(t, utcOffset, timezone).format(format); }), vs.map(function (t) { return (0, dayjs_1.toLocal)(t, utcOffset, timezone); }));
        }
        if ((0, is_1.isDayjs)(vs) && (0, dayjs_1.isDayjsChange)(mergedValue, vs)) {
            onChange &&
                onChange((0, dayjs_1.toLocal)(vs, utcOffset, timezone).format(format), (0, dayjs_1.toLocal)(vs, utcOffset, timezone));
        }
    }
    function renderPopup(panelOnly) {
        var vs = isRangePicker
            ? (0, is_1.isArray)(valueShow) && valueShow.length
                ? valueShow
                : mergedValue
            : valueShow || mergedValue;
        return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-container", panelOnly ? className : ''), style: panelOnly ? style : {}, onClick: function () { return focusInput(); } }, react_1.default.cloneElement(picker, __assign(__assign({}, props), { format: format, inputValue: inputValue, setInputValue: setInputValue, onConfirmValue: onConfirmValue, setValueShow: setValueShow, valueShow: vs, value: mergedValue, popupVisible: mergedPopupVisible, focusedInputIndex: focusedInputIndex, changeFocusedInputIndex: changeFocusedInputIndex }))));
    }
    function onChangeInput(e) {
        var newInputValue = e.target.value;
        if (!popupVisible) {
            setPopupVisible(true);
        }
        setInputValue(newInputValue);
        confirmInputValue(newInputValue);
    }
    function confirmInputValue(newInputValue) {
        var newInputDayjs = (0, dayjs_1.getDayjsValue)(newInputValue, format);
        if (isRangePicker) {
            var newValueShow = __spreadArray([], __read(((0, is_1.isArray)(valueShow) ? valueShow : value || [])), false);
            if ((0, dayjs_1.isValidTimeString)(newInputValue, format)) {
                newValueShow[focusedInputIndex] = newInputDayjs;
                var localDayjsArray = newValueShow.map(function (nv) { return (0, dayjs_1.toLocal)(nv, utcOffset, timezone); });
                props.onSelect &&
                    props.onSelect(localDayjsArray.map(function (la) { return la && la.format(format); }), localDayjsArray);
                setValueShow(newValueShow);
                setInputValue(undefined);
            }
        }
        else if ((0, dayjs_1.isValidTimeString)(newInputValue, format)) {
            var localDayjs = (0, dayjs_1.toLocal)(newInputDayjs, utcOffset, timezone);
            props.onSelect && props.onSelect(localDayjs.format(format), localDayjs);
            setValueShow(newInputDayjs);
            setInputValue(undefined);
        }
    }
    function onPressEnter() {
        if (isRangePicker) {
            if ((0, is_1.isArray)(valueShow) && valueShow.length) {
                if (inputValue && !(0, dayjs_1.isValidTimeString)(inputValue, format)) {
                    setOpen(false);
                }
                else if (valueShow[0] === undefined || valueShow[1] === undefined) {
                    changeFocusedInputIndex(focusedInputIndex === 0 ? 1 : 0);
                }
                else if (valueShow.length === 2) {
                    onConfirmValue(valueShow);
                }
            }
            else {
                setOpen(false);
            }
        }
        else {
            onConfirmValue(valueShow || mergedValue);
        }
    }
    function onClear(e) {
        e.stopPropagation();
        onConfirmValue(undefined);
        onChange && onChange(undefined, undefined);
        props.onClear && props.onClear();
    }
    var rangePickerPlaceholder = isRangePicker && (0, is_1.isArray)(placeholder) ? placeholder : locale.TimePicker.placeholders;
    var inputPlaceHolder = placeholder || locale.TimePicker.placeholder;
    var suffixIcon = (icons && icons.inputSuffix) || react_1.default.createElement(IconClockCircle_1.default, null);
    var baseInputProps = __assign({ style: style, className: className, popupVisible: mergedPopupVisible, format: format, disabled: disabled, error: error, status: status, size: size, onPressEnter: onPressEnter, onClear: onClear, suffixIcon: suffixIcon, editable: editable, allowClear: allowClear, prefix: props.prefix }, (0, pick_1.pickDataAttributes)(props));
    return (react_1.default.createElement(context_1.default.Provider, { value: { utcOffset: utcOffset, timezone: timezone } }, triggerElement === null ? (renderPopup(true)) : (react_1.default.createElement(Trigger_1.default, __assign({ popup: function () { return renderPopup(); }, trigger: "click", clickToClose: false, position: position, disabled: disabled, popupAlign: triggerPopupAlign, getPopupContainer: getPopupContainer, onVisibleChange: onVisibleChange, popupVisible: mergedPopupVisible, classNames: "slideDynamicOrigin", unmountOnExit: !!unmountOnExit }, triggerProps), triggerElement ||
        (isRangePicker ? (react_1.default.createElement(input_range_1.default, __assign({}, baseInputProps, { ref: refInput, placeholder: rangePickerPlaceholder, value: ((0, is_1.isArray)(valueShow) && valueShow.length ? valueShow : mergedValue), onChange: onChangeInput, inputValue: inputValue, changeFocusedInputIndex: changeFocusedInputIndex, focusedInputIndex: focusedInputIndex }))) : (react_1.default.createElement(input_1.default, __assign({}, baseInputProps, { ref: refInput, placeholder: inputPlaceHolder, value: (valueShow || mergedValue), inputValue: inputValue, onChange: onChangeInput }))))))));
};
exports.default = Picker;
