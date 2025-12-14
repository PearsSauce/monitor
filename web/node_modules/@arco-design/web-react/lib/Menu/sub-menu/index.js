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
var inline_1 = __importDefault(require("./inline"));
var pop_1 = __importDefault(require("./pop"));
var context_1 = __importDefault(require("../context"));
function SubMenu(props, ref) {
    var children = props.children, popup = props.popup, level = props.level;
    var _a = (0, react_1.useContext)(context_1.default), mode = _a.mode, collapse = _a.collapse, inDropdown = _a.inDropdown, collectInlineMenuKeys = _a.collectInlineMenuKeys;
    var forcePopup = !!(typeof popup === 'function' ? popup(level) : popup);
    var mergedPopup = forcePopup || collapse || inDropdown || mode !== 'vertical';
    var MergedMenu = mergedPopup ? pop_1.default : inline_1.default;
    (0, react_1.useEffect)(function () {
        collectInlineMenuKeys(props._key);
        return function () {
            collectInlineMenuKeys(props._key, true);
        };
    }, []);
    return (react_1.default.createElement(MergedMenu, __assign({ forwardedRef: ref }, props), children));
}
var ForwardRefSubMenu = (0, react_1.forwardRef)(SubMenu);
var SubMenuComponent = ForwardRefSubMenu;
SubMenuComponent.displayName = 'SubMenu';
SubMenuComponent.menuType = 'SubMenu';
exports.default = SubMenuComponent;
