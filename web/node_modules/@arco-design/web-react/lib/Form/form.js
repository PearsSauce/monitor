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
var scroll_into_view_if_needed_1 = __importDefault(require("scroll-into-view-if-needed"));
var merge_1 = __importDefault(require("lodash/merge"));
var classNames_1 = __importDefault(require("../_util/classNames"));
var useForm_1 = __importDefault(require("./useForm"));
var ConfigProvider_1 = __importStar(require("../ConfigProvider"));
var context_1 = require("./context");
var is_1 = require("../_util/is");
var omit_1 = __importDefault(require("../_util/omit"));
var useMergeProps_1 = __importDefault(require("../_util/hooks/useMergeProps"));
var useCreate_1 = __importDefault(require("../_util/hooks/useCreate"));
var utils_1 = require("./utils");
function getFormElementId(prefix, field) {
    var id = field.replace(/[\[\.]/g, '_').replace(/\]/g, '');
    return prefix ? prefix + "-" + id : "" + id;
}
var defaultProps = {
    layout: 'horizontal',
    labelCol: { span: 5, offset: 0 },
    labelAlign: 'right',
    wrapperCol: { span: 19, offset: 0 },
    requiredSymbol: true,
    wrapper: 'form',
    validateTrigger: 'onChange',
};
var Form = function (baseProps, ref) {
    var _a;
    var _b, _c;
    var ctx = (0, react_1.useContext)(ConfigProvider_1.ConfigContext);
    var formProviderCtx = (0, react_1.useContext)(context_1.FormProviderContext);
    var wrapperRef = (0, react_1.useRef)(null);
    var _d = __read((0, useForm_1.default)(baseProps.form), 1), formInstance = _d[0];
    var props = (0, useMergeProps_1.default)(baseProps, defaultProps, (_b = ctx.componentConfig) === null || _b === void 0 ? void 0 : _b.Form);
    var layout = props.layout, labelCol = props.labelCol, wrapperCol = props.wrapperCol, Wrapper = props.wrapper, id = props.id, requiredSymbol = props.requiredSymbol, labelAlign = props.labelAlign, disabled = props.disabled, colon = props.colon, className = props.className, validateTrigger = props.validateTrigger, formPrefixCls = props.prefixCls, validateMessages = props.validateMessages, rest = __rest(props, ["layout", "labelCol", "wrapperCol", "wrapper", "id", "requiredSymbol", "labelAlign", "disabled", "colon", "className", "validateTrigger", "prefixCls", "validateMessages"]);
    var prefixCls = formPrefixCls || ctx.getPrefixCls('form');
    var rtl = ctx.rtl;
    var size = 'size' in props ? props.size : ctx.size;
    var innerMethods = formInstance.getInnerMethods(true);
    (0, useCreate_1.default)(function () {
        innerMethods.innerSetInitialValues(props.initialValues);
    });
    (0, react_1.useEffect)(function () {
        var unregister;
        if (formProviderCtx.register) {
            unregister = formProviderCtx.register(props.id, formInstance);
        }
        return unregister;
    }, [props.id, formInstance]);
    (0, react_1.useImperativeHandle)(ref, function () {
        return formInstance;
    });
    // 滚动到目标表单字段位置
    formInstance.scrollToField = function (field, options) {
        var node = wrapperRef.current;
        var id = props.id;
        if (!node) {
            return;
        }
        var fieldNode = node.querySelector("#" + getFormElementId(id, field));
        if (!fieldNode) {
            // 如果设置了nostyle， fieldNode不存在，尝试直接查询表单控件
            fieldNode = node.querySelector("#" + getFormElementId(id, field) + utils_1.ID_SUFFIX);
        }
        fieldNode &&
            (0, scroll_into_view_if_needed_1.default)(fieldNode, __assign({ behavior: 'smooth', block: 'nearest', scrollMode: 'if-needed' }, options));
    };
    innerMethods.innerSetCallbacks({
        onValuesChange: function (value, values) {
            props.onValuesChange && props.onValuesChange(value, values);
            formProviderCtx.onFormValuesChange && formProviderCtx.onFormValuesChange(props.id, value);
        },
        onChange: props.onChange,
        onValidateFail: function (errors) {
            if (props.scrollToFirstError) {
                var options = (0, is_1.isObject)(props.scrollToFirstError) ? props.scrollToFirstError : {};
                formInstance.scrollToField(Object.keys(errors)[0], options);
            }
        },
        onSubmitFailed: props.onSubmitFailed,
        onSubmit: function (values) {
            var returnValue = props.onSubmit && props.onSubmit(values);
            formProviderCtx.onFormSubmit && formProviderCtx.onFormSubmit(props.id, values);
            return returnValue;
        },
    });
    var contextProps = {
        requiredSymbol: requiredSymbol,
        labelAlign: labelAlign,
        disabled: disabled,
        colon: colon,
        labelCol: labelCol,
        wrapperCol: wrapperCol,
        layout: layout,
        store: formInstance,
        prefixCls: prefixCls,
        validateTrigger: validateTrigger,
        validateMessages: (0, merge_1.default)({}, (_c = ctx.locale.Form) === null || _c === void 0 ? void 0 : _c.validateMessages, validateMessages),
        getFormElementId: function (field) { return getFormElementId(id, field); },
    };
    var FormContext = context_1.FormContext;
    return (react_1.default.createElement(ConfigProvider_1.default, __assign({}, ctx, { size: size }),
        react_1.default.createElement(FormContext.Provider, { value: contextProps },
            react_1.default.createElement(Wrapper, __assign({ ref: wrapperRef }, (0, omit_1.default)(rest, [
                'form',
                'size',
                'initialValues',
                'onValuesChange',
                'onChange',
                'wrapperProps',
                'scrollToFirstError',
                'onSubmit',
                'onSubmitFailed',
            ]), props.wrapperProps, { className: (0, classNames_1.default)(prefixCls, prefixCls + "-" + layout, prefixCls + "-size-" + size, (_a = {}, _a[prefixCls + "-rtl"] = rtl, _a), className), style: props.style, onSubmit: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    formInstance.submit();
                }, id: id }), props.children))));
};
var FormComponent = (0, react_1.forwardRef)(Form);
FormComponent.displayName = 'Form';
exports.default = FormComponent;
