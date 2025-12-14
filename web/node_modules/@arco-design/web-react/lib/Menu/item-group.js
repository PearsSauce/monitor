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
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var util_1 = require("./util");
var context_1 = __importDefault(require("./context"));
var indent_1 = __importDefault(require("./indent"));
function ItemGroup(props, ref) {
    var children = props.children, title = props.title, level = props.level, className = props.className, style = props.style;
    var _a = (0, react_1.useContext)(context_1.default), prefixCls = _a.prefixCls, levelIndent = _a.levelIndent;
    var childrenLevel = level === 1 ? level + 1 : level;
    var childrenList = (0, util_1.processChildren)(children, { level: childrenLevel });
    return (react_1.default.createElement("div", { ref: ref, className: (0, classNames_1.default)(prefixCls + "-group", className), style: style },
        react_1.default.createElement("div", { className: prefixCls + "-group-title" },
            react_1.default.createElement(indent_1.default, { level: level, prefixCls: prefixCls, levelIndent: levelIndent }),
            react_1.default.createElement("span", null, title)),
        childrenList));
}
var ForwardRefItemGroup = (0, react_1.forwardRef)(ItemGroup);
var ItemGroupComponent = ForwardRefItemGroup;
ItemGroupComponent.displayName = 'MenuItemGroup';
ItemGroupComponent.menuType = 'MenuGroup';
exports.default = ItemGroupComponent;
