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
exports.SiderContext = void 0;
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var IconLeft_1 = __importDefault(require("../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../icon/react-icon-cjs/IconRight"));
var ConfigProvider_1 = require("../ConfigProvider");
var ResizeBox_1 = __importDefault(require("../ResizeBox"));
var is_1 = require("../_util/is");
var responsiveObserve_1 = __importStar(require("../_util/responsiveObserve"));
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
exports.SiderContext = (0, react_1.createContext)({
    siderCollapsed: false,
    collapsedWidth: 64,
});
var generateId = (function () {
    var i = 0;
    return function (prefix) {
        if (prefix === void 0) { prefix = ''; }
        i += 1;
        return "" + prefix + i;
    };
})();
function Sider(props, ref) {
    var _a;
    var _b;
    var children = props.children, className = props.className, style = props.style, _c = props.theme, theme = _c === void 0 ? 'light' : _c, trigger = props.trigger, reverseArrow = props.reverseArrow, _d = props.collapsedWidth, collapsedWidth = _d === void 0 ? 48 : _d, _e = props.width, width = _e === void 0 ? 200 : _e, collapsible = props.collapsible, resizeDirections = props.resizeDirections, onSiderMount = props.onSiderMount, onSiderUnmount = props.onSiderUnmount, breakpoint = props.breakpoint, onBreakpoint = props.onBreakpoint, onCollapse = props.onCollapse, _f = props.resizeBoxProps, resizeBoxProps = _f === void 0 ? {} : _f;
    var uniqueId = generateId('arco-sider-');
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('layout-sider');
    var _g = __read((0, useMergeValue_1.default)(false, {
        value: 'collapsed' in props ? props.collapsed : undefined,
        defaultValue: props.defaultCollapsed,
    }), 2), collapsed = _g[0], setCollapsed = _g[1];
    // Parsing props width from number to string, to be used as css property value.
    // Using px as the default unit
    var propsWidth = (0, is_1.isNumber)(width) ? width + "px" : String(width);
    var _collapsedWidth = (0, is_1.isNumber)(collapsedWidth) ? "" + collapsedWidth : String(collapsedWidth);
    var _h = __read((0, react_1.useState)(collapsed ? _collapsedWidth : propsWidth), 2), siderWidth = _h[0], setSiderWidth = _h[1];
    var refResponsiveHandlerToken = (0, react_1.useRef)(null);
    // 提供给 ResponsiveHandler，使得其可以获得最新的 state 值
    var refStateForResponsiveHandler = (0, react_1.useRef)(null);
    refStateForResponsiveHandler.current = {
        breakpoint: breakpoint,
        collapsed: collapsed,
        onCollapse: onCollapse,
        onBreakpoint: onBreakpoint,
    };
    (0, react_1.useEffect)(function () {
        onSiderMount && onSiderMount(uniqueId);
        if (collapsible && breakpoint in responsiveObserve_1.responsiveMap) {
            refResponsiveHandlerToken.current = responsiveObserve_1.default.subscribe(function (screens, breakpointChecked) {
                var _a = refStateForResponsiveHandler.current, breakpoint = _a.breakpoint, collapsed = _a.collapsed, onCollapse = _a.onCollapse, onBreakpoint = _a.onBreakpoint;
                if (!breakpointChecked || breakpointChecked === breakpoint) {
                    var nextCollapsed = !screens[breakpoint];
                    if (nextCollapsed !== collapsed) {
                        setCollapsed(nextCollapsed);
                        onCollapse && onCollapse(nextCollapsed, 'responsive');
                    }
                    onBreakpoint && onBreakpoint(nextCollapsed);
                }
            });
        }
        return function () {
            onSiderUnmount && onSiderUnmount(uniqueId);
            if (refResponsiveHandlerToken.current) {
                responsiveObserve_1.default.unsubscribe(refResponsiveHandlerToken.current);
            }
        };
    }, []);
    (0, react_1.useEffect)(function () {
        // Parsing collapsed width from number to string, to be used as css property value.
        // Using px as the default unit
        var _collapsedWidth = (0, is_1.isNumber)(collapsedWidth)
            ? collapsedWidth + "px"
            : String(collapsedWidth);
        setSiderWidth(collapsed ? _collapsedWidth : propsWidth);
    }, [collapsed, propsWidth, collapsedWidth]);
    var resizable = (resizeDirections && (0, is_1.isArray)(resizeDirections)) || ((_b = resizeBoxProps.directions) === null || _b === void 0 ? void 0 : _b.length);
    var TagName = resizable ? ResizeBox_1.default : 'aside';
    var renderTrigger = function () {
        var _a;
        var triggerIcon = trigger ||
            (collapsed ? (reverseArrow ? (react_1.default.createElement(IconLeft_1.default, null)) : (react_1.default.createElement(IconRight_1.default, null))) : reverseArrow ? (react_1.default.createElement(IconRight_1.default, null)) : (react_1.default.createElement(IconLeft_1.default, null)));
        return collapsible && trigger !== null ? (react_1.default.createElement("div", { style: { width: siderWidth }, className: (0, classNames_1.default)(prefixCls + "-trigger", (_a = {},
                _a[prefixCls + "-trigger-light"] = theme === 'light',
                _a)), onClick: function () {
                setCollapsed(!collapsed);
                onCollapse && onCollapse(!collapsed, 'clickTrigger');
            } }, triggerIcon)) : null;
    };
    var resizeProps = (0, react_1.useMemo)(function () {
        if (resizable) {
            return __assign(__assign({ component: 'aside' }, resizeBoxProps), { width: siderWidth, directions: resizeDirections, onMoving: function (event, size) {
                    var _a;
                    setSiderWidth(size.width + "px");
                    (_a = resizeBoxProps === null || resizeBoxProps === void 0 ? void 0 : resizeBoxProps.onMoving) === null || _a === void 0 ? void 0 : _a.call(resizeBoxProps, event, size);
                } });
        }
        return {};
    }, [resizable, resizeDirections, siderWidth, resizeBoxProps]);
    return (react_1.default.createElement(exports.SiderContext.Provider, { value: {
            siderCollapsed: collapsed,
            collapsedWidth: collapsedWidth,
        } },
        react_1.default.createElement(TagName, __assign({ ref: ref, style: __assign({ width: siderWidth }, style), className: (0, classNames_1.default)(prefixCls, (_a = {},
                _a[prefixCls + "-light"] = theme === 'light',
                _a[prefixCls + "-has-trigger"] = trigger !== null && collapsible,
                _a[prefixCls + "-collapsed"] = collapsed,
                _a), className) }, resizeProps),
            react_1.default.createElement("div", { className: prefixCls + "-children" }, children),
            renderTrigger())));
}
var ForwardRefSider = (0, react_1.forwardRef)(Sider);
var SiderComponent = ForwardRefSider;
SiderComponent.displayName = 'LayoutSider';
SiderComponent.__ARCO_SIGN__ = 'sider';
exports.default = SiderComponent;
