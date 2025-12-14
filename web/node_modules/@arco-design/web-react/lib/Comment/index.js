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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var ConfigProvider_1 = require("../ConfigProvider");
var is_1 = require("../_util/is");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var pick_1 = require("../_util/pick");
var defaultAlign = {
    datetime: 'left',
    actions: 'left',
};
var defaultProps = {
    align: 'left',
};
function Comment(baseProps, ref) {
    var _a;
    var _b = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _b.getPrefixCls, componentConfig = _b.componentConfig, rtl = _b.rtl;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.Comment);
    var prefixCls = getPrefixCls('comment');
    var actions = props.actions, author = props.author, avatar = props.avatar, content = props.content, datetime = props.datetime;
    var align = __assign(__assign({}, defaultAlign), ((0, is_1.isObject)(props.align)
        ? props.align
        : {
            datetime: props.align,
            actions: props.align,
        }));
    return (react_1.default.createElement("div", __assign({ ref: ref, className: (0, classNames_1.default)("" + prefixCls, (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), props.className), style: props.style }, (0, pick_1.pickDataAttributes)(props)),
        avatar && (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-avatar") }, (0, is_1.isString)(avatar) ? react_1.default.createElement("img", { src: avatar, alt: "comment-avatar" }) : avatar)),
        react_1.default.createElement("div", { className: prefixCls + "-inner" },
            react_1.default.createElement("div", { className: prefixCls + "-inner-content" },
                (author || datetime) && (react_1.default.createElement("div", { className: prefixCls + "-title " + prefixCls + "-title-align-" + align.datetime },
                    author && react_1.default.createElement("span", { className: prefixCls + "-author" }, author),
                    datetime && react_1.default.createElement("span", { className: prefixCls + "-datetime" }, datetime))),
                content && react_1.default.createElement("div", { className: prefixCls + "-content" }, content),
                actions && (react_1.default.createElement("div", { className: prefixCls + "-actions " + prefixCls + "-actions-align-" + align.actions }, actions))),
            props.children && react_1.default.createElement("div", { className: prefixCls + "-inner-comment" }, props.children))));
}
var CommentRef = (0, react_1.forwardRef)(Comment);
CommentRef.displayName = 'Comment';
exports.default = CommentRef;
