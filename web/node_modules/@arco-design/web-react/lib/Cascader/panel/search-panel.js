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
exports.getLegalIndex = void 0;
var react_1 = __importStar(require("react"));
var isEqualWith_1 = __importDefault(require("lodash/isEqualWith"));
var scroll_into_view_if_needed_1 = __importDefault(require("scroll-into-view-if-needed"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var Checkbox_1 = __importDefault(require("../../Checkbox"));
var keycode_1 = require("../../_util/keycode");
var useUpdate_1 = __importDefault(require("../../_util/hooks/useUpdate"));
var useIsFirstRender_1 = __importDefault(require("../../_util/hooks/useIsFirstRender"));
var is_1 = require("../../_util/is");
var util_1 = require("../util");
var VirtualList_1 = __importDefault(require("../../_class/VirtualList"));
var dom_1 = require("../../_util/dom");
var getLegalIndex = function (currentIndex, maxIndex) {
    if (currentIndex < 0) {
        return maxIndex;
    }
    if (currentIndex > maxIndex) {
        return 0;
    }
    return currentIndex;
};
exports.getLegalIndex = getLegalIndex;
var formatLabel = function (inputValue, label, prefixCls) {
    var dom = label;
    if ((0, is_1.isString)(label)) {
        var index = label.toUpperCase().indexOf(inputValue.toUpperCase());
        if (index > -1) {
            var prefix = label.substr(0, index);
            var suffix = label.substr(index + inputValue.length);
            dom = (react_1.default.createElement(react_1.default.Fragment, null,
                prefix,
                react_1.default.createElement("span", { className: prefixCls + "-highlight" }, label.substr(index, inputValue.length)),
                suffix));
        }
    }
    return dom;
};
var SearchPanel = function (props) {
    var _a;
    var store = props.store, prefixCls = props.prefixCls, multiple = props.multiple, onChange = props.onChange, inputValue = props.inputValue, renderEmpty = props.renderEmpty, style = props.style, defaultActiveFirstOption = props.defaultActiveFirstOption, rtl = props.rtl, icons = props.icons;
    var value = props.value || [];
    var _b = __read((0, react_1.useState)(store.searchNodeByLabel(inputValue) || []), 2), options = _b[0], setOptions = _b[1];
    var refActiveItem = (0, react_1.useRef)();
    // 用来标示是否需要scrollIntoView。如果是鼠标hover，不需要滚动。
    var isKeyboardHover = (0, react_1.useRef)();
    var isFirstRender = (0, useIsFirstRender_1.default)();
    // 保存键盘操作的目标节点
    var _c = __read((0, react_1.useState)(defaultActiveFirstOption ? 0 : -1), 2), currentHoverIndex = _c[0], setCurrentHoverIndex = _c[1];
    var handleSearchOptionClick = function (option, checked, e) {
        e.stopPropagation();
        if (option.disabled) {
            return;
        }
        if (multiple) {
            var checkedValues = (0, util_1.getMultipleCheckValue)(props.value, store, option, checked);
            onChange && onChange(checkedValues);
        }
        else {
            onChange && onChange([option.pathValue]);
        }
    };
    (0, useUpdate_1.default)(function () {
        setOptions(store.searchNodeByLabel(inputValue));
    }, [inputValue, store]);
    (0, useUpdate_1.default)(function () {
        setCurrentHoverIndex(function (currentIndex) {
            if (currentIndex > options.length - 1) {
                return defaultActiveFirstOption ? 0 : -1;
            }
            return currentIndex;
        });
    }, [options]);
    (0, react_1.useEffect)(function () {
        var target = props.getTriggerElement();
        if (!target) {
            return;
        }
        var handleKeyDown = function (e) {
            e.stopPropagation();
            // 使用keycode，避免中文输入法输入时，触发enter,space等事件。
            // p.s 中文输入时，keycode 都是229
            var keyCode = e.keyCode || e.which;
            switch (keyCode) {
                case keycode_1.Esc.code: {
                    props.onEsc();
                    return false;
                }
                case keycode_1.ArrowDown.code:
                case keycode_1.ArrowUp.code: {
                    isKeyboardHover.current = true;
                    var diff = keycode_1.ArrowDown.code === keyCode ? 1 : -1;
                    var nextIndex = (0, exports.getLegalIndex)(currentHoverIndex + diff, options.length - 1);
                    while (nextIndex !== currentHoverIndex) {
                        var item_1 = options[nextIndex];
                        if (item_1.disabled) {
                            nextIndex = (0, exports.getLegalIndex)(nextIndex + diff, options.length - 1);
                        }
                        else {
                            break;
                        }
                    }
                    setCurrentHoverIndex(nextIndex);
                    return false;
                }
                case keycode_1.Enter.code:
                    var item_2 = options[currentHoverIndex];
                    if (item_2) {
                        var isChecked = value.some(function (x) {
                            return (0, isEqualWith_1.default)(x, item_2.pathValue);
                        });
                        handleSearchOptionClick(item_2, !isChecked, e);
                    }
                    return false;
                default:
                    break;
            }
        };
        (0, dom_1.on)(target, 'keydown', handleKeyDown);
        return function () {
            (0, dom_1.off)(target, 'keydown', handleKeyDown);
        };
    }, [options, currentHoverIndex, value]);
    (0, react_1.useEffect)(function () {
        var _a;
        var target = refActiveItem.current;
        if (target && (isKeyboardHover.current || isFirstRender)) {
            (0, scroll_into_view_if_needed_1.default)(target, {
                behavior: 'auto',
                block: 'nearest',
                scrollMode: 'if-needed',
                boundary: (_a = target.parentNode) === null || _a === void 0 ? void 0 : _a.parentNode,
            });
        }
    }, [currentHoverIndex, options]);
    refActiveItem.current = null;
    return options.length ? (react_1.default.createElement("div", { className: prefixCls + "-list-wrapper" },
        react_1.default.createElement(VirtualList_1.default, __assign({ needFiller: false, wrapper: "ul", role: "menu", style: style, data: options, isStaticItemHeight: true, threshold: props.virtualListProps ? 100 : null }, ((0, is_1.isObject)(props.virtualListProps) ? props.virtualListProps : {}), { onMouseMove: function () {
                isKeyboardHover.current = false;
            }, className: (0, classNames_1.default)(prefixCls + "-list", prefixCls + "-list-search", (_a = {},
                _a[prefixCls + "-list-multiple"] = multiple,
                _a[prefixCls + "-list-rtl"] = rtl,
                _a)) }), function (item, i) {
            var _a;
            var pathNodes = item.getPathNodes();
            var pathLabel = pathNodes.map(function (path, index) { return (react_1.default.createElement("span", { key: path.label + "_" + path._level },
                path.label,
                pathNodes.length === index + 1 ? '' : ' / ')); });
            var isChecked = item._checked;
            var options = { checked: isChecked };
            var label = (0, is_1.isFunction)(props.renderOption)
                ? props.renderOption(inputValue, item._data, options)
                : formatLabel(inputValue, pathLabel, prefixCls);
            return (react_1.default.createElement("li", { title: (0, is_1.isString)(label) ? label : (0, is_1.isString)(pathLabel) ? pathLabel : undefined, role: "menuitem", "aria-disabled": item.disabled, ref: function (node) {
                    if (i === currentHoverIndex) {
                        refActiveItem.current = node;
                    }
                    if (isChecked && !refActiveItem.current) {
                        refActiveItem.current = node;
                    }
                }, className: (0, classNames_1.default)(prefixCls + "-list-search-item", (_a = {},
                    _a[prefixCls + "-list-search-item-active"] = isChecked,
                    _a[prefixCls + "-list-search-item-hover"] = i === currentHoverIndex,
                    _a[prefixCls + "-list-search-item-disabled"] = item.disabled,
                    _a)), onClick: function (e) {
                    handleSearchOptionClick(item, !isChecked, e);
                }, key: i, onMouseEnter: function () {
                    if (!isKeyboardHover.current && !item.disabled) {
                        setCurrentHoverIndex(i);
                    }
                }, onMouseLeave: function () {
                    if (!isKeyboardHover.current && !item.disabled) {
                        setCurrentHoverIndex(defaultActiveFirstOption ? 0 : -1);
                    }
                } },
                react_1.default.createElement("div", { className: prefixCls + "-list-item-label" }, (0, is_1.isFunction)(props.renderOption) ? (label) : multiple ? (react_1.default.createElement(Checkbox_1.default, { checked: isChecked, disabled: item.disabled }, label)) : (react_1.default.createElement(react_1.default.Fragment, null,
                    label,
                    isChecked && (react_1.default.createElement("span", { className: prefixCls + "-check-icon" }, icons.checked)))))));
        }))) : (react_1.default.createElement(react_1.default.Fragment, null, renderEmpty && renderEmpty()));
};
exports.default = SearchPanel;
