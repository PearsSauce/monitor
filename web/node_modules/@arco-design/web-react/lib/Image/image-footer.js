"use strict";
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
exports.ImageFooter = void 0;
var react_1 = __importDefault(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var useShowFooter_1 = __importDefault(require("./utils/hooks/useShowFooter"));
var IconMore_1 = __importDefault(require("../../icon/react-icon-cjs/IconMore"));
var trigger_for_toolbar_1 = require("./trigger-for-toolbar");
var ImageFooter = function (props) {
    var _a;
    var style = props.style, className = props.className, title = props.title, description = props.description, actions = props.actions, prefixCls = props.prefixCls, simple = props.simple;
    var _b = __read((0, useShowFooter_1.default)({ title: title, description: description, actions: actions }), 3), showFooter = _b[0], showCaption = _b[1], showActions = _b[2];
    if (!showFooter)
        return null;
    var footerPrefixCls = prefixCls + "-footer";
    var classNames = (0, classNames_1.default)(footerPrefixCls, className, (_a = {},
        _a[footerPrefixCls + "-with-actions"] = showActions,
        _a));
    var renderActionList = function () {
        var actionsList = (react_1.default.createElement("div", { className: prefixCls + "-actions-list" }, actions.map(function (item, index) {
            return (react_1.default.createElement("div", { className: prefixCls + "-actions-item", key: "" + index }, item));
        })));
        if (simple) {
            return (react_1.default.createElement("div", { className: prefixCls + "-actions-list" },
                react_1.default.createElement(trigger_for_toolbar_1.TriggerForToolbar, { prefixCls: prefixCls, popup: function () { return actionsList; } },
                    react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-actions-item", prefixCls + "-actions-item-trigger") },
                        react_1.default.createElement("span", null,
                            react_1.default.createElement(IconMore_1.default, null))))));
        }
        return actionsList;
    };
    return (react_1.default.createElement("div", { className: classNames, style: style },
        showCaption && (react_1.default.createElement("div", { className: (0, classNames_1.default)(footerPrefixCls + "-block", prefixCls + "-caption") },
            title && (react_1.default.createElement("div", { className: prefixCls + "-caption-title", title: title }, title)),
            description && !simple && (react_1.default.createElement("div", { className: prefixCls + "-caption-description", title: description }, description)))),
        showActions && (react_1.default.createElement("div", { className: (0, classNames_1.default)(footerPrefixCls + "-block", prefixCls + "-actions") }, renderActionList()))));
};
exports.ImageFooter = ImageFooter;
