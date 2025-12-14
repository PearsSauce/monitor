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
var omit_1 = __importDefault(require("../_util/omit"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var IconLeft_1 = __importDefault(require("../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../icon/react-icon-cjs/IconRight"));
var Breadcrumb_1 = __importDefault(require("../Breadcrumb"));
var icon_hover_1 = __importDefault(require("../_class/icon-hover"));
var resizeObserver_1 = __importDefault(require("../_util/resizeObserver"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
function PageHeader(baseProps) {
    var _a, _b;
    var _c = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _c.getPrefixCls, componentConfig = _c.componentConfig, rtl = _c.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, {}, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.PageHeader);
    var title = props.title, subTitle = props.subTitle, extra = props.extra, children = props.children, backIcon = props.backIcon, footer = props.footer, breadcrumb = props.breadcrumb, rest = __rest(props, ["title", "subTitle", "extra", "children", "backIcon", "footer", "breadcrumb"]);
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var _d = __read((0, react_1.useState)(false), 2), pageWrap = _d[0], setPageWrap = _d[1];
    var pageRef = (0, react_1.useRef)();
    var prefixCls = getPrefixCls('page-header');
    return (react_1.default.createElement(resizeObserver_1.default, { onResize: function () {
            if (pageRef.current) {
                setPageWrap(pageRef.current.offsetWidth < 768);
            }
        }, getTargetDOMNode: function () { return pageRef.current; } },
        react_1.default.createElement("div", __assign({}, (0, omit_1.default)(rest, ['onBack']), { ref: pageRef, className: (0, classNames_1.default)("" + prefixCls, (_a = {},
                _a[prefixCls + "-with-breadcrumb"] = breadcrumb,
                _a[prefixCls + "-with-content"] = children,
                _a[prefixCls + "-with-footer"] = footer,
                _a[prefixCls + "-wrap"] = pageWrap,
                _a[prefixCls + "-rtl"] = rtl,
                _a), props.className), style: props.style }),
            react_1.default.createElement("div", { className: prefixCls + "-head-wrapper" },
                breadcrumb && react_1.default.createElement(Breadcrumb_1.default, __assign({}, breadcrumb)),
                react_1.default.createElement("div", { className: prefixCls + "-head" },
                    react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-head-main", (_b = {},
                            _b[prefixCls + "-head-main-with-back"] = backIcon,
                            _b)) },
                        backIcon && (react_1.default.createElement(icon_hover_1.default, __assign({ prefix: prefixCls, tabIndex: 0, role: "button", className: prefixCls + "-back", onClick: props.onBack }, getKeyboardEvents({
                            onPressEnter: props.onBack,
                        })),
                            react_1.default.createElement("span", { className: prefixCls + "-back-icon" }, backIcon === true ? rtl ? react_1.default.createElement(IconRight_1.default, null) : react_1.default.createElement(IconLeft_1.default, null) : backIcon))),
                        title && react_1.default.createElement("div", { className: prefixCls + "-title" }, title),
                        subTitle && (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement("div", { className: prefixCls + "-divider" }),
                            react_1.default.createElement("div", { className: prefixCls + "-sub-title" }, subTitle)))),
                    extra && react_1.default.createElement("div", { className: prefixCls + "-head-extra" }, extra))),
            children && react_1.default.createElement("div", { className: prefixCls + "-content" }, children),
            footer && react_1.default.createElement("div", { className: prefixCls + "-footer" }, footer))));
}
PageHeader.displayName = 'PageHeader';
exports.default = PageHeader;
