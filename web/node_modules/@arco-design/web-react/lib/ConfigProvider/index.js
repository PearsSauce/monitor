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
exports.ConfigContext = exports.ConfigConsumer = void 0;
var react_1 = __importStar(require("react"));
var is_1 = require("../_util/is");
var util_1 = require("./util");
var Message_1 = __importDefault(require("../Message"));
var Notification_1 = __importDefault(require("../Notification"));
var config_1 = require("../Modal/config");
var context_1 = require("../../icon/react-icon-cjs/context");
var omit_1 = __importDefault(require("../_util/omit"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var context_2 = require("./context");
Object.defineProperty(exports, "ConfigContext", { enumerable: true, get: function () { return context_2.ConfigContext; } });
var colorList = {
    primaryColor: {
        default: '--arcoblue-6',
        hover: '--arcoblue-5',
        active: '--arcoblue-7',
    },
    successColor: {
        default: '--green-6',
        hover: '--green-5',
        active: '--green-7',
    },
    infoColor: {
        default: '--arcoblue-6',
        hover: '--arcoblue-5',
        active: '--arcoblue-7',
    },
    warningColor: {
        default: '--orangered-6',
        hover: '--orangered-5',
        active: '--orangered-7',
    },
    dangerColor: {
        default: '--red-6',
        hover: '--red-5',
        active: '--red-7',
    },
};
function setTheme(theme) {
    if (theme && (0, is_1.isObject)(theme)) {
        var root_1 = document.body;
        Object.keys(colorList).forEach(function (color) {
            if (theme[color]) {
                root_1.style.setProperty(colorList[color].default, (0, util_1.lighten)(theme[color], 0));
                if (!theme[color + "Hover"]) {
                    root_1.style.setProperty(colorList[color].hover, (0, util_1.lighten)(theme[color], 10));
                }
                if (!theme[color + "Active"]) {
                    root_1.style.setProperty(colorList[color].active, (0, util_1.lighten)(theme[color], -10));
                }
            }
        });
    }
}
var defaultProps = context_2.DefaultConfigProviderProps;
var componentConfig = {};
function ConfigProvider(baseProps) {
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, componentConfig);
    var theme = props.theme, prefixCls = props.prefixCls, children = props.children, locale = props.locale, rtl = props.rtl, _a = props.effectGlobalNotice, effectGlobalNotice = _a === void 0 ? true : _a, _b = props.effectGlobalModal, effectGlobalModal = _b === void 0 ? true : _b;
    (0, react_1.useEffect)(function () {
        setTheme(theme);
    }, [theme]);
    (0, react_1.useEffect)(function () {
        if (effectGlobalNotice) {
            Message_1.default.config({ prefixCls: prefixCls, rtl: rtl });
            Notification_1.default.config({ prefixCls: prefixCls, rtl: rtl });
        }
    }, [prefixCls, rtl, effectGlobalNotice]);
    function getPrefixCls(componentName, customPrefix) {
        return (customPrefix || prefixCls) + "-" + componentName;
    }
    var config = __assign(__assign({}, (0, omit_1.default)(props, ['children'])), { getPrefixCls: getPrefixCls });
    (0, react_1.useEffect)(function () {
        if (effectGlobalModal) {
            (0, config_1.setConfigProviderProps)({ locale: locale, prefixCls: prefixCls, rtl: rtl });
        }
    }, [locale, prefixCls, rtl, effectGlobalModal]);
    var child = children;
    if (prefixCls && prefixCls !== 'arco') {
        child = react_1.default.createElement(context_1.IconContext.Provider, { value: { prefixCls: prefixCls } }, children);
    }
    return react_1.default.createElement(context_2.ConfigContext.Provider, { value: config }, child);
}
ConfigProvider.ConfigContext = context_2.ConfigContext;
ConfigProvider.displayName = 'ConfigProvider';
exports.default = ConfigProvider;
exports.ConfigConsumer = context_2.ConfigContext.Consumer;
