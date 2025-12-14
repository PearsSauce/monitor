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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiderContext = void 0;
var react_1 = __importStar(require("react"));
var get_1 = __importDefault(require("lodash/get"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var sider_1 = __importStar(require("./sider"));
Object.defineProperty(exports, "SiderContext", { enumerable: true, get: function () { return sider_1.SiderContext; } });
var header_1 = __importDefault(require("./header"));
var footer_1 = __importDefault(require("./footer"));
var content_1 = __importDefault(require("./content"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
function Layout(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, {}, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Layout);
    var className = props.className, hasSider = props.hasSider, children = props.children, rest = __rest(props, ["className", "hasSider", "children"]);
    var _c = __read((0, react_1.useState)([]), 2), siders = _c[0], setSiders = _c[1];
    var prefixCls = getPrefixCls('layout');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-has-sider"] = typeof hasSider === 'boolean' ? hasSider : siders.length > 0,
        _a), className);
    return (react_1.default.createElement("section", __assign({ ref: ref }, rest, { className: classNames }), react_1.default.Children.map(children, function (child) {
        // child?.props?.sign: Compatible with custom components
        var sign = (0, get_1.default)(child, 'type.__ARCO_SIGN__') || (0, get_1.default)(child, 'props.sign');
        if (child && sign === 'sider') {
            return react_1.default.cloneElement(child, {
                onSiderMount: function (id) { return setSiders(__spreadArray(__spreadArray([], __read(siders), false), [id], false)); },
                onSiderUnmount: function (id) { return setSiders(siders.filter(function (currentId) { return currentId !== id; })); },
            });
        }
        return child;
    })));
}
var ForwardRefLayout = (0, react_1.forwardRef)(Layout);
var LayoutComponent = ForwardRefLayout;
LayoutComponent.displayName = 'Layout';
LayoutComponent.Sider = sider_1.default;
LayoutComponent.Header = header_1.default;
LayoutComponent.Footer = footer_1.default;
LayoutComponent.Content = content_1.default;
exports.default = LayoutComponent;
