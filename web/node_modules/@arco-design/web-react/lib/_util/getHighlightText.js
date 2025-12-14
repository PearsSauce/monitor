"use strict";
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
var escapeRegExp_1 = __importDefault(require("lodash/escapeRegExp"));
var react_1 = __importStar(require("react"));
var is_1 = require("./is");
function getHighlightText(_a) {
    var nodeList = _a.nodeList, pattern = _a.pattern, highlightClassName = _a.highlightClassName;
    if (!pattern) {
        return nodeList;
    }
    var transformNode = function (node) {
        if (node && node.props && typeof node.props.children === 'string') {
            return (0, react_1.cloneElement)(node, undefined, react_1.default.createElement(HighlightText, { text: node.props.children, keyword: pattern, highlightClassName: highlightClassName }));
        }
        return node;
    };
    return (0, is_1.isArray)(nodeList) ? nodeList.map(function (node) { return transformNode(node); }) : transformNode(nodeList);
}
exports.default = getHighlightText;
function HighlightText(_a) {
    var text = _a.text, keyword = _a.keyword, highlightClassName = _a.highlightClassName;
    if (!keyword)
        return react_1.default.createElement(react_1.default.Fragment, null, text);
    // limit keyword length to avoid Regular expression too large error
    if (keyword.length > 1000) {
        keyword = keyword.slice(0, 1000);
    }
    // 注意这里的括号，这里使用了带capture group功能的正则，来split字符串
    // 从而在strArr中可以保留匹配文本
    var re = new RegExp("(" + (0, escapeRegExp_1.default)(keyword) + ")", 'i');
    var strArr = text.split(re);
    return (react_1.default.createElement(react_1.default.Fragment, null, strArr.map(function (item, index) {
        return re.test(item) ? (react_1.default.createElement("span", { key: index, className: highlightClassName }, item)) : (react_1.default.createElement("span", { key: index }, item));
    })));
}
