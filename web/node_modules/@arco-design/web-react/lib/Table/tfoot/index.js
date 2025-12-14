"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var context_1 = require("../summary/context");
var utils_1 = require("../utils");
function Tfoot(props) {
    var summary = props.summary, data = props.data, prefixCls = props.prefixCls, columns = props.columns, stickyOffsets = props.stickyOffsets, stickyClassNames = props.stickyClassNames;
    return (react_1.default.createElement("tfoot", { className: prefixCls + "-tfoot" },
        react_1.default.createElement(context_1.SummaryContext.Provider, { value: { columns: columns, stickyOffsets: stickyOffsets, stickyClassNames: stickyClassNames, prefixCls: prefixCls } }, summary((0, utils_1.getOriginData)(data)))));
}
exports.default = Tfoot;
