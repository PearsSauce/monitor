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
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var item_1 = __importDefault(require("./item"));
var item_group_1 = __importDefault(require("./item-group"));
var sub_menu_1 = __importDefault(require("./sub-menu"));
var overflow_wrap_1 = __importDefault(require("./overflow-wrap"));
var omit_1 = __importDefault(require("../_util/omit"));
var util_1 = require("./util");
var ConfigProvider_1 = require("../ConfigProvider");
var Layout_1 = require("../Layout");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var IconMenuFold_1 = __importDefault(require("../../icon/react-icon-cjs/IconMenuFold"));
var IconMenuUnfold_1 = __importDefault(require("../../icon/react-icon-cjs/IconMenuUnfold"));
var useForceUpdate_1 = __importDefault(require("../_util/hooks/useForceUpdate"));
var context_1 = __importDefault(require("./context"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var useId_1 = __importDefault(require("../_util/hooks/useId"));
var is_1 = require("../_util/is");
var DEFAULT_THEME = 'light';
var defaultProps = {
    mode: 'vertical',
    selectable: true,
    ellipsis: true,
};
function Menu(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Menu);
    var style = props.style, children = props.children, className = props.className, menuPrefixCls = props.prefixCls, mode = props.mode, propTheme = props.theme, icons = props.icons, levelIndent = props.levelIndent, propCollapse = props.collapse, inDropdown = props.inDropdown, selectable = props.selectable, triggerProps = props.triggerProps, tooltipProps = props.tooltipProps, ellipsis = props.ellipsis, accordion = props.accordion, autoOpen = props.autoOpen, autoScrollIntoView = props.autoScrollIntoView, scrollConfig = props.scrollConfig, hasCollapseButton = props.hasCollapseButton, defaultOpenKeys = props.defaultOpenKeys, defaultSelectedKeys = props.defaultSelectedKeys, propOpenKeys = props.openKeys, propSelectedKeys = props.selectedKeys, onClickSubMenu = props.onClickSubMenu, onClickMenuItem = props.onClickMenuItem, onCollapseChange = props.onCollapseChange, onEllipsisChange = props.onEllipsisChange, rest = __rest(props, ["style", "children", "className", "prefixCls", "mode", "theme", "icons", "levelIndent", "collapse", "inDropdown", "selectable", "triggerProps", "tooltipProps", "ellipsis", "accordion", "autoOpen", "autoScrollIntoView", "scrollConfig", "hasCollapseButton", "defaultOpenKeys", "defaultSelectedKeys", "openKeys", "selectedKeys", "onClickSubMenu", "onClickMenuItem", "onCollapseChange", "onEllipsisChange"]);
    var _c = __read((0, useMergeValue_1.default)([], {
        defaultValue: defaultOpenKeys,
        value: propOpenKeys,
    }), 2), openKeys = _c[0], setOpenKeys = _c[1];
    var _d = __read((0, useMergeValue_1.default)([], {
        defaultValue: defaultSelectedKeys,
        value: propSelectedKeys,
    }), 2), selectedKeys = _d[0], setSelectedKeys = _d[1];
    var _e = __read((0, useMergeValue_1.default)(false, {
        value: propCollapse,
    }), 2), collapse = _e[0], setCollapse = _e[1];
    var menuContext = (0, react_1.useContext)(context_1.default);
    var siderCollapsed = (0, react_1.useContext)(Layout_1.SiderContext).siderCollapsed;
    var prefixCls = menuPrefixCls || getPrefixCls('menu');
    var mergedCollapse = siderCollapsed || collapse || inDropdown || mode === 'popButton';
    var theme = propTheme || menuContext.theme || DEFAULT_THEME;
    var refSubMenuKeys = (0, react_1.useRef)([]);
    var refPrevSubMenuKeys = (0, react_1.useRef)([]);
    var forceUpdate = (0, useForceUpdate_1.default)();
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var menuInfoMap = (0, react_1.useMemo)(function () {
        return (0, util_1.generateInfoMap)(children);
    }, [children]);
    // Unique ID of this instance
    var _instanceId = (0, useId_1.default)(prefixCls + "-");
    var instanceId = rest.id || _instanceId;
    // autoOpen 时，初次渲染展开所有的子菜单
    (0, react_1.useEffect)(function () {
        // 从 openKeys 中过滤已经不存在的 subMenuKey
        var validOpenKeys = openKeys.filter(function (key) { return refSubMenuKeys.current.indexOf(key) !== -1; });
        if (autoOpen) {
            var keysAdded = refSubMenuKeys.current.filter(function (key) { return refPrevSubMenuKeys.current.indexOf(key) === -1; });
            validOpenKeys = openKeys.concat(keysAdded);
        }
        setOpenKeys(accordion ? validOpenKeys.slice(0, 1) : validOpenKeys);
        refPrevSubMenuKeys.current = refSubMenuKeys.current.slice();
    }, [refSubMenuKeys.current.toString()]);
    var mergedHasCollapseButton = mode !== 'horizontal' && mode !== 'popButton' && !inDropdown && hasCollapseButton;
    var renderChildren = function () {
        var childrenList = (0, util_1.processChildren)(children, { level: 1 });
        var collapseIcon = collapse
            ? (icons && icons.collapseActive) || react_1.default.createElement(IconMenuUnfold_1.default, null)
            : (icons && icons.collapseDefault) || react_1.default.createElement(IconMenuFold_1.default, null);
        var collapseButtonClickHandler = function () {
            var newCollapse = !collapse;
            setCollapse(newCollapse);
            onCollapseChange && onCollapseChange(newCollapse);
        };
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: prefixCls + "-inner" }, mode === 'horizontal' && ellipsis !== false ? (react_1.default.createElement(overflow_wrap_1.default, { ellipsisText: (0, is_1.isObject)(ellipsis) ? ellipsis.text : '···', onEllipsisChange: onEllipsisChange }, childrenList)) : (childrenList)),
            mergedHasCollapseButton && (react_1.default.createElement("div", __assign({ tabIndex: 0, role: "button", "aria-controls": instanceId, "aria-expanded": !collapse, className: prefixCls + "-collapse-button", onClick: collapseButtonClickHandler }, getKeyboardEvents({ onPressEnter: collapseButtonClickHandler })), collapseIcon))));
    };
    var usedStyle = __assign({}, style);
    if (mergedCollapse && !inDropdown) {
        delete usedStyle.width;
    }
    return (react_1.default.createElement("div", __assign({ id: mergedHasCollapseButton ? instanceId : undefined, role: "menu" }, (0, omit_1.default)(rest, ['isMenu']), { ref: ref, style: usedStyle, className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + theme, prefixCls + "-" + (mode === 'horizontal' ? 'horizontal' : 'vertical'), (_a = {},
            _a[prefixCls + "-collapse"] = mergedCollapse,
            // 缩起状态自动变成 pop 模式
            _a[prefixCls + "-pop"] = mode === 'pop' || mergedCollapse,
            _a[prefixCls + "-pop-button"] = mode === 'popButton',
            _a[prefixCls + "-rtl"] = rtl,
            _a), className) }),
        react_1.default.createElement(context_1.default.Provider, { value: {
                mode: mode,
                theme: theme,
                collapse: mergedCollapse,
                levelIndent: levelIndent,
                inDropdown: inDropdown,
                selectedKeys: selectedKeys,
                openKeys: openKeys,
                icons: icons,
                triggerProps: triggerProps,
                tooltipProps: tooltipProps,
                autoScrollIntoView: autoScrollIntoView,
                scrollConfig: scrollConfig,
                // pass props directly
                id: instanceId,
                prefixCls: prefixCls,
                collectInlineMenuKeys: function (key, unmount) {
                    if (unmount) {
                        refSubMenuKeys.current = refSubMenuKeys.current.filter(function (x) { return x !== key; });
                    }
                    else {
                        refSubMenuKeys.current.push(key);
                    }
                    forceUpdate();
                },
                onClickMenuItem: function (key, event) {
                    var _a;
                    selectable && setSelectedKeys([key]);
                    onClickMenuItem && onClickMenuItem(key, event, (_a = menuInfoMap[key]) === null || _a === void 0 ? void 0 : _a.keyPath);
                },
                onClickSubMenu: function (key, level, type) {
                    var _a;
                    var newOpenKeys = __spreadArray([], __read(openKeys), false);
                    if (type === 'inline') {
                        if ((openKeys === null || openKeys === void 0 ? void 0 : openKeys.indexOf(key)) > -1) {
                            if (accordion && level === 1) {
                                newOpenKeys = [];
                            }
                            else {
                                newOpenKeys = openKeys.filter(function (item) { return item !== key; });
                            }
                        }
                        else if (accordion && level === 1) {
                            newOpenKeys = [key];
                        }
                        else {
                            newOpenKeys = openKeys.concat([key]);
                        }
                    }
                    setOpenKeys(newOpenKeys);
                    onClickSubMenu && onClickSubMenu(key, newOpenKeys, (_a = menuInfoMap[key]) === null || _a === void 0 ? void 0 : _a.keyPath);
                },
            } }, renderChildren())));
}
var ForwardRefMenu = (0, react_1.forwardRef)(Menu);
var MenuComponent = ForwardRefMenu;
MenuComponent.displayName = 'Menu';
MenuComponent.Item = item_1.default;
MenuComponent.SubMenu = sub_menu_1.default;
MenuComponent.ItemGroup = item_group_1.default;
MenuComponent.__ARCO_MENU__ = true;
exports.default = MenuComponent;
