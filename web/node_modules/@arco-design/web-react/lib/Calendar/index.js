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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var merge_1 = __importDefault(require("lodash/merge"));
var ConfigProvider_1 = require("../ConfigProvider");
var classNames_1 = __importDefault(require("../_util/classNames"));
var month_1 = __importStar(require("./month"));
var year_1 = __importDefault(require("./year"));
var header_1 = __importDefault(require("./header/header"));
var panel_header_1 = __importDefault(require("./header/panel-header"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var dayjs_1 = require("../_util/dayjs");
var pick_1 = require("../_util/pick");
function getFormat(mode, panel) {
    return mode === 'month' || (mode === 'year' && !panel) ? 'YYYY-MM-DD' : 'YYYY-MM';
}
var defaultProps = {
    dayStartOfWeek: 0,
    panelWidth: 265,
    defaultMode: 'month',
    headerType: 'button',
    modes: ['month', 'year'],
};
function Calendar(baseProps) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, globalLocale = _b.locale, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Calendar);
    var style = props.style, className = props.className, dayStartOfWeek = props.dayStartOfWeek, panel = props.panel, locale = props.locale, panelWidth = props.panelWidth, panelTodayBtn = props.panelTodayBtn, defaultPageShowDate = props.defaultPageShowDate, propsValue = props.value, propsPageShowDate = props.pageShowDate, defaultValue = props.defaultValue, propsMode = props.mode, defaultMode = props.defaultMode, onChange = props.onChange, onPanelChange = props.onPanelChange, headerRender = props.headerRender, headerType = props.headerType, modes = props.modes, panelOperations = props.panelOperations;
    var CALENDAR_LOCALE = (0, merge_1.default)(globalLocale.Calendar, locale);
    var prefixCls = getPrefixCls('calendar');
    var _c = __read((0, react_1.useState)(propsMode || defaultMode), 2), mode = _c[0], setMode = _c[1];
    var innerMode = propsMode || mode;
    var format = getFormat(innerMode, panel);
    var _d = __read((0, react_1.useState)((0, dayjs_1.getDayjsValue)(propsValue || defaultValue, format)), 2), value = _d[0], setValue = _d[1];
    var _e = __read((0, react_1.useState)((0, dayjs_1.getDayjsValue)(defaultPageShowDate, format) || value || (0, dayjs_1.getNow)()), 2), pageShowDate = _e[0], setPageShowDate = _e[1];
    var mergedPageShowDate = ((0, dayjs_1.getDayjsValue)(propsPageShowDate, format) || pageShowDate);
    var mergedValue = 'value' in props ? (0, dayjs_1.getDayjsValue)(propsValue, format) : value;
    // page data list
    var pageData = (0, react_1.useMemo)(function () {
        return (0, month_1.getAllDaysByTime)(props, mergedPageShowDate);
    }, [mergedPageShowDate.toString(), innerMode, dayStartOfWeek]);
    // value / pageShowDate / pageData
    function move(time) {
        setValue(time);
        onChange && onChange(time);
        onChangePageDate(time);
    }
    function onChangePageDate(time) {
        setPageShowDate(time);
        onPanelChange && onPanelChange(time);
    }
    function selectHandler(time, disabled) {
        if (!disabled) {
            move(time);
        }
    }
    var headerValueFormat = '';
    if (innerMode === 'month') {
        headerValueFormat = CALENDAR_LOCALE.formatMonth;
    }
    else if (innerMode === 'year') {
        headerValueFormat = CALENDAR_LOCALE.formatYear;
    }
    function changePageShowDate(type, unit) {
        var newPageShowDate;
        if (type === 'prev') {
            newPageShowDate = dayjs_1.methods.subtract(mergedPageShowDate, 1, unit);
        }
        if (type === 'next') {
            newPageShowDate = dayjs_1.methods.add(mergedPageShowDate, 1, unit);
        }
        setPageShowDate(newPageShowDate);
        onPanelChange && onPanelChange(newPageShowDate);
    }
    function onChangeYear(year) {
        var newValue = dayjs_1.methods.set(mergedPageShowDate, 'year', year);
        setPageShowDate(newValue);
        onPanelChange && onPanelChange(newValue);
    }
    function onChangeMonth(month) {
        var newValue = dayjs_1.methods.set(mergedPageShowDate, 'month', month - 1);
        setPageShowDate(newValue);
        onPanelChange && onPanelChange(newValue);
    }
    function changeMode(mode) {
        setMode(mode);
    }
    var classNames = (0, classNames_1.default)(prefixCls, innerMode === 'month' ? prefixCls + "-mode-month" : prefixCls + "-mode-year", (_a = {},
        _a[prefixCls + "-panel"] = panel && (innerMode === 'month' || innerMode === 'year'),
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var baseStyle = panel ? { width: panelWidth } : {};
    var baseHeaderProps = {
        prefixCls: prefixCls,
        changePageShowDate: changePageShowDate,
        headerValueFormat: headerValueFormat,
        mergedPageShowDate: mergedPageShowDate,
        modes: modes,
        innerMode: innerMode,
        panelOperations: panelOperations,
    };
    return (react_1.default.createElement("div", __assign({ className: classNames, style: __assign(__assign({}, style), baseStyle) }, (0, pick_1.pickDataAttributes)(props)),
        typeof headerRender === 'function' ? (headerRender({
            value: mergedValue,
            pageShowDate: mergedPageShowDate,
            onChangeMode: changeMode,
            onChange: move,
            onChangePageDate: onChangePageDate,
        })) : panel ? (react_1.default.createElement(panel_header_1.default, __assign({}, baseHeaderProps))) : (react_1.default.createElement(header_1.default, __assign({}, baseHeaderProps, { CALENDAR_LOCALE: CALENDAR_LOCALE, move: move, innerMode: innerMode, changeMode: changeMode, onChangeYear: onChangeYear, onChangeMonth: onChangeMonth, headerType: headerType }))),
        innerMode === 'month' && (react_1.default.createElement("div", { className: prefixCls + "-body" },
            react_1.default.createElement(month_1.default, __assign({}, props, { prefixCls: prefixCls, pageData: pageData, mergedValue: mergedValue, innerMode: innerMode, selectHandler: selectHandler, mergedPageShowDate: mergedPageShowDate, CALENDAR_LOCALE: CALENDAR_LOCALE })))),
        innerMode === 'year' && (react_1.default.createElement("div", { className: prefixCls + "-body" },
            react_1.default.createElement(year_1.default, __assign({}, props, { prefixCls: prefixCls, pageData: pageData, mergedPageShowDate: mergedPageShowDate, innerMode: innerMode, mergedValue: mergedValue, selectHandler: selectHandler, CALENDAR_LOCALE: CALENDAR_LOCALE })))),
        panelTodayBtn && panel && (react_1.default.createElement("div", { className: prefixCls + "-footer-btn-wrapper", onClick: function () { return move((0, dayjs_1.getNow)()); } }, CALENDAR_LOCALE.today))));
}
Calendar.displayName = 'Calendar';
exports.default = Calendar;
