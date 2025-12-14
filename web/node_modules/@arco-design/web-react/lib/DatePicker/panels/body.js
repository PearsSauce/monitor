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
var classNames_1 = __importDefault(require("../../_util/classNames"));
var week_list_1 = __importDefault(require("./week-list"));
var useCellClassName_1 = __importDefault(require("../hooks/useCellClassName"));
var context_1 = __importDefault(require("../context"));
var util_1 = require("../util");
function Body(props) {
    var prefixCls = props.prefixCls, isWeek = props.isWeek, disabledDate = props.disabledDate, onSelectDate = props.onSelectDate, dateRender = props.dateRender, onMouseEnterCell = props.onMouseEnterCell, onMouseLeaveCell = props.onMouseLeaveCell, CALENDAR_LOCALE = props.CALENDAR_LOCALE, rows = props.rows, showWeekList = props.showWeekList, isSameTime = props.isSameTime, format = props.format, mode = props.mode;
    var _a = (0, react_1.useContext)(context_1.default), utcOffset = _a.utcOffset, timezone = _a.timezone, weekStart = _a.weekStart;
    var getCellClassName = (0, useCellClassName_1.default)(__assign(__assign({}, props), { isSameTime: isSameTime }));
    function renderRow(row) {
        return row.map(function (col, index) {
            if (col.time) {
                var disabled_1 = (0, util_1.isDisabledDate)(col.time, disabledDate, mode);
                var onClickHandler = function () { return !disabled_1 && onSelectDate(col.time.format(format), col.time); };
                return (react_1.default.createElement("div", { key: index, className: getCellClassName(col, disabled_1, utcOffset, timezone), onMouseEnter: function () { return onMouseEnterCell && onMouseEnterCell(col.time, disabled_1); }, onMouseLeave: function () { return onMouseLeaveCell && onMouseLeaveCell(col.time, disabled_1); }, onClick: onClickHandler }, dateRender ? (react_1.default.cloneElement(dateRender(col.time))) : (react_1.default.createElement("div", { className: prefixCls + "-date" },
                    react_1.default.createElement("div", { className: prefixCls + "-date-value" }, col.name)))));
            }
            if ('weekOfYear' in col) {
                return (react_1.default.createElement("div", { key: index, className: (0, classNames_1.default)(prefixCls + "-cell", prefixCls + "-cell-week") },
                    react_1.default.createElement("div", { className: prefixCls + "-date" },
                        react_1.default.createElement("div", { className: prefixCls + "-date-value" }, col.weekOfYear))));
            }
        });
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        showWeekList && (react_1.default.createElement(week_list_1.default, { prefixCls: prefixCls, weekStart: weekStart, isWeek: isWeek, CALENDAR_LOCALE: CALENDAR_LOCALE })),
        react_1.default.createElement("div", { className: prefixCls + "-body" }, rows.map(function (row, index) {
            var _a;
            return (react_1.default.createElement("div", { key: index, className: (0, classNames_1.default)(prefixCls + "-row", (_a = {}, _a[prefixCls + "-row-week"] = isWeek, _a)) }, renderRow(row)));
        }))));
}
exports.default = Body;
