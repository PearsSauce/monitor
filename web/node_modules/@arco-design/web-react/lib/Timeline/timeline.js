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
var item_1 = __importDefault(require("./item"));
var ConfigProvider_1 = require("../ConfigProvider");
var Spin_1 = __importDefault(require("../Spin"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var getDefaultPosition = function (position, index, mode, direction) {
    var map = ['left', 'right'];
    if (direction === 'horizontal') {
        map = ['top', 'bottom'];
    }
    var res = mode === 'alternate' ? position || map[index % 2] : mode;
    return map.indexOf(res) > -1 ? res : map[0];
};
var defaultProps = {
    mode: 'left',
    direction: 'vertical',
    pendingDot: react_1.default.createElement(Spin_1.default, { size: 12 }),
    labelPosition: 'same',
};
function Timeline(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    if (rtl) {
        defaultProps.mode = 'right';
    }
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Timeline);
    var className = props.className, mode = props.mode, reverse = props.reverse, children = props.children, style = props.style, direction = props.direction, pending = props.pending, labelPosition = props.labelPosition, pendingDot = props.pendingDot, rest = __rest(props, ["className", "mode", "reverse", "children", "style", "direction", "pending", "labelPosition", "pendingDot"]);
    var prefixCls = getPrefixCls('timeline');
    var items = react_1.default.Children.map(children, function (child) {
        if (child && child.type && child.type.isTimelineItem) {
            return child;
        }
        return null;
    }) || [];
    if (pending) {
        items.push(react_1.default.createElement(item_1.default, { lineType: "dashed", dot: pendingDot }, pending === true ? '' : pending));
    }
    if (reverse) {
        items.reverse();
    }
    return (react_1.default.createElement("div", __assign({ role: "list" }, rest, { ref: ref, className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + mode, prefixCls + "-direction-" + direction, (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), className), style: style }), items.map(function (child, index) {
        var _a;
        if (!child) {
            return null;
        }
        var position = child.props.position;
        var lineType = child.props.lineType;
        if (pending) {
            if (reverse) {
                if (index === 0) {
                    lineType = 'dashed';
                }
            }
            else if (items.length - 2 === index) {
                lineType = 'dashed';
            }
        }
        return react_1.default.cloneElement(child, {
            key: index,
            className: (0, classNames_1.default)(child.props.className, (_a = {},
                _a[prefixCls + "-item-last"] = items.length - 1 === index,
                _a)),
            labelPosition: labelPosition,
            position: getDefaultPosition(position, index, mode, direction),
            direction: direction,
            lineType: lineType,
        });
    })));
}
var ForwardRefTimeline = react_1.default.forwardRef(Timeline);
var TimelineComponent = ForwardRefTimeline;
TimelineComponent.displayName = 'Timeline';
TimelineComponent.Item = item_1.default;
exports.default = TimelineComponent;
