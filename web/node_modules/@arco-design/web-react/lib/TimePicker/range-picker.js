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
var time_picker_1 = __importDefault(require("./time-picker"));
var is_1 = require("../_util/is");
var dayjs_1 = require("../_util/dayjs");
var omit_1 = __importDefault(require("../_util/omit"));
var context_1 = __importDefault(require("./context"));
function RangePicker(props) {
    var _a = props.format, format = _a === void 0 ? 'HH:mm:ss' : _a, onSelect = props.onSelect, focusedInputIndex = props.focusedInputIndex, changeFocusedInputIndex = props.changeFocusedInputIndex, popupVisible = props.popupVisible, onConfirmValue = props.onConfirmValue, _b = props.valueShow, valueShow = _b === void 0 ? [] : _b, setValueShow = props.setValueShow, disableConfirm = props.disableConfirm, rest = __rest(props, ["format", "onSelect", "focusedInputIndex", "changeFocusedInputIndex", "popupVisible", "onConfirmValue", "valueShow", "setValueShow", "disableConfirm"]);
    var _c = (0, react_1.useContext)(context_1.default), utcOffset = _c.utcOffset, timezone = _c.timezone;
    function onSelectTime(_, time) {
        var zoneValue = valueShow.slice();
        var v = valueShow.map(function (a) { return (0, dayjs_1.toLocal)(a, utcOffset, timezone); });
        zoneValue[focusedInputIndex] = (0, dayjs_1.toTimezone)(time, utcOffset, timezone);
        v[focusedInputIndex] = time;
        onSelect &&
            onSelect(v.map(function (t) { return t.format(format); }), v);
        setValueShow(zoneValue);
        if (disableConfirm && (0, is_1.isArray)(v) && (0, is_1.isDayjs)(v[0]) && (0, is_1.isDayjs)(v[1])) {
            onConfirmValue(zoneValue);
        }
    }
    function onConfirmValueInner() {
        if (valueShow.length && (valueShow[0] === undefined || valueShow[1] === undefined)) {
            changeFocusedInputIndex(focusedInputIndex === 0 ? 1 : 0);
        }
        else {
            onConfirmValue(valueShow);
        }
    }
    var timepickerProps = (0, omit_1.default)(rest, ['defaultValue', 'placeholder', 'value', 'onChange']);
    var currentShowValue = valueShow[focusedInputIndex];
    return (react_1.default.createElement(time_picker_1.default, __assign({ onSelect: onSelectTime, value: currentShowValue, format: format, isRangePicker: true, onConfirmValue: onConfirmValueInner, confirmBtnDisabled: !(0, is_1.isDayjs)(currentShowValue), valueShow: currentShowValue, popupVisible: popupVisible, disableConfirm: disableConfirm }, timepickerProps)));
}
exports.default = RangePicker;
