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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var merge_1 = __importDefault(require("lodash/merge"));
var dayjs_1 = require("../../../_util/dayjs");
var classNames_1 = __importDefault(require("../../../_util/classNames"));
var ConfigProvider_1 = require("../../../ConfigProvider");
var header_1 = __importDefault(require("../header"));
var body_1 = __importDefault(require("../body"));
var year_1 = __importDefault(require("../year"));
var pad_1 = require("../../../_util/pad");
function MonthPicker(props) {
    var pageShowDate = props.pageShowDate, style = props.style, onMouseEnterCell = props.onMouseEnterCell, onMouseLeaveCell = props.onMouseLeaveCell, dateRender = props.dateRender, disabledDate = props.disabledDate, value = props.value, locale = props.locale, isRangePicker = props.isRangePicker, onSelect = props.onSelect, rangeValues = props.rangeValues, onSuperPrev = props.onSuperPrev, onSuperNext = props.onSuperNext, format = props.format, getHeaderOperations = props.getHeaderOperations, setPageShowDate = props.setPageShowDate, icons = props.icons, panelMode = props.panelMode, setPanelMode = props.setPanelMode, rest = __rest(props, ["pageShowDate", "style", "onMouseEnterCell", "onMouseLeaveCell", "dateRender", "disabledDate", "value", "locale", "isRangePicker", "onSelect", "rangeValues", "onSuperPrev", "onSuperNext", "format", "getHeaderOperations", "setPageShowDate", "icons", "panelMode", "setPanelMode"]);
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), globalLocale = _a.locale, getPrefixCls = _a.getPrefixCls, rtl = _a.rtl;
    var DATEPICKER_LOCALE = (0, merge_1.default)(globalLocale.DatePicker, locale);
    var CALENDAR_LOCALE = DATEPICKER_LOCALE.Calendar;
    var prefixCls = getPrefixCls('panel-month');
    var classNames = (0, classNames_1.default)(prefixCls);
    var bodyProps = isRangePicker ? { rangeValues: rangeValues } : { value: value };
    var showYear = pageShowDate.year();
    var rows = (0, react_1.useMemo)(function () {
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
                name: CALENDAR_LOCALE.month.short[month],
                time: (0, dayjs_1.dayjs)(showYear + "-" + (0, pad_1.padStart)(index + 1, 2, '0'), 'YYYY-MM').endOf('month'),
            };
        });
        var monthGroup = Array(4);
        for (var i = 0; i < 4; i++) {
            monthGroup[i] = MONTHS.slice(i * 3, 3 * (i + 1));
        }
        return monthGroup;
    }, [showYear, CALENDAR_LOCALE]);
    function renderCalendar() {
        return (react_1.default.createElement(body_1.default, __assign({}, rest, bodyProps, { prefixCls: getPrefixCls('picker'), rows: rows, onSelectDate: onSelect, isSameTime: function (current, target) { return current.isSame(target, 'month'); }, onMouseEnterCell: onMouseEnterCell, onMouseLeaveCell: onMouseLeaveCell, dateRender: dateRender, disabledDate: disabledDate, CALENDAR_LOCALE: CALENDAR_LOCALE, mode: "month", format: format })));
    }
    var headerOperations = { onSuperPrev: onSuperPrev, onSuperNext: onSuperNext };
    function onChangePanel(mode) {
        setPanelMode(mode);
    }
    if (panelMode === 'year') {
        return (react_1.default.createElement(year_1.default, __assign({}, getHeaderOperations(panelMode), { pageShowDate: pageShowDate, onSelect: function (_, date) {
                setPanelMode('month');
                setPageShowDate(date);
            }, disabledDate: disabledDate })));
    }
    return (react_1.default.createElement("div", { className: classNames, style: style },
        react_1.default.createElement(header_1.default, __assign({}, headerOperations, { DATEPICKER_LOCALE: DATEPICKER_LOCALE, icons: icons, prefixCls: getPrefixCls('picker'), value: pageShowDate, mode: panelMode, onChangePanel: onChangePanel, rtl: rtl })),
        renderCalendar()));
}
exports.default = MonthPicker;
