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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var IconClose_1 = __importDefault(require("../../../icon/react-icon-cjs/IconClose"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var icon_hover_1 = __importDefault(require("../../_class/icon-hover"));
var is_1 = require("../../_util/is");
var utils_1 = require("../utils");
var keycode_1 = require("../../_util/keycode");
var TabHeaderTitle = function (_a, ref) {
    var _b;
    var prefixCls = _a.prefixCls, onDeleteTab = _a.onDeleteTab, tabKey = _a.tabKey, isActive = _a.isActive, onClickTab = _a.onClickTab, _c = _a.disabled, disabled = _c === void 0 ? false : _c, title = _a.title, editable = _a.editable, renderTitle = _a.renderTitle, deleteIcon = _a.deleteIcon, deleteButton = _a.deleteButton, getIdPrefix = _a.getIdPrefix, index = _a.index;
    var render = (0, is_1.isFunction)(renderTitle)
        ? renderTitle
        : function (node) {
            return node;
        };
    var handleDeleteTab = function (e) {
        e.stopPropagation();
        if (disabled)
            return;
        onDeleteTab();
    };
    var handleTabClick = function (e) {
        if (disabled)
            return;
        onClickTab(e);
    };
    return render(react_1.default.createElement("div", { ref: ref, key: tabKey, className: (0, classNames_1.default)(prefixCls + "-header-title", (_b = {},
            _b[prefixCls + "-header-title-active"] = isActive,
            _b[prefixCls + "-header-title-editable"] = editable,
            _b[prefixCls + "-header-title-disabled"] = disabled,
            _b)), role: "tab", "aria-selected": isActive, tabIndex: disabled ? -1 : 0, "aria-disabled": disabled || undefined, id: getIdPrefix(index).tab, "aria-controls": getIdPrefix(index).tabpane, onClick: handleTabClick, onKeyDown: function (event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode === keycode_1.Enter.code) {
                handleTabClick(event);
            }
        } },
        react_1.default.createElement("span", { className: prefixCls + "-header-title-text" }, title),
        editable && (react_1.default.createElement("span", __assign({ role: "button", "aria-label": "remove tab", "aria-disabled": disabled || undefined, tabIndex: disabled ? -1 : 0, className: prefixCls + "-close-icon" }, (0, utils_1.getKeyDownEvent)({ onPressEnter: handleDeleteTab }), { onClick: handleDeleteTab }), deleteButton || react_1.default.createElement(icon_hover_1.default, { prefix: prefixCls }, deleteIcon || react_1.default.createElement(IconClose_1.default, null))))), {
        key: tabKey,
        isActive: isActive,
        disabled: disabled,
        editable: editable,
    });
};
exports.default = react_1.default.forwardRef(TabHeaderTitle);
