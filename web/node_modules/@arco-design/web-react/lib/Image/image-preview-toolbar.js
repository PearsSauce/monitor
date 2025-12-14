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
var IconMore_1 = __importDefault(require("../../icon/react-icon-cjs/IconMore"));
var Tooltip_1 = __importDefault(require("../Tooltip"));
var trigger_for_toolbar_1 = require("./trigger-for-toolbar");
var ImagePreviewToolbar = function (props, ref) {
    var _a;
    var prefixCls = props.prefixCls, previewPrefixCls = props.previewPrefixCls, _b = props.simple, simple = _b === void 0 ? false : _b, _c = props.actions, actions = _c === void 0 ? [] : _c, _d = props.actionsLayout, actionsLayout = _d === void 0 ? [] : _d, _e = props.defaultActions, defaultActions = _e === void 0 ? [] : _e;
    // Filter based on layout
    var actionsLayoutSet = new Set(actionsLayout);
    var filterWithLayout = function (item) { return actionsLayoutSet.has(item.key); };
    var filteredActions = __spreadArray(__spreadArray([], __read(defaultActions.filter(filterWithLayout)), false), __read(actions.filter(filterWithLayout)), false);
    var extraActions = actions.filter(function (item) { return !actionsLayoutSet.has(item.key); });
    // Sort by layout
    var resultActions = filteredActions.sort(function (pre, cur) {
        var preIndex = actionsLayout.indexOf(pre.key);
        var curIndex = actionsLayout.indexOf(cur.key);
        return preIndex > curIndex ? 1 : -1;
    });
    if (actionsLayoutSet.has('extra')) {
        var extraIndex = actionsLayout.indexOf('extra');
        resultActions.splice.apply(resultActions, __spreadArray([extraIndex, 0], __read(extraActions), false));
    }
    var renderAction = function (itemData, renderName) {
        var _a;
        if (renderName === void 0) { renderName = false; }
        var content = itemData.content, disabled = itemData.disabled, key = itemData.key, name = itemData.name, getContainer = itemData.getContainer, onClick = itemData.onClick, rest = __rest(itemData, ["content", "disabled", "key", "name", "getContainer", "onClick"]);
        var action = (react_1.default.createElement("div", __assign({ className: (0, classNames_1.default)(previewPrefixCls + "-toolbar-action", (_a = {},
                _a[previewPrefixCls + "-toolbar-action-disabled"] = disabled,
                _a)), key: key, onClick: function (e) {
                if (!disabled && onClick) {
                    onClick(e);
                }
            }, onMouseDown: function (e) {
                // To solve the problem that tooltip is selected when button is quickly clicked
                e.preventDefault();
            } }, rest),
            content && react_1.default.createElement("span", { className: previewPrefixCls + "-toolbar-action-content" }, content),
            renderName && name && (react_1.default.createElement("span", { className: previewPrefixCls + "-toolbar-action-name" }, name))));
        if (getContainer) {
            return getContainer(action);
        }
        return action;
    };
    if (!resultActions.length)
        return null;
    var actionList = resultActions.map(function (item) {
        var action = renderAction(item, simple);
        if (!simple && item.name && !item.getContainer) {
            return (react_1.default.createElement(Tooltip_1.default, { content: item.name, key: item.key }, action));
        }
        return action;
    });
    return (react_1.default.createElement("div", { ref: ref, className: (0, classNames_1.default)(previewPrefixCls + "-toolbar", (_a = {},
            _a[previewPrefixCls + "-toolbar-simple"] = simple,
            _a), props.className), style: props.style },
        simple && (react_1.default.createElement(trigger_for_toolbar_1.TriggerForToolbar, { prefixCls: prefixCls, className: previewPrefixCls + "-trigger", popup: function () { return react_1.default.createElement("div", null, actionList); } }, renderAction({
            key: 'trigger',
            content: (react_1.default.createElement("span", null,
                react_1.default.createElement(IconMore_1.default, null))),
        }))),
        !simple && actionList));
};
exports.default = (0, react_1.forwardRef)(ImagePreviewToolbar);
