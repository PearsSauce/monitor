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
var is_1 = require("../_util/is");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var toArray_1 = __importDefault(require("./toArray"));
var defaultProps = {
    size: 'small',
    direction: 'horizontal',
};
function Space(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Space);
    var className = props.className, style = props.style, children = props.children, size = props.size, direction = props.direction, align = props.align, wrap = props.wrap, split = props.split, rest = __rest(props, ["className", "style", "children", "size", "direction", "align", "wrap", "split"]);
    var prefixCls = getPrefixCls('space');
    var innerAlign = align || (direction === 'horizontal' ? 'center' : '');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-" + direction] = direction,
        _a[prefixCls + "-align-" + innerAlign] = innerAlign,
        _a[prefixCls + "-wrap"] = wrap,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    function getMargin(size) {
        if ((0, is_1.isNumber)(size)) {
            return size;
        }
        switch (size) {
            case 'mini':
                return 4;
            case 'small':
                return 8;
            case 'medium':
                return 16;
            case 'large':
                return 24;
            default:
                return 8;
        }
    }
    var childrenList = (0, toArray_1.default)(children);
    function getMarginStyle(index) {
        var _a, _b, _c, _d;
        // const isLastOne =
        //   rtl && direction === 'horizontal' ? index === 0 : childrenList.length === index + 1;
        var isLastOne = childrenList.length === index + 1;
        var marginDirection = rtl ? 'marginLeft' : 'marginRight';
        if (typeof size === 'string' || typeof size === 'number') {
            var margin = getMargin(size);
            if (wrap) {
                return isLastOne
                    ? { marginBottom: margin }
                    : (_a = {},
                        _a["" + marginDirection] = margin,
                        _a.marginBottom = margin,
                        _a);
            }
            return !isLastOne
                ? (_b = {},
                    _b[direction === 'vertical' ? 'marginBottom' : marginDirection] = margin,
                    _b) : {};
        }
        if ((0, is_1.isArray)(size)) {
            var marginHorizontal = getMargin(size[0]);
            var marginBottom = getMargin(size[1]);
            if (wrap) {
                return isLastOne
                    ? { marginBottom: marginBottom }
                    : (_c = {},
                        _c["" + marginDirection] = marginHorizontal,
                        _c.marginBottom = marginBottom,
                        _c);
            }
            if (direction === 'vertical') {
                return { marginBottom: marginBottom };
            }
            return _d = {}, _d["" + marginDirection] = marginHorizontal, _d;
        }
    }
    return (react_1.default.createElement("div", __assign({ ref: ref, className: classNames, style: style }, rest), childrenList.map(function (child, index) {
        var _a;
        // Keep the key passed on the child to avoid additional DOM remounting
        // Related issue: https://github.com/arco-design/arco-design/issues/1320
        var key = ((_a = child) === null || _a === void 0 ? void 0 : _a.key) || index;
        var shouldRenderSplit = split !== undefined && split !== null && index > 0;
        return (react_1.default.createElement(react_1.Fragment, { key: key },
            shouldRenderSplit && react_1.default.createElement("div", { className: prefixCls + "-item-split" }, split),
            react_1.default.createElement("div", { className: prefixCls + "-item", style: getMarginStyle(index) }, child)));
    })));
}
var SpaceComponent = (0, react_1.forwardRef)(Space);
SpaceComponent.displayName = 'Space';
exports.default = SpaceComponent;
