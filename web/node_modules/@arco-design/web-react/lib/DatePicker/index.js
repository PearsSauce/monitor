"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var picker_1 = __importDefault(require("./picker"));
var picker_range_1 = __importDefault(require("./picker-range"));
var date_1 = __importDefault(require("./panels/date"));
var month_1 = __importDefault(require("./panels/month"));
var year_1 = __importDefault(require("./panels/year"));
var week_1 = __importDefault(require("./panels/week"));
var quarter_1 = __importDefault(require("./panels/quarter"));
function wrapper(picker, options) {
    var _a;
    return _a = /** @class */ (function (_super) {
            __extends(PickerWrapper, _super);
            function PickerWrapper(props) {
                var _this = _super.call(this, props) || this;
                _this.refPicker = react_1.default.createRef();
                return _this;
            }
            PickerWrapper.prototype.focus = function () {
                this.refPicker.current && this.refPicker.current.focus && this.refPicker.current.focus();
            };
            PickerWrapper.prototype.blur = function () {
                this.refPicker.current && this.refPicker.current.blur && this.refPicker.current.blur();
            };
            PickerWrapper.prototype.render = function () {
                return react_1.default.createElement(picker_1.default, __assign({}, this.props, { ref: this.refPicker, picker: picker, mode: options.mode }));
            };
            return PickerWrapper;
        }(react_1.default.Component)),
        _a.displayName = options.displayName,
        _a;
}
var DatePicker = wrapper(react_1.default.createElement(date_1.default, null), {
    displayName: 'DatePicker',
    mode: 'date',
});
var MonthPicker = wrapper(react_1.default.createElement(month_1.default, null), {
    displayName: 'MonthPicker',
    mode: 'month',
});
var YearPicker = wrapper(react_1.default.createElement(year_1.default, null), {
    displayName: 'YearPicker',
    mode: 'year',
});
var WeekPicker = wrapper(react_1.default.createElement(week_1.default, null), {
    displayName: 'WeekPicker',
    mode: 'week',
});
var QuarterPicker = wrapper(react_1.default.createElement(quarter_1.default, null), {
    displayName: 'QuarterPicker',
    mode: 'quarter',
});
var RangePicker = picker_range_1.default;
exports.default = Object.assign(DatePicker, {
    MonthPicker: MonthPicker,
    YearPicker: YearPicker,
    WeekPicker: WeekPicker,
    QuarterPicker: QuarterPicker,
    RangePicker: RangePicker,
});
