"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
function WeekList(props) {
    var prefixCls = props.prefixCls, dayStartOfWeek = props.dayStartOfWeek, isWeek = props.isWeek, CALENDAR_LOCALE = props.CALENDAR_LOCALE, panel = props.panel, innerMode = props.innerMode;
    var weekList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (dayStartOfWeek === 0) {
        weekList.unshift('sunday');
    }
    else {
        weekList.push('sunday');
    }
    if (isWeek) {
        weekList.unshift('self');
    }
    var weekLocale = CALENDAR_LOCALE.week[panel || innerMode === 'year' ? 'short' : 'long'];
    return (react_1.default.createElement("div", { className: prefixCls + "-week-list" }, weekList.map(function (w) { return (react_1.default.createElement("div", { className: prefixCls + "-week-list-item", key: w }, weekLocale[w])); })));
}
exports.default = WeekList;
