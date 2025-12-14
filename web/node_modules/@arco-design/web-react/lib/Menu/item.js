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
var scroll_into_view_if_needed_1 = __importDefault(require("scroll-into-view-if-needed"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var Tooltip_1 = __importDefault(require("../Tooltip"));
var useIsFirstRender_1 = __importDefault(require("../_util/hooks/useIsFirstRender"));
var context_1 = __importDefault(require("./context"));
var indent_1 = __importDefault(require("./indent"));
var omit_1 = __importDefault(require("../_util/omit"));
var util_1 = require("./util");
var keycode_1 = require("../_util/keycode");
function Item(props, ref) {
    var _a;
    var _key = props._key, children = props.children, level = props.level, disabled = props.disabled, className = props.className, style = props.style, _b = props.wrapper, WrapperTagName = _b === void 0 ? 'div' : _b, onClick = props.onClick, renderItemInTooltip = props.renderItemInTooltip, rest = __rest(props, ["_key", "children", "level", "disabled", "className", "style", "wrapper", "onClick", "renderItemInTooltip"]);
    var _c = (0, react_1.useContext)(context_1.default), prefixCls = _c.prefixCls, mode = _c.mode, collapse = _c.collapse, inDropdown = _c.inDropdown, levelIndent = _c.levelIndent, selectedKeys = _c.selectedKeys, autoScrollIntoView = _c.autoScrollIntoView, scrollConfig = _c.scrollConfig, tooltipProps = _c.tooltipProps, onClickMenuItem = _c.onClickMenuItem;
    var refElement = (0, react_1.useRef)(null);
    var isFirstRender = (0, useIsFirstRender_1.default)();
    var needTextIndent = mode === 'vertical' && level > 1;
    var needTooltip = collapse && !inDropdown && level === 1;
    var isSelected = selectedKeys && ~selectedKeys.indexOf(_key);
    (0, react_1.useEffect)(function () {
        var shouldScroll = isSelected && autoScrollIntoView;
        if (refElement.current && shouldScroll) {
            // 首次渲染需要等待展开动画结束之后滚动
            setTimeout(function () {
                refElement.current &&
                    (0, scroll_into_view_if_needed_1.default)(refElement.current, __assign({ behavior: 'smooth', block: 'start', scrollMode: 'if-needed', boundary: document.body }, scrollConfig));
            }, isFirstRender ? 500 : 0);
        }
    }, [isSelected, autoScrollIntoView]);
    var menuItemClickHandler = function (event) {
        if (!disabled) {
            onClickMenuItem(_key, event);
            onClick && onClick(event);
        }
    };
    var itemElement = (react_1.default.createElement(WrapperTagName, __assign({ tabIndex: disabled ? -1 : 0, role: "menuitem", ref: function (_ref) {
            ref = _ref;
            refElement.current = ref;
        }, style: style, className: (0, classNames_1.default)(prefixCls + "-item", (_a = {},
            _a[prefixCls + "-disabled"] = disabled,
            _a[prefixCls + "-selected"] = isSelected,
            // 存在缩进dom
            _a[prefixCls + "-item-indented"] = needTextIndent && !collapse,
            _a), className), onClick: menuItemClickHandler, onKeyDown: function (event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode === keycode_1.Enter.code) {
                menuItemClickHandler(event);
            }
        } }, (0, omit_1.default)(rest, ['key', '_key'].concat(util_1.PROPS_NEED_TO_BE_PASSED_IN_SUBMENU))),
        needTextIndent && !collapse ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(indent_1.default, { prefixCls: prefixCls, levelIndent: levelIndent, level: level }),
            react_1.default.createElement("span", { className: prefixCls + "-item-inner", style: {
                    display: 'block',
                } }, children))) : (children),
        isSelected && mode === 'horizontal' ? (react_1.default.createElement("div", { className: prefixCls + "-selected-label" })) : null));
    return needTooltip ? (react_1.default.createElement(Tooltip_1.default, __assign({ trigger: "hover", position: "right", content: typeof renderItemInTooltip === 'function' ? renderItemInTooltip() : react_1.default.createElement("span", null, children), triggerProps: __assign({ className: prefixCls + "-item-tooltip" }, ((tooltipProps === null || tooltipProps === void 0 ? void 0 : tooltipProps.triggerProps) || {})) }, (0, omit_1.default)(tooltipProps, ['triggerProps'])), itemElement)) : (itemElement);
}
var ForwardRefItem = (0, react_1.forwardRef)(Item);
var ItemComponent = ForwardRefItem;
ItemComponent.displayName = 'MenuItem';
ItemComponent.menuType = 'MenuItem';
exports.default = ItemComponent;
