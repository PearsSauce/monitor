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
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var is_1 = require("../_util/is");
var count_1 = __importDefault(require("./count"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
var InnerColors = [
    'red',
    'orangered',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'arcoblue',
    'purple',
    'pinkpurple',
    'magenta',
    'gray',
];
var defaultProps = {
    count: 0,
    maxCount: 99,
};
function Badge(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Badge);
    var count = props.count, text = props.text, className = props.className, dotClassName = props.dotClassName, dot = props.dot, maxCount = props.maxCount, color = props.color, propsDotStyle = props.dotStyle, offset = props.offset, style = props.style, status = props.status, children = props.children, restProps = __rest(props, ["count", "text", "className", "dotClassName", "dot", "maxCount", "color", "dotStyle", "offset", "style", "status", "children"]);
    var prefixCls = getPrefixCls('badge');
    var dotStyle = __assign({}, (propsDotStyle || {}));
    var _c = __read(offset || [], 2), leftOffset = _c[0], topOffset = _c[1];
    if (leftOffset) {
        dotStyle.marginRight = -leftOffset;
    }
    if (topOffset) {
        dotStyle.marginTop = topOffset;
    }
    var getDom = function () {
        var _a, _b;
        if ((0, is_1.isObject)(count)) {
            return (react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-custom-dot", dotClassName), style: dotStyle }, count));
        }
        var colorStyle = !color || InnerColors.indexOf(color) > -1 ? {} : { backgroundColor: color };
        // display a red dot if color and status are NOT set
        if (text && !color && !status) {
            return (react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-text", dotClassName), style: dotStyle }, text));
        }
        if (status || (color && typeof count === 'number' && count <= 0)) {
            return (react_1.default.createElement("span", { className: prefixCls + "-status-wrapper" },
                react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-status-dot", (_a = {},
                        _a[prefixCls + "-status-" + status] = status,
                        _a[prefixCls + "-color-" + color] = color,
                        _a), dotClassName), style: __assign(__assign({}, colorStyle), dotStyle) }),
                text && react_1.default.createElement("span", { className: prefixCls + "-status-text" }, text)));
        }
        if ((dot || color) && typeof count === 'number' && count > 0) {
            return (react_1.default.createElement(CSSTransition_1.default, { classNames: "badge-zoom", in: dot || !!color, timeout: 200, appear: true, mountOnEnter: true, unmountOnExit: true },
                react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-dot", (_b = {},
                        _b[prefixCls + "-color-" + color] = color,
                        _b), dotClassName), style: __assign(__assign({}, colorStyle), dotStyle) })));
        }
        return (react_1.default.createElement(count_1.default, { prefixCls: prefixCls, className: (0, classNames_1.default)(prefixCls + "-number", dotClassName), style: __assign(__assign({}, colorStyle), dotStyle), maxCount: maxCount, count: count }));
    };
    return (react_1.default.createElement("span", __assign({ className: (0, classNames_1.default)(prefixCls, (_a = {},
            _a[prefixCls + "-status"] = status,
            _a[prefixCls + "-no-children"] = !children,
            _a[prefixCls + "-rtl"] = rtl,
            _a), className), ref: ref, style: style }, restProps),
        children,
        getDom()));
}
var BadgeComponent = (0, react_1.forwardRef)(Badge);
BadgeComponent.displayName = 'Badge';
exports.default = BadgeComponent;
