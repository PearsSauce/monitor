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
var is_1 = require("../_util/is");
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var context_1 = require("./context");
var defaultProps = {
    span: 24,
};
function getFlexString(flex) {
    if (typeof flex === 'string' && /\d+[px|%|em|rem|]{1}/.test(flex)) {
        return "0 0 " + flex;
    }
    return flex;
}
function Col(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Grid.Col']);
    var _c = (0, react_1.useContext)(context_1.RowContext), gutter = _c.gutter, div = _c.div;
    var className = props.className, style = props.style, children = props.children, span = props.span, offset = props.offset, order = props.order, pull = props.pull, push = props.push, xs = props.xs, sm = props.sm, md = props.md, lg = props.lg, xl = props.xl, xxl = props.xxl, xxxl = props.xxxl, flex = props.flex, rest = __rest(props, ["className", "style", "children", "span", "offset", "order", "pull", "push", "xs", "sm", "md", "lg", "xl", "xxl", "xxxl", "flex"]);
    function adaptationGrid(prefixCls, mergeClassName) {
        var screenList = { xs: xs, sm: sm, md: md, lg: lg, xl: xl, xxl: xxl, xxxl: xxxl };
        Object.keys(screenList).forEach(function (screen) {
            var screenValue = screenList[screen];
            if ((0, is_1.isNumber)(screenValue)) {
                if (screenValue >= 0) {
                    mergeClassName[prefixCls + "-" + screen + "-" + screenValue] = true;
                }
            }
            else if ((0, is_1.isObject)(screenValue)) {
                mergeClassName[prefixCls + "-" + screen + "-" + screenValue.span] = screenValue.span;
                mergeClassName[prefixCls + "-" + screen + "-offset-" + screenValue.offset] = screenValue.offset;
                mergeClassName[prefixCls + "-" + screen + "-order-" + screenValue.order] = screenValue.order;
                mergeClassName[prefixCls + "-" + screen + "-pull-" + screenValue.pull] = screenValue.pull;
                mergeClassName[prefixCls + "-" + screen + "-push-" + screenValue.push] = screenValue.push;
            }
        });
        return mergeClassName;
    }
    var prefixCls = getPrefixCls('col');
    var mergeClassName = (_a = {},
        _a["" + prefixCls] = !div,
        _a[prefixCls + "-order-" + order] = order,
        _a[prefixCls + "-" + span] = !div && !xs && !sm && !md && !lg && !xl && !xxl && !xxxl,
        _a[prefixCls + "-offset-" + offset] = offset,
        _a[prefixCls + "-pull-" + pull] = pull,
        _a[prefixCls + "-push-" + push] = push,
        _a[prefixCls + "-rtl"] = rtl,
        _a);
    mergeClassName = adaptationGrid(prefixCls, mergeClassName);
    var classNames = (0, classNames_1.default)(flex ? prefixCls : mergeClassName, className);
    var paddingStyle = {};
    if (Array.isArray(gutter) && !div) {
        var paddingHorizontal = (gutter[0] && gutter[0] / 2) || 0;
        var paddingVertical = (gutter[1] && gutter[1] / 2) || 0;
        if (paddingHorizontal) {
            paddingStyle.paddingLeft = paddingHorizontal;
            paddingStyle.paddingRight = paddingHorizontal;
        }
        if (paddingVertical) {
            paddingStyle.paddingTop = paddingVertical;
            paddingStyle.paddingBottom = paddingVertical;
        }
    }
    var flexStyle = (0, react_1.useMemo)(function () { return (getFlexString(flex) ? { flex: getFlexString(flex) } : {}); }, [flex]);
    return (react_1.default.createElement("div", __assign({ ref: ref }, rest, { style: __assign(__assign(__assign({}, style), paddingStyle), flexStyle), className: classNames }), children));
}
var ColComponent = (0, react_1.forwardRef)(Col);
ColComponent.displayName = 'Col';
exports.default = ColComponent;
