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
var IconDown_1 = __importDefault(require("../../../icon/react-icon-cjs/IconDown"));
var Dropdown_1 = __importDefault(require("../../Dropdown"));
var Menu_1 = __importDefault(require("../../Menu"));
var icon_hover_1 = __importDefault(require("../../_class/icon-hover"));
var is_1 = require("../../_util/is");
function DropdownIcon(props) {
    var prefixCls = props.prefixCls, currentOffset = props.currentOffset, headerSize = props.headerSize, headerWrapperSize = props.headerWrapperSize, getTitleRef = props.getTitleRef, paneChildren = props.paneChildren, direction = props.direction, icon = props.icon;
    var paneKeys = paneChildren.map(function (child) { return child.key; });
    var size = direction === 'vertical' ? headerSize.height : headerSize.width;
    var wrapperSize = direction === 'vertical' ? headerWrapperSize.height : headerWrapperSize.width;
    var tabSizes = (0, react_1.useMemo)(function () {
        var map = {};
        var wrapperRect = headerWrapperSize.domRect;
        paneKeys.map(function (key) {
            var titleDom = getTitleRef(key);
            if (!titleDom)
                return;
            var rect = titleDom.getBoundingClientRect();
            map[key] = {
                left: rect.left - wrapperRect.left,
                right: rect.left - wrapperRect.left + rect.width,
                top: rect.top - wrapperRect.top,
                bottom: rect.top - wrapperRect.top + rect.height,
            };
        });
        return map;
    }, [paneKeys.join(','), size, wrapperSize]);
    var rangeIndex = (0, react_1.useMemo)(function () {
        var start = -1;
        var end = -1;
        for (var key in tabSizes) {
            var _a = tabSizes[key], left = _a.left, right = _a.right;
            if (left >= currentOffset && right - currentOffset <= wrapperSize && start === -1) {
                start = paneKeys.indexOf(key);
                end = start;
            }
            if (left >= currentOffset && right - currentOffset > wrapperSize) {
                end = paneKeys.indexOf(key);
                break;
            }
        }
        return [start, end];
    }, [tabSizes, paneKeys.join(','), currentOffset]);
    if ((0, is_1.isNull)(icon)) {
        return null;
    }
    return (react_1.default.createElement(Dropdown_1.default, { trigger: "click", droplist: react_1.default.createElement(Menu_1.default, { onClickMenuItem: props.onClickTab }, paneChildren.map(function (child, index) {
            if (index < rangeIndex[0] || index >= rangeIndex[1]) {
                return (react_1.default.createElement(Menu_1.default.Item, { key: child.key, disabled: child.disabled }, child.props.title));
            }
        })) },
        react_1.default.createElement(icon_hover_1.default, { role: "button", "aria-label": "expand tabs", prefix: prefixCls + "-dropdown", className: prefixCls + "-dropdown-icon" }, icon || react_1.default.createElement(IconDown_1.default, null))));
}
exports.default = DropdownIcon;
