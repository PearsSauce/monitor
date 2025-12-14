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
var useKeyboardEvent_1 = __importDefault(require("../../_util/hooks/useKeyboardEvent"));
var Select_1 = __importDefault(require("../../Select"));
var Button_1 = __importDefault(require("../../Button"));
var Radio_1 = __importDefault(require("../../Radio"));
var IconLeft_1 = __importDefault(require("../../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../../icon/react-icon-cjs/IconRight"));
var dayjs_1 = require("../../_util/dayjs");
var is_1 = require("../../_util/is");
function getPopupContainer(node) {
    return node.parentElement;
}
function Header(props) {
    var prefixCls = props.prefixCls, changePageShowDate = props.changePageShowDate, headerValueFormat = props.headerValueFormat, mergedPageShowDate = props.mergedPageShowDate, CALENDAR_LOCALE = props.CALENDAR_LOCALE, move = props.move, innerMode = props.innerMode, changeMode = props.changeMode, headerType = props.headerType, onChangeYear = props.onChangeYear, onChangeMonth = props.onChangeMonth, modes = props.modes;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var modesOptions = (0, is_1.isArray)(modes)
        ? modes.map(function (m) { return ({
            label: CALENDAR_LOCALE.view[m],
            value: m,
        }); })
        : [];
    var isSelectHeaderType = headerType === 'select';
    var pageShowDateYear = mergedPageShowDate.year();
    var pageShowDateMonth = mergedPageShowDate.month() + 1;
    var optionsYear = (0, react_1.useMemo)(function () {
        var options = [pageShowDateYear];
        for (var i = 1; i <= 10; i++) {
            options.unshift(pageShowDateYear - i);
        }
        for (var i = 1; i < 10; i++) {
            options.push(pageShowDateYear + i);
        }
        return options;
    }, [pageShowDateYear]);
    var optionsMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return (react_1.default.createElement("div", { className: prefixCls + "-header" },
        react_1.default.createElement("div", { className: prefixCls + "-header-left" },
            isSelectHeaderType ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(Select_1.default, { size: "small", className: prefixCls + "-header-value-year", value: pageShowDateYear, options: optionsYear, onChange: onChangeYear, getPopupContainer: getPopupContainer }),
                innerMode === 'month' && (react_1.default.createElement(Select_1.default, { size: "small", className: prefixCls + "-header-value-month", value: pageShowDateMonth, options: optionsMonth, onChange: onChangeMonth, getPopupContainer: getPopupContainer })))) : (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("div", __assign({ className: prefixCls + "-header-icon", role: "button", tabIndex: 0, onClick: function () { return changePageShowDate('prev', innerMode); } }, getKeyboardEvents({
                    onPressEnter: function () { return changePageShowDate('prev', innerMode); },
                })),
                    react_1.default.createElement(IconLeft_1.default, null)),
                react_1.default.createElement("div", { className: prefixCls + "-header-value" }, mergedPageShowDate.format(headerValueFormat)),
                react_1.default.createElement("div", __assign({ role: "button", tabIndex: 0, className: prefixCls + "-header-icon", onClick: function () { return changePageShowDate('next', innerMode); } }, getKeyboardEvents({
                    onPressEnter: function () { return changePageShowDate('next', innerMode); },
                })),
                    react_1.default.createElement(IconRight_1.default, null)))),
            react_1.default.createElement(Button_1.default, { size: "small", onClick: function () { return move((0, dayjs_1.getNow)()); } }, CALENDAR_LOCALE.today)),
        react_1.default.createElement("div", { className: prefixCls + "-header-right" },
            react_1.default.createElement(Radio_1.default.Group, { size: "small", type: "button", options: modesOptions, onChange: changeMode, value: innerMode }))));
}
exports.default = Header;
