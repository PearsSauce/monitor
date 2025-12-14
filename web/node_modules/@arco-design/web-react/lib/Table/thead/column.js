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
var classNames_1 = __importDefault(require("../../_util/classNames"));
var is_1 = require("../../_util/is");
var Trigger_1 = __importDefault(require("../../Trigger"));
var radio_1 = __importDefault(require("../../Radio/radio"));
var Button_1 = __importDefault(require("../../Button"));
var Tooltip_1 = __importDefault(require("../../Tooltip"));
var IconCaretDown_1 = __importDefault(require("../../../icon/react-icon-cjs/IconCaretDown"));
var IconCaretUp_1 = __importDefault(require("../../../icon/react-icon-cjs/IconCaretUp"));
var IconFilter_1 = __importDefault(require("../../../icon/react-icon-cjs/IconFilter"));
var Checkbox_1 = __importDefault(require("../../Checkbox"));
var Space_1 = __importDefault(require("../../Space"));
var ConfigProvider_1 = require("../../ConfigProvider");
var useComponent_1 = __importDefault(require("../hooks/useComponent"));
var useMergeValue_1 = __importDefault(require("../../_util/hooks/useMergeValue"));
function getTooltipContent(nextSorterDirection, locale) {
    if (nextSorterDirection === 'ascend') {
        return locale.Table.sortAscend;
    }
    if (nextSorterDirection === 'descend') {
        return locale.Table.sortDescend;
    }
    return locale.Table.cancelSort;
}
var triggerPopupAlign = { bottom: 0 };
function Column(_a) {
    var _b, _c, _d, _e;
    var onSort = _a.onSort, onFilter = _a.onFilter, onHandleFilter = _a.onHandleFilter, onHandleFilterReset = _a.onHandleFilterReset, _f = _a.currentFilters, currentFilters = _f === void 0 ? {} : _f, currentSorter = _a.currentSorter, _key = _a._key, dataIndex = _a.dataIndex, title = _a.title, sorter = _a.sorter, _g = _a.sortDirections, sortDirections = _g === void 0 ? ['ascend', 'descend'] : _g, _h = _a.filters, filters = _h === void 0 ? [] : _h, columnFixedStyle = _a.columnFixedStyle, className = _a.className, cellStyle = _a.cellStyle, headerCellStyle = _a.headerCellStyle, rowSpan = _a.rowSpan, colSpan = _a.colSpan, headerCellProps = _a.headerCellProps, prefixCls = _a.prefixCls, _j = _a.align, align = _j === void 0 ? 'left' : _j, components = _a.components, filterIcon = _a.filterIcon, filterDropdown = _a.filterDropdown, _k = _a.filterMultiple, filterMultiple = _k === void 0 ? true : _k, ellipsis = _a.ellipsis, filterDropdownProps = _a.filterDropdownProps, onFilterDropdownVisibleChange = _a.onFilterDropdownVisibleChange, column = _a.column, showSorterTooltip = _a.showSorterTooltip, index = _a.index;
    var _l = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), locale = _l.locale, rtl = _l.rtl;
    // const innerDataIndex = dataIndex === undefined ? index : dataIndex;
    var innerDataIndex = _key || dataIndex || index;
    // stateCurrentFilter 标记了下拉框中选中的 filter 项目，在受控模式下它与 currentFilter 可以不同
    var _m = __read((0, useMergeValue_1.default)([], {
        value: currentFilters[innerDataIndex] || [],
    }), 3), currentFilter = _m[0], setCurrentFilter = _m[1], stateCurrentFilter = _m[2];
    var _o = __read((0, react_1.useState)(false), 2), filterVisible = _o[0], setFilterVisible = _o[1];
    var _p = __read((0, react_1.useState)(false), 2), isEnter = _p[0], setEnter = _p[1];
    var enableSort = sorter && (0, is_1.isArray)(sortDirections) && sortDirections.length;
    var nextSortDirection = enableSort ? getNextSortDirection() : undefined;
    (0, react_1.useEffect)(function () {
        setCurrentFilter(currentFilters[innerDataIndex] || []);
    }, [currentFilters, innerDataIndex]);
    (0, react_1.useEffect)(function () {
        if (currentFilter && currentFilter !== stateCurrentFilter) {
            setCurrentFilter(currentFilter);
        }
    }, [filterVisible]);
    function getNextSortDirection() {
        var currentSortDirection = currentSorter && currentSorter.direction;
        if (!currentSortDirection || (currentSorter && currentSorter.field !== innerDataIndex)) {
            return sortDirections[0];
        }
        var sorterIndex = sortDirections.indexOf(currentSortDirection);
        if (sorterIndex < sortDirections.length) {
            return sortDirections[sorterIndex + 1];
        }
    }
    function handleFilter() {
        if (!currentFilter)
            return;
        onHandleFilter &&
            onHandleFilter({ onFilter: onFilter, filters: filters, dataIndex: innerDataIndex }, stateCurrentFilter);
        onVisibleChange(false);
    }
    function handleFilterReset() {
        onHandleFilterReset({ dataIndex: innerDataIndex });
        onVisibleChange(false);
    }
    function onVisibleChange(filterVisible) {
        setFilterVisible(filterVisible);
        onFilterDropdownVisibleChange && onFilterDropdownVisibleChange(filterVisible);
    }
    function onChangeFilterItem(filterValue, checked) {
        var filter = __spreadArray([], __read(stateCurrentFilter), false);
        if (filterMultiple) {
            if (checked) {
                filter = filter.concat(filterValue);
            }
            else {
                filter.splice(filter.findIndex(function (value) { return value === filterValue; }), 1);
            }
        }
        else if (filter.length > 0) {
            if (filter[0] !== filterValue) {
                filter = [filterValue];
            }
            else {
                return;
            }
        }
        else {
            filter = [filterValue];
        }
        setCurrentFilter(filter);
    }
    // filterDropdown confirm
    function confirm(_filterKeys) {
        setCurrentFilter(_filterKeys || stateCurrentFilter);
        setFilterVisible(false);
        onHandleFilter &&
            onHandleFilter({ filters: filters, onFilter: onFilter, dataIndex: innerDataIndex }, _filterKeys || stateCurrentFilter);
    }
    function renderFilters() {
        return typeof filterDropdown === 'function' ? (filterDropdown({
            filterKeys: stateCurrentFilter,
            setFilterKeys: function (filterKeys, callback) {
                setCurrentFilter(filterKeys);
                callback === null || callback === void 0 ? void 0 : callback();
            },
            confirm: confirm,
        })) : (react_1.default.createElement("div", { className: prefixCls + "-filters-popup" },
            react_1.default.createElement("div", { className: prefixCls + "-filters-list" }, filters.map(function (col) {
                var checked = stateCurrentFilter.findIndex(function (value) { return value === col.value; }) !== -1;
                return (react_1.default.createElement("div", { className: prefixCls + "-filters-item", key: col.value }, filterMultiple ? (react_1.default.createElement(Checkbox_1.default, { checked: checked, onChange: function (checked) { return onChangeFilterItem(col.value, checked); } }, col.text)) : (react_1.default.createElement(radio_1.default, { checked: checked, onChange: function (checked) { return onChangeFilterItem(col.value, checked); } }, col.text))));
            })),
            react_1.default.createElement(Space_1.default, { className: prefixCls + "-filters-btn" },
                react_1.default.createElement(Button_1.default, { onClick: handleFilterReset, size: "mini" }, locale.Table.resetText),
                react_1.default.createElement(Button_1.default, { onClick: handleFilter, type: "primary", size: "mini" }, locale.Table.okText))));
    }
    var classNameSorter = function (direction) {
        var _a;
        return (0, classNames_1.default)(prefixCls + "-sorter-icon", (_a = {},
            _a[prefixCls + "-sorter-icon-active"] = currentSorter &&
                currentSorter.direction === direction &&
                currentSorter.field === innerDataIndex,
            _a));
    };
    var classNameFilter = (0, classNames_1.default)(prefixCls + "-filters", (_b = {},
        _b[prefixCls + "-filters-open"] = filterVisible,
        _b[prefixCls + "-filters-active"] = currentFilter && currentFilter.length,
        _b));
    var styleTh = __assign({}, columnFixedStyle);
    if ((0, is_1.isObject)(cellStyle)) {
        styleTh = __assign(__assign({}, styleTh), cellStyle);
    }
    if ((0, is_1.isObject)(headerCellStyle)) {
        styleTh = __assign(__assign({}, styleTh), headerCellStyle);
    }
    if (align && align !== 'left') {
        styleTh.textAlign = align;
    }
    var thProps = {
        style: styleTh,
        key: _key || innerDataIndex,
    };
    if (colSpan && colSpan > 1) {
        thProps.colSpan = colSpan;
    }
    if (rowSpan && rowSpan > 1) {
        thProps.rowSpan = rowSpan;
    }
    var _q = (0, useComponent_1.default)(components), ComponentTh = _q.ComponentTh, ComponentHeaderCell = _q.ComponentHeaderCell;
    var shouldRenderFilters = ((0, is_1.isArray)(filters) && filters.length > 0) || typeof filterDropdown === 'function';
    var titleProps = ellipsis && typeof title === 'string' ? { title: title } : {};
    var filterDropdownTriggerProps = filterDropdownProps && filterDropdownProps.triggerProps;
    var cellChildren = (react_1.default.createElement(react_1.default.Fragment, null,
        enableSort ? (react_1.default.createElement(Tooltip_1.default, __assign({ content: getTooltipContent(nextSortDirection, locale), disabled: !showSorterTooltip }, ((0, is_1.isObject)(showSorterTooltip) ? showSorterTooltip : {})),
            react_1.default.createElement("div", { className: prefixCls + "-cell-with-sorter", onMouseEnter: function () {
                    setEnter(true);
                }, onMouseLeave: function () {
                    setEnter(false);
                }, onClick: function () { return onSort(nextSortDirection, innerDataIndex); } },
                react_1.default.createElement("span", __assign({ className: prefixCls + "-th-item-title" }, titleProps), title),
                enableSort && (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-sorter", (_c = {},
                        _c[prefixCls + "-sorter-direction-one"] = sortDirections.length === 1,
                        _c)) },
                    sortDirections.indexOf('ascend') !== -1 && (react_1.default.createElement("div", { className: classNameSorter('ascend') },
                        react_1.default.createElement(IconCaretUp_1.default, null))),
                    sortDirections.indexOf('descend') !== -1 && (react_1.default.createElement("div", { className: classNameSorter('descend') },
                        react_1.default.createElement(IconCaretDown_1.default, null)))))))) : (react_1.default.createElement("span", __assign({ className: prefixCls + "-th-item-title" }, titleProps), title)),
        shouldRenderFilters && (react_1.default.createElement(Trigger_1.default, __assign({ popup: renderFilters, trigger: "click", classNames: "slideDynamicOrigin", position: rtl ? 'bl' : 'br', popupAlign: triggerPopupAlign, popupVisible: filterVisible, onVisibleChange: onVisibleChange }, filterDropdownTriggerProps),
            react_1.default.createElement("div", { className: classNameFilter }, filterIcon || react_1.default.createElement(IconFilter_1.default, null))))));
    var cellChildrenClassName = (0, classNames_1.default)(prefixCls + "-th-item", (_d = {},
        _d[prefixCls + "-cell-text-ellipsis"] = ellipsis,
        _d[prefixCls + "-cell-mouseenter"] = isEnter,
        _d[prefixCls + "-cell-next-" + nextSortDirection] = isEnter && nextSortDirection,
        _d[prefixCls + "-col-has-sorter"] = enableSort,
        _d[prefixCls + "-col-has-filter"] = shouldRenderFilters,
        _d));
    return (colSpan !== 0 && (react_1.default.createElement(ComponentTh, __assign({ className: (0, classNames_1.default)(prefixCls + "-th", (_e = {},
            _e[prefixCls + "-col-sorted"] = currentSorter && currentSorter.direction && currentSorter.field === innerDataIndex,
            _e), className) }, thProps, headerCellProps), (0, is_1.isString)(ComponentHeaderCell) ? (react_1.default.createElement(ComponentHeaderCell, { className: cellChildrenClassName }, cellChildren)) : (react_1.default.createElement(ComponentHeaderCell, { className: cellChildrenClassName, column: column }, cellChildren)))));
}
exports.default = Column;
