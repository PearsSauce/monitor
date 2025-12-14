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
var merge_1 = __importDefault(require("lodash/merge"));
var classNames_1 = __importDefault(require("../../../_util/classNames"));
var is_1 = require("../../../_util/is");
var dayjs_1 = require("../../../_util/dayjs");
var ConfigProvider_1 = require("../../../ConfigProvider");
var time_picker_1 = __importDefault(require("../../../TimePicker/time-picker"));
var header_1 = __importDefault(require("../header"));
var body_1 = __importDefault(require("../body"));
var month_1 = __importDefault(require("../month"));
var year_1 = __importDefault(require("../year"));
var constant_1 = require("../../../_util/constant");
var context_1 = __importDefault(require("../../context"));
var omit_1 = __importDefault(require("../../../_util/omit"));
var allDaysInOnePage = 6 * 7;
var getReturn = function (time) {
    return {
        year: time.year(),
        month: time.month() + 1,
        day: time.day(),
        name: time.date(),
        time: time,
    };
};
var getTimeObj = function (time) {
    return __assign(__assign({}, getReturn(dayjs_1.methods.startOf(time, 'month'))), { days: time.daysInMonth() });
};
function getAllDaysByTime(props, time) {
    var dayStartOfWeek = props.dayStartOfWeek, isWeek = props.isWeek;
    var current = getTimeObj(time);
    var flatRows = (0, constant_1.newArray)(allDaysInOnePage).map(function () { return ({}); });
    var startIndex = current.day - dayStartOfWeek < 0
        ? 7 + (current.day - dayStartOfWeek)
        : current.day - dayStartOfWeek;
    flatRows[startIndex] = __assign({}, current);
    // pre
    for (var i = 0; i < startIndex; i++) {
        flatRows[startIndex - i - 1] = __assign(__assign({}, getReturn(dayjs_1.methods.subtract(current.time, i + 1, 'day'))), { isPrev: true });
    }
    // next
    for (var i = 0; i < allDaysInOnePage - startIndex - 1; i++) {
        flatRows[startIndex + i + 1] = __assign(__assign({}, getReturn(dayjs_1.methods.add(current.time, i + 1, 'day'))), { isNext: i >= current.days - 1 });
    }
    var rows = (0, constant_1.newArray)(6).map(function () { return []; });
    for (var i = 0; i < 6; i++) {
        rows[i] = flatRows.slice(i * 7, 7 * (i + 1));
        if (isWeek) {
            var weekTime = rows[i][0].time;
            var weekRows = __spreadArray([], __read(rows[i]), false);
            rows[i].unshift({
                weekRows: weekRows,
                weekOfYear: weekTime.week(),
            });
        }
    }
    return rows;
}
function DatePicker(props) {
    var isWeek = props.isWeek, popupVisible = props.popupVisible, format = props.format, pageShowDate = props.pageShowDate, showTime = props.showTime, style = props.style, timepickerProps = props.timepickerProps, onMouseEnterCell = props.onMouseEnterCell, onMouseLeaveCell = props.onMouseLeaveCell, dateRender = props.dateRender, disabledDate = props.disabledDate, disabledTime = props.disabledTime, value = props.value, rangeValues = props.rangeValues, locale = props.locale, isRangePicker = props.isRangePicker, onSelect = props.onSelect, onTimePickerSelect = props.onTimePickerSelect, onPrev = props.onPrev, onNext = props.onNext, onSuperPrev = props.onSuperPrev, onSuperNext = props.onSuperNext, isSameTime = props.isSameTime, index = props.index, getHeaderOperations = props.getHeaderOperations, setPageShowDate = props.setPageShowDate, timeValue = props.timeValue, hideNotInViewDates = props.hideNotInViewDates, icons = props.icons, isTimePanel = props.isTimePanel, panelMode = props.panelMode, setPanelMode = props.setPanelMode, rest = __rest(props, ["isWeek", "popupVisible", "format", "pageShowDate", "showTime", "style", "timepickerProps", "onMouseEnterCell", "onMouseLeaveCell", "dateRender", "disabledDate", "disabledTime", "value", "rangeValues", "locale", "isRangePicker", "onSelect", "onTimePickerSelect", "onPrev", "onNext", "onSuperPrev", "onSuperNext", "isSameTime", "index", "getHeaderOperations", "setPageShowDate", "timeValue", "hideNotInViewDates", "icons", "isTimePanel", "panelMode", "setPanelMode"]);
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), globalLocale = _a.locale, getPrefixCls = _a.getPrefixCls, rtl = _a.rtl;
    var _b = (0, react_1.useContext)(context_1.default), utcOffset = _b.utcOffset, timezone = _b.timezone, weekStart = _b.weekStart;
    var DATEPICKER_LOCALE = (0, merge_1.default)(globalLocale.DatePicker, locale);
    var prefixCls = getPrefixCls(isWeek ? 'panel-week' : 'panel-date');
    var classNames = (0, classNames_1.default)(prefixCls);
    var bodyProps = isRangePicker ? { rangeValues: rangeValues } : { value: value };
    var timeFormat = ((0, is_1.isObject)(showTime) && showTime.format) || (0, dayjs_1.getTimeFormat)(format);
    var dayjsLocale = globalLocale.dayjsLocale;
    // page data list
    var rows = (0, react_1.useMemo)(function () {
        return getAllDaysByTime(__assign(__assign({}, props), { dayStartOfWeek: weekStart }), pageShowDate.locale(dayjsLocale));
    }, [pageShowDate.toString(), weekStart, dayjsLocale]);
    var disabledTimeProps;
    if (isRangePicker) {
        disabledTimeProps =
            typeof disabledTime === 'function'
                ? disabledTime(rangeValues[index], index === 0 ? 'start' : 'end')
                : {};
    }
    else {
        disabledTimeProps =
            typeof disabledTime === 'function' ? disabledTime((0, dayjs_1.getDayjsValue)(value, format)) : {};
    }
    function renderCalendar() {
        return (react_1.default.createElement(body_1.default, __assign({}, rest, bodyProps, { showWeekList: true, isWeek: isWeek, prefixCls: getPrefixCls('picker'), rows: rows, isSameTime: isSameTime || (function (current, target) { return current.isSame(target, 'day'); }), onSelectDate: onSelect, onMouseEnterCell: onMouseEnterCell, onMouseLeaveCell: onMouseLeaveCell, dateRender: dateRender, disabledDate: disabledDate, CALENDAR_LOCALE: DATEPICKER_LOCALE.Calendar, mode: isWeek ? 'week' : 'date', format: format, hideNotInViewDates: hideNotInViewDates })));
    }
    function renderTimePicker() {
        var showTimeProps = (0, is_1.isObject)(showTime) ? showTime : {};
        return (react_1.default.createElement("div", { className: prefixCls + "-timepicker" },
            react_1.default.createElement("header", { className: prefixCls + "-timepicker-title" }, DATEPICKER_LOCALE.selectTime),
            react_1.default.createElement(time_picker_1.default, __assign({}, (0, omit_1.default)(timepickerProps, ['disableConfirm']), showTimeProps, disabledTimeProps, { hideFooter: true, format: timeFormat, valueShow: timeValue.format(timeFormat), onSelect: onTimePickerSelect, popupVisible: popupVisible, utcOffset: utcOffset, timezone: timezone }))));
    }
    var headerOperations = { onPrev: onPrev, onSuperPrev: onSuperPrev, onNext: onNext, onSuperNext: onSuperNext, DATEPICKER_LOCALE: DATEPICKER_LOCALE };
    function onChangePanel(mode) {
        setPanelMode(mode);
    }
    if (panelMode === 'year') {
        return (react_1.default.createElement(year_1.default, __assign({}, getHeaderOperations(panelMode), { pageShowDate: pageShowDate, onSelect: function (_, date) {
                setPanelMode('month');
                setPageShowDate(date);
            }, disabledDate: disabledDate })));
    }
    if (panelMode === 'month') {
        return (react_1.default.createElement(month_1.default, __assign({}, getHeaderOperations(panelMode), { setPageShowDate: setPageShowDate, pageShowDate: pageShowDate, panelMode: panelMode, getHeaderOperations: getHeaderOperations, onSelect: function (_, date) {
                setPanelMode('date');
                setPageShowDate(date);
            }, disabledDate: disabledDate, setPanelMode: setPanelMode })));
    }
    return (react_1.default.createElement("div", { className: classNames, style: style }, showTime && isTimePanel ? (renderTimePicker()) : (react_1.default.createElement("div", { className: prefixCls + "-inner" },
        react_1.default.createElement(header_1.default, __assign({}, headerOperations, { icons: icons, prefixCls: getPrefixCls('picker'), value: pageShowDate, mode: panelMode, onChangePanel: onChangePanel, rtl: rtl })),
        renderCalendar()))));
}
exports.default = DatePicker;
