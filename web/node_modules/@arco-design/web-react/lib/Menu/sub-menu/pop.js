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
var classNames_1 = __importDefault(require("../../_util/classNames"));
var IconRight_1 = __importDefault(require("../../../icon/react-icon-cjs/IconRight"));
var IconLeft_1 = __importDefault(require("../../../icon/react-icon-cjs/IconLeft"));
var IconDown_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDown"));
var util_1 = require("../util");
var omit_1 = __importDefault(require("../../_util/omit"));
var Dropdown_1 = __importDefault(require("../../Dropdown"));
var index_1 = __importDefault(require("../index"));
var indent_1 = __importDefault(require("../indent"));
var context_1 = __importDefault(require("../context"));
var ConfigProvider_1 = require("../../ConfigProvider");
var keycode_1 = require("../../_util/keycode");
var useId_1 = __importDefault(require("../../_util/hooks/useId"));
var SubMenuPop = function (props) {
    var _a;
    var _key = props._key, children = props.children, style = props.style, className = props.className, title = props.title, level = props.level, selectable = props.selectable, forwardedRef = props.forwardedRef, propTriggerProps = props.triggerProps, rest = __rest(props, ["_key", "children", "style", "className", "title", "level", "selectable", "forwardedRef", "triggerProps"]);
    var _b = (0, react_1.useContext)(context_1.default), menuId = _b.id, prefixCls = _b.prefixCls, mode = _b.mode, inDropdown = _b.inDropdown, levelIndent = _b.levelIndent, _c = _b.selectedKeys, selectedKeys = _c === void 0 ? [] : _c, icons = _b.icons, contextTriggerProps = _b.triggerProps, onClickSubMenu = _b.onClickSubMenu, onClickMenuItem = _b.onClickMenuItem;
    var rtl = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).rtl;
    var triggerProps = __assign(__assign({}, contextTriggerProps), propTriggerProps);
    var _d = __read((0, react_1.useState)(false), 2), popupVisible = _d[0], setPopupVisible = _d[1];
    var baseClassName = prefixCls + "-pop";
    var isSelected = selectable && selectedKeys.indexOf(props._key) > -1;
    var needPopOnBottom = mode === 'horizontal' && !inDropdown;
    // Unique ID of this instance
    var instanceId = (0, useId_1.default)(menuId + "-submenu-pop-");
    var renderSuffix = function () {
        var MergedIconRight = icons && icons.popArrowRight ? icons.popArrowRight : rtl ? react_1.default.createElement(IconLeft_1.default, null) : react_1.default.createElement(IconRight_1.default, null);
        var MergedIconDown = icons && icons.horizontalArrowDown ? icons.horizontalArrowDown : react_1.default.createElement(IconDown_1.default, null);
        return (react_1.default.createElement("span", { className: prefixCls + "-icon-suffix" }, needPopOnBottom ? MergedIconDown : MergedIconRight));
    };
    var hasSelectedStatus = (0, util_1.isChildrenSelected)(children, selectedKeys) || isSelected;
    var popPosition = rtl ? ['br', 'lt'] : ['bl', 'rt'];
    var subMenuClickHandler = function (event) {
        onClickSubMenu(_key, level, 'pop');
        selectable && onClickMenuItem(_key, event);
    };
    return (react_1.default.createElement(Dropdown_1.default, { trigger: "hover", popupVisible: popupVisible, onVisibleChange: setPopupVisible, droplist: react_1.default.createElement(index_1.default, { id: instanceId, selectedKeys: selectedKeys, onClickMenuItem: function (key, event) {
                onClickMenuItem(key, event);
                setPopupVisible(false);
            } }, children), triggerProps: __assign({ position: needPopOnBottom ? popPosition[0] : popPosition[1], showArrow: true, autoAlignPopupMinWidth: true, classNames: 'fadeIn', duration: 100, mouseEnterDelay: 50, mouseLeaveDelay: 50, className: (0, classNames_1.default)(baseClassName + "-trigger", triggerProps && triggerProps.className) }, (0, omit_1.default)(triggerProps, ['className'])) },
        react_1.default.createElement("div", __assign({ tabIndex: 0, "aria-haspopup": true, "aria-expanded": popupVisible, "aria-controls": instanceId, ref: forwardedRef, style: style, className: (0, classNames_1.default)(baseClassName, baseClassName + "-header", (_a = {},
                _a[prefixCls + "-selected"] = hasSelectedStatus,
                _a), className), onClick: subMenuClickHandler, onKeyDown: function (event) {
                var keyCode = event.keyCode || event.which;
                if (keyCode === keycode_1.Enter.code) {
                    subMenuClickHandler(event);
                }
                else if (keyCode === keycode_1.ArrowLeft.code) {
                    setPopupVisible(false);
                }
                else if (keyCode === keycode_1.ArrowRight.code) {
                    setPopupVisible(true);
                }
            } }, (0, omit_1.default)(rest, ['key', 'popup'])),
            react_1.default.createElement(indent_1.default, { prefixCls: prefixCls, levelIndent: levelIndent, level: level }),
            title,
            renderSuffix(),
            hasSelectedStatus && mode === 'horizontal' ? (react_1.default.createElement("div", { className: prefixCls + "-selected-label" })) : null)));
};
exports.default = SubMenuPop;
