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
var classNames_1 = __importDefault(require("../_util/classNames"));
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var ConfigProvider_1 = require("../ConfigProvider");
var IconDragDotVertical_1 = __importDefault(require("../../icon/react-icon-cjs/IconDragDotVertical"));
var IconDragDot_1 = __importDefault(require("../../icon/react-icon-cjs/IconDragDot"));
var IconCaretRight_1 = __importDefault(require("../../icon/react-icon-cjs/IconCaretRight"));
var IconCaretLeft_1 = __importDefault(require("../../icon/react-icon-cjs/IconCaretLeft"));
var IconCaretDown_1 = __importDefault(require("../../icon/react-icon-cjs/IconCaretDown"));
var IconCaretUp_1 = __importDefault(require("../../icon/react-icon-cjs/IconCaretUp"));
var is_1 = require("../_util/is");
var omit_1 = __importDefault(require("../_util/omit"));
function ResizeTrigger(props) {
    var _a, _b;
    var className = props.className, direction = props.direction, icon = props.icon, onMouseDown = props.onMouseDown, onResize = props.onResize, children = props.children, _c = props.collapsible, collapsible = _c === void 0 ? {} : _c, _d = props.resizable, resizable = _d === void 0 ? true : _d, renderChildren = props.renderChildren, rest = __rest(props, ["className", "direction", "icon", "onMouseDown", "onResize", "children", "collapsible", "resizable", "renderChildren"]);
    var _e = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _e.getPrefixCls, rtl = _e.rtl;
    var prefixCls = getPrefixCls('resizebox-trigger');
    var isHorizontal = direction === 'horizontal';
    var rtlReverse = rtl && !isHorizontal;
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-" + (isHorizontal ? 'horizontal' : 'vertical'), (_a = {}, _a[prefixCls + "-not-resizable"] = !resizable, _a), (_b = {}, _b[prefixCls + "-rtl"] = rtl, _b), className);
    var refDiv = (0, react_1.useRef)();
    var verticalTriggerIcon = rtlReverse
        ? [react_1.default.createElement(IconCaretRight_1.default, { key: "prev" }), react_1.default.createElement(IconCaretLeft_1.default, { key: "next" })]
        : [react_1.default.createElement(IconCaretLeft_1.default, { key: "prev" }), react_1.default.createElement(IconCaretRight_1.default, { key: "next" })];
    var prevCollapsedConfig = (0, is_1.isObject)(collapsible.prev)
        ? __assign(__assign({}, collapsible.prev), { icon: collapsible.prev.icon || (isHorizontal ? react_1.default.createElement(IconCaretUp_1.default, null) : verticalTriggerIcon[0]) }) : {};
    var nextCollapsedConfig = (0, is_1.isObject)(collapsible.next)
        ? __assign(__assign({}, collapsible.next), { icon: collapsible.next.icon || (isHorizontal ? react_1.default.createElement(IconCaretDown_1.default, null) : verticalTriggerIcon[1]) }) : {};
    var renderPrevCollapsedTrigger = function () {
        // 1. 传入了prev
        // 当前不在收缩状态，或者在反方向收缩状态时展示
        if ((prevCollapsedConfig.icon && !prevCollapsedConfig.collapsed) ||
            nextCollapsedConfig.collapsed) {
            return (react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-icon", (0, classNames_1.default)(prefixCls + "-prev")), onClick: prevCollapsedConfig.onClick }, prevCollapsedConfig.icon));
        }
        return react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-icon-empty") });
    };
    var renderNextCollapsedTrigger = function () {
        if ((nextCollapsedConfig.icon && !nextCollapsedConfig.collapsed) ||
            prevCollapsedConfig.collapsed) {
            return (react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-icon", (0, classNames_1.default)(prefixCls + "-next")), onClick: nextCollapsedConfig.onClick }, nextCollapsedConfig.icon));
        }
        return react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-icon-empty") });
    };
    var renderResizeTrigger = function () {
        if (resizable) {
            return (react_1.default.createElement("span", { className: prefixCls + "-icon" }, icon || (isHorizontal ? react_1.default.createElement(IconDragDot_1.default, null) : react_1.default.createElement(IconDragDotVertical_1.default, null))));
        }
        return react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-icon-empty") });
    };
    var prev = renderPrevCollapsedTrigger();
    var trigger = renderResizeTrigger();
    var next = renderNextCollapsedTrigger();
    var renderIcon = function () {
        return (react_1.default.createElement("div", { className: prefixCls + "-icon-wrapper" },
            prev,
            trigger,
            next));
    };
    if (!resizable) {
        return (react_1.default.createElement("div", { className: classNames }, (0, is_1.isFunction)(renderChildren)
            ? renderChildren(prev, trigger, next)
            : children || renderIcon()));
    }
    return (react_1.default.createElement(resizeObserver_1.default, { onResize: onResize, getTargetDOMNode: function () { return refDiv.current; } },
        react_1.default.createElement("div", __assign({ ref: refDiv }, (0, omit_1.default)(rest, ['style']), { className: classNames, onMouseDown: onMouseDown }), (0, is_1.isFunction)(renderChildren)
            ? renderChildren(prev, trigger, next)
            : children || renderIcon())));
}
exports.default = ResizeTrigger;
