"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ConfigProvider_1 = require("../ConfigProvider");
function CarouselIndicator(props, ref) {
    var _a, _b;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var className = props.className, _c = props.type, type = _c === void 0 ? 'line' : _c, _d = props.count, count = _d === void 0 ? 2 : _d, _e = props.activeIndex, activeIndex = _e === void 0 ? 0 : _e, _f = props.position, position = _f === void 0 ? 'bottom' : _f, _g = props.trigger, trigger = _g === void 0 ? 'click' : _g, onSelectIndex = props.onSelectIndex;
    var prefixCls = getPrefixCls('carousel-indicator');
    var indicatorContent = [];
    if (type === 'slider') {
        var step = 100 / count;
        indicatorContent.push(react_1.default.createElement("span", { key: 0, style: { width: step + "%", left: activeIndex * step + "%" }, className: (0, classNames_1.default)(prefixCls + "-item", prefixCls + "-item-active") }));
    }
    else {
        for (var i = 0; i < count; i++) {
            indicatorContent.push(react_1.default.createElement("span", { key: i, "data-index": i, className: (0, classNames_1.default)(prefixCls + "-item", (_a = {},
                    _a[prefixCls + "-item-active"] = i === activeIndex,
                    _a)) }));
        }
    }
    var wrapperProps = (_b = {
            ref: ref,
            className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + type, prefixCls + "-" + position, className)
        },
        _b[trigger === 'click' ? 'onClick' : 'onMouseMove'] = function (event) {
            event.preventDefault();
            if (type === 'slider') {
                // clear up effect from event bubbling
                if (event.target === event.currentTarget) {
                    var _a = event.currentTarget.getBoundingClientRect(), startX = _a.x, width = _a.width;
                    var offsetX = event.nativeEvent.clientX - startX;
                    var index = ~~((offsetX / width) * count);
                    index !== activeIndex && onSelectIndex(index);
                }
            }
            else {
                var dataIndex = event.target.getAttribute('data-index');
                // Judge if data-index exists at first, event.target can be the wrapper of indicators
                dataIndex && +dataIndex !== activeIndex && onSelectIndex(+dataIndex);
            }
        },
        _b);
    return react_1.default.createElement("div", __assign({}, wrapperProps), indicatorContent);
}
var CarouselIndicatorComponent = react_1.default.forwardRef(CarouselIndicator);
exports.default = CarouselIndicatorComponent;
