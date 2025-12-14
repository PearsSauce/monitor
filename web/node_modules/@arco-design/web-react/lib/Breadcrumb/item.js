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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var pick_1 = require("../_util/pick");
var classNames_1 = __importDefault(require("../_util/classNames"));
var Dropdown_1 = __importDefault(require("../Dropdown"));
var IconDown_1 = __importDefault(require("../../icon/react-icon-cjs/IconDown"));
var omit_1 = __importDefault(require("../_util/omit"));
var is_1 = require("../_util/is");
function Item(props) {
    var _a, _b;
    var children = props.children, style = props.style, className = props.className, prefixCls = props.prefixCls, droplist = props.droplist, dropdownProps = props.dropdownProps, href = props.href, onClick = props.onClick, _c = props.tagName, tagName = _c === void 0 ? 'div' : _c, rest = __rest(props, ["children", "style", "className", "prefixCls", "droplist", "dropdownProps", "href", "onClick", "tagName"]);
    var _d = __read((0, react_1.useState)(false), 2), dropdownVisible = _d[0], setDropdownVisible = _d[1];
    var TagName = (0, is_1.isString)(href) ? 'a' : tagName;
    var dom = (react_1.default.createElement(TagName, __assign({ href: href, onClick: onClick, role: "listitem", style: style, className: (0, classNames_1.default)(prefixCls + "-item", (_a = {},
            _a[prefixCls + "-item-with-dropdown"] = droplist,
            _a), className) }, (0, pick_1.pickDataAttributes)(rest)),
        children,
        droplist && (react_1.default.createElement("span", { "aria-hidden": true, className: (0, classNames_1.default)(prefixCls + "-item-dropdown-icon", (_b = {},
                _b[prefixCls + "-item-dropdown-icon-active"] = dropdownVisible,
                _b)) },
            react_1.default.createElement(IconDown_1.default, null)))));
    return droplist ? (react_1.default.createElement(Dropdown_1.default, __assign({ droplist: droplist, onVisibleChange: function (visible) {
            setDropdownVisible(visible);
            dropdownProps && dropdownProps.onVisibleChange && dropdownProps.onVisibleChange(visible);
        } }, (0, omit_1.default)(dropdownProps, ['onVisibleChange'])), dom)) : (dom);
}
Item.displayName = 'BreadcrumbItem';
exports.default = Item;
