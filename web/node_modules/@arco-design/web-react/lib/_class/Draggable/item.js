"use strict";
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
var classNames_1 = __importDefault(require("../../_util/classNames"));
function Item(props) {
    var _a;
    var prefixCls = props.prefixCls, style = props.style, children = props.children, direction = props.direction, disabled = props.disabled, _b = props.droppable, droppable = _b === void 0 ? true : _b, onDrop = props.onDrop, onDragStart = props.onDragStart, onDragEnd = props.onDragEnd, onDragOver = props.onDragOver, onDragLeave = props.onDragLeave;
    var refItem = (0, react_1.useRef)(null);
    var refDraggedTimer = (0, react_1.useRef)(null);
    var _c = __read((0, react_1.useState)('none'), 2), dragStatus = _c[0], setDragStatus = _c[1];
    var _d = __read((0, react_1.useState)(false), 2), dragOver = _d[0], setDragOver = _d[1];
    var _e = __read((0, react_1.useState)(null), 2), dragPosition = _e[0], setDragPosition = _e[1];
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
    return (react_1.default.createElement("li", { draggable: true, ref: refItem, style: style, className: (0, classNames_1.default)(prefixCls + "-item", (_a = {},
            _a[prefixCls + "-item-" + dragStatus] = dragStatus !== 'none',
            _a[prefixCls + "-item-gap-" + dragPosition] = dragPosition,
            _a[prefixCls + "-item-disabled"] = disabled,
            _a[prefixCls + "-item-dragover"] = dragOver,
            _a)), onDragStart: function (event) {
            event.stopPropagation();
            setDragStatus('dragging');
            try {
                // ie throw error
                // firefox-need-it
                event.dataTransfer.setData('text/plain', '');
            }
            catch (error) { }
            onDragStart && onDragStart(event);
        }, onDragEnd: function (event) {
            event.stopPropagation();
            setDragOver(false);
            setDragStatus('dragged');
            onDragEnd && onDragEnd(event);
        }, onDragOver: function (event) {
            if (droppable) {
                event.stopPropagation();
                event.preventDefault();
                var rect = refItem.current.getBoundingClientRect();
                if (direction === 'vertical') {
                    setDragPosition(event.pageY > window.pageYOffset + rect.top + rect.height / 2 ? 'bottom' : 'top');
                }
                else {
                    setDragPosition(event.pageX > window.pageXOffset + rect.left + rect.width / 2 ? 'right' : 'left');
                }
                setDragOver(true);
                onDragOver && onDragOver(event);
            }
        }, onDragLeave: function (event) {
            if (droppable) {
                event.stopPropagation();
                setDragOver(false);
                onDragLeave && onDragLeave(event);
            }
        }, onDrop: function (event) {
            if (droppable) {
                event.stopPropagation();
                event.preventDefault();
                setDragOver(false);
                setDragPosition(null);
                setDragStatus('none');
                onDrop && onDrop(event, dragPosition);
            }
        } }, children));
}
exports.default = Item;
