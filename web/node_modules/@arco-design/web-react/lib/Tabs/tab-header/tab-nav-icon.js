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
var IconLeft_1 = __importDefault(require("../../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../../icon/react-icon-cjs/IconRight"));
var IconUp_1 = __importDefault(require("../../../icon/react-icon-cjs/IconUp"));
var IconDown_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDown"));
var icon_hover_1 = __importDefault(require("../../_class/icon-hover"));
var classNames_1 = __importDefault(require("../../_util/classNames"));
var is_1 = require("../../_util/is");
var horizontalMap = {
    prev: 'left',
    next: 'right',
};
var vertialMap = { prev: 'up', next: 'down' };
var TabNavIcon = function (props) {
    var _a;
    var direction = props.direction, headerSize = props.headerSize, headerWrapperSize = props.headerWrapperSize, prefixCls = props.prefixCls, iconPos = props.iconPos, curOffset = props.currentOffset, align = props.align, rtl = props.rtl, icon = props.icon;
    var wrapHeight = headerWrapperSize.height, wrapWidth = headerWrapperSize.width;
    var headerHeight = headerSize.height, headerWidth = headerSize.width;
    var maxHeightOffset = headerHeight - wrapHeight;
    var maxWidthOffset = headerWidth - wrapWidth;
    var defaultIcon = {
        up: react_1.default.createElement(IconUp_1.default, null),
        down: react_1.default.createElement(IconDown_1.default, null),
        left: rtl ? react_1.default.createElement(IconRight_1.default, null) : react_1.default.createElement(IconLeft_1.default, null),
        right: rtl ? react_1.default.createElement(IconLeft_1.default, null) : react_1.default.createElement(IconRight_1.default, null),
    };
    var onChange = function (offset) {
        if (offset !== props.currentOffset) {
            props.onChange && props.onChange(offset);
        }
    };
    var handleHozClick = function (e, pos) {
        e.preventDefault();
        var nextOffset;
        if (align === 'left') {
            nextOffset = pos === 'left' ? curOffset - wrapWidth : curOffset + wrapWidth;
        }
        else {
            nextOffset = pos === 'left' ? curOffset + wrapWidth : curOffset - wrapWidth;
        }
        onChange(nextOffset);
    };
    var handleVerticalClick = function (e, pos) {
        e.preventDefault();
        var nextOffset;
        if (pos === 'up') {
            nextOffset = curOffset - wrapHeight;
        }
        else {
            nextOffset = curOffset + wrapHeight;
            if (nextOffset >= headerHeight)
                return;
        }
        onChange(nextOffset);
    };
    var disabledPrev = (0, react_1.useMemo)(function () {
        if (align === 'left') {
            return curOffset <= 0;
        }
        return direction === 'vertical' ? curOffset >= maxHeightOffset : curOffset >= maxWidthOffset;
    }, [align, direction, curOffset, maxWidthOffset, curOffset]);
    var disabledNext = (0, react_1.useMemo)(function () {
        if (align === 'left') {
            return direction === 'vertical' ? curOffset >= maxHeightOffset : curOffset >= maxWidthOffset;
        }
        return curOffset <= 0;
    }, [align, direction, maxHeightOffset, maxWidthOffset, curOffset]);
    if ((0, is_1.isNull)(icon)) {
        return null;
    }
    var iconDirection = direction === 'horizontal' ? horizontalMap[iconPos] : vertialMap[iconPos];
    var disabled = iconPos === 'prev' ? disabledPrev : disabledNext;
    var className = (0, classNames_1.default)(prefixCls + "-" + iconDirection + "-icon", (_a = {},
        _a[prefixCls + "-nav-icon-disabled"] = disabled,
        _a));
    var handleClick = direction === 'vertical' ? handleVerticalClick : handleHozClick;
    return (react_1.default.createElement(icon_hover_1.default, { disabled: disabled, className: className, prefix: prefixCls, onClick: function (e) { return handleClick(e, iconDirection); } }, icon || defaultIcon[iconDirection]));
};
exports.default = TabNavIcon;
