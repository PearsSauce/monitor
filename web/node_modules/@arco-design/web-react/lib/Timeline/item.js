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
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var defaultProps = {
    dotType: 'solid',
    lineType: 'solid',
};
function Item(baseProps, ref) {
    var _a, _b;
    var _c = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _c.getPrefixCls, componentConfig = _c.componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Timeline.Item']);
    var children = props.children, className = props.className, style = props.style, label = props.label, position = props.position, dot = props.dot, dotColor = props.dotColor, dotType = props.dotType, lineType = props.lineType, lineColor = props.lineColor, direction = props.direction, labelPosition = props.labelPosition, _d = props.autoFixDotSize, autoFixDotSize = _d === void 0 ? true : _d, rest = __rest(props, ["children", "className", "style", "label", "position", "dot", "dotColor", "dotType", "lineType", "lineColor", "direction", "labelPosition", "autoFixDotSize"]);
    var dotRef = (0, react_1.useRef)();
    var prefixCls = getPrefixCls('timeline');
    var autoFixSize = function () {
        if (dotRef.current) {
            var dotWidth = dotRef.current.offsetWidth;
            var scale = 16 / dotWidth; // 16 是允许的节点最大宽度。
            if (scale < 1) {
                dotRef.current.style.transform = "translateX(-50%) translateY(-50%) scale(" + scale + ")";
            }
        }
    };
    (0, react_1.useEffect)(function () {
        autoFixDotSize && autoFixSize();
    }, [props]);
    var labelDom = label && react_1.default.createElement("div", { className: prefixCls + "-item-label" }, label);
    return (react_1.default.createElement("div", __assign({ ref: ref, role: "listitem" }, rest, { className: (0, classNames_1.default)(prefixCls + "-item", (_a = {},
            _a[prefixCls + "-item-" + direction + "-" + position] = direction,
            _a[prefixCls + "-item-label-" + labelPosition] = labelPosition,
            _a), className), style: style }),
        react_1.default.createElement("div", { className: prefixCls + "-item-dot-wrapper" },
            react_1.default.createElement("div", { className: prefixCls + "-item-dot-line " + prefixCls + "-item-dot-line-is-" + direction, style: __assign((_b = {}, _b["" + (direction === 'horizontal' ? 'borderTopStyle' : 'borderLeftStyle')] = lineType, _b), (lineColor ? { borderColor: lineColor } : {})) }),
            react_1.default.createElement("div", { className: prefixCls + "-item-dot-content" }, dot ? (react_1.default.createElement("div", { className: prefixCls + "-item-dot-custom", ref: dotRef }, dot)) : (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-item-dot", prefixCls + "-item-dot-" + dotType), style: dotType === 'solid' ? { backgroundColor: dotColor } : { borderColor: dotColor } })))),
        react_1.default.createElement("div", { className: prefixCls + "-item-content-wrapper" },
            children && react_1.default.createElement("div", { className: prefixCls + "-item-content" }, children),
            labelPosition !== 'relative' && labelDom),
        labelPosition === 'relative' && labelDom));
}
var ForwardRefItem = react_1.default.forwardRef(Item);
var TimelineItem = ForwardRefItem;
TimelineItem.displayName = 'TimelineItem';
TimelineItem.isTimelineItem = true;
exports.default = TimelineItem;
