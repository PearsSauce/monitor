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
var Button_1 = __importDefault(require("../Button"));
var index_1 = __importDefault(require("./index"));
var IconMore_1 = __importDefault(require("../../icon/react-icon-cjs/IconMore"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var pick_1 = require("../_util/pick");
var defaultProps = {
    position: 'br',
    trigger: 'hover',
    type: 'default',
    icon: react_1.default.createElement(IconMore_1.default, null),
    unmountOnExit: true,
};
function Button(baseProps, ref) {
    var _a;
    var componentConfig = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).componentConfig;
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig['Dropdown.Button']);
    var className = props.className, style = props.style, children = props.children, disabled = props.disabled, _b = props.position, position = _b === void 0 ? 'br' : _b, _c = props.type, type = _c === void 0 ? 'default' : _c, size = props.size, _d = props.icon, icon = _d === void 0 ? react_1.default.createElement(IconMore_1.default, null) : _d, onClick = props.onClick, buttonProps = props.buttonProps, buttonsRender = props.buttonsRender, dropdownRestProps = __rest(props, ["className", "style", "children", "disabled", "position", "type", "size", "icon", "onClick", "buttonProps", "buttonsRender"]);
    var leftButton = (react_1.default.createElement(Button_1.default, __assign({ disabled: disabled, type: type, size: size, onClick: onClick }, buttonProps), children));
    var rightButton = (react_1.default.createElement(Button_1.default, { disabled: disabled, type: type, size: size, icon: icon }));
    if (buttonsRender) {
        _a = __read(buttonsRender([leftButton, rightButton]), 2), leftButton = _a[0], rightButton = _a[1];
    }
    var disableTrigger = disabled ||
        !rightButton ||
        (rightButton.props && rightButton.props.loading);
    return (react_1.default.createElement(Button_1.default.Group, __assign({ className: className, style: style, ref: ref }, (0, pick_1.pickDataAttributes)(props)),
        leftButton,
        react_1.default.createElement(index_1.default, __assign({ disabled: disabled, position: position }, dropdownRestProps, { triggerProps: __assign({ disabled: disableTrigger }, dropdownRestProps === null || dropdownRestProps === void 0 ? void 0 : dropdownRestProps.triggerProps) }), rightButton)));
}
var ButtonComponent = (0, react_1.forwardRef)(Button);
ButtonComponent.displayName = 'DropdownButton';
exports.default = ButtonComponent;
