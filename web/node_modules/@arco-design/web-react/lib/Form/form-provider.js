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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var context_1 = require("./context");
var FormProviderComponent = function (props, _) {
    var formsRef = (0, react_1.useRef)({});
    var register = (0, react_1.useCallback)(function (name, form) {
        if (name) {
            formsRef.current[name] = form;
        }
        return function () {
            delete formsRef.current[name];
        };
    }, []);
    var onFormSubmit = (0, react_1.useCallback)(function (name, changedValues) {
        props.onFormSubmit &&
            props.onFormSubmit(name, changedValues, {
                forms: formsRef.current,
            });
    }, [props.onFormSubmit]);
    var onFormValuesChange = (0, react_1.useCallback)(function (name, values) {
        props.onFormValuesChange &&
            props.onFormValuesChange(name, values, {
                forms: formsRef.current,
            });
    }, [props.onFormValuesChange]);
    return (react_1.default.createElement(context_1.FormProviderContext.Provider, { value: {
            onFormValuesChange: onFormValuesChange,
            onFormSubmit: onFormSubmit,
            register: register,
        } }, props.children));
};
var FormProvider = (0, react_1.forwardRef)(FormProviderComponent);
FormProvider.displayName = 'FormProvider';
exports.default = FormProvider;
