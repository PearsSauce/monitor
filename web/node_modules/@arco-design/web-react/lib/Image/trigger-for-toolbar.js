"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerForToolbar = void 0;
var react_1 = __importDefault(require("react"));
var Trigger_1 = __importDefault(require("../Trigger"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var TriggerForToolbar = function (props) {
    var style = props.style, className = props.className, prefixCls = props.prefixCls, popup = props.popup, children = props.children;
    var classNames = (0, classNames_1.default)(prefixCls + "-trigger", className);
    return (react_1.default.createElement(Trigger_1.default, { style: style, className: classNames, popup: popup, showArrow: true }, children));
};
exports.TriggerForToolbar = TriggerForToolbar;
