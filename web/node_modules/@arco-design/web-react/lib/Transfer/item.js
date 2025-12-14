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
var classNames_1 = __importDefault(require("../_util/classNames"));
var icon_hover_1 = __importDefault(require("../_class/icon-hover"));
var Checkbox_1 = __importDefault(require("../Checkbox"));
var IconClose_1 = __importDefault(require("../../icon/react-icon-cjs/IconClose"));
var IconDragDotVertical_1 = __importDefault(require("../../icon/react-icon-cjs/IconDragDotVertical"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
function TransferItem(props) {
    var _a;
    var className = props.className, prefixCls = props.prefixCls, render = props.render, item = props.item, selectedKeys = props.selectedKeys, disabled = props.disabled, draggable = props.draggable, droppable = props.droppable, allowClear = props.allowClear, onItemSelect = props.onItemSelect, onItemRemove = props.onItemRemove, onDragStart = props.onDragStart, onDragEnd = props.onDragEnd, onDragLeave = props.onDragLeave, onDragOver = props.onDragOver, onDrop = props.onDrop;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var baseClassName = prefixCls + "-view-item";
    var refItem = (0, react_1.useRef)(null);
    var refDraggedTimer = (0, react_1.useRef)(null);
    var _b = __read((0, react_1.useState)('none'), 2), dragStatus = _b[0], setDragStatus = _b[1];
    var _c = __read((0, react_1.useState)(false), 2), dragOver = _c[0], setDragOver = _c[1];
    var _d = __read((0, react_1.useState)(0), 2), dragPosition = _d[0], setDragPosition = _d[1];
    var _disabled = disabled || item.disabled;
    var _draggable = draggable && !_disabled;
    var checked = selectedKeys.indexOf(item.key) > -1;
    var itemContent = render ? render(item) : item.value;
    (0, react_1.useEffect)(function () {
        return function () {
            refDraggedTimer.current && clearTimeout(refDraggedTimer.current);
        };
    }, []);
    (0, react_1.useEffect)(function () {
        if (dragStatus === 'dragged') {
            refDraggedTimer.current = setTimeout(function () { return setDragStatus('none'); }, 1000);
        }
    }, [dragStatus]);
    return (react_1.default.createElement("li", { key: item.key, ref: refItem, className: (0, classNames_1.default)(baseClassName, (_a = {},
            _a[baseClassName + "-disabled"] = _disabled,
            _a[baseClassName + "-draggable"] = _draggable,
            _a[baseClassName + "-gap-top"] = dragOver && dragPosition < 0,
            _a[baseClassName + "-gap-bottom"] = dragOver && dragPosition > 0,
            _a[baseClassName + "-" + dragStatus] = dragStatus !== 'none',
            _a), className), draggable: _draggable, onDragStart: function (e) {
            e.stopPropagation();
            setDragStatus('dragging');
            onDragStart && onDragStart(e, item);
            try {
                // ie throw error
                // firefox-need-it
                e.dataTransfer.setData('text/plain', '');
            }
            catch (error) {
                // empty
            }
        }, onDragEnd: function (e) {
            e.stopPropagation();
            setDragOver(false);
            setDragStatus('dragged');
            onDragEnd && onDragEnd(e, item);
        }, onDragOver: function (e) {
            if (droppable) {
                e.stopPropagation();
                e.preventDefault();
                var rect = refItem.current.getBoundingClientRect();
                var threshold = window.pageYOffset + rect.top + rect.height / 2;
                var position = e.pageY > threshold ? 1 : -1;
                setDragOver(true);
                setDragPosition(position);
                onDragOver && onDragOver(e, item);
            }
        }, onDragLeave: function (e) {
            if (droppable) {
                e.stopPropagation();
                setDragOver(false);
                onDragLeave && onDragLeave(e, item);
            }
        }, onDrop: function (e) {
            if (droppable) {
                e.stopPropagation();
                e.preventDefault();
                setDragOver(false);
                setDragPosition(0);
                setDragStatus('none');
                onDrop && onDrop(e, item, dragPosition);
            }
        } },
        draggable ? react_1.default.createElement(IconDragDotVertical_1.default, { className: baseClassName + "-icon-drag" }) : null,
        allowClear ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("span", { className: baseClassName + "-content" }, itemContent),
            !_disabled && (react_1.default.createElement(icon_hover_1.default, __assign({ className: baseClassName + "-icon-remove", onClick: function () { return onItemRemove(item.key); }, tabIndex: 0, role: "button" }, getKeyboardEvents({
                onPressEnter: function () { return onItemRemove(item.key); },
            })),
                react_1.default.createElement(IconClose_1.default, null))))) : (react_1.default.createElement(Checkbox_1.default, { className: baseClassName + "-content", checked: checked, disabled: _disabled, onChange: function (checked) { return onItemSelect(item.key, checked); } }, itemContent))));
}
exports.default = TransferItem;
