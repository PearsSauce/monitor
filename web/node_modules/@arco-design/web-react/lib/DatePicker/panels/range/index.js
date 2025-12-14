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
var date_1 = __importDefault(require("../date"));
var week_1 = __importDefault(require("../week"));
var month_1 = __importDefault(require("../month"));
var year_1 = __importDefault(require("../year"));
var quarter_1 = __importDefault(require("../quarter"));
var ConfigProvider_1 = require("../../../ConfigProvider");
var dayjs_1 = require("../../../_util/dayjs");
var is_1 = require("../../../_util/is");
var util_1 = require("../../util");
var context_1 = __importDefault(require("../../context"));
function range(start, end) {
    var result = [];
    for (var i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
function RangePicker(props) {
    var _a = props.mode, mode = _a === void 0 ? 'date' : _a, showTime = props.showTime, disabledDate = props.disabledDate, disabledTime = props.disabledTime, format = props.format, dateRender = props.dateRender, propsValue = props.value, timeValues = props.timeValues, icons = props.icons, locale = props.locale, pageShowDates = props.pageShowDates, onMouseEnterCell = props.onMouseEnterCell, onMouseLeaveCell = props.onMouseLeaveCell, onSelectTime = props.onTimePickerSelect, onSelectPanel = props.onSelectPanel, onPrev = props.onPrev, onSuperPrev = props.onSuperPrev, onNext = props.onNext, onSuperNext = props.onSuperNext, localeName = props.localeName, popupVisible = props.popupVisible, timepickerProps = props.timepickerProps, getHeaderOperations = props.getHeaderOperations, setRangePageShowDates = props.setRangePageShowDates, disabledTimePickerIndex = props.disabledTimePickerIndex, hideNotInViewDates = props.hideNotInViewDates, isTimePanel = props.isTimePanel, valueShowHover = props.valueShowHover, panelModes = props.panelModes, setPanelModes = props.setPanelModes;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('picker-range');
    var _b = (0, react_1.useContext)(context_1.default), utcOffset = _b.utcOffset, timezone = _b.timezone;
    var startShowDate = pageShowDates[0] || (0, dayjs_1.getNow)(utcOffset, timezone);
    var endShowDate = pageShowDates[1] || (0, dayjs_1.getNow)(utcOffset, timezone);
    var value = (0, dayjs_1.getDayjsValue)(propsValue, format);
    var basePickerProps = {
        isRangePicker: true,
        rangeValues: value,
        onMouseEnterCell: onMouseEnterCell,
        onMouseLeaveCell: onMouseLeaveCell,
        locale: locale,
        disabledDate: disabledDate,
        onSelect: onSelectPanel,
        dateRender: dateRender,
        getHeaderOperations: getHeaderOperations,
        icons: icons,
        valueShowHover: valueShowHover,
    };
    var startPickerProps = {
        pageShowDate: startShowDate,
        panelMode: panelModes[0],
        setPanelMode: function (m) { return setPanelModes([m, panelModes[1]]); },
        format: (0, util_1.getFormatByIndex)(format, 0),
    };
    var endPickerProps = {
        pageShowDate: endShowDate,
        panelMode: panelModes[1],
        setPanelMode: function (m) { return setPanelModes([panelModes[0], m]); },
        format: (0, util_1.getFormatByIndex)(format, 1),
    };
    function renderDate() {
        var startOperations = {
            onPrev: onPrev,
            onSuperPrev: onSuperPrev,
        };
        var endOperations = {
            onNext: onNext,
            onSuperNext: onSuperNext,
        };
        var pickerProps = __assign(__assign({}, basePickerProps), { localeName: localeName, popupVisible: popupVisible, timepickerProps: timepickerProps, getHeaderOperations: getHeaderOperations, hideNotInViewDates: hideNotInViewDates, isTimePanel: isTimePanel });
        if (mode === 'week') {
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(week_1.default, __assign({ setPageShowDate: function (d) { return setRangePageShowDates([d, d], 0); } }, startOperations, pickerProps, startPickerProps)),
                react_1.default.createElement(week_1.default, __assign({ setPageShowDate: function (d) { return setRangePageShowDates([dayjs_1.methods.subtract(d, 1, 'month'), d], 1); } }, endOperations, pickerProps, endPickerProps))));
        }
        var showTimeProps = {
            disabledTime: disabledTime,
            showTime: showTime,
        };
        var disabledTimePickerProps = {};
        // 禁用面板时，TimePicker 被整体禁用同时关闭 hideDisabledOptions 防止用户传 true 导致空白
        if (typeof disabledTimePickerIndex === 'number') {
            disabledTimePickerProps.disabledTime = function () { return ({
                disabledHours: function () { return range(0, 24); },
                disabledMinutes: function () { return range(0, 60); },
                disabledSeconds: function () { return range(0, 60); },
            }); };
            if ((0, is_1.isObject)(showTime)) {
                var st = __assign(__assign({}, showTime), { defaultValue: undefined });
                disabledTimePickerProps.showTime = __assign(__assign({}, st), { hideDisabledOptions: false });
            }
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(date_1.default, __assign({}, startOperations, pickerProps, showTimeProps, (disabledTimePickerIndex === 0 ? disabledTimePickerProps : {}), { onTimePickerSelect: function (timeString, time) {
                    onSelectTime(0, timeString, time);
                }, index: 0, setPageShowDate: function (d) { return setRangePageShowDates([d, d], 0); }, timeValue: timeValues[0] }, startPickerProps)),
            react_1.default.createElement(date_1.default, __assign({}, endOperations, pickerProps, showTimeProps, (disabledTimePickerIndex === 1 ? disabledTimePickerProps : {}), { onTimePickerSelect: function (timeString, time) {
                    onSelectTime(1, timeString, time);
                }, index: 1, setPageShowDate: function (d) { return setRangePageShowDates([dayjs_1.methods.subtract(d, 1, 'month'), d], 1); }, timeValue: timeValues[1] }, endPickerProps))));
    }
    function renderMonth() {
        var startOperations = {
            onSuperPrev: onSuperPrev,
        };
        var endOperations = {
            onSuperNext: onSuperNext,
        };
        var pickerProps = basePickerProps;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(month_1.default, __assign({ setPageShowDate: function (d) { return setRangePageShowDates([d, d], 0); } }, startOperations, pickerProps, startPickerProps)),
            react_1.default.createElement(month_1.default, __assign({ setPageShowDate: function (d) { return setRangePageShowDates([dayjs_1.methods.subtract(d, 1, 'year'), d], 1); } }, endOperations, pickerProps, endPickerProps))));
    }
    function renderYear() {
        var startOperations = {
            onSuperPrev: onSuperPrev,
        };
        var endOperations = {
            onSuperNext: onSuperNext,
        };
        var pickerProps = basePickerProps;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(year_1.default, __assign({}, startOperations, pickerProps, { pageShowDate: startShowDate })),
            react_1.default.createElement(year_1.default, __assign({}, endOperations, pickerProps, { pageShowDate: endShowDate }))));
    }
    function renderQuarter() {
        var startOperations = {
            onSuperPrev: onSuperPrev,
        };
        var endOperations = {
            onSuperNext: onSuperNext,
        };
        var pickerProps = basePickerProps;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(quarter_1.default, __assign({ setPageShowDate: function (d) { return setRangePageShowDates([d, d], 0); } }, startOperations, pickerProps, startPickerProps)),
            react_1.default.createElement(quarter_1.default, __assign({ setPageShowDate: function (d) { return setRangePageShowDates([dayjs_1.methods.subtract(d, 1, 'year'), d], 1); } }, endOperations, pickerProps, endPickerProps))));
    }
    return (react_1.default.createElement("div", { className: prefixCls },
        react_1.default.createElement("div", { className: prefixCls + "-wrapper" },
            (mode === 'date' || mode === 'week') && renderDate(),
            mode === 'month' && renderMonth(),
            mode === 'year' && renderYear(),
            mode === 'quarter' && renderQuarter())));
}
exports.default = RangePicker;
