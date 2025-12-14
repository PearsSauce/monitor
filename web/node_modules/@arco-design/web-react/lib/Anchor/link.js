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
var context_1 = __importDefault(require("./context"));
var ConfigProvider_1 = require("../ConfigProvider");
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var DISPLAY_NAME = 'AnchorLink';
var defaultProps = {
    href: '#',
};
function isNamedComponent(type) {
    return (0, is_1.isObject)(type) && type.hasOwnProperty('displayName');
}
function Link(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig;
    var _c = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Anchor.Link']), className = _c.className, style = _c.style, href = _c.href, title = _c.title, children = _c.children, rest = __rest(_c, ["className", "style", "href", "title", "children"]);
    var anchorContext = (0, react_1.useContext)(context_1.default);
    var currentLink = anchorContext.currentLink, addLink = anchorContext.addLink, removeLink = anchorContext.removeLink, onLinkClick = anchorContext.onLinkClick, direction = anchorContext.direction;
    var prefixCls = getPrefixCls('anchor-link');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-active"] = currentLink === href,
        _a), className);
    var linkRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () { return linkRef.current; }, []);
    (0, react_1.useEffect)(function () {
        addLink && addLink(href, linkRef.current);
        return function () {
            removeLink && removeLink(href);
        };
    }, [href]);
    return (react_1.default.createElement("div", __assign({ className: classNames, style: style, ref: linkRef }, rest),
        !(0, is_1.isUndefined)(title) && !(0, is_1.isNull)(title) && (react_1.default.createElement("a", { className: prefixCls + "-title", title: (0, is_1.isString)(title) ? title : '', href: href, "data-href": href, onClick: function (e) {
                onLinkClick && onLinkClick(e, href);
            } }, title)),
        children &&
            direction !== 'horizontal' &&
            react_1.default.Children.map(children, function (item) {
                return ((0, react_1.isValidElement)(item) &&
                    isNamedComponent(item.type) &&
                    item.type.displayName === DISPLAY_NAME &&
                    item);
            })));
}
var AnchorLinkComponent = (0, react_1.forwardRef)(Link);
AnchorLinkComponent.displayName = DISPLAY_NAME;
exports.default = AnchorLinkComponent;
