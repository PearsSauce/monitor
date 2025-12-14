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
var meta_1 = __importDefault(require("./meta"));
var ConfigProvider_1 = require("../ConfigProvider");
var classNames_1 = __importDefault(require("../_util/classNames"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var defaultProps = {
    actionLayout: 'horizontal',
};
function Item(baseProps, ref) {
    var _a = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _a.getPrefixCls, componentConfig = _a.componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig && componentConfig['List.Item']);
    var children = props.children, className = props.className, actions = props.actions, extra = props.extra, actionLayout = props.actionLayout, rest = __rest(props, ["children", "className", "actions", "extra", "actionLayout"]);
    var prefixCls = getPrefixCls('list');
    var baseClassName = prefixCls + "-item";
    var metaContent = [];
    var mainContent = [];
    react_1.default.Children.forEach(children, function (element) {
        if (element && element.type && element.type === meta_1.default) {
            metaContent.push(element);
        }
        else {
            mainContent.push(element);
        }
    });
    var content = mainContent.length ? (react_1.default.createElement("div", { className: baseClassName + "-content" }, mainContent)) : null;
    var extraContent = extra ? (react_1.default.createElement("div", { className: baseClassName + "-extra-content" }, extra)) : null;
    var actionsContent = actions && actions.length ? (react_1.default.createElement("div", { className: baseClassName + "-action" }, actions.map(function (action, i) { return (react_1.default.createElement("li", { key: baseClassName + "-action-" + i }, action)); }))) : null;
    return (react_1.default.createElement("div", __assign({ role: "listitem", ref: ref, className: (0, classNames_1.default)(baseClassName, className) }, rest),
        react_1.default.createElement("div", { className: baseClassName + "-main" },
            metaContent,
            content,
            actionLayout === 'vertical' ? actionsContent : null),
        actionLayout === 'horizontal' ? actionsContent : null,
        extraContent));
}
var ForwardRefItem = react_1.default.forwardRef(Item);
var ItemComponent = ForwardRefItem;
ItemComponent.displayName = 'ListItem';
ItemComponent.Meta = meta_1.default;
exports.default = ItemComponent;
