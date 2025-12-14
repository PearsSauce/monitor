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
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var IconClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconClose"));
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var omit_1 = __importDefault(require("../_util/omit"));
var ConfigProvider_1 = require("../ConfigProvider");
var icon_hover_1 = __importDefault(require("../_class/icon-hover"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
// 色板里的 12 个颜色
var COLORS = [
    'red',
    'orangered',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'arcoblue',
    'purple',
    'pinkpurple',
    'magenta',
    'gray',
];
var defaultProps = {
    size: 'default',
};
function Tag(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Tag);
    var className = props.className, style = props.style, children = props.children, color = props.color, closable = props.closable, checkable = props.checkable, defaultChecked = props.defaultChecked, size = props.size, onClose = props.onClose, onCheck = props.onCheck, icon = props.icon, closeIcon = props.closeIcon, bordered = props.bordered, __closeIconProps = props.__closeIconProps, rest = __rest(props, ["className", "style", "children", "color", "closable", "checkable", "defaultChecked", "size", "onClose", "onCheck", "icon", "closeIcon", "bordered", "__closeIconProps"]);
    var prefixCls = getPrefixCls('tag');
    var _c = __read((0, react_1.useState)('visible' in props ? props.visible : true), 2), visible = _c[0], setVisible = _c[1];
    var _d = __read((0, react_1.useState)('checked' in props ? props.checked : defaultChecked), 2), checked = _d[0], setChecked = _d[1];
    var _e = __read((0, react_1.useState)(), 2), loading = _e[0], setLoading = _e[1];
    // controlled
    var mergedChecked = 'checked' in props ? props.checked : checked;
    var mergedVisible = 'visible' in props ? props.visible : visible;
    function onHandleClose(e) {
        var ret = onClose && onClose(e);
        if (ret && ret.then) {
            setLoading(true);
            ret
                .then(function () {
                setLoading(false);
                setVisible(false);
            })
                .catch(function () {
                setLoading(false);
            });
        }
        else {
            setVisible(false);
        }
    }
    function onHandleCheck() {
        var newChecked = !mergedChecked;
        if (!('checked' in props)) {
            setChecked(newChecked);
        }
        onCheck && onCheck(newChecked);
    }
    var _color = color ? (COLORS.indexOf(color) !== -1 ? color : '') : '';
    var _checked = checkable ? mergedChecked : true;
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-loading"] = loading,
        _a[prefixCls + "-hide"] = !mergedVisible,
        _a[prefixCls + "-" + _color] = _color,
        _a[prefixCls + "-checkable"] = checkable,
        _a[prefixCls + "-checked"] = _checked,
        _a[prefixCls + "-size-" + size] = size,
        _a[prefixCls + "-bordered"] = bordered,
        _a[prefixCls + "-custom-color"] = _checked && color && !_color,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var colorStyle = __assign({}, style);
    if (color && !_color && _checked) {
        colorStyle.backgroundColor = color;
        colorStyle.borderColor = color;
    }
    var otherProps = (0, omit_1.default)(rest, ['visible']);
    if (checkable) {
        otherProps.onClick = onHandleCheck;
    }
    return (react_1.default.createElement("div", __assign({ ref: ref, style: colorStyle, className: classNames }, otherProps),
        icon && react_1.default.createElement("span", { className: prefixCls + "-icon" }, icon),
        react_1.default.createElement("span", { className: prefixCls + "-content" }, children),
        closable && !loading && closeIcon !== null && (react_1.default.createElement(icon_hover_1.default, __assign({ prefix: prefixCls, className: prefixCls + "-close-btn", onClick: onHandleClose, role: "button", tabIndex: 0 }, getKeyboardEvents({ onPressEnter: onHandleClose }), { "aria-label": "Close" }, __closeIconProps), closeIcon !== undefined ? closeIcon : react_1.default.createElement(IconClose_1.default, null))),
        loading && (react_1.default.createElement("span", { className: prefixCls + "-loading-icon" },
            react_1.default.createElement(IconLoading_1.default, null)))));
}
var TagComponent = (0, react_1.forwardRef)(Tag);
TagComponent.displayName = 'Tag';
exports.default = TagComponent;
