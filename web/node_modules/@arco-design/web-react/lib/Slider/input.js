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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var InputNumber_1 = __importDefault(require("../InputNumber"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var Input = function (props) {
    var _a;
    var value = props.value, range = props.range, min = props.min, max = props.max, step = props.step, disabled = props.disabled, prefixCls = props.prefixCls, onChange = props.onChange, _b = props.extra, extra = _b === void 0 ? [] : _b;
    var baseProps = {
        min: min,
        max: max,
        step: step,
        disabled: disabled,
    };
    var _c = __read((0, react_1.useState)(value), 2), innerValue = _c[0], setInnerValue = _c[1];
    var beginExtraProps = extra[0];
    var endExtraProps = range ? extra[1] : extra[0];
    (0, react_1.useEffect)(function () {
        setInnerValue(value);
    }, [value]);
    var handleChange = function (val) {
        onChange === null || onChange === void 0 ? void 0 : onChange(val);
    };
    var handleBlur = function () {
        setInnerValue(__spreadArray([], __read(value), false).sort(function (a, b) { return a - b; }));
    };
    return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-input", (_a = {}, _a[prefixCls + "-input-group"] = range, _a)), onBlur: handleBlur },
        range && [
            react_1.default.createElement(InputNumber_1.default, __assign({}, __assign(__assign({ hideControl: true }, beginExtraProps), baseProps), { value: innerValue[0], key: 0, onChange: function (val, reason) {
                    // eslint-disable-next-line no-self-compare
                    if (!(isNaN(val) && val !== val)) {
                        handleChange([val, innerValue[1]]);
                        (beginExtraProps === null || beginExtraProps === void 0 ? void 0 : beginExtraProps.onChange) && (beginExtraProps === null || beginExtraProps === void 0 ? void 0 : beginExtraProps.onChange(val, reason));
                    }
                } })),
            react_1.default.createElement("div", { key: 1, className: prefixCls + "-input-range" },
                react_1.default.createElement("span", { className: prefixCls + "-input-range-content" })),
        ],
        react_1.default.createElement(InputNumber_1.default, __assign({}, __assign(__assign({ hideControl: true }, endExtraProps), baseProps), { key: 2, value: innerValue[1], onChange: function (val, reason) {
                // eslint-disable-next-line no-self-compare
                if (!(isNaN(val) && val !== val)) {
                    handleChange([innerValue[0], val]);
                    (endExtraProps === null || endExtraProps === void 0 ? void 0 : endExtraProps.onChange) && (endExtraProps === null || endExtraProps === void 0 ? void 0 : endExtraProps.onChange(val, reason));
                }
            } }))));
};
exports.default = (0, react_1.memo)(Input);
