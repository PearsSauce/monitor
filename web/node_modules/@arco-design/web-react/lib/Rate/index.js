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
var number_precision_1 = __importDefault(require("number-precision"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var IconStarFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconStarFill"));
var IconFaceMehFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconFaceMehFill"));
var IconFaceSmileFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconFaceSmileFill"));
var IconFaceFrownFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconFaceFrownFill"));
var ConfigProvider_1 = require("../ConfigProvider");
var Tooltip_1 = __importDefault(require("../Tooltip"));
var omit_1 = __importDefault(require("../_util/omit"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
number_precision_1.default.enableBoundaryChecking(false);
var defaultProps = {
    character: react_1.default.createElement(IconStarFill_1.default, null),
    count: 5,
};
function Rate(baseProps, ref) {
    var _a;
    var _this = this;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Rate);
    var _c = props.style, style = _c === void 0 ? {} : _c, className = props.className, defaultValue = props.defaultValue, character = props.character, count = props.count, propValue = props.value, tooltips = props.tooltips, allowHalf = props.allowHalf, allowClear = props.allowClear, readonly = props.readonly, disabled = props.disabled, grading = props.grading, onChange = props.onChange, onHoverChange = props.onHoverChange, restProps = __rest(props, ["style", "className", "defaultValue", "character", "count", "value", "tooltips", "allowHalf", "allowClear", "readonly", "disabled", "grading", "onChange", "onHoverChange"]);
    var _d = __read((0, react_1.useState)(defaultValue || propValue || 0), 2), value = _d[0], setValue = _d[1];
    var _e = __read((0, react_1.useState)(0), 2), hoverIndex = _e[0], setHoverIndex = _e[1];
    var _f = __read((0, react_1.useState)(), 2), animation = _f[0], setAnimation = _f[1];
    var prefixCls = getPrefixCls('rate');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-readonly"] = readonly,
        _a[prefixCls + "-disabled"] = disabled,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var mergedValue = 'value' in props ? propValue : value;
    var resetHoverIndex = function () {
        if (hoverIndex) {
            setHoverIndex(0);
            onHoverChange && onHoverChange(0);
        }
    };
    var onMouseEnter = function (index, isHalf) {
        var newHoverIndex = isHalf && allowHalf ? index + 0.5 : index + 1;
        if (newHoverIndex !== hoverIndex) {
            setHoverIndex(newHoverIndex);
            onHoverChange && onHoverChange(newHoverIndex);
        }
    };
    var onClick = function (index, isHalf) {
        var newValue = isHalf && allowHalf ? index + 0.5 : index + 1;
        setAnimation(true);
        if (newValue !== mergedValue) {
            setValue(newValue);
            onChange && onChange(newValue);
        }
        else if (allowClear) {
            setValue(0);
            onChange && onChange(0);
            resetHoverIndex();
        }
    };
    var renderCharacter = function (index) {
        var _a;
        // fix number like 3.7
        var fixedValue = allowHalf
            ? number_precision_1.default.times(+number_precision_1.default.divide(mergedValue || 0, 0.5).toFixed(0), 0.5)
            : Math.round(mergedValue);
        var _usedIndex = hoverIndex || fixedValue;
        var _usedCharacter = typeof character === 'function' ? character(index) : character;
        if (grading) {
            if (_usedIndex <= 2) {
                _usedCharacter = react_1.default.createElement(IconFaceFrownFill_1.default, null);
            }
            else if (_usedIndex <= 3) {
                _usedCharacter = react_1.default.createElement(IconFaceMehFill_1.default, null);
            }
            else {
                _usedCharacter = react_1.default.createElement(IconFaceSmileFill_1.default, null);
            }
            if (_usedIndex <= index) {
                _usedCharacter = react_1.default.createElement(IconFaceMehFill_1.default, null);
            }
        }
        var classNames = (0, classNames_1.default)(prefixCls + "-character", (_a = {},
            _a[prefixCls + "-character-half"] = allowHalf && index + 0.5 === _usedIndex,
            _a[prefixCls + "-character-full"] = index + 1 <= _usedIndex,
            _a[prefixCls + "-character-scale"] = animation && index + 1 < mergedValue,
            _a));
        var leftProps = readonly || disabled
            ? {}
            : {
                onMouseEnter: onMouseEnter.bind(_this, index, true),
                onClick: onClick.bind(_this, index, true),
            };
        var rightProps = readonly || disabled
            ? {}
            : {
                onMouseEnter: onMouseEnter.bind(_this, index, false),
                onClick: onClick.bind(_this, index, false),
            };
        var tooltip = tooltips && tooltips[index];
        var CharacterWrapper = tooltip ? Tooltip_1.default : react_1.default.Fragment;
        var tooltipProps = tooltip ? { content: tooltip } : {};
        function getAriaProps(isHalf) {
            return {
                role: 'radio',
                'aria-checked': index + (isHalf ? 0.5 : 1) <= _usedIndex,
                'aria-setsize': count,
                'aria-posinset': index + (isHalf ? 0.5 : 1),
            };
        }
        return (react_1.default.createElement(CharacterWrapper, __assign({ key: index }, tooltipProps),
            react_1.default.createElement("div", __assign({ className: classNames, style: animation ? { animationDelay: 50 * index + "ms" } : {}, onAnimationEnd: function () {
                    if (animation && index + 1 >= mergedValue - 1) {
                        setAnimation(false);
                    }
                } }, (!allowHalf ? getAriaProps() : {})),
                react_1.default.createElement("div", __assign({ className: prefixCls + "-character-left" }, leftProps, (allowHalf ? getAriaProps(true) : {})), _usedCharacter),
                react_1.default.createElement("div", __assign({ className: prefixCls + "-character-right" }, rightProps, (allowHalf ? getAriaProps() : {})), _usedCharacter))));
    };
    return (react_1.default.createElement("div", __assign({ ref: ref }, (0, omit_1.default)(restProps, ['error']), { style: style, className: classNames, onMouseLeave: resetHoverIndex }),
        react_1.default.createElement("div", { className: prefixCls + "-inner" }, Array.apply(null, Array(grading ? 5 : count)).map(function (_, index) { return renderCharacter(index); }))));
}
var RateComponent = react_1.default.forwardRef(Rate);
RateComponent.displayName = 'Rate';
exports.default = RateComponent;
