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
var react_1 = __importStar(require("react"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var Tooltip_1 = __importDefault(require("../Tooltip"));
var is_1 = require("../_util/is");
var clipboard_1 = __importDefault(require("../_util/clipboard"));
var IconCopy_1 = __importDefault(require("../../icon/react-icon-cjs/IconCopy"));
var IconCheckCircleFill_1 = __importDefault(require("../../icon/react-icon-cjs/IconCheckCircleFill"));
var IconEdit_1 = __importDefault(require("../../icon/react-icon-cjs/IconEdit"));
var mergedToString_1 = __importDefault(require("../_util/mergedToString"));
function Operations(props) {
    var children = props.children, copyable = props.copyable, editable = props.editable, ellipsis = props.ellipsis, expanding = props.expanding, setEditing = props.setEditing, onClickExpand = props.onClickExpand, forceShowExpand = props.forceShowExpand, isEllipsis = props.isEllipsis, _a = props.currentContext, currentContext = _a === void 0 ? {} : _a;
    var getEventListeners = (0, useKeyboardEvent_1.default)();
    var getPrefixCls = currentContext.getPrefixCls, locale = currentContext.locale;
    var prefixCls = getPrefixCls('typography');
    var _b = __read((0, react_1.useState)(false), 2), isCopied = _b[0], setCopied = _b[1];
    var copyTimer = (0, react_1.useRef)(null);
    var copyConfig = (0, is_1.isObject)(copyable) ? copyable : {};
    var ellipsisConfig = (0, is_1.isObject)(ellipsis) ? ellipsis : {};
    var editableConfig = (0, is_1.isObject)(editable) ? editable : {};
    var expandNodes = (0, is_1.isArray)(ellipsisConfig.expandNodes)
        ? ellipsisConfig.expandNodes
        : [locale.Typography.fold, locale.Typography.unfold];
    (0, react_1.useEffect)(function () {
        return function () {
            clearTimeout(copyTimer.current);
            copyTimer.current = null;
        };
    }, []);
    function onClickCopy(e) {
        if (isCopied)
            return;
        var text = copyConfig.text !== undefined ? copyConfig.text : (0, mergedToString_1.default)(children);
        (0, clipboard_1.default)(text);
        setCopied(true);
        copyConfig.onCopy && copyConfig.onCopy(text, e);
        copyTimer.current = setTimeout(function () {
            setCopied(false);
        }, 3000);
    }
    var onClickEdit = function (e) {
        editableConfig.onStart && editableConfig.onStart((0, mergedToString_1.default)(children), e);
        setEditing(true);
    };
    var tooltips = copyConfig.tooltips || [locale.Typography.copy, locale.Typography.copied];
    var copyElement = copyable && (react_1.default.createElement(Tooltip_1.default, __assign({ content: isCopied ? tooltips[1] : tooltips[0] }, copyConfig.tooltipProps),
        react_1.default.createElement("span", __assign({ className: isCopied ? prefixCls + "-operation-copied" : prefixCls + "-operation-copy", onClick: onClickCopy, role: "button", "aria-label": tooltips[0], tabIndex: 0 }, getEventListeners({
            onPressEnter: onClickCopy,
        })), isCopied ? react_1.default.createElement(IconCheckCircleFill_1.default, null) : copyConfig.icon || react_1.default.createElement(IconCopy_1.default, null))));
    var editElement = editable && (react_1.default.createElement(Tooltip_1.default, __assign({ content: locale.Typography.edit }, editableConfig.tooltipProps),
        react_1.default.createElement("span", __assign({ tabIndex: 0, "aria-label": locale.Typography.edit, role: "button", className: prefixCls + "-operation-edit", onClick: onClickEdit }, getEventListeners({
            onPressEnter: onClickEdit,
        })),
            react_1.default.createElement(IconEdit_1.default, null))));
    var ellipsisElement = forceShowExpand || (ellipsisConfig.expandable && isEllipsis) ? (react_1.default.createElement("a", __assign({ className: prefixCls + "-operation-expand", onClick: onClickExpand, role: "button", tabIndex: 0, "aria-label": locale.Typography.unfold }, getEventListeners({
        onPressEnter: onClickExpand,
    })), expanding ? expandNodes[0] : expandNodes[1])) : null;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        ellipsisElement,
        editElement,
        copyElement));
}
exports.default = Operations;
