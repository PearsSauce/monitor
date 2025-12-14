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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var pad_1 = require("../_util/pad");
var util_1 = require("./util");
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var dayjs_1 = require("../_util/dayjs");
var Button_1 = __importDefault(require("../Button"));
var time_column_1 = __importDefault(require("./time-column"));
var context_1 = __importDefault(require("./context"));
var AMPM = ['am', 'pm'];
function isUse12Hours(props) {
    var _a;
    return (_a = props.use12Hours) !== null && _a !== void 0 ? _a : (0, util_1.getColumnsFromFormat)(props.format).use12Hours;
}
function TimePicker(props) {
    var _a = props.format, format = _a === void 0 ? 'HH:mm:ss' : _a, onSelect = props.onSelect, popupVisible = props.popupVisible, _b = props.step, step = _b === void 0 ? {} : _b, disabledHours = props.disabledHours, disabledMinutes = props.disabledMinutes, disabledSeconds = props.disabledSeconds, hideDisabledOptions = props.hideDisabledOptions, onConfirmValue = props.onConfirmValue, isRangePicker = props.isRangePicker, confirmBtnDisabled = props.confirmBtnDisabled, propsValueShow = props.valueShow, setValueShow = props.setValueShow, extra = props.extra, disableConfirm = props.disableConfirm, hideFooter = props.hideFooter, _c = props.showNowBtn, showNowBtn = _c === void 0 ? true : _c, scrollSticky = props.scrollSticky;
    var _d = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _d.getPrefixCls, locale = _d.locale;
    var prefixCls = getPrefixCls('timepicker');
    var _e = (0, react_1.useContext)(context_1.default), utcOffset = _e.utcOffset, timezone = _e.timezone;
    var valueShow = (0, dayjs_1.getDayjsValue)(propsValueShow, format);
    var ampm = valueShow && valueShow.hour() >= 12 ? 'pm' : 'am';
    var use12Hours = isUse12Hours(props);
    var getShowList = (0, react_1.useCallback)(function (type) {
        var stepHour = step.hour || 1;
        var stepMinute = step.minute || 1;
        var stepSecond = step.second || 1;
        var list = [];
        if (type === 'hour') {
            for (var i = 0; i < (use12Hours ? 12 : 24); i += stepHour) {
                list.push(i);
            }
            if (use12Hours) {
                list[0] = 12;
            }
        }
        if (type === 'minute') {
            for (var i = 0; i < 60; i += stepMinute) {
                list.push(i);
            }
        }
        if (type === 'second') {
            for (var i = 0; i < 60; i += stepSecond) {
                list.push(i);
            }
        }
        return list;
    }, [step.hour, step.minute, step.second, use12Hours]);
    var HOURS = getShowList('hour');
    var MINUTES = getShowList('minute');
    var SECONDS = getShowList('second');
    var selectedHour = valueShow && valueShow.hour();
    selectedHour = use12Hours ? (selectedHour > 12 ? selectedHour - 12 : selectedHour) : selectedHour;
    if (use12Hours && selectedHour === 0 && ampm === 'am') {
        selectedHour += 12;
    }
    var selectedMinute = valueShow && valueShow.minute();
    var selectedSecond = valueShow && valueShow.second();
    var getDefaultStr = (0, react_1.useCallback)(function (type) {
        switch (type) {
            case 'hour':
                return typeof disabledHours === 'function'
                    ? (0, pad_1.padStart)(HOURS.find(function (h) { return disabledHours().indexOf(h) === -1; }) || 0, 2, '0')
                    : (0, pad_1.padStart)(HOURS[0], 2, '0');
            case 'minute':
                return typeof disabledMinutes === 'function'
                    ? (0, pad_1.padStart)(MINUTES.find(function (m) { return disabledMinutes(selectedHour).indexOf(m) === -1; }) || 0, 2, '0')
                    : (0, pad_1.padStart)(MINUTES[0], 2, '0');
            case 'second':
                return typeof disabledSeconds === 'function'
                    ? (0, pad_1.padStart)(SECONDS.find(function (s) { return disabledSeconds(selectedHour, selectedMinute).indexOf(s) === -1; }) || 0, 2, '0')
                    : (0, pad_1.padStart)(SECONDS[0], 2, '0');
            default:
                return '00';
        }
    }, [
        HOURS,
        MINUTES,
        SECONDS,
        disabledHours,
        disabledMinutes,
        disabledSeconds,
        selectedHour,
        selectedMinute,
    ]);
    function onHandleSelect(selectedValue, unit) {
        var _a, _b, _c;
        var isUpperCase = (0, util_1.getColumnsFromFormat)(format).list.indexOf('A') !== -1;
        var _valueShow = valueShow ||
            (0, dayjs_1.dayjs)(getDefaultStr('hour') + ":" + getDefaultStr('minute') + ":" + getDefaultStr('second'), 'HH:mm:ss');
        var hour = _valueShow.hour();
        var minute = _valueShow.minute();
        var second = _valueShow.second();
        var selectedAmpm = isUpperCase ? ampm.toUpperCase() : ampm;
        var valueFormat = 'HH:mm:ss';
        var newValue;
        if (use12Hours) {
            if (isUpperCase) {
                valueFormat = valueFormat + " A";
            }
            else {
                valueFormat = valueFormat + " a";
            }
        }
        if (use12Hours) {
            hour = hour > 12 ? hour - 12 : hour;
        }
        if (unit === 'hour') {
            if (typeof disabledMinutes === 'function' &&
                disabledMinutes(selectedValue).includes(minute)) {
                minute = (_a = MINUTES.find(function (m) { return disabledMinutes(selectedValue).indexOf(m) === -1; })) !== null && _a !== void 0 ? _a : 0;
            }
            if (typeof disabledSeconds === 'function' &&
                disabledSeconds(selectedValue, minute).includes(second)) {
                second = (_b = SECONDS.find(function (s) { return disabledSeconds(selectedValue, minute).indexOf(s) === -1; })) !== null && _b !== void 0 ? _b : 0;
            }
            newValue = (0, dayjs_1.dayjs)(selectedValue + ":" + minute + ":" + second + " " + selectedAmpm, valueFormat, 'en');
        }
        if (unit === 'minute') {
            if (typeof disabledSeconds === 'function' &&
                disabledSeconds(hour, selectedValue).includes(second)) {
                second = (_c = SECONDS.find(function (s) { return disabledSeconds(hour, selectedValue).indexOf(s) === -1; })) !== null && _c !== void 0 ? _c : 0;
            }
            newValue = (0, dayjs_1.dayjs)(hour + ":" + selectedValue + ":" + second + " " + selectedAmpm, valueFormat, 'en');
        }
        if (unit === 'second') {
            newValue = (0, dayjs_1.dayjs)(hour + ":" + minute + ":" + selectedValue + " " + selectedAmpm, valueFormat, 'en');
        }
        if (unit === 'ampm') {
            newValue = (0, dayjs_1.dayjs)(hour + ":" + minute + ":" + second + " " + (isUpperCase ? selectedValue.toUpperCase() : selectedValue), valueFormat, 'en');
        }
        newValue = (0, dayjs_1.dayjs)(newValue, valueFormat).locale(dayjs_1.dayjs.locale());
        onSelect &&
            onSelect((0, dayjs_1.toLocal)(newValue, utcOffset, timezone).format(format), (0, dayjs_1.toLocal)(newValue, utcOffset, timezone));
        if (!isRangePicker) {
            setValueShow && setValueShow(newValue);
            if (disableConfirm) {
                onConfirmValue(newValue);
            }
        }
    }
    function onConfirmTime() {
        if (valueShow) {
            onConfirmValue(valueShow);
        }
    }
    function onSelectNow() {
        var now = (0, dayjs_1.getNow)();
        var zoneNow = (0, dayjs_1.getNow)(utcOffset, timezone);
        onSelect && onSelect(now.format(format), now);
        if (disableConfirm) {
            onConfirmValue(zoneNow);
        }
        else {
            setValueShow && setValueShow(zoneNow);
        }
    }
    var baseTimeColumnProps = {
        prefixCls: prefixCls,
        onHandleSelect: onHandleSelect,
        popupVisible: popupVisible,
        scrollSticky: scrollSticky,
    };
    function renderHours() {
        var hours = hideDisabledOptions && typeof disabledHours === 'function'
            ? HOURS.filter(function (h) { return disabledHours().indexOf(h) === -1; })
            : HOURS;
        var list = hours.map(function (h) { return ({
            label: (0, pad_1.padStart)("" + h, 2, '0'),
            value: h,
            selected: selectedHour !== undefined && selectedHour === h,
            disabled: typeof disabledHours === 'function' && disabledHours().indexOf(h) !== -1,
        }); });
        return react_1.default.createElement(time_column_1.default, __assign({}, baseTimeColumnProps, { list: list, value: selectedHour, unit: "hour" }));
    }
    function renderMinutes() {
        var minutes = hideDisabledOptions && typeof disabledMinutes === 'function'
            ? MINUTES.filter(function (h) { return disabledMinutes(selectedHour).indexOf(h) === -1; })
            : MINUTES;
        var list = minutes.map(function (m) { return ({
            label: (0, pad_1.padStart)("" + m, 2, '0'),
            value: m,
            selected: selectedHour !== undefined && selectedMinute === m,
            disabled: typeof disabledMinutes === 'function' && disabledMinutes(selectedHour).indexOf(m) !== -1,
        }); });
        return react_1.default.createElement(time_column_1.default, __assign({}, baseTimeColumnProps, { list: list, value: selectedMinute, unit: "minute" }));
    }
    function renderSeconds() {
        var seconds = hideDisabledOptions && typeof disabledSeconds === 'function'
            ? SECONDS.filter(function (h) { return disabledSeconds(selectedHour, selectedMinute).indexOf(h) === -1; })
            : SECONDS;
        var list = seconds.map(function (s) { return ({
            label: (0, pad_1.padStart)("" + s, 2, '0'),
            value: s,
            selected: selectedHour !== undefined && selectedSecond === s,
            disabled: typeof disabledSeconds === 'function' &&
                disabledSeconds(selectedHour, selectedMinute).indexOf(s) !== -1,
        }); });
        return react_1.default.createElement(time_column_1.default, __assign({}, baseTimeColumnProps, { list: list, value: selectedSecond, unit: "second" }));
    }
    function renderAmPm() {
        var isUpperCase = (0, util_1.getColumnsFromFormat)(format).list.indexOf('A') !== -1;
        var list = AMPM.map(function (a) { return ({
            label: isUpperCase ? a.toUpperCase() : a,
            value: a,
            selected: ampm === a,
        }); });
        return react_1.default.createElement(time_column_1.default, __assign({}, baseTimeColumnProps, { list: list, value: ampm, unit: "ampm" }));
    }
    var list = (0, util_1.getColumnsFromFormat)(format).list;
    var classNames = (0, classNames_1.default)(prefixCls);
    var _hideFooter = hideFooter ||
        (disableConfirm && isRangePicker) ||
        (!isRangePicker && disableConfirm && !showNowBtn);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { className: classNames },
            (list.indexOf('H') !== -1 || list.indexOf('h') !== -1) && renderHours(),
            list.indexOf('m') !== -1 && renderMinutes(),
            list.indexOf('s') !== -1 && renderSeconds(),
            use12Hours && renderAmPm()),
        extra && react_1.default.createElement("div", { className: prefixCls + "-footer-extra-wrapper" }, extra),
        !_hideFooter && (react_1.default.createElement("div", { className: prefixCls + "-footer-btn-wrapper" },
            !isRangePicker && showNowBtn ? (react_1.default.createElement(Button_1.default, { size: "mini", onClick: onSelectNow }, locale.TimePicker.now)) : (react_1.default.createElement("div", null)),
            !disableConfirm && (react_1.default.createElement(Button_1.default, { type: "primary", size: "mini", onClick: onConfirmTime, disabled: confirmBtnDisabled || !valueShow }, locale.TimePicker.ok))))));
}
exports.default = TimePicker;
