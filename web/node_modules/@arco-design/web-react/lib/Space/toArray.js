"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_is_1 = require("react-is");
function toArray(children) {
    var childrenList = [];
    react_1.default.Children.forEach(children, function (child) {
        if ((0, react_is_1.isFragment)(child) && child.props) {
            childrenList = childrenList.concat(toArray(child.props.children));
        }
        else if (child !== null && child !== undefined) {
            childrenList.push(child);
        }
    });
    return childrenList;
}
exports.default = toArray;
