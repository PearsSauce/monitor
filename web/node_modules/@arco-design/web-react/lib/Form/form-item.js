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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var is_1 = require("../_util/is");
var Grid_1 = __importDefault(require("../Grid"));
var interface_1 = require("./interface");
var control_1 = __importDefault(require("./control"));
var context_1 = require("./context");
var ConfigProvider_1 = require("../ConfigProvider");
var omit_1 = __importDefault(require("../_util/omit"));
var form_label_1 = __importDefault(require("./form-label"));
var utils_1 = require("./utils");
var CSSTransition_1 = __importDefault(require("../_util/CSSTransition"));
var Row = Grid_1.default.Row;
var Col = Grid_1.default.Col;
// 错误提示文字
var FormItemTip = function (_a) {
    var _b;
    var prefixCls = _a.prefixCls, help = _a.help, propsErrors = _a.errors, warnings = _a.warnings;
    var errorTip = propsErrors.map(function (item, i) {
        if (item) {
            return (react_1.default.createElement("div", { key: i, role: "alert" }, item.message));
        }
    });
    var warningTip = [];
    warnings.map(function (item, i) {
        warningTip.push(react_1.default.createElement("div", { key: i, role: "alert", className: prefixCls + "-message-help-warning" }, item));
    });
    var isHelpTip = !(0, is_1.isUndefined)(help) || !!warningTip.length;
    var visible = isHelpTip || !!errorTip.length;
    return (visible && (react_1.default.createElement(CSSTransition_1.default, { in: visible, appear: true, classNames: "formblink", timeout: 300, unmountOnExit: true },
        react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-message", (_b = {},
                _b[prefixCls + "-message-help"] = isHelpTip,
                _b)) }, !(0, is_1.isUndefined)(help) ? (help) : (react_1.default.createElement(react_1.default.Fragment, null,
            errorTip.length > 0 && errorTip,
            warningTip.length > 0 && warningTip))))));
};
var Item = function (props, ref) {
    var _a, _b, _c, _d;
    var _e, _f;
    var _g = (0, react_1.useContext)(ConfigProvider_1.ConfigContext), getPrefixCls = _g.getPrefixCls, prefix = _g.prefixCls;
    var topFormContext = (0, react_1.useContext)(context_1.FormItemContext);
    var formListContext = (0, react_1.useContext)(context_1.FormListContext);
    var _h = __read((0, react_1.useState)(null), 2), errors = _h[0], setErrors = _h[1];
    var _j = __read((0, react_1.useState)(null), 2), warnings = _j[0], setWarnings = _j[1];
    var formContext = (0, react_1.useContext)(context_1.FormContext);
    var prefixCls = formContext.prefixCls || getPrefixCls('form');
    var formLayout = props.layout || formContext.layout;
    var labelAlign = props.labelAlign || formContext.labelAlign;
    var isDestroyed = (0, react_1.useRef)(false);
    // update error status
    var updateInnerFormItem = function (field, params) {
        if (params === void 0) { params = {}; }
        if (isDestroyed.current) {
            return;
        }
        var _a = params || {}, errors = _a.errors, warnings = _a.warnings;
        setErrors(function (innerErrors) {
            var newErrors = __assign({}, (innerErrors || {}));
            if (errors) {
                newErrors[field] = errors;
            }
            else {
                delete newErrors[field];
            }
            return newErrors;
        });
        setWarnings(function (current) {
            var newVal = __assign({}, (current || {}));
            if (warnings && warnings.length) {
                newVal[field] = warnings;
            }
            else {
                delete newVal[field];
            }
            return newVal;
        });
    };
    var updateFormItem = (0, is_1.isObject)(props.noStyle) && props.noStyle.showErrorTip && topFormContext.updateFormItem
        ? topFormContext.updateFormItem
        : updateInnerFormItem;
    (0, react_1.useEffect)(function () {
        isDestroyed.current = false;
        return function () {
            isDestroyed.current = true;
            setErrors(null);
            setWarnings(null);
        };
    }, []);
    var contextProps = __assign(__assign({}, formContext), { validateMessages: formContext.validateMessages &&
            (0, utils_1.formatValidateMsg)(formContext.validateMessages, {
                label: props.label,
            }), prefixCls: prefixCls, updateFormItem: updateFormItem, disabled: 'disabled' in props ? props.disabled : formContext.disabled });
    var label = props.label, extra = props.extra, className = props.className, style = props.style, validateStatus = props.validateStatus, hidden = props.hidden, rest = __rest(props, ["label", "extra", "className", "style", "validateStatus", "hidden"]);
    var labelClassNames = (0, classNames_1.default)(prefixCls + "-label-item", (_a = {},
        _a[prefixCls + "-label-item-left"] = labelAlign === 'left',
        _a));
    var errorInfo = errors ? Object.values(errors) : [];
    var warningInfo = warnings
        ? Object.values(warnings).reduce(function (total, next) { return total.concat(next); }, [])
        : [];
    var itemStatus = (0, react_1.useMemo)(function () {
        if (validateStatus) {
            return validateStatus;
        }
        if (errorInfo.length) {
            return interface_1.VALIDATE_STATUS.error;
        }
        if (warningInfo.length) {
            return interface_1.VALIDATE_STATUS.warning;
        }
        return undefined;
    }, [errors, warnings, validateStatus]);
    var hasHelp = (0, react_1.useMemo)(function () {
        return !(0, is_1.isUndefined)(props.help) || warningInfo.length > 0;
    }, [props.help, warnings]);
    var classNames = (0, classNames_1.default)(prefixCls + "-item", (_b = {},
        _b[prefixCls + "-item-error"] = hasHelp || (!validateStatus && itemStatus === interface_1.VALIDATE_STATUS.error),
        _b[prefixCls + "-item-status-" + itemStatus] = itemStatus,
        _b[prefixCls + "-item-has-help"] = hasHelp,
        _b[prefixCls + "-item-hidden"] = hidden,
        _b[prefixCls + "-item-has-feedback"] = itemStatus && props.hasFeedback,
        _b), prefixCls + "-layout-" + formLayout, className);
    var cloneElementWithDisabled = function () {
        var _a, _b;
        var field = props.field, children = props.children;
        var disabled = 'disabled' in props ? props.disabled : formContext.disabled;
        if ((0, is_1.isFunction)(children)) {
            return (react_1.default.createElement(control_1.default, __assign({ disabled: disabled }, props, (field ? { key: field, _key: field } : {})), function () {
                var rest = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    rest[_i] = arguments[_i];
                }
                return children.apply(void 0, __spreadArray([], __read(rest), false));
            }));
        }
        if ((0, is_1.isArray)(children)) {
            var childrenDom = react_1.default.Children.map(children, function (child, i) {
                var key = ((0, is_1.isObject)(child) && child.key) || i;
                var existChildDisabled = (0, is_1.isObject)(child) && 'disabled' in child.props;
                var childProps = !(0, is_1.isUndefined)(disabled) && !existChildDisabled ? { key: key, disabled: disabled } : { key: key };
                return (0, is_1.isObject)(child) ? (0, react_1.cloneElement)(child, childProps) : child;
            });
            return (react_1.default.createElement(control_1.default, __assign({}, props, { field: undefined }), childrenDom));
        }
        if (react_1.default.Children.count(children) === 1) {
            if (field) {
                var key = ((_a = formListContext === null || formListContext === void 0 ? void 0 : formListContext.getItemKey) === null || _a === void 0 ? void 0 : _a.call(formListContext, field)) || field;
                return (react_1.default.createElement(control_1.default, __assign({ disabled: disabled }, props, { key: key, _key: key }), children));
            }
            if ((0, is_1.isObject)(children)) {
                // Compatible Form.Control
                if ((_b = children.type) === null || _b === void 0 ? void 0 : _b.isFormControl) {
                    return children;
                }
                var existChildDisabled = 'disabled' in children.props;
                var childProps = !existChildDisabled && !(0, is_1.isUndefined)(disabled) ? { disabled: disabled } : null;
                return (react_1.default.createElement(control_1.default, __assign({}, props, { field: undefined }), !childProps ? children : (0, react_1.cloneElement)(children, childProps)));
            }
        }
        return children;
    };
    var FormItemContext = context_1.FormItemContext;
    var newFormContext = __assign({}, formContext);
    if (!props.noStyle) {
        newFormContext.wrapperCol = undefined;
        newFormContext.labelCol = undefined;
    }
    return (react_1.default.createElement(context_1.FormContext.Provider, { value: newFormContext },
        react_1.default.createElement(FormItemContext.Provider, { value: contextProps }, props.noStyle ? (cloneElementWithDisabled()) : (react_1.default.createElement(Row, __assign({ ref: ref }, (0, omit_1.default)(rest, [
            'tooltip',
            'children',
            'prefixCls',
            'store',
            'initialValue',
            'field',
            'labelCol',
            'wrapperCol',
            'colon',
            'disabled',
            'rules',
            'trigger',
            'triggerPropName',
            'validateTrigger',
            'noStyle',
            'required',
            'hasFeedback',
            'help',
            'normalize',
            'formatter',
            'getValueFromEvent',
            'shouldUpdate',
            'field',
            'isInner',
            'labelAlign',
            'layout',
            'requiredSymbol',
            'isFormList',
        ]), { className: classNames, div: formLayout !== 'horizontal', style: style }),
            label ? (react_1.default.createElement(Col, __assign({}, (props.labelCol || formContext.labelCol), { className: (0, classNames_1.default)(labelClassNames, (_e = props.labelCol) === null || _e === void 0 ? void 0 : _e.className, (_f = formContext.labelCol) === null || _f === void 0 ? void 0 : _f.className, (_c = {},
                    _c[prefixCls + "-label-item-flex"] = !props.labelCol && !formContext.labelCol,
                    _c)) }),
                react_1.default.createElement(form_label_1.default, { tooltip: props.tooltip, htmlFor: props.field && formContext.getFormElementId(props.field), label: label, prefix: prefix, requiredSymbol: 'requiredSymbol' in props ? props.requiredSymbol : formContext.requiredSymbol, required: props.required, rules: props.rules, showColon: 'colon' in props ? props.colon : formContext.colon }))) : null,
            react_1.default.createElement(Col, __assign({ className: (0, classNames_1.default)(prefixCls + "-item-wrapper", (_d = {},
                    _d[prefixCls + "-item-wrapper-flex"] = !props.wrapperCol && !formContext.wrapperCol,
                    _d)) }, (props.wrapperCol || formContext.wrapperCol)),
                cloneElementWithDisabled(),
                react_1.default.createElement(FormItemTip, { prefixCls: prefixCls, help: props.help, errors: errorInfo, warnings: warningInfo }),
                extra && react_1.default.createElement("div", { className: prefixCls + "-extra" }, extra)))))));
};
var ItemComponent = (0, react_1.forwardRef)(Item);
ItemComponent.defaultProps = {
    trigger: 'onChange',
    triggerPropName: 'value',
};
ItemComponent.displayName = 'FormItem';
exports.default = ItemComponent;
