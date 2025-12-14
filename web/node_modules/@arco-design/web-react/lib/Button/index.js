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
var IconLoading_1 = __importDefault(require("../../icon/react-icon-cjs/IconLoading"));
var group_1 = __importDefault(require("./group"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var regexTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
function processChildren(children) {
    var childrenList = [];
    var isPrevChildPure = false;
    react_1.default.Children.forEach(children, function (child) {
        var isCurrentChildPure = typeof child === 'string' || typeof child === 'number';
        if (isCurrentChildPure && isPrevChildPure) {
            var lastIndex = childrenList.length - 1;
            var lastChild = childrenList[lastIndex];
            childrenList[lastIndex] = "" + lastChild + child;
        }
        else {
            childrenList.push(child);
        }
        isPrevChildPure = isCurrentChildPure;
    });
    return react_1.default.Children.map(childrenList, function (child) {
        return typeof child === 'string' ? react_1.default.createElement("span", null, child) : child;
    });
}
var defaultProps = {
    htmlType: 'button',
    type: 'default',
    shape: 'square',
};
function Button(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, ctxSize = _b.size, autoInsertSpaceInButton = _b.autoInsertSpaceInButton, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Button);
    var style = props.style, className = props.className, children = props.children, htmlType = props.htmlType, type = props.type, status = props.status, size = props.size, shape = props.shape, href = props.href, anchorProps = props.anchorProps, disabled = props.disabled, loading = props.loading, loadingFixedWidth = props.loadingFixedWidth, icon = props.icon, iconOnly = props.iconOnly, onClick = props.onClick, long = props.long, rest = __rest(props, ["style", "className", "children", "htmlType", "type", "status", "size", "shape", "href", "anchorProps", "disabled", "loading", "loadingFixedWidth", "icon", "iconOnly", "onClick", "long"]);
    var iconNode = loading ? react_1.default.createElement(IconLoading_1.default, null) : icon;
    var _c = __read((0, react_1.useState)(false), 2), isTwoCNChar = _c[0], setIsTwoCNChar = _c[1];
    var innerButtonRef = (0, react_1.useRef)();
    var buttonRef = ref || innerButtonRef;
    (0, react_1.useEffect)(function () {
        if (autoInsertSpaceInButton && buttonRef && buttonRef.current) {
            var textContent = buttonRef.current.textContent;
            if (regexTwoCNChar.test(textContent)) {
                if (!isTwoCNChar) {
                    setIsTwoCNChar(true);
                }
            }
            else if (isTwoCNChar) {
                setIsTwoCNChar(false);
            }
        }
    }, [buttonRef.current, autoInsertSpaceInButton]);
    var prefixCls = getPrefixCls('btn');
    var _type = type === 'default' ? 'secondary' : type;
    var classNames = (0, classNames_1.default)(prefixCls, prefixCls + "-" + _type, prefixCls + "-size-" + (size || ctxSize), prefixCls + "-shape-" + shape, (_a = {},
        _a[prefixCls + "-long"] = long,
        _a[prefixCls + "-status-" + status] = status,
        _a[prefixCls + "-loading-fixed-width"] = loadingFixedWidth,
        _a[prefixCls + "-loading"] = loading,
        _a[prefixCls + "-link"] = href,
        _a[prefixCls + "-icon-only"] = iconOnly || (!children && children !== 0 && iconNode),
        _a[prefixCls + "-disabled"] = disabled,
        _a[prefixCls + "-two-chinese-chars"] = isTwoCNChar,
        _a[prefixCls + "-rtl"] = rtl,
        _a), className);
    var handleClick = function (event) {
        if (loading || disabled) {
            typeof (event === null || event === void 0 ? void 0 : event.preventDefault) === 'function' && event.preventDefault();
            return;
        }
        onClick && onClick(event);
    };
    var InnerContent = (react_1.default.createElement(react_1.default.Fragment, null,
        iconNode,
        processChildren(children)));
    if (href) {
        var _anchorProps = __assign({}, anchorProps);
        if (disabled) {
            delete _anchorProps.href;
        }
        else {
            _anchorProps.href = href;
        }
        return (react_1.default.createElement("a", __assign({ ref: buttonRef }, rest, _anchorProps, { style: style, className: classNames, onClick: handleClick }), InnerContent));
    }
    return (react_1.default.createElement("button", __assign({ ref: buttonRef }, rest, { style: style, className: classNames, type: htmlType, disabled: disabled, onClick: handleClick }), InnerContent));
}
var ForwardRefButton = (0, react_1.forwardRef)(Button);
var ButtonComponent = ForwardRefButton;
ButtonComponent.__BYTE_BUTTON = true;
ButtonComponent.Group = group_1.default;
ButtonComponent.displayName = 'Button';
exports.default = ButtonComponent;
