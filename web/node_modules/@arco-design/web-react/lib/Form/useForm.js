"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormInstance = void 0;
var react_1 = require("react");
var store_1 = __importDefault(require("./store"));
function getFormInstance() {
    var store = new store_1.default();
    return {
        getFieldsValue: store.getFieldsValue,
        getFieldValue: store.getFieldValue,
        getFieldError: store.getFieldError,
        getFieldsError: store.getFieldsError,
        getTouchedFields: store.getTouchedFields,
        getFields: store.getFields,
        setFieldValue: store.setFieldValue,
        setFieldsValue: store.setFieldsValue,
        setFields: store.setFields,
        resetFields: store.resetFields,
        clearFields: store.clearFields,
        submit: store.submit,
        validate: store.validate,
        scrollToField: function () { },
        getFieldsState: store.getFieldsState,
        // arco 内部使用，业务万不可调用
        getInnerMethods: function (inner) {
            var methods = {};
            if (inner) {
                [
                    'registerField',
                    'registerWatcher',
                    'registerStateWatcher',
                    'registerFormWatcher',
                    'innerSetInitialValues',
                    'innerSetInitialValue',
                    'innerSetCallbacks',
                    'innerSetFieldValue',
                    'innerGetStore',
                    'innerGetStoreStatus',
                    'innerGetFieldValue',
                    'innerCollectFormState',
                ].map(function (key) {
                    methods[key] = store[key];
                });
            }
            return methods;
        },
    };
}
exports.getFormInstance = getFormInstance;
function useForm(form) {
    var formRef = (0, react_1.useRef)(form);
    if (!formRef.current) {
        if (form) {
            formRef.current = form;
        }
        else {
            formRef.current = getFormInstance();
        }
    }
    return [formRef.current];
}
exports.default = useForm;
