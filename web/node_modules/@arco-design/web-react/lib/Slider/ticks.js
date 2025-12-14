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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var number_precision_1 = require("number-precision");
var utils_1 = require("./utils");
var classNames_1 = __importDefault(require("../_util/classNames"));
exports.default = (0, react_1.memo)(function Ticks(props) {
    var min = props.min, max = props.max, valueRange = props.valueRange, prefixCls = props.prefixCls, vertical = props.vertical, reverse = props.reverse, intervalConfigs = props.intervalConfigs;
    var stepsMap = new Map();
    var getCurrentSteps = function (interval) {
        var step = interval.step, begin = interval.begin, end = interval.end;
        var stepsLength = Math.floor((end - begin) / step);
        for (var i = 0; i <= stepsLength; i++) {
            var stepVal = (0, number_precision_1.plus)(i * step, begin);
            if (stepVal <= min || stepVal >= max)
                continue;
            var offset = (0, utils_1.formatPercent)((0, utils_1.getIntervalOffset)(stepVal, intervalConfigs));
            stepsMap.set(offset, { offset: offset, isActive: (0, utils_1.valueInRange)(stepVal, valueRange) });
        }
    };
    var steps = (0, react_1.useMemo)(function () {
        stepsMap.clear();
        intervalConfigs.forEach(function (interval) { return getCurrentSteps(interval); });
        return Array.from(stepsMap.values());
    }, [intervalConfigs]);
    return (react_1.default.createElement("div", { className: prefixCls + "-ticks" }, steps.map(function (item, index) {
        var _a, _b, _c;
        return (react_1.default.createElement("div", { key: index, className: (0, classNames_1.default)(prefixCls + "-tick", (_a = {}, _a[prefixCls + "-tick-active"] = item.isActive, _a)), style: vertical
                ? (_b = {}, _b[reverse ? 'top' : 'bottom'] = item.offset, _b) : (_c = {}, _c[reverse ? 'right' : 'left'] = item.offset, _c) }));
    })));
});
