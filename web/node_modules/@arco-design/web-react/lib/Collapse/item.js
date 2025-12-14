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
var react_transition_group_1 = require("react-transition-group");
var classNames_1 = __importDefault(require("../_util/classNames"));
var collapse_1 = require("./collapse");
var ConfigProvider_1 = require("../ConfigProvider");
var icon_hover_1 = __importDefault(require("../_class/icon-hover"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
function Item(props, ref) {
    var _a, _b, _c, _d, _e;
    var _f;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var divRef = (0, react_1.useRef)();
    var ctx = (0, react_1.useContext)(collapse_1.CollapseContext);
    var getEventListeners = (0, useKeyboardEvent_1.default)();
    var children = props.children, name = props.name, header = props.header, className = props.className, style = props.style, contentStyle = props.contentStyle, extra = props.extra, disabled = props.disabled, destroyOnHide = props.destroyOnHide, expandIcon = props.expandIcon, _g = props.showExpandIcon, showExpandIcon = _g === void 0 ? true : _g, rest = __rest(props, ["children", "name", "header", "className", "style", "contentStyle", "extra", "disabled", "destroyOnHide", "expandIcon", "showExpandIcon"]);
    var prefixCls = getPrefixCls('collapse-item');
    var isExpanded = ((_f = ctx.activeKeys) === null || _f === void 0 ? void 0 : _f.indexOf(name)) > -1;
    var icon = showExpandIcon ? ('expandIcon' in props ? expandIcon : ctx.expandIcon) : null;
    var clickEventHandler = function (e, regionLevel) {
        if (disabled)
            return;
        var triggerRegion = ctx.triggerRegion;
        var triggerRegionLevel = triggerRegion === 'icon' ? 0 : triggerRegion === 'header' ? 1 : 2;
        if (regionLevel === triggerRegionLevel ||
            // When triggerRegion is set to header, clicking icon should trigger onChange as well
            (triggerRegion === 'header' && [0, 1].includes(regionLevel))) {
            ctx.onToggle(name, e);
        }
    };
    return (react_1.default.createElement("div", __assign({ ref: ref }, rest, { className: (0, classNames_1.default)(prefixCls, (_a = {},
            _a[prefixCls + "-active"] = isExpanded,
            _a[prefixCls + "-no-icon"] = !icon,
            _a[prefixCls + "-disabled"] = disabled,
            _a), className), style: style }),
        react_1.default.createElement("div", __assign({ role: "button", "aria-disabled": disabled, "aria-expanded": isExpanded, "data-active-region": ctx.triggerRegion, tabIndex: disabled ? -1 : 0, className: (0, classNames_1.default)(prefixCls + "-header", prefixCls + "-header-" + ctx.expandIconPosition, (_b = {},
                _b[prefixCls + "-header-disabled"] = disabled,
                _b)), onClick: function (e) { return clickEventHandler(e, 2); } }, getEventListeners({
            onPressEnter: function (e) {
                !disabled && ctx.onToggle(name, e);
            },
        })),
            icon && (react_1.default.createElement(icon_hover_1.default, { prefix: prefixCls, disabled: disabled, className: (0, classNames_1.default)((_c = {},
                    _c[prefixCls + "-icon-hover-right"] = ctx.expandIconPosition === 'right',
                    _c[prefixCls + "-header-icon-right"] = ctx.expandIconPosition === 'right',
                    _c)), onClick: function (e) { return clickEventHandler(e, 0); } },
                react_1.default.createElement("span", { className: (0, classNames_1.default)(prefixCls + "-header-icon", (_d = {},
                        _d[prefixCls + "-header-icon-down"] = isExpanded,
                        _d)) }, icon))),
            react_1.default.createElement("div", { className: prefixCls + "-header-title", onClick: function (e) { return clickEventHandler(e, 1); } }, header),
            extra && (react_1.default.createElement("div", { className: prefixCls + "-header-extra", onClick: function (e) {
                    e.stopPropagation();
                } }, extra))),
        react_1.default.createElement(react_transition_group_1.Transition, { nodeRef: divRef, in: isExpanded, 
            //  when nodeRef prop is passed, node is not passed, so done is being passed as the first argument.
            addEndListener: function (done) {
                var _a;
                (_a = divRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener('transitionend', done, false);
            }, mountOnEnter: 'destroyOnHide' in props ? destroyOnHide : ctx.destroyOnHide || ctx.lazyload, unmountOnExit: 'destroyOnHide' in props ? destroyOnHide : ctx.destroyOnHide, onEnter: function () {
                var e = divRef.current;
                if (e) {
                    e.style.height = '0';
                    e.style.display = 'block';
                }
            }, onEntering: function () {
                var e = divRef.current;
                if (e) {
                    e.style.height = e.scrollHeight + "px";
                }
            }, onEntered: function () {
                var e = divRef.current;
                if (e) {
                    e.style.height = 'auto';
                }
            }, onExit: function () {
                var e = divRef.current;
                if (e) {
                    e.style.display = 'block';
                    e.style.height = e.offsetHeight + "px";
                    // have to trigger reflow to get animation effect on exit
                    e.offsetHeight; // eslint-disable-line
                }
            }, onExiting: function () {
                var e = divRef.current;
                if (e) {
                    e.style.height = '0';
                }
            }, onExited: function () {
                var e = divRef.current;
                if (e) {
                    e.style.display = 'none';
                    e.style.height = 'auto';
                }
            } },
            react_1.default.createElement("div", { role: "region", className: (0, classNames_1.default)(prefixCls + "-content", (_e = {},
                    _e[prefixCls + "-content-expanded"] = isExpanded,
                    _e)), ref: divRef },
                react_1.default.createElement("div", { style: contentStyle, className: prefixCls + "-content-box" }, children)))));
}
var ItemRef = react_1.default.forwardRef(Item);
ItemRef.displayName = 'CollapseItem';
exports.default = ItemRef;
