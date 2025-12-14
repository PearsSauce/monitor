"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var merge_1 = __importDefault(require("lodash/merge"));
var is_1 = require("../../_util/is");
var defaultComponents = {
    table: 'table',
    header: {
        operations: function (_a) {
            var selectionNode = _a.selectionNode, expandNode = _a.expandNode;
            return [
                {
                    name: 'expandNode',
                    node: expandNode,
                },
                {
                    name: 'selectionNode',
                    node: selectionNode,
                },
            ];
        },
        wrapper: 'div',
        thead: 'thead',
        row: 'tr',
        th: 'th',
        cell: 'div',
    },
    body: {
        operations: function (_a) {
            var selectionNode = _a.selectionNode, expandNode = _a.expandNode;
            return [
                {
                    name: 'expandNode',
                    node: expandNode,
                },
                {
                    name: 'selectionNode',
                    node: selectionNode,
                },
            ];
        },
        wrapper: 'div',
        tbody: 'tbody',
        row: 'tr',
        td: 'td',
        cell: 'span',
    },
};
function useComponent(components) {
    var _components = (0, react_1.useMemo)(function () { return ((0, is_1.isObject)(components) ? (0, merge_1.default)({}, defaultComponents, components) : defaultComponents); }, [components]);
    return {
        getHeaderComponentOperations: _components.header.operations,
        getBodyComponentOperations: _components.body.operations,
        ComponentTable: _components.table,
        ComponentHeaderWrapper: _components.header.wrapper,
        ComponentThead: _components.header.thead,
        ComponentHeaderRow: _components.header.row,
        ComponentTh: _components.header.th,
        ComponentHeaderCell: _components.header.cell,
        ComponentBodyWrapper: _components.body.wrapper,
        ComponentTbody: _components.body.tbody,
        ComponentBodyRow: _components.body.row,
        ComponentTd: _components.body.td,
        ComponentBodyCell: _components.body.cell,
    };
}
exports.default = useComponent;
