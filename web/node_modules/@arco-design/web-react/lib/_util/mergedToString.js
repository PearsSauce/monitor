"use strict";
/** merge multiple children to a string node */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var is_1 = require("./is");
var isSingleNode = function (child) {
    return (0, is_1.isString)(child) || (0, is_1.isNumber)(child);
};
function mergedToString(children) {
    var mergedResult = [''];
    react_1.default.Children.forEach(children, function (child) {
        var prevIndex = mergedResult.length - 1;
        var prevChild = mergedResult[prevIndex];
        if (isSingleNode(child) && isSingleNode(prevChild)) {
            mergedResult[prevIndex] = "" + prevChild + child;
        }
        else if (child && child.props && child.props.children) {
            mergedResult.push(mergedToString(child.props.children));
        }
    });
    return mergedResult.join('');
}
exports.default = mergedToString;
