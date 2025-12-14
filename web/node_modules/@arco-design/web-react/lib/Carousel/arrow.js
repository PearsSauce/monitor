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
var IconLeft_1 = __importDefault(require("../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../icon/react-icon-cjs/IconRight"));
var IconUp_1 = __importDefault(require("../../icon/react-icon-cjs/IconUp"));
var IconDown_1 = __importDefault(require("../../icon/react-icon-cjs/IconDown"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
function CarouselArrow(props, ref) {
    var _a;
    var className = props.className, _b = props.direction, direction = _b === void 0 ? 'horizontal' : _b, _c = props.showArrow, showArrow = _c === void 0 ? 'always' : _c, prev = props.prev, next = props.next, icons = props.icons;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('carousel');
    var arrowClass = (0, classNames_1.default)(prefixCls + "-arrow", (_a = {},
        _a[prefixCls + "-arrow-hover"] = showArrow === 'hover',
        _a), className);
    var iconPrev = icons && icons.hasOwnProperty('prev') ? (icons.prev) : direction === 'horizontal' ? (react_1.default.createElement(IconLeft_1.default, null)) : (react_1.default.createElement(IconUp_1.default, null));
    var iconNext = icons && icons.hasOwnProperty('next') ? (icons.next) : direction === 'horizontal' ? (react_1.default.createElement(IconRight_1.default, null)) : (react_1.default.createElement(IconDown_1.default, null));
    return (react_1.default.createElement("div", { ref: ref, className: arrowClass },
        react_1.default.createElement("div", __assign({ className: prefixCls + "-arrow-" + (direction === 'vertical' ? 'top' : 'left'), onClick: prev, role: "button", tabIndex: 0 }, getKeyboardEvents({ onPressEnter: prev })), iconPrev),
        react_1.default.createElement("div", __assign({ className: prefixCls + "-arrow-" + (direction === 'vertical' ? 'bottom' : 'right'), onClick: next, role: "button", tabIndex: 0 }, getKeyboardEvents({ onPressEnter: next })), iconNext)));
}
var CarouselArrowComponent = react_1.default.forwardRef(CarouselArrow);
exports.default = CarouselArrowComponent;
