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
var get_1 = __importDefault(require("lodash/get"));
var pick_1 = __importDefault(require("../../_util/pick"));
var is_1 = require("../../_util/is");
var classNames_1 = __importDefault(require("../../_util/classNames"));
var useComponent_1 = __importDefault(require("../hooks/useComponent"));
var utils_1 = require("../utils");
var ConfigProvider_1 = require("../../ConfigProvider");
function isInvalidRenderElement(element) {
    return element && !react_1.default.isValidElement(element) && (0, is_1.isObject)(element);
}
function Td(props) {
    var _a, _b;
    var components = props.components, InnerComponentTd = props.InnerComponentTd, column = props.column, columnIndex = props.columnIndex, prefixCls = props.prefixCls, stickyClassName = props.stickyClassName, stickyOffset = props.stickyOffset, currentSorter = props.currentSorter, virtualized = props.virtualized, record = props.record, trIndex = props.trIndex, level = props.level, placeholder = props.placeholder, indentSize = props.indentSize, renderExpandIcon = props.renderExpandIcon, rowKey = props.rowKey, recordHaveChildren = props.recordHaveChildren, haveTreeData = props.haveTreeData;
    var rtl = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).rtl;
    var ComponentBodyCell = (0, useComponent_1.default)(components).ComponentBodyCell;
    var classNameTd = (0, classNames_1.default)(prefixCls + "-td", stickyClassName, (_a = {},
        _a[prefixCls + "-col-sorted"] = currentSorter && currentSorter.direction && currentSorter.field === column.dataIndex,
        _a), column.className);
    var tdProps = {};
    var rowSpan;
    var colSpan;
    var styleTd = {};
    if (column.fixed === 'left') {
        styleTd[rtl ? 'right' : 'left'] = stickyOffset;
    }
    if (column.fixed === 'right') {
        styleTd[rtl ? 'left' : 'right'] = stickyOffset;
    }
    if ((0, is_1.isObject)(column.cellStyle)) {
        styleTd = __assign(__assign({}, styleTd), column.cellStyle);
    }
    if ((0, is_1.isObject)(column.bodyCellStyle)) {
        styleTd = __assign(__assign({}, styleTd), column.bodyCellStyle);
    }
    if (column.align) {
        styleTd.textAlign = column.align;
    }
    if (virtualized && column.width) {
        styleTd.width = column.width;
        styleTd.minWidth = column.width;
        styleTd.maxWidth = column.width;
    }
    var _c = column.onCell
        ? column.onCell(record, trIndex)
        : { onHandleSave: function () { } }, onHandleSave = _c.onHandleSave, cellProps = __rest(_c, ["onHandleSave"]);
    var renderElement = (0, react_1.useMemo)(function () {
        return column.render && column.render((0, get_1.default)(record, column.dataIndex), (0, utils_1.getOriginData)(record), trIndex);
    }, [record, column, trIndex]);
    if (isInvalidRenderElement(renderElement)) {
        tdProps = renderElement.props;
        rowSpan = tdProps.rowSpan;
        colSpan = tdProps.colSpan;
        renderElement = renderElement.children;
    }
    if (rowSpan === 0 || colSpan === 0) {
        return null;
    }
    var v = (0, get_1.default)(record, column.dataIndex);
    var cellChildren = column.render
        ? renderElement
        : v === undefined || (typeof v === 'string' && v.trim() === '') || v === null
            ? column.placeholder === undefined
                ? placeholder
                : column.placeholder
            : v;
    var titleProps = column.ellipsis && typeof cellChildren === 'string' ? { title: cellChildren } : {};
    var hasInlineExpandIcon = haveTreeData && column.$$isFirstColumn;
    var needRenderExpandIcon = hasInlineExpandIcon && recordHaveChildren;
    var paddingLeft = hasInlineExpandIcon && level > 0 ? indentSize * level : 0;
    if (hasInlineExpandIcon && !recordHaveChildren) {
        // expand icon width and margin-right
        paddingLeft += 16 + 4;
    }
    var content = (react_1.default.createElement(react_1.default.Fragment, null,
        needRenderExpandIcon ? (react_1.default.createElement("span", { className: prefixCls + "-cell-expand-icon" }, renderExpandIcon(record, rowKey))) : null,
        (0, is_1.isString)(ComponentBodyCell) ? (react_1.default.createElement(ComponentBodyCell, { className: prefixCls + "-cell-wrap-value" }, cellChildren)) : (react_1.default.createElement(ComponentBodyCell, __assign({ rowData: (0, utils_1.getOriginData)(record), className: prefixCls + "-cell-wrap-value", column: column, onHandleSave: onHandleSave }, cellProps), cellChildren))));
    return (react_1.default.createElement(InnerComponentTd, __assign({ className: classNameTd, key: column.key || column.dataIndex || columnIndex, style: styleTd }, (0, pick_1.default)(cellProps, [
        'onClick',
        'onDoubleClick',
        'onContextMenu',
        'onMouseOver',
        'onMouseEnter',
        'onMouseLeave',
        'onMouseMove',
        'onMouseDown',
        'onMouseUp',
    ]), tdProps),
        react_1.default.createElement("div", __assign({ className: (0, classNames_1.default)(prefixCls + "-cell", (_b = {},
                _b[prefixCls + "-cell-text-ellipsis"] = column.ellipsis,
                _b)) }, titleProps),
            paddingLeft ? (react_1.default.createElement("span", { className: prefixCls + "-cell-indent", style: { paddingLeft: paddingLeft } })) : null,
            content)));
}
exports.default = (0, react_1.memo)(Td);
