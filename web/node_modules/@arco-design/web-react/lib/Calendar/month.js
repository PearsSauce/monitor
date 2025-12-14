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
exports.getAllDaysByTime = void 0;
var react_1 = __importDefault(require("react"));
var dayjs_1 = require("../_util/dayjs");
var constant_1 = require("../_util/constant");
var pad_1 = require("../_util/pad");
var classNames_1 = __importDefault(require("../_util/classNames"));
var week_list_1 = __importDefault(require("./week-list"));
var useCellClassName_1 = __importDefault(require("./hooks/useCellClassName"));
var allDaysInOnePage = 6 * 7;
var getReturn = function (time) {
    return {
        year: time.year(),
        month: time.month() + 1,
        date: time.date(),
        day: time.day(),
        time: time,
    };
};
var getTimeObj = function (time) {
    return {
        start: getReturn(dayjs_1.methods.startOf(time, 'month')),
        end: getReturn(dayjs_1.methods.endOf(time, 'month')),
        days: time.daysInMonth(),
    };
};
function getAllDaysByTime(props, time) {
    var _a = props.dayStartOfWeek, dayStartOfWeek = _a === void 0 ? 0 : _a, isWeek = props.isWeek;
    var current = getTimeObj(time);
    var flatRows = (0, constant_1.newArray)(allDaysInOnePage).map(function () { return ({}); });
    // current.start.day is 0 for Sunday
    var startIndex = dayStartOfWeek === 0 ? current.start.day : (current.start.day || 7) - 1;
    flatRows[startIndex] = __assign(__assign({}, current.start), { isCurrent: true });
    // pre
    for (var i = 0; i < startIndex; i++) {
        flatRows[startIndex - i - 1] = __assign(__assign({}, getReturn(dayjs_1.methods.subtract(current.start.time, i + 1, 'day'))), { isPrev: true });
    }
    // next
    for (var i = 0; i < allDaysInOnePage - startIndex - 1; i++) {
        flatRows[startIndex + i + 1] = __assign(__assign({}, getReturn(dayjs_1.methods.add(current.start.time, i + 1, 'day'))), { isCurrent: i < current.days, isNext: i >= current.days - 1 });
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
exports.getAllDaysByTime = getAllDaysByTime;
function Month(props) {
    var prefixCls = props.prefixCls, cell = props.cell, value = props.value, pageData = props.pageData, mergedValue = props.mergedValue, isWeek = props.isWeek, disabledDate = props.disabledDate, selectHandler = props.selectHandler, panel = props.panel, innerMode = props.innerMode, dateRender = props.dateRender, onMouseEnterCell = props.onMouseEnterCell, onMouseLeaveCell = props.onMouseLeaveCell, dateInnerContent = props.dateInnerContent, mergedPageShowDate = props.mergedPageShowDate, dayStartOfWeek = props.dayStartOfWeek, CALENDAR_LOCALE = props.CALENDAR_LOCALE;
    var pageShowDateYear = mergedPageShowDate.year();
    var getCellClassName = (0, useCellClassName_1.default)(__assign(__assign({}, props), { isSameTime: function (current, target) { return current.isSame(target, 'day'); } }));
    function renderDays(row) {
        return row.map(function (col, index) {
            var _a;
            if (col.time) {
                var disabled_1 = typeof disabledDate === 'function' && disabledDate(col.time);
                var onClickHandler = function () { return selectHandler(col.time, disabled_1); };
                var tdProps = isWeek ? { onClick: onClickHandler } : {};
                var tdDivProps = !isWeek ? { onClick: onClickHandler } : {};
                return (react_1.default.createElement("div", __assign({ key: index, className: getCellClassName(col, disabled_1), onMouseEnter: function () { return onMouseEnterCell && onMouseEnterCell(col.time, disabled_1); }, onMouseLeave: function () { return onMouseLeaveCell && onMouseLeaveCell(col.time, disabled_1); } }, tdProps), dateRender ? (react_1.default.cloneElement(dateRender(col.time), tdDivProps)) : (react_1.default.createElement("div", __assign({ className: prefixCls + "-date" }, tdDivProps),
                    react_1.default.createElement("div", { className: prefixCls + "-date-value" }, panel ? col.date : react_1.default.createElement("div", { className: prefixCls + "-date-circle" }, col.date)),
                    !panel && innerMode !== 'year' && (react_1.default.createElement("div", { className: prefixCls + "-date-content" }, dateInnerContent && dateInnerContent(col.time)))))));
            }
            if ('weekOfYear' in col) {
                var rowYear_1 = mergedValue && mergedValue.year();
                var rowMonth_1 = mergedValue && mergedValue.month() + 1;
                var rowWeek = mergedValue && mergedValue.week();
                var selectedWeek = mergedValue &&
                    col.weekRows.find(function (r) { return r.year === rowYear_1 && r.month === rowMonth_1; }) &&
                    rowWeek === col.weekOfYear;
                return (react_1.default.createElement("div", { key: index, className: (0, classNames_1.default)(prefixCls + "-cell", prefixCls + "-cell-week", (_a = {},
                        _a[prefixCls + "-cell-selected-week"] = selectedWeek,
                        _a[prefixCls + "-cell-in-range"] = selectedWeek,
                        _a)) },
                    react_1.default.createElement("div", { className: prefixCls + "-date" },
                        react_1.default.createElement("div", { className: prefixCls + "-date-value" }, col.weekOfYear))));
            }
        });
    }
    var pd = pageData;
    if (typeof value === 'number') {
        pd = getAllDaysByTime(props, (0, dayjs_1.dayjs)(pageShowDateYear + "-" + (0, pad_1.padStart)(value + 1, 2, '0') + "-01"));
    }
    return (react_1.default.createElement("div", { className: cell ? prefixCls + "-month-cell" : prefixCls + "-month" },
        react_1.default.createElement(week_list_1.default, { prefixCls: prefixCls, dayStartOfWeek: dayStartOfWeek, isWeek: isWeek, CALENDAR_LOCALE: CALENDAR_LOCALE, panel: panel, innerMode: innerMode }),
        react_1.default.createElement("div", { className: prefixCls + "-month-cell-body" }, pd.map(function (row, index) {
            var _a;
            return (react_1.default.createElement("div", { key: index, className: (0, classNames_1.default)(prefixCls + "-month-row", (_a = {}, _a[prefixCls + "-row-week"] = isWeek, _a)) }, renderDays(row)));
        }))));
}
exports.default = Month;
