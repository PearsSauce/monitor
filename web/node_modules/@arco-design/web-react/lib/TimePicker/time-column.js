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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var debounce_1 = __importDefault(require("lodash/debounce"));
var util_1 = require("./util");
var classNames_1 = __importDefault(require("../_util/classNames"));
var usePrevious_1 = __importDefault(require("../_util/hooks/usePrevious"));
function TimeColumn(props) {
    var prefixCls = props.prefixCls, list = props.list, value = props.value, onHandleSelect = props.onHandleSelect, unit = props.unit, popupVisible = props.popupVisible, scrollSticky = props.scrollSticky;
    var lis = (0, react_1.useRef)(new Map());
    var wrapper = (0, react_1.useRef)();
    var ul = (0, react_1.useRef)();
    var listItemHeight = (0, react_1.useRef)(0);
    var prevPopupVisible = (0, usePrevious_1.default)(popupVisible);
    var prevScrollTop = (0, react_1.useRef)(wrapper.current && wrapper.current.scrollTop);
    (0, react_1.useEffect)(function () {
        var li = lis.current.get(value);
        if (li && popupVisible && prevPopupVisible) {
            (0, util_1.scrollTo)(wrapper.current, li.offsetTop, 150);
            prevScrollTop.current = li.offsetTop;
        }
    }, [value]);
    (0, react_1.useEffect)(function () {
        if (popupVisible && popupVisible !== prevPopupVisible) {
            var li = lis.current.get(value);
            if (li) {
                (0, util_1.scrollTo)(wrapper.current, li.offsetTop, 0);
                prevScrollTop.current = li.offsetTop;
            }
        }
    }, [popupVisible, prevPopupVisible]);
    (0, react_1.useEffect)(function () {
        if (list.length <= 1) {
            return;
        }
        listItemHeight.current =
            (ul.current.clientHeight - wrapper.current.clientHeight) / (list.length - 1);
    }, [list.length]);
    var onScrollList = (0, react_1.useCallback)((0, debounce_1.default)(function () {
        var mathFunc = wrapper.current.scrollTop - prevScrollTop.current > 0 ? Math.ceil : Math.floor;
        var index = mathFunc(wrapper.current.scrollTop / listItemHeight.current);
        if (index !== value && list[index] && !list[index].disabled) {
            onHandleSelect(list[index].value, unit);
        }
    }, 100), [onHandleSelect]);
    return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-list"), ref: wrapper, onWheel: scrollSticky ? onScrollList : undefined },
        react_1.default.createElement("ul", { ref: ul }, list.map(function (item) {
            var _a;
            return (react_1.default.createElement("li", { key: item.value, className: (0, classNames_1.default)(prefixCls + "-cell", (_a = {},
                    _a[prefixCls + "-cell-disabled"] = item.disabled,
                    _a[prefixCls + "-cell-selected"] = item.selected,
                    _a)), onClick: function () { return !item.disabled && onHandleSelect(item.value, unit); }, ref: function (element) {
                    lis.current.set(item.value, element);
                } },
                react_1.default.createElement("div", { className: prefixCls + "-cell-inner" }, item.label)));
        }))));
}
exports.default = TimeColumn;
