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
var is_1 = require("../_util/is");
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var avatar_1 = __importDefault(require("./avatar"));
var Popover_1 = __importDefault(require("../Popover"));
var context_1 = __importDefault(require("./context"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var defaultProps = {
    shape: 'circle',
    autoFixFontSize: true,
};
function Group(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Avatar.Group']);
    var className = props.className, style = props.style, children = props.children, size = props.size, shape = props.shape, autoFixFontSize = props.autoFixFontSize, zIndexAscend = props.zIndexAscend, maxCount = props.maxCount, maxStyle = props.maxStyle, maxPopoverTriggerProps = props.maxPopoverTriggerProps, rest = __rest(props, ["className", "style", "children", "size", "shape", "autoFixFontSize", "zIndexAscend", "maxCount", "maxStyle", "maxPopoverTriggerProps"]);
    var prefixCls = getPrefixCls('avatar-group');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var childrenArr = react_1.default.Children.toArray(children);
    var avatarCount = childrenArr.length;
    var avatarsToRender = childrenArr;
    if ((0, is_1.isNumber)(maxCount) && maxCount >= 0 && avatarCount > maxCount) {
        var avatarsInPopover = childrenArr.slice(maxCount);
        avatarsToRender = childrenArr.slice(0, maxCount);
        avatarsToRender.push(react_1.default.createElement(avatar_1.default, { key: "_arco_avatar_group_popup", style: maxStyle, className: prefixCls + "-max-count-avatar" },
            react_1.default.createElement(Popover_1.default, { triggerProps: maxPopoverTriggerProps, content: react_1.default.createElement(context_1.default.Provider, { value: { size: size, shape: shape, autoFixFontSize: autoFixFontSize } },
                    react_1.default.createElement("div", { className: prefixCls + "-popover" }, avatarsInPopover)) },
                "+",
                avatarsInPopover.length)));
    }
    return (react_1.default.createElement("div", __assign({ ref: ref, style: style, className: classNames }, rest), avatarsToRender.map(function (item, index) {
        var isFirst = rtl ? index === avatarsToRender.length - 1 : index === 0;
        var stackedStyle = {
            zIndex: zIndexAscend ? index + 1 : avatarCount - index,
            marginLeft: size ? (!isFirst ? -size / 4 : 0) : '',
        };
        return (react_1.default.createElement(context_1.default.Provider, { key: index, value: { size: size, shape: shape, autoFixFontSize: autoFixFontSize, style: stackedStyle } }, item));
    })));
}
var AvatarGroupComponent = (0, react_1.forwardRef)(Group);
AvatarGroupComponent.displayName = 'AvatarGroup';
exports.default = AvatarGroupComponent;
