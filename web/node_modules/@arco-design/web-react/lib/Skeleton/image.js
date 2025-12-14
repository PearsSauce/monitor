"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
function image(props) {
    var _a;
    var style = props.style, _b = props.shape, shape = _b === void 0 ? 'square' : _b, size = props.size, _c = props.position, position = _c === void 0 ? 'left' : _c, className = props.className, prefixCls = props.prefixCls;
    var classNames = (0, classNames_1.default)(prefixCls + "-image", (_a = {},
        _a[prefixCls + "-image-" + position] = position,
        _a[prefixCls + "-image-" + shape] = shape,
        _a[prefixCls + "-image-" + size] = size,
        _a), className);
    return react_1.default.createElement("div", { className: classNames, style: style });
}
exports.default = image;
