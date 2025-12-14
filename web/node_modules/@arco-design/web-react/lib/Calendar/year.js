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
var react_1 = __importDefault(require("react"));
var pad_1 = require("../_util/pad");
var dayjs_1 = require("../_util/dayjs");
var month_1 = __importDefault(require("./month"));
var useCellClassName_1 = __importDefault(require("./hooks/useCellClassName"));
var MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
].map(function (month, index) {
    return {
        name: month,
        value: index,
    };
});
var monthGroup = Array(3);
for (var i = 0; i < 3; i++) {
    monthGroup[i] = MONTHS.slice(i * 4, 4 * (i + 1));
}
var monthGroupPanel = Array(4);
for (var i = 0; i < 4; i++) {
    monthGroupPanel[i] = MONTHS.slice(i * 3, 3 * (i + 1));
}
function Year(props) {
    var prefixCls = props.prefixCls, mergedPageShowDate = props.mergedPageShowDate, panel = props.panel, onMouseEnterCell = props.onMouseEnterCell, disabledDate = props.disabledDate, monthRender = props.monthRender, selectHandler = props.selectHandler, innerMode = props.innerMode, CALENDAR_LOCALE = props.CALENDAR_LOCALE;
    var getCellClassName = (0, useCellClassName_1.default)(__assign(__assign({}, props), { isSameTime: function (current, target) { return current.isSame(target, 'month'); } }));
    var showYear = mergedPageShowDate.year();
    var mg = panel ? monthGroupPanel : monthGroup;
    return (react_1.default.createElement("div", { className: prefixCls + "-year" }, mg.map(function (row, rowIndex) { return (react_1.default.createElement("div", { className: prefixCls + "-year-row", key: rowIndex }, row.map(function (col) {
        var time = (0, dayjs_1.dayjs)(showYear + "-" + (0, pad_1.padStart)(col.value + 1, 2, '0') + "-01");
        var disabled = typeof disabledDate === 'function' && disabledDate(time);
        var divProps = panel ? { onClick: function () { return selectHandler(time, disabled); } } : {};
        return (react_1.default.createElement("div", { key: col.value, className: getCellClassName(__assign(__assign({}, col), { time: time }), disabled), onMouseEnter: function () { return onMouseEnterCell && onMouseEnterCell(time, disabled); } }, monthRender ? (react_1.default.cloneElement(monthRender(time), divProps)) : panel ? (react_1.default.createElement("div", __assign({ className: prefixCls + "-date" }, divProps),
            react_1.default.createElement("div", { className: prefixCls + "-date-value" }, CALENDAR_LOCALE.month.short[col.name]))) : (react_1.default.createElement("div", { className: prefixCls + "-month-with-days" },
            react_1.default.createElement("div", { className: prefixCls + "-month-title" }, CALENDAR_LOCALE.month.long[col.name]),
            react_1.default.createElement(month_1.default, __assign({}, props, { cell: true, value: col.value, innerMode: innerMode }))))));
    }))); })));
}
exports.default = Year;
