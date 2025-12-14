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
var throttle_1 = __importDefault(require("lodash/throttle"));
var is_1 = require("../../_util/is");
var resizeObserver_1 = __importDefault(require("../../_util/resizeObserver"));
var dropdown_icon_1 = __importDefault(require("./dropdown-icon"));
var tab_nav_icon_1 = __importDefault(require("./tab-nav-icon"));
var tab_title_1 = __importDefault(require("./tab-title"));
var IconPlus_1 = __importDefault(require("../../../icon/react-icon-cjs/IconPlus"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var style_1 = require("../../_util/style");
var utils_1 = require("../utils");
var tabs_1 = require("../tabs");
var tab_ink_1 = __importDefault(require("./tab-ink"));
var icon_hover_1 = __importDefault(require("../../_class/icon-hover"));
var useDomSize_1 = __importDefault(require("../hook/useDomSize"));
var useHeaderScroll_1 = __importDefault(require("../hook/useHeaderScroll"));
var ConfigProvider_1 = require("../../ConfigProvider");
var DIRECTION_VERTICAL = 'vertical';
var ALIGN_RIGHT = 'right';
var ALIGN_LEFT = 'left';
var SCROLL_MAP = {
    delete: true,
    add: true,
};
var getHeaderStyle = function (_a) {
    var direction = _a.direction, _b = _a.align, align = _b === void 0 ? ALIGN_LEFT : _b, headerOffset = _a.headerOffset;
    var value = "translateX(" + -headerOffset + "px)";
    if (align === ALIGN_RIGHT) {
        value = "translateX(" + headerOffset + "px)";
    }
    if (direction === DIRECTION_VERTICAL) {
        value = "translateY(" + -headerOffset + "px)";
    }
    return (0, style_1.setTransformStyle)(value);
};
var getCurrentHeaderOffset = function (_a) {
    var direction = _a.direction, _b = _a.align, align = _b === void 0 ? ALIGN_LEFT : _b, headerDom = _a.headerDom, headerWrapperDom = _a.headerWrapperDom;
    var diffStyle = (0, utils_1.getRectDiff)(headerDom, headerWrapperDom);
    if (direction === DIRECTION_VERTICAL)
        return -diffStyle.top;
    if (align === ALIGN_RIGHT)
        return diffStyle.right;
    return -diffStyle.left;
};
var TabHeader = react_1.default.forwardRef(function (props, ref) {
    var _a, _b;
    var ctxProps = (0, react_1.useContext)(tabs_1.TabsContext);
    var rtl = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).rtl;
    var mergeProps = __assign(__assign({}, props), ctxProps);
    var _c = __read((0, useDomSize_1.default)(), 3), headerWrapperRef = _c[0], headerWrapperSize = _c[1], setHeaderWrapperSize = _c[2];
    var _d = __read((0, useDomSize_1.default)(), 3), headerRef = _d[0], headerSize = _d[1], setHeaderSize = _d[2];
    var _e = __read((0, useDomSize_1.default)(), 3), scrollWrapperRef = _e[0], scrollWrapperSize = _e[1], setScrollWrapperSize = _e[2];
    var _f = __read((0, useDomSize_1.default)(), 3), extraRef = _f[0], extraSize = _f[1], setExtraSize = _f[2];
    var _g = __read((0, useDomSize_1.default)(), 3), addBtnRef = _g[0], addBtnSize = _g[1], setAddenBtnSize = _g[2];
    var titleRef = (0, react_1.useRef)({});
    var _h = __read((0, react_1.useState)(0), 2), headerOffset = _h[0], setHeaderOffset = _h[1];
    var _j = __read((0, react_1.useState)(true), 2), shouldScroll = _j[0], setShouldScroll = _j[1];
    var paneChildren = mergeProps.paneChildren, editable = mergeProps.editable, prefixCls = mergeProps.prefixCls, onAddTab = mergeProps.onAddTab, direction = mergeProps.direction, _k = mergeProps.type, type = _k === void 0 ? 'line' : _k, _l = mergeProps.overflow, overflow = _l === void 0 ? 'scroll' : _l, activeTab = mergeProps.activeTab, showAddButton = mergeProps.showAddButton, _m = mergeProps.size, size = _m === void 0 ? 'default' : _m, style = mergeProps.style, tabPosition = mergeProps.tabPosition, className = mergeProps.className, extra = mergeProps.extra, animation = mergeProps.animation, icons = mergeProps.icons, deleteButton = mergeProps.deleteButton, addButton = mergeProps.addButton, renderTabTitle = mergeProps.renderTabTitle, scrollAfterEdit = mergeProps.scrollAfterEdit, _o = mergeProps.scrollPosition, scrollPosition = _o === void 0 ? 'auto' : _o, inkBarSize = mergeProps.inkBarSize;
    var scrollConfig = (0, is_1.isObject)(scrollAfterEdit)
        ? __assign(__assign({}, SCROLL_MAP), scrollAfterEdit) : SCROLL_MAP;
    var _p = __read(rtl
        ? [ALIGN_RIGHT, ALIGN_LEFT]
        : [ALIGN_LEFT, ALIGN_RIGHT], 2), left = _p[0], right = _p[1];
    var align = type === 'capsule' ? right : left;
    var isScrollable = (0, react_1.useMemo)(function () {
        var headerContentHeight = scrollWrapperSize.height - extraSize.height - addBtnSize.height;
        var headerContentWidth = scrollWrapperSize.width - extraSize.width - addBtnSize.width;
        var res = mergeProps.direction === 'vertical'
            ? headerContentHeight < headerSize.height
            : headerContentWidth < headerSize.width;
        return res;
    }, [mergeProps.direction, scrollWrapperSize, extraSize, headerSize, addBtnSize]);
    var updateScrollWrapperSize = function () {
        if (scrollWrapperRef.current) {
            var dom = scrollWrapperRef.current;
            setScrollWrapperSize({
                height: dom.offsetHeight,
                width: dom.offsetWidth,
            });
        }
    };
    var resizeCallback = function (callback) {
        return (0, throttle_1.default)(function (entry) {
            updateScrollWrapperSize();
            var dom = entry[0] && entry[0].target;
            if (dom) {
                callback({
                    height: dom.offsetHeight,
                    width: dom.offsetWidth,
                    domRect: dom.getBoundingClientRect(),
                });
            }
        }, 200);
    };
    var onWrapperResize = resizeCallback(setHeaderWrapperSize);
    var onHeaderResize = resizeCallback(setHeaderSize);
    var onExtraResize = resizeCallback(setExtraSize);
    var onAddBtnResize = resizeCallback(setAddenBtnSize);
    var getValidOffset = (0, react_1.useCallback)(function (offset) {
        var maxOffset = direction === DIRECTION_VERTICAL
            ? headerSize.height - headerWrapperSize.height
            : headerSize.width - headerWrapperSize.width;
        var validOffset = offset;
        validOffset = Math.min(maxOffset, validOffset);
        validOffset = Math.max(validOffset, 0);
        return validOffset;
    }, [direction, headerSize, headerWrapperSize]);
    var updateHeaderOffset = function (offset) {
        var nextOffset = getValidOffset(offset);
        if (nextOffset !== headerOffset) {
            setHeaderOffset(nextOffset);
        }
    };
    (0, react_1.useEffect)(function () {
        return function () {
            var _a, _b, _c, _d;
            (_a = onHeaderResize === null || onHeaderResize === void 0 ? void 0 : onHeaderResize.cancel) === null || _a === void 0 ? void 0 : _a.call(onHeaderResize);
            (_b = onWrapperResize === null || onWrapperResize === void 0 ? void 0 : onWrapperResize.cancel) === null || _b === void 0 ? void 0 : _b.call(onWrapperResize);
            (_c = onExtraResize === null || onExtraResize === void 0 ? void 0 : onExtraResize.cancel) === null || _c === void 0 ? void 0 : _c.call(onExtraResize);
            (_d = onAddBtnResize === null || onAddBtnResize === void 0 ? void 0 : onAddBtnResize.cancel) === null || _d === void 0 ? void 0 : _d.call(onAddBtnResize);
        };
    }, []);
    // 根据激活的 tab 更新 headerOffset，所以依赖里面不能加 headerOffset
    (0, react_1.useEffect)(function () {
        if (!shouldScroll) {
            setShouldScroll(true);
            return;
        }
        var getActiveTabOffset = function () {
            var currentTitleNode = titleRef.current[activeTab];
            if (!currentTitleNode || !isScrollable) {
                return 0;
            }
            var diffStyle = (0, utils_1.getRectDiff)(currentTitleNode, headerWrapperRef.current);
            var currentOffset = getCurrentHeaderOffset({
                direction: direction,
                align: align,
                headerDom: headerRef.current,
                headerWrapperDom: headerWrapperRef.current,
            });
            // 垂直方向的 offset 计算，不分type
            if (direction === 'vertical') {
                var nextOffset_1 = currentOffset;
                var scrollAlign_1 = scrollPosition;
                var topOffset = currentOffset + diffStyle.top;
                var bottomOffset = currentOffset + diffStyle.bottom;
                if (scrollAlign_1 === 'auto') {
                    scrollAlign_1 = diffStyle.top < 0 ? 'start' : diffStyle.bottom > 0 ? 'end' : scrollPosition;
                }
                if (scrollAlign_1 === 'start') {
                    nextOffset_1 = topOffset;
                }
                else if (scrollAlign_1 === 'end') {
                    nextOffset_1 = bottomOffset;
                }
                else if (scrollAlign_1 === 'center') {
                    nextOffset_1 = topOffset - (diffStyle.top - diffStyle.bottom) / 2;
                }
                else if ((0, is_1.isNumber)(scrollAlign_1)) {
                    nextOffset_1 = Math.max(topOffset - scrollAlign_1, bottomOffset);
                }
                return nextOffset_1;
            }
            // 水平方向的 offset 计算，分为 capsule 和其他，因为 capsule 是右对齐
            if (align === 'right') {
                var startOffset_1 = currentOffset - diffStyle.left;
                var endOffset_1 = currentOffset - diffStyle.right;
                var scrollAlign_2 = scrollPosition;
                var nextOffset_2 = currentOffset;
                if (scrollPosition === 'auto') {
                    scrollAlign_2 = diffStyle.left < 0 ? 'start' : diffStyle.right > 0 ? 'end' : scrollPosition;
                }
                if (scrollAlign_2 === 'start') {
                    nextOffset_2 = startOffset_1;
                }
                else if (scrollAlign_2 === 'end') {
                    nextOffset_2 = endOffset_1;
                }
                else if (scrollAlign_2 === 'center') {
                    nextOffset_2 = startOffset_1 + (diffStyle.left - diffStyle.right) / 2;
                }
                else if ((0, is_1.isNumber)(scrollAlign_2)) {
                    nextOffset_2 = Math.min(startOffset_1 + scrollAlign_2, endOffset_1);
                }
                return nextOffset_2;
            }
            var nextOffset = currentOffset;
            var scrollAlign = scrollPosition;
            var startOffset = currentOffset + diffStyle.left;
            var endOffset = currentOffset + diffStyle.right;
            if (scrollPosition === 'auto') {
                scrollAlign = diffStyle.left < 0 ? 'start' : diffStyle.right > 0 ? 'end' : scrollPosition;
            }
            if (scrollAlign === 'start') {
                nextOffset = startOffset;
            }
            else if (scrollAlign === 'end') {
                nextOffset = endOffset;
            }
            else if (scrollAlign === 'center') {
                nextOffset = startOffset - (diffStyle.left - diffStyle.right) / 2;
            }
            else if ((0, is_1.isNumber)(scrollAlign)) {
                nextOffset = Math.max(startOffset - scrollAlign, endOffset);
            }
            return nextOffset;
        };
        (0, utils_1.updateScrollOffset)(headerWrapperRef.current, direction);
        var offset = getActiveTabOffset();
        offset = getValidOffset(offset);
        setHeaderOffset(offset);
    }, [activeTab, direction, overflow, isScrollable, type, getValidOffset, scrollPosition]);
    var headerStyle = getHeaderStyle({
        direction: direction,
        align: align,
        headerOffset: headerOffset,
    });
    var isDropdown = isScrollable && overflow === 'dropdown' && direction !== 'vertical';
    var isScroll = isScrollable && !isDropdown;
    var isEditable = editable && (type === 'card' || type === 'card-gutter' || type === 'line');
    var handleDelete = function (child) {
        mergeProps.onDeleteTab && mergeProps.onDeleteTab(child.key);
        setShouldScroll(scrollConfig.delete);
    };
    var handleAdd = function () {
        onAddTab === null || onAddTab === void 0 ? void 0 : onAddTab();
        setShouldScroll(scrollConfig.add);
    };
    var renderAddIcon = function (isEditable) {
        return (isEditable &&
            showAddButton && (react_1.default.createElement(resizeObserver_1.default, { onResize: onAddBtnResize },
            react_1.default.createElement("div", __assign({ className: prefixCls + "-add-icon", "aria-label": "add tab", tabIndex: 0, role: "button", ref: addBtnRef, onClick: handleAdd }, (0, utils_1.getKeyDownEvent)({ onPressEnter: handleAdd })), addButton || (react_1.default.createElement(icon_hover_1.default, { prefix: prefixCls + "-add" },
                react_1.default.createElement("span", { className: prefixCls + "-add" }, (icons === null || icons === void 0 ? void 0 : icons.add) || react_1.default.createElement(IconPlus_1.default, null))))))));
    };
    (0, useHeaderScroll_1.default)({
        headerWrapperRef: headerWrapperRef,
        headerOffset: headerOffset,
        align: align,
        direction: direction,
        isScrollable: isScrollable,
        onScroll: function (offset) {
            updateHeaderOffset(offset);
        },
    });
    return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-header-nav", prefixCls + "-header-nav-" + direction, prefixCls + "-header-nav-" + tabPosition, prefixCls + "-header-size-" + size, prefixCls + "-header-nav-" + type, className), style: style, ref: ref },
        react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-header-scroll", (_a = {},
                _a[prefixCls + "-header-overflow-scroll"] = isScroll,
                _a[prefixCls + "-header-overflow-dropdown"] = isDropdown,
                _a)), ref: scrollWrapperRef },
            isScroll && (react_1.default.createElement(tab_nav_icon_1.default, { iconPos: "prev", rtl: rtl, icon: icons === null || icons === void 0 ? void 0 : icons.prev, prefixCls: prefixCls, currentOffset: headerOffset, headerSize: headerSize, headerWrapperSize: headerWrapperSize, 
                // getRef={(name) => getCalcArguments()[name]}
                direction: direction, align: align, onChange: updateHeaderOffset })),
            react_1.default.createElement(resizeObserver_1.default, { onResize: onWrapperResize },
                react_1.default.createElement("div", { className: prefixCls + "-header-wrapper", ref: headerWrapperRef },
                    react_1.default.createElement(resizeObserver_1.default, { onResize: onHeaderResize },
                        react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-header", (_b = {},
                                _b[prefixCls + "-header-no-padding"] = !props.headerPadding &&
                                    direction === 'horizontal' &&
                                    ['line', 'text'].indexOf(type) > -1,
                                _b)), ref: headerRef, style: headerStyle },
                            paneChildren.map(function (child, index) { return (react_1.default.createElement(tab_title_1.default, __assign({ key: index, ref: function (node) {
                                    titleRef.current[child.key] = node;
                                }, tabKey: child.key }, child.props, { prefixCls: prefixCls, onDeleteTab: function () { return handleDelete(child); }, renderTitle: props.children || renderTabTitle, onClickTab: function () {
                                    mergeProps.onClickTab && mergeProps.onClickTab(child.key);
                                }, isActive: activeTab === child.key, editable: isEditable && child.props.closable !== false, deleteIcon: icons === null || icons === void 0 ? void 0 : icons.delete, deleteButton: deleteButton, getIdPrefix: ctxProps.getIdPrefix, index: index }))); }),
                            type === 'line' && (react_1.default.createElement(tab_ink_1.default, { disabled: !!paneChildren.find(function (child) {
                                    return child && child.props && child.props.disabled && child.key === activeTab;
                                }), prefixCls: prefixCls, animation: animation, direction: direction, getTitleRef: function (key) { return titleRef.current[key]; }, activeTab: activeTab, getHeaderRef: function () { return headerRef; }, inkBarSize: inkBarSize })))),
                    !isScrollable && renderAddIcon(isEditable))),
            isScroll && (react_1.default.createElement(tab_nav_icon_1.default, { prefixCls: prefixCls, rtl: rtl, iconPos: "next", icon: icons === null || icons === void 0 ? void 0 : icons.next, currentOffset: headerOffset, headerSize: headerSize, headerWrapperSize: headerWrapperSize, direction: direction, align: align, onChange: updateHeaderOffset })),
            isDropdown && (react_1.default.createElement(dropdown_icon_1.default, { onClickTab: mergeProps.onClickTab, paneChildren: paneChildren, prefixCls: prefixCls, currentOffset: headerOffset, headerSize: headerSize, icon: icons === null || icons === void 0 ? void 0 : icons.dropdown, headerWrapperSize: headerWrapperSize, getTitleRef: function (key) { return titleRef.current[key]; }, direction: direction })),
            ((isEditable && isScrollable) || extra) && (react_1.default.createElement(resizeObserver_1.default, { onResize: onExtraResize },
                react_1.default.createElement("div", { className: prefixCls + "-header-extra", ref: extraRef },
                    isScrollable && renderAddIcon(isEditable),
                    extra))))));
});
TabHeader.displayName = 'TabHeader';
exports.default = TabHeader;
