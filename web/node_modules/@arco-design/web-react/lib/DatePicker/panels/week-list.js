"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
function WeekList(props) {
    var prefixCls = props.prefixCls, weekStart = props.weekStart, isWeek = props.isWeek, CALENDAR_LOCALE = props.CALENDAR_LOCALE;
    var weekList = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    weekList = weekList.slice(weekStart).concat(weekList.slice(0, weekStart));
    if (isWeek) {
        weekList.unshift('');
    }
    var weekLocale = CALENDAR_LOCALE.week.short;
    return (react_1.default.createElement("div", { className: prefixCls + "-week-list" }, weekList.map(function (w) { return (react_1.default.createElement("div", { className: prefixCls + "-week-list-item", key: w }, w && weekLocale[w])); })));
}
exports.default = WeekList;
