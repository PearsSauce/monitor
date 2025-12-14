"use strict";
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
var dayjs_1 = __importDefault(require("dayjs"));
var dayjs_2 = require("../_util/dayjs");
var classNames_1 = __importDefault(require("../_util/classNames"));
var util_1 = require("./util");
var ConfigProvider_1 = require("../ConfigProvider");
var is_1 = require("../_util/is");
function Countdown(props, ref) {
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var className = props.className, style = props.style, title = props.title, styleValue = props.styleValue, value = props.value, onFinish = props.onFinish, renderFormat = props.renderFormat, _a = props.format, format = _a === void 0 ? 'HH:mm:ss' : _a, _b = props.start, start = _b === void 0 ? true : _b;
    var dayjsValue = (0, dayjs_2.getDayjsValue)(value, format) || (0, dayjs_1.default)();
    var now = (0, dayjs_2.getDayjsValue)(props.now, format);
    var prefixCls = getPrefixCls('statistic');
    var _c = __read((0, react_1.useState)(dayjsValue.diff(now, 'millisecond')), 2), valueDiff = _c[0], setValueDiff = _c[1];
    var _d = __read((0, react_1.useState)((0, util_1.getDateString)(Math.max(valueDiff, 0), format)), 2), valueShow = _d[0], setValueShow = _d[1];
    var timerRef = (0, react_1.useRef)(null);
    var stopTimer = function () {
        clearInterval(timerRef.current);
        timerRef.current = null;
    };
    var startTimer = function () {
        timerRef.current = setInterval(function () {
            var _valueDiff = dayjsValue.diff((0, dayjs_2.getNow)());
            var _value = dayjsValue.diff((0, dayjs_2.getNow)(), 'millisecond');
            if (_value <= 0) {
                stopTimer();
                onFinish === null || onFinish === void 0 ? void 0 : onFinish();
            }
            var valueShow = (0, util_1.getDateString)(Math.max(_value, 0), format);
            setValueShow(valueShow);
            setValueDiff(_valueDiff);
        }, 1000 / 30);
    };
    (0, react_1.useEffect)(function () {
        if (!timerRef.current && start) {
            if (dayjsValue.valueOf() >= Date.now()) {
                startTimer();
            }
        }
        return function () {
            stopTimer();
        };
    }, [props.start]);
    var valueShowNode = (0, is_1.isFunction)(renderFormat) ? renderFormat(valueDiff, valueShow) : valueShow;
    return (react_1.default.createElement("div", { ref: ref, className: (0, classNames_1.default)("" + prefixCls, prefixCls + "-countdown", className), style: style },
        title && react_1.default.createElement("div", { className: prefixCls + "-title" }, title),
        react_1.default.createElement("div", { className: prefixCls + "-content" },
            react_1.default.createElement("div", { className: prefixCls + "-value", style: styleValue }, valueShowNode))));
}
var CountdownComponent = (0, react_1.forwardRef)(Countdown);
CountdownComponent.displayName = 'StatisticCountdown';
exports.default = CountdownComponent;
