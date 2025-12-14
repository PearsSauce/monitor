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
var meta_1 = __importDefault(require("./meta"));
var grid_1 = __importDefault(require("./grid"));
var ConfigProvider_1 = require("../ConfigProvider");
var Spin_1 = __importDefault(require("../Spin"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var defaultProps = {
    size: 'default',
    bordered: true,
};
function Card(baseProps, ref) {
    var _a, _b;
    var _c = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _c.getPrefixCls, loadingElement = _c.loadingElement, componentConfig = _c.componentConfig, rtl = _c.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Card);
    var className = props.className, children = props.children, bordered = props.bordered, loading = props.loading, hoverable = props.hoverable, size = props.size, title = props.title, extra = props.extra, cover = props.cover, actions = props.actions, headerStyle = props.headerStyle, bodyStyle = props.bodyStyle, rest = __rest(props, ["className", "children", "bordered", "loading", "hoverable", "size", "title", "extra", "cover", "actions", "headerStyle", "bodyStyle"]);
    var prefixCls = getPrefixCls('card');
    var actionList = actions && actions.length ? (react_1.default.createElement("div", { className: prefixCls + "-actions" },
        react_1.default.createElement("div", { className: prefixCls + "-actions-right" }, actions.map(function (action, index) { return (react_1.default.createElement("span", { key: "action-" + index, className: prefixCls + "-actions-item" }, action)); })))) : null;
    var isContainGrid = false;
    var isContainMeta = false;
    var handledChildren = react_1.default.Children.map(children, function (element) {
        if (element && element.type) {
            if (element.type === grid_1.default) {
                isContainGrid = true;
            }
            else if (element.type === meta_1.default) {
                isContainMeta = true;
                return react_1.default.cloneElement(element, { actionList: actionList });
            }
        }
        return element;
    });
    return (react_1.default.createElement("div", __assign({}, rest, { ref: ref, className: (0, classNames_1.default)(prefixCls, prefixCls + "-size-" + size, (_a = {},
            _a[prefixCls + "-loading"] = loading,
            _a[prefixCls + "-bordered"] = bordered,
            _a[prefixCls + "-hoverable"] = hoverable,
            _a[prefixCls + "-contain-grid"] = isContainGrid,
            _a[prefixCls + "-rtl"] = rtl,
            _a), className) }),
        title || extra ? (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-header", (_b = {}, _b[prefixCls + "-header-no-title"] = !title, _b)), style: headerStyle },
            title && react_1.default.createElement("div", { className: prefixCls + "-header-title" }, title),
            extra && react_1.default.createElement("div", { className: prefixCls + "-header-extra" }, extra))) : null,
        cover ? react_1.default.createElement("div", { className: prefixCls + "-cover" }, cover) : null,
        react_1.default.createElement("div", { className: prefixCls + "-body", style: bodyStyle },
            loading ? loadingElement || react_1.default.createElement(Spin_1.default, null) : handledChildren,
            isContainMeta ? null : actionList)));
}
var ForwardRefCard = react_1.default.forwardRef(Card);
var CardComponent = ForwardRefCard;
CardComponent.Meta = meta_1.default;
CardComponent.Grid = grid_1.default;
CardComponent.displayName = 'Card';
exports.default = CardComponent;
