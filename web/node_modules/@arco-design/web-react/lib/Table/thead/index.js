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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var Checkbox_1 = __importDefault(require("../../Checkbox"));
var column_1 = __importDefault(require("./column"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var useComponent_1 = __importDefault(require("../hooks/useComponent"));
var constant_1 = require("../constant");
var ConfigProvider_1 = require("../../ConfigProvider");
function THead(props) {
    var activeSorters = props.activeSorters, expandedRowRender = props.expandedRowRender, _a = props.expandProps, expandProps = _a === void 0 ? {} : _a, onSort = props.onSort, onHandleFilter = props.onHandleFilter, onHandleFilterReset = props.onHandleFilterReset, onHeaderRow = props.onHeaderRow, prefixCls = props.prefixCls, currentFilters = props.currentFilters, components = props.components, data = props.data, selectedRowKeys = props.selectedRowKeys, rowSelection = props.rowSelection, _b = props.allSelectedRowKeys, allSelectedRowKeys = _b === void 0 ? [] : _b, groupColumns = props.groupColumns, stickyOffsets = props.stickyOffsets, groupStickyClassNames = props.groupStickyClassNames, showSorterTooltip = props.showSorterTooltip;
    var rtl = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).rtl;
    var _c = (0, useComponent_1.default)(components), ComponentThead = _c.ComponentThead, ComponentHeaderRow = _c.ComponentHeaderRow, getHeaderComponentOperations = _c.getHeaderComponentOperations;
    var _checkbox = rowSelection && (rowSelection.type === 'checkbox' || !('type' in rowSelection));
    var _checkAll = rowSelection && 'checkAll' in rowSelection ? rowSelection.checkAll : true;
    var isRadio = rowSelection && rowSelection.type === 'radio';
    var expandColumnTitle = expandProps.columnTitle;
    var currentSelectedRowKeys = (0, react_1.useMemo)(function () {
        var tempSet = new Set(allSelectedRowKeys);
        return selectedRowKeys.filter(function (v) { return tempSet.has(v); });
    }, [selectedRowKeys, allSelectedRowKeys]);
    var selectionRowSpanProps = groupColumns.length > 1 ? { rowSpan: groupColumns.length } : {};
    var operationClassName = (0, classNames_1.default)(prefixCls + "-th", prefixCls + "-operation");
    return (react_1.default.createElement(ComponentThead, null, groupColumns.map(function (row, index) {
        var headerRowProps = onHeaderRow && onHeaderRow(row, index);
        var selectionNode = (_checkbox || isRadio) && index === 0 && (react_1.default.createElement("th", { className: (0, classNames_1.default)(operationClassName, prefixCls + "-" + (isRadio ? 'radio' : 'checkbox')) },
            react_1.default.createElement("div", { className: prefixCls + "-th-item" },
                _checkAll && !isRadio ? (react_1.default.createElement(Checkbox_1.default, { indeterminate: data &&
                        currentSelectedRowKeys.length > 0 &&
                        currentSelectedRowKeys.length !== allSelectedRowKeys.length, checked: data &&
                        currentSelectedRowKeys.length !== 0 &&
                        currentSelectedRowKeys.length === allSelectedRowKeys.length, disabled: !allSelectedRowKeys.length, onChange: props.onCheckAll })) : null,
                rowSelection && rowSelection.columnTitle)));
        var expandNode = expandedRowRender && (react_1.default.createElement("th", { className: (0, classNames_1.default)(operationClassName, prefixCls + "-expand") }, expandColumnTitle && react_1.default.createElement("div", { className: prefixCls + "-th-item" }, expandColumnTitle)));
        var stickyClassNames = groupStickyClassNames[index];
        var headerOperations = getHeaderComponentOperations({ selectionNode: selectionNode, expandNode: expandNode });
        return (react_1.default.createElement(ComponentHeaderRow, __assign({}, headerRowProps, { key: index, className: prefixCls + "-tr" }), row.map(function (column, colIndex) {
            var _a;
            var _b, _c, _d, _e;
            var columnIndex = column.$$columnIndex;
            var stickyOffset = 0;
            if (Array.isArray(columnIndex) && columnIndex.length === 2) {
                stickyOffset =
                    column.fixed === 'right'
                        ? stickyOffsets[columnIndex[1]]
                        : stickyOffsets[columnIndex[0]];
            }
            else if (typeof columnIndex === 'number') {
                stickyOffset = stickyOffsets[columnIndex] || 0;
            }
            var stickyClassName = stickyClassNames[colIndex];
            if (column.$$isOperation) {
                var node = column.node;
                var isExtraOperation = true;
                if (column.title === constant_1.INTERNAL_SELECTION_KEY) {
                    node = (_b = headerOperations.find(function (o) { return o.name === 'selectionNode'; })) === null || _b === void 0 ? void 0 : _b.node;
                    isExtraOperation = false;
                }
                if (column.title === constant_1.INTERNAL_EXPAND_KEY) {
                    node = (_c = headerOperations.find(function (o) { return o.name === 'expandNode'; })) === null || _c === void 0 ? void 0 : _c.node;
                    isExtraOperation = false;
                }
                var operationNode = node;
                return react_1.default.cloneElement(operationNode, __assign(__assign(__assign({ key: column.key || colIndex }, operationNode.props), selectionRowSpanProps), { className: (0, classNames_1.default)(isExtraOperation ? operationClassName : '', (_d = operationNode === null || operationNode === void 0 ? void 0 : operationNode.props) === null || _d === void 0 ? void 0 : _d.className, stickyClassName), style: __assign(__assign(__assign({}, (_e = operationNode === null || operationNode === void 0 ? void 0 : operationNode.props) === null || _e === void 0 ? void 0 : _e.style), (column.fixed === 'left'
                        ? (_a = {},
                            _a[rtl ? 'right' : 'left'] = stickyOffset,
                            _a) : {})), { width: column.width, minWidth: column.width }) }));
            }
            var headerCellProps = column.onHeaderCell && column.onHeaderCell(column, colIndex);
            var columnClassName = (0, classNames_1.default)(stickyClassName, column.className);
            var columnFixedStyle = {};
            if (column.fixed === 'left') {
                columnFixedStyle[rtl ? 'right' : 'left'] = stickyOffset;
            }
            if (column.fixed === 'right') {
                columnFixedStyle[rtl ? 'left' : 'right'] = stickyOffset;
            }
            return (react_1.default.createElement(column_1.default, __assign({ key: column.key, index: colIndex, onSort: onSort, onHandleFilter: onHandleFilter, onHandleFilterReset: onHandleFilterReset, currentSorter: activeSorters.find(function (item) { return item.field === column.key; }), currentFilters: currentFilters, _key: column.key || column.dataIndex || colIndex }, column, { column: column, headerCellProps: headerCellProps, prefixCls: prefixCls, components: components, className: columnClassName, columnFixedStyle: columnFixedStyle, showSorterTooltip: showSorterTooltip })));
        })));
    })));
}
exports.default = THead;
