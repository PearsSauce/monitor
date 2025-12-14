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
var debounce_1 = __importDefault(require("lodash/debounce"));
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var dot_loading_1 = __importDefault(require("./dot-loading"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var is_1 = require("../_util/is");
function Spin(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, {}, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Spin);
    var style = props.style, className = props.className, children = props.children, propLoading = props.loading, size = props.size, icon = props.icon, element = props.element, tip = props.tip, dot = props.dot, delay = props.delay, _c = props.block, block = _c === void 0 ? false : _c, rest = __rest(props, ["style", "className", "children", "loading", "size", "icon", "element", "tip", "dot", "delay", "block"]);
    var _d = __read((0, react_1.useState)(delay ? false : propLoading), 2), loading = _d[0], setLoading = _d[1];
    var debouncedSetLoading = (0, react_1.useCallback)((0, debounce_1.default)(setLoading, delay), [delay]);
    var _usedLoading = delay ? loading : propLoading;
    var prefixCls = getPrefixCls('spin');
    (0, react_1.useEffect)(function () {
        delay && debouncedSetLoading(propLoading);
        return function () {
            debouncedSetLoading && debouncedSetLoading.cancel();
        };
    }, [propLoading]);
    var loadingIcon = (react_1.default.createElement("span", { className: prefixCls + "-icon" }, icon
        ? react_1.default.cloneElement(icon, {
            className: (0, classNames_1.default)(prefixCls.replace('-spin', '-icon') + "-loading"),
            style: {
                fontSize: size,
            },
        })
        : element ||
            (dot ? react_1.default.createElement(dot_loading_1.default, { size: size }) : react_1.default.createElement(IconLoading_1.default, { style: { fontSize: size } }))));
    return (react_1.default.createElement("div", __assign({ ref: ref, className: (0, classNames_1.default)(prefixCls, (_a = {},
            _a[prefixCls + "-block"] = block,
            _a[prefixCls + "-loading"] = _usedLoading,
            _a[prefixCls + "-with-tip"] = tip && !children,
            _a), className), style: style }, rest), (0, is_1.isEmptyReactNode)(children) ? (react_1.default.createElement(react_1.default.Fragment, null,
        loadingIcon,
        tip ? react_1.default.createElement("div", { className: prefixCls + "-tip" }, tip) : null)) : (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { className: prefixCls + "-children" }, children),
        _usedLoading && (react_1.default.createElement("div", { className: prefixCls + "-loading-layer", style: { fontSize: size } },
            react_1.default.createElement("span", { className: prefixCls + "-loading-layer-inner" },
                loadingIcon,
                tip ? react_1.default.createElement("div", { className: prefixCls + "-tip" }, tip) : null)))))));
}
var SpinComponent = react_1.default.forwardRef(Spin);
SpinComponent.displayName = 'Spin';
exports.default = SpinComponent;
