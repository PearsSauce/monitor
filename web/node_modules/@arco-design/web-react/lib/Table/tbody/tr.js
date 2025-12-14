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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var Checkbox_1 = __importDefault(require("../../Checkbox"));
var Radio_1 = __importDefault(require("../../Radio"));
var is_1 = require("../../_util/is");
var utils_1 = require("../utils");
var classNames_1 = __importDefault(require("../../_util/classNames"));
var useComponent_1 = __importDefault(require("../hooks/useComponent"));
var IconPlus_1 = __importDefault(require("../../../icon/react-icon-cjs/IconPlus"));
var IconMinus_1 = __importDefault(require("../../../icon/react-icon-cjs/IconMinus"));
var constant_1 = require("../constant");
var ConfigProvider_1 = require("../../ConfigProvider");
var td_1 = __importDefault(require("./td"));
function Tr(props, ref) {
    var _a;
    var expandedRowRender = props.expandedRowRender, onClickExpandBtn = props.onClickExpandBtn, columns = props.columns, components = props.components, onCheck = props.onCheck, onCheckRadio = props.onCheckRadio, prefixCls = props.prefixCls, selectedRowKeys = props.selectedRowKeys, indeterminateKeys = props.indeterminateKeys, rowClassName = props.rowClassName, onRow = props.onRow, rowSelection = props.rowSelection, _b = props.indentSize, indentSize = _b === void 0 ? 16 : _b, activeSorters = props.activeSorters, virtualized = props.virtualized, stickyOffsets = props.stickyOffsets, stickyClassNames = props.stickyClassNames, getRowKey = props.getRowKey, placeholder = props.placeholder, _c = props.expandProps, expandProps = _c === void 0 ? { strictTreeData: true } : _c, data = props.data, expandedRowKeys = props.expandedRowKeys, childrenColumnName = props.childrenColumnName, record = props.record, index = props.index, type = props.type, shouldRowExpand = props.shouldRowExpand, level = props.level;
    var rtl = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).rtl;
    var originRecord = (0, utils_1.getOriginData)(record);
    var rowProps = __rest((onRow && onRow(originRecord, index)) || {}, []);
    var rowK = getRowKey(record);
    var usedSelectedRowKeys = type === 'radio' ? selectedRowKeys.slice(0, 1) : selectedRowKeys;
    var trKey = rowK || index;
    var checked = usedSelectedRowKeys.indexOf(rowK) > -1;
    var expanded = expandedRowKeys.indexOf(rowK) > -1;
    var indeterminate = indeterminateKeys.indexOf(rowK) > -1;
    var classNameTr = (0, classNames_1.default)(prefixCls + "-tr", (_a = {},
        _a[prefixCls + "-row-checked"] = checked,
        _a[prefixCls + "-row-expanded"] = expanded,
        _a), rowClassName && rowClassName(originRecord, index));
    var checkboxProps = rowSelection && typeof rowSelection.checkboxProps === 'function'
        ? rowSelection.checkboxProps(originRecord)
        : {};
    var operationClassName = (0, classNames_1.default)(prefixCls + "-td", prefixCls + "-operation");
    var getPrefixColClassName = function (name) {
        var _a;
        return (0, classNames_1.default)(operationClassName, prefixCls + "-" + name, (_a = {},
            _a[prefixCls + "-selection-col"] = (virtualized && type === 'checkbox') || type === 'radio',
            _a[prefixCls + "-expand-icon-col"] = virtualized && expandedRowRender,
            _a));
    };
    function isChildrenNotEmpty(record) {
        return expandProps.strictTreeData
            ? (0, is_1.isArray)(record[childrenColumnName]) && record[childrenColumnName].length
            : record[childrenColumnName] !== undefined;
    }
    // tree data
    function isDataHaveChildren() {
        return data.find(function (d) { return isChildrenNotEmpty(d); });
    }
    var shouldRenderExpandRow = shouldRowExpand(record, index);
    var recordHaveChildren = isChildrenNotEmpty(record);
    var haveTreeData = isDataHaveChildren() && !expandedRowRender;
    var shouldRenderTreeDataExpandRow = haveTreeData && recordHaveChildren;
    var expandRowByClick = expandProps.expandRowByClick;
    var rowClickProps = expandRowByClick && (shouldRenderExpandRow || shouldRenderTreeDataExpandRow)
        ? {
            onClick: function (e) {
                onClickExpandBtn(rowK);
                rowProps && rowProps.onClick && rowProps.onClick(e);
            },
        }
        : {};
    var _d = (0, useComponent_1.default)(components), ComponentBodyRow = _d.ComponentBodyRow, ComponentTd = _d.ComponentTd, getBodyComponentOperations = _d.getBodyComponentOperations;
    var InnerComponentBodyRow = virtualized ? 'div' : ComponentBodyRow;
    var InnerComponentTd = virtualized ? 'div' : ComponentTd;
    var baseTrProps = __assign(__assign({ className: classNameTr, key: trKey }, rowProps), rowClickProps);
    var trProps = (0, is_1.isString)(ComponentBodyRow) ? baseTrProps : __assign(__assign({}, baseTrProps), { record: record, index: index });
    function renderExpandIcon(record, rowK) {
        var expandIcon = expandProps.icon;
        var expanded = !!~expandedRowKeys.indexOf(rowK);
        var onClickProps = {
            onClick: function (e) {
                e.stopPropagation();
                onClickExpandBtn(rowK);
            },
        };
        return typeof expandIcon === 'function' ? (expandIcon(__assign({ expanded: expanded, record: record }, onClickProps))) : (react_1.default.createElement("button", __assign({}, onClickProps, { type: "button" }), expanded ? react_1.default.createElement(IconMinus_1.default, null) : react_1.default.createElement(IconPlus_1.default, null)));
    }
    var expandNode = expandedRowRender && (react_1.default.createElement(InnerComponentTd, { className: getPrefixColClassName('expand-icon-cell') }, shouldRenderExpandRow && renderExpandIcon(record, rowK)));
    var renderSelectionCell = rowSelection && rowSelection.renderCell;
    var selectionNode;
    var checkboxNode = (react_1.default.createElement(Checkbox_1.default, __assign({ value: rowK, onChange: function (check) { return onCheck(check, record); }, checked: checked, indeterminate: indeterminate }, checkboxProps)));
    var radioNode = (react_1.default.createElement(Radio_1.default, __assign({ onChange: function () { return onCheckRadio(rowK, record); }, value: rowK, checked: checked }, checkboxProps)));
    if (type === 'checkbox') {
        selectionNode = (react_1.default.createElement(InnerComponentTd, { className: getPrefixColClassName('checkbox') }, renderSelectionCell
            ? renderSelectionCell(checkboxNode, checked, originRecord)
            : checkboxNode));
    }
    if (type === 'radio') {
        selectionNode = (react_1.default.createElement(InnerComponentTd, { className: getPrefixColClassName('radio') }, renderSelectionCell ? renderSelectionCell(radioNode, checked, originRecord) : radioNode));
    }
    var bodyOperations = getBodyComponentOperations({ selectionNode: selectionNode, expandNode: expandNode });
    return (react_1.default.createElement(InnerComponentBodyRow, __assign({}, trProps, { ref: ref }), columns.map(function (col, colIndex) {
        var _a;
        var _b, _c, _d, _e;
        var stickyOffset = stickyOffsets[colIndex];
        var stickyClassName = stickyClassNames[colIndex];
        if (col.$$isOperation) {
            var node = col.node;
            var isExtraOperation = true;
            if (col.title === constant_1.INTERNAL_SELECTION_KEY) {
                node = (_b = bodyOperations.find(function (o) { return o.name === 'selectionNode'; })) === null || _b === void 0 ? void 0 : _b.node;
                isExtraOperation = false;
            }
            if (col.title === constant_1.INTERNAL_EXPAND_KEY) {
                node = (_c = bodyOperations.find(function (o) { return o.name === 'expandNode'; })) === null || _c === void 0 ? void 0 : _c.node;
                isExtraOperation = false;
            }
            var operationNode = typeof node === 'function' ? node(record) : node;
            return react_1.default.cloneElement(operationNode, __assign(__assign({ key: col.key || colIndex }, operationNode.props), { className: (0, classNames_1.default)(isExtraOperation ? operationClassName : '', (_d = operationNode === null || operationNode === void 0 ? void 0 : operationNode.props) === null || _d === void 0 ? void 0 : _d.className, stickyClassName), style: __assign(__assign(__assign({}, (_e = operationNode === null || operationNode === void 0 ? void 0 : operationNode.props) === null || _e === void 0 ? void 0 : _e.style), (col.fixed === 'left'
                    ? (_a = {},
                        _a[rtl ? 'right' : 'left'] = stickyOffset,
                        _a) : {})), { width: col.width, minWidth: col.width }) }));
        }
        return (react_1.default.createElement(td_1.default, { key: colIndex, prefixCls: prefixCls, virtualized: virtualized, components: components, currentSorter: activeSorters.find(function (item) { return item.field === col.key; }), placeholder: placeholder, indentSize: indentSize, stickyClassName: stickyClassName, stickyOffset: stickyOffset, InnerComponentTd: InnerComponentTd, column: col, columnIndex: colIndex, record: record, trIndex: index, level: level, haveTreeData: haveTreeData, recordHaveChildren: recordHaveChildren, rowKey: rowK, renderExpandIcon: renderExpandIcon }));
    })));
}
var ForwardRefTr = (0, react_1.forwardRef)(Tr);
exports.default = ForwardRefTr;
