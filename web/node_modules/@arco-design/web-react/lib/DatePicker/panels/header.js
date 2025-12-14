"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var IconLeft_1 = __importDefault(require("../../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../../icon/react-icon-cjs/IconRight"));
var IconDoubleLeft_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDoubleLeft"));
var IconDoubleRight_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDoubleRight"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
function Header(props) {
    var prefixCls = props.prefixCls, title = props.title, onPrev = props.onPrev, onNext = props.onNext, onSuperPrev = props.onSuperPrev, onSuperNext = props.onSuperNext, mode = props.mode, value = props.value, onChangePanel = props.onChangePanel, _a = props.icons, icons = _a === void 0 ? {} : _a, rtl = props.rtl, DATEPICKER_LOCALE = props.DATEPICKER_LOCALE;
    var showPrev = typeof onPrev === 'function';
    var showSuperPrev = typeof onSuperPrev === 'function';
    var showNext = typeof onNext === 'function';
    var showSuperNext = typeof onSuperNext === 'function';
    var getIconClassName = function (isShow) {
        var _a;
        return (0, classNames_1.default)(prefixCls + "-header-icon", (_a = {}, _a[prefixCls + "-header-icon-hidden"] = !isShow, _a));
    };
    function renderHeaderLabel() {
        var _a = (DATEPICKER_LOCALE === null || DATEPICKER_LOCALE === void 0 ? void 0 : DATEPICKER_LOCALE.Calendar) || {}, monthBeforeYear = _a.monthBeforeYear, monthFormat = _a.monthFormat, yearFormat = _a.yearFormat;
        if (title) {
            return title;
        }
        if (mode === 'date' || mode === 'week') {
            var yearNode = (react_1.default.createElement("span", { key: "year-node", className: prefixCls + "-header-label", onClick: function () { return onChangePanel('year'); } }, value.format(yearFormat || 'YYYY')));
            var monthNode = (react_1.default.createElement("span", { key: "month-node", className: prefixCls + "-header-label", onClick: function () { return onChangePanel('month'); } }, value.format(monthFormat || 'MM')));
            return monthBeforeYear ? [monthNode, yearNode] : [yearNode, monthNode];
        }
        if (mode === 'month' || mode === 'quarter') {
            return (react_1.default.createElement("span", { className: prefixCls + "-header-label", onClick: function () { return onChangePanel('year'); } }, value.format(yearFormat || 'YYYY')));
        }
    }
    var prevDoubleNull = icons.prevDouble === null;
    var prevNull = icons.prev === null;
    var nextNull = icons.next === null;
    var nextDoubleNull = icons.nextDouble === null;
    return (react_1.default.createElement("div", { className: prefixCls + "-header" },
        !prevDoubleNull && (react_1.default.createElement("div", { className: getIconClassName(showSuperPrev), onClick: onSuperPrev }, showSuperPrev &&
            (prevDoubleNull
                ? null
                : icons.prevDouble || (rtl ? react_1.default.createElement(IconDoubleRight_1.default, null) : react_1.default.createElement(IconDoubleLeft_1.default, null))))),
        !prevNull && (react_1.default.createElement("div", { className: getIconClassName(showPrev), onClick: onPrev }, showPrev && (prevNull ? null : icons.prev || (rtl ? react_1.default.createElement(IconRight_1.default, null) : react_1.default.createElement(IconLeft_1.default, null))))),
        react_1.default.createElement("div", { className: prefixCls + "-header-value" }, renderHeaderLabel()),
        !nextNull && (react_1.default.createElement("div", { className: getIconClassName(showNext), onClick: onNext }, showNext && (nextNull ? null : icons.next || (rtl ? react_1.default.createElement(IconLeft_1.default, null) : react_1.default.createElement(IconRight_1.default, null))))),
        !nextDoubleNull && (react_1.default.createElement("div", { className: getIconClassName(showSuperNext), onClick: onSuperNext }, showSuperNext &&
            (nextDoubleNull
                ? null
                : icons.nextDouble || (rtl ? react_1.default.createElement(IconDoubleLeft_1.default, null) : react_1.default.createElement(IconDoubleRight_1.default, null)))))));
}
exports.default = Header;
