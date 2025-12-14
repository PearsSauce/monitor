"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var tabs_1 = require("./tabs");
var ConfigProvider_1 = require("../ConfigProvider");
function TabContent(props) {
    var _a;
    var animation = props.animation, activeTab = props.activeTab, prefixCls = props.prefixCls, paneChildren = props.paneChildren, direction = props.direction, lazyload = props.lazyload, destroyOnHide = props.destroyOnHide;
    var activeIndex = paneChildren.findIndex(function (p) { return p.key === activeTab; });
    var ctxProps = (0, react_1.useContext)(tabs_1.TabsContext);
    var rtl = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).rtl;
    if (paneChildren.every(function (x) {
        return (x === null || x === void 0 ? void 0 : x.props) && (!('children' in x.props) || x.props.children === null);
    })) {
        return null;
    }
    var classNamesContentInner = (0, classNames_1.default)(prefixCls + "-content-inner", (_a = {},
        _a[prefixCls + "-animation"] = animation,
        _a));
    return (react_1.default.createElement("div", { className: prefixCls + "-content " + prefixCls + "-content-" + direction },
        react_1.default.createElement("div", { className: classNamesContentInner, style: rtl ? { marginRight: "-" + activeIndex * 100 + "%" } : { marginLeft: "-" + activeIndex * 100 + "%" } }, paneChildren.map(function (child, index) {
            var _a;
            var _b = ctxProps.getIdPrefix(index), tabpane = _b.tabpane, tab = _b.tab;
            var mergedDestroyOnHide = 'destroyOnHide' in child.props ? child.props.destroyOnHide : destroyOnHide;
            var isActive = child.key === activeTab;
            return (react_1.default.createElement("div", { key: child.key, className: (0, classNames_1.default)(prefixCls + "-content-item", (_a = {},
                    _a[prefixCls + "-content-item-active"] = isActive,
                    _a)), role: "tabpanel", id: tabpane, "aria-hidden": isActive ? undefined : true, tabIndex: isActive ? 0 : -1, "aria-labelledby": tab }, activeIndex !== index && mergedDestroyOnHide
                ? null
                : react_1.default.cloneElement(child, {
                    lazyload: lazyload,
                    isActive: isActive,
                })));
        }))));
}
exports.default = TabContent;
