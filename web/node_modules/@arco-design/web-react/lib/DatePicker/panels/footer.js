"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var Button_1 = __importDefault(require("../../Button"));
var shortcuts_1 = __importDefault(require("./shortcuts"));
var is_1 = require("../../_util/is");
var Link_1 = __importDefault(require("../../Link"));
function Footer(props) {
    var showTime = props.showTime, prefixCls = props.prefixCls, DATEPICKER_LOCALE = props.DATEPICKER_LOCALE, disabled = props.disabled, onClickConfirmBtn = props.onClickConfirmBtn, onClickSelectTimeBtn = props.onClickSelectTimeBtn, isTimePanel = props.isTimePanel, onSelectNow = props.onSelectNow, showNowBtn = props.showNowBtn, shortcuts = props.shortcuts, onMouseEnterShortcut = props.onMouseEnterShortcut, onMouseLeaveShortcut = props.onMouseLeaveShortcut, onSelectShortcut = props.onSelectShortcut, extra = props.extra, mode = props.mode, shortcutsPlacementLeft = props.shortcutsPlacementLeft;
    var hasShortcuts = (0, is_1.isArray)(shortcuts) && shortcuts.length > 0;
    var shouldShowNowBtn = showNowBtn && showTime && !hasShortcuts;
    var shouldShouldShortcuts = shouldShowNowBtn || (hasShortcuts && !shortcutsPlacementLeft);
    return (react_1.default.createElement("div", { className: prefixCls + "-footer" },
        extra && react_1.default.createElement("div", { className: prefixCls + "-footer-extra-wrapper" }, extra),
        !showTime && showNowBtn && mode === 'date' && (react_1.default.createElement("div", { className: prefixCls + "-footer-now-wrapper" },
            react_1.default.createElement(Link_1.default, { onClick: onSelectNow }, DATEPICKER_LOCALE.today))),
        shouldShouldShortcuts || showTime ? (react_1.default.createElement("div", { className: prefixCls + "-footer-btn-wrapper" },
            !shortcutsPlacementLeft ? (react_1.default.createElement(shortcuts_1.default, { shortcuts: shortcuts, prefixCls: prefixCls, onSelectNow: onSelectNow, nowText: DATEPICKER_LOCALE.now, showNowBtn: showNowBtn, onMouseEnterShortcut: onMouseEnterShortcut, onMouseLeaveShortcut: onMouseLeaveShortcut, onSelectShortcut: onSelectShortcut, showTime: showTime })) : (react_1.default.createElement("div", null)),
            showTime && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(Button_1.default, { type: "text", size: "mini", onClick: onClickSelectTimeBtn, className: isTimePanel ? prefixCls + "-btn-select-date" : prefixCls + "-btn-select-time" }, isTimePanel ? DATEPICKER_LOCALE.selectDate : DATEPICKER_LOCALE.selectTime),
                react_1.default.createElement(Button_1.default, { className: prefixCls + "-btn-confirm", type: "primary", size: "mini", disabled: disabled, onClick: onClickConfirmBtn }, DATEPICKER_LOCALE.ok))))) : null));
}
exports.default = Footer;
