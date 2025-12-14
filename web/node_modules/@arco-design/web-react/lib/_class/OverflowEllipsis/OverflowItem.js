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
var resizeObserver_1 = __importDefault(require("../../_util/resizeObserver"));
var ConfigProvider_1 = require("../../ConfigProvider");
var classNames_1 = __importDefault(require("../../_util/classNames"));
function OverflowItem(props) {
    var _a;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('overflow-item');
    var itemRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        props.onResize(itemRef.current);
        return function () {
            props.unregister(itemRef.current);
        };
    }, []);
    var hidden = props.hidden;
    return (react_1.default.createElement(resizeObserver_1.default, { onResize: function (entry) {
            props.onResize(entry === null || entry === void 0 ? void 0 : entry[0].target);
        } },
        react_1.default.createElement("div", { ref: itemRef, className: (0, classNames_1.default)(prefixCls, props.className, (_a = {},
                _a[prefixCls + "-hidden"] = hidden,
                _a)) }, props.children)));
}
exports.default = OverflowItem;
