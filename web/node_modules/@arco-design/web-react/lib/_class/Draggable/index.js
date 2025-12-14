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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ConfigProvider_1 = require("../../ConfigProvider");
var classNames_1 = __importDefault(require("../../_util/classNames"));
var item_1 = __importDefault(require("./item"));
function Draggable(props) {
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('draggable');
    var className = props.className, children = props.children, _a = props.direction, direction = _a === void 0 ? 'vertical' : _a, onIndexChange = props.onIndexChange, itemWrapperStyle = props.itemWrapperStyle;
    var _b = __read((0, react_1.useState)(null), 2), dragItemIndex = _b[0], setDragItemIndex = _b[1];
    return (react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls, className) }, react_1.default.Children.map(children, function (child, index) {
        return (react_1.default.createElement(item_1.default, { style: itemWrapperStyle, prefixCls: prefixCls, direction: direction, onDragStart: function () { return setDragItemIndex(index); }, onDragEnd: function () { return setDragItemIndex(null); }, onDrop: function (_, dropPosition) {
                var prevIndex = dragItemIndex;
                var nextIndex = dropPosition === 'left' || dropPosition === 'top' ? index : index + 1;
                if (onIndexChange && prevIndex !== nextIndex) {
                    onIndexChange(nextIndex, prevIndex);
                }
            } }, child));
    })));
}
exports.default = Draggable;
