"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var IconLeft_1 = __importDefault(require("../../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../../icon/react-icon-cjs/IconRight"));
var IconDoubleLeft_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDoubleLeft"));
var IconDoubleRight_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDoubleRight"));
var is_1 = require("../../_util/is");
var classNames_1 = __importDefault(require("../../_util/classNames"));
function PanelHeader(props) {
    var prefixCls = props.prefixCls, changePageShowDate = props.changePageShowDate, headerValueFormat = props.headerValueFormat, mergedPageShowDate = props.mergedPageShowDate, innerMode = props.innerMode, panelOperations = props.panelOperations;
    var isOperationAvailable = function (operation) {
        return (0, is_1.isArray)(panelOperations) ? panelOperations.indexOf(operation) > -1 : true;
    };
    var showDoubleLeft = isOperationAvailable('double-left');
    var showLeft = isOperationAvailable('left') && innerMode !== 'year';
    var showDoubleRight = isOperationAvailable('double-right');
    var showRight = isOperationAvailable('right') && innerMode !== 'year';
    var getIconClassName = function (isShow) {
        var _a;
        return (0, classNames_1.default)(prefixCls + "-header-icon", (_a = {}, _a[prefixCls + "-header-icon-hidden"] = !isShow, _a));
    };
    return (react_1.default.createElement("div", { className: prefixCls + "-header" },
        react_1.default.createElement("div", { className: getIconClassName(showDoubleLeft), onClick: function () { return showDoubleLeft && changePageShowDate('prev', 'year'); } }, showDoubleLeft && react_1.default.createElement(IconDoubleLeft_1.default, null)),
        react_1.default.createElement("div", { className: getIconClassName(showLeft), onClick: function () { return showLeft && changePageShowDate('prev', 'month'); } }, showLeft && react_1.default.createElement(IconLeft_1.default, null)),
        react_1.default.createElement("div", { className: prefixCls + "-header-value" }, mergedPageShowDate.format(headerValueFormat)),
        react_1.default.createElement("div", { className: getIconClassName(showRight), onClick: function () { return showRight && changePageShowDate('next', 'month'); } }, showRight && react_1.default.createElement(IconRight_1.default, null)),
        react_1.default.createElement("div", { className: getIconClassName(showDoubleRight), onClick: function () { return showDoubleRight && changePageShowDate('next', 'year'); } }, showDoubleRight && react_1.default.createElement(IconDoubleRight_1.default, null))));
}
exports.default = PanelHeader;
