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
var isEqualWith_1 = __importDefault(require("lodash/isEqualWith"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var utils_1 = require("../utils");
var throttleByRaf_1 = __importDefault(require("../../_util/throttleByRaf"));
var getInkStyle = function (direction, curTitle, headerRef) {
    var style = { left: '', width: '', top: '', height: '' };
    if (curTitle) {
        var diffStyle = (0, utils_1.getRectDiff)(curTitle, headerRef);
        if (direction === 'vertical') {
            style = {
                top: diffStyle.top + "px",
                height: curTitle.offsetHeight + "px",
                left: '',
                width: '',
            };
        }
        else {
            style = {
                left: diffStyle.left + "px",
                width: curTitle.offsetWidth + "px",
                top: '',
                height: '',
            };
        }
    }
    return style;
};
var TabInk = function (_a) {
    var _b;
    var prefixCls = _a.prefixCls, animation = _a.animation, disabled = _a.disabled, direction = _a.direction, getTitleRef = _a.getTitleRef, activeTab = _a.activeTab, getHeaderRef = _a.getHeaderRef, inkBarSize = _a.inkBarSize;
    var inkRef = (0, react_1.useRef)();
    var inkStyleRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        var setInkStyle = (0, throttleByRaf_1.default)(function () {
            var _a;
            var curTitle = getTitleRef(activeTab);
            var newStyle = getInkStyle(direction, curTitle, getHeaderRef('headerRef').current);
            if (newStyle && !(0, isEqualWith_1.default)(inkStyleRef.current, newStyle)) {
                inkStyleRef.current = newStyle;
                if ((_a = inkRef.current) === null || _a === void 0 ? void 0 : _a.style) {
                    Object.keys(newStyle).forEach(function (key) {
                        inkRef.current.style[key] = newStyle[key];
                    });
                }
            }
        });
        setInkStyle();
        return function () {
            setInkStyle.cancel && setInkStyle.cancel();
        };
    });
    return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-header-ink", (_b = {},
            _b[prefixCls + "-header-ink-no-animation"] = !animation,
            _b[prefixCls + "-header-ink-disabled"] = disabled,
            _b[prefixCls + "-header-ink-custom"] = inkBarSize,
            _b)), ref: inkRef }, inkBarSize && react_1.default.createElement("div", { style: inkBarSize, className: prefixCls + "-header-ink-inner" })));
};
exports.default = TabInk;
