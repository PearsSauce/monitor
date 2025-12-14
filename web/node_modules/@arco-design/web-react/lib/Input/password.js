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
var classNames_1 = __importDefault(require("../_util/classNames"));
var input_1 = __importDefault(require("./input"));
var IconEye_1 = __importDefault(require("../../icon/react-icon-cjs/IconEye"));
var IconEyeInvisible_1 = __importDefault(require("../../icon/react-icon-cjs/IconEyeInvisible"));
var ConfigProvider_1 = require("../ConfigProvider");
var useMergeValue_1 = __importDefault(require("../_util/hooks/useMergeValue"));
var omit_1 = __importDefault(require("../_util/omit"));
var useKeyboardEvent_1 = __importDefault(require("../_util/hooks/useKeyboardEvent"));
var Password = react_1.default.forwardRef(function (props, ref) {
    var _a;
    var _b = __read((0, useMergeValue_1.default)(false, {
        defaultValue: props.defaultVisibility,
        value: props.visibility,
    }), 2), visibility = _b[0], setVisibility = _b[1];
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var getKeyboardEvents = (0, useKeyboardEvent_1.default)();
    var className = props.className, _c = props.visibilityToggle, visibilityToggle = _c === void 0 ? true : _c, onVisibilityChange = props.onVisibilityChange, rest = __rest(props, ["className", "visibilityToggle", "onVisibilityChange"]);
    var prefixCls = getPrefixCls('input-password');
    var classNames = (0, classNames_1.default)(prefixCls, (_a = {},
        _a[prefixCls + "-visibility"] = visibilityToggle,
        _a), className);
    var onClickVisibility = function (v) {
        if (!('visibility' in props)) {
            setVisibility(v);
        }
        onVisibilityChange && onVisibilityChange(v);
    };
    var icon = props.suffix;
    var handleClickVisibility = function () {
        onClickVisibility(!visibility);
    };
    if (visibilityToggle) {
        var IconProps = __assign({ onClick: handleClickVisibility, 
            // 预防focus丢失
            onMouseDown: function (e) { return e.preventDefault(); }, onMouseUp: function (e) { return e.preventDefault(); } }, getKeyboardEvents({
            onPressEnter: handleClickVisibility,
        }));
        if (props.suffix) {
            icon = react_1.default.createElement("span", __assign({}, IconProps), props.suffix);
        }
        else {
            var IconComponent = visibility ? IconEye_1.default : IconEyeInvisible_1.default;
            icon = (react_1.default.createElement(IconComponent, __assign({}, IconProps, {
                focusable: undefined,
                'aria-hidden': undefined,
                tabIndex: 0,
                className: prefixCls + "-visibility-icon",
            })));
        }
    }
    return (react_1.default.createElement(input_1.default, __assign({}, (0, omit_1.default)(rest, ['visibility', 'defaultVisibility']), { type: visibility ? 'text' : 'password', className: classNames, ref: ref, suffix: icon })));
});
Password.displayName = 'Password';
exports.default = Password;
