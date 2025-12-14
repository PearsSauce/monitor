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
var Menu_1 = __importDefault(require("../Menu"));
var IconObliqueLine_1 = __importDefault(require("../../icon/react-icon-cjs/IconObliqueLine"));
var omit_1 = __importDefault(require("../_util/omit"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var is_1 = require("../_util/is");
var defaultItemRender = function (route, routes, paths) {
    if (routes.indexOf(route) === routes.length - 1) {
        return react_1.default.createElement("span", null, route.breadcrumbName);
    }
    return react_1.default.createElement("a", { href: "#/" + paths.join('/').replace(/^\//, '') }, route.breadcrumbName);
};
var defaultProps = {
    separator: react_1.default.createElement(IconObliqueLine_1.default, null),
};
function Breadcrumb(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Breadcrumb);
    var className = props.className, children = props.children, style = props.style, routes = props.routes, maxCount = props.maxCount, separator = props.separator, rest = __rest(props, ["className", "children", "style", "routes", "maxCount", "separator"]);
    var prefixCls = getPrefixCls('breadcrumb');
    var itemRender = 'itemRender' in props ? props.itemRender : defaultItemRender;
    var Ellipses = (react_1.default.createElement("span", { "aria-label": "ellipses of breadcrumb items", className: prefixCls + "-item-ellipses" }, "..."));
    var Separator = (react_1.default.createElement("span", { "aria-hidden": true, className: prefixCls + "-item-separator" }, separator));
    var getValidChild = function (itemToRender, delta, index) {
        var SeparatorWithKey = react_1.default.cloneElement(Separator, { key: index + "_separator" });
        // Show ellipses
        if (delta > 0) {
            if (index === 0) {
                return [itemToRender, SeparatorWithKey, Ellipses];
            }
            if (index > delta) {
                return [SeparatorWithKey, itemToRender];
            }
            return null;
        }
        return index === 0 ? [itemToRender] : [SeparatorWithKey, itemToRender];
    };
    var getItemsByRoute = function () {
        var paths = [];
        var delta = routes.length - maxCount;
        return routes.map(function (route, index) {
            paths.push((route.path || '').replace(/^\//, ''));
            var droplist = route.children ? (react_1.default.createElement(Menu_1.default, null, route.children.map(function (item) {
                return (react_1.default.createElement(Menu_1.default.Item, { key: item.path || item.breadcrumbName }, itemRender(item, routes, paths)));
            }))) : null;
            return getValidChild(react_1.default.createElement(item_1.default, { prefixCls: prefixCls, key: route.path || route.breadcrumbName, droplist: droplist }, itemRender(route, routes, paths)), delta, index);
        });
    };
    var getItemsByChildren = function () {
        var _children = [];
        react_1.default.Children.forEach(children, function (child) {
            if (!(0, is_1.isEmptyReactNode)(child)) {
                _children.push(child);
            }
        });
        var delta = _children.length - maxCount;
        return react_1.default.Children.map(_children, function (child, index) {
            return getValidChild(react_1.default.cloneElement(child, {
                prefixCls: prefixCls,
            }), delta, index);
        });
    };
    return (react_1.default.createElement("div", __assign({ role: "list", ref: ref, style: style, className: (0, classNames_1.default)(prefixCls, (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), className) }, (0, omit_1.default)(rest, ['itemRender'])), routes && routes.length ? getItemsByRoute() : getItemsByChildren()));
}
var ForwardRefBreadcrumb = (0, react_1.forwardRef)(Breadcrumb);
var BreadcrumbComponent = ForwardRefBreadcrumb;
BreadcrumbComponent.displayName = 'Breadcrumb';
BreadcrumbComponent.Item = item_1.default;
exports.default = BreadcrumbComponent;
