"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormListContext = exports.FormProviderContext = exports.FormItemContext = exports.FormContext = void 0;
var react_1 = require("react");
var constant_1 = require("../_util/constant");
exports.FormContext = (0, react_1.createContext)({
    layout: 'horizontal',
    labelCol: { span: 5, offset: 0 },
    labelAlign: 'right',
    wrapperCol: { span: 19, offset: 0 },
    requiredSymbol: true,
    getFormElementId: function () { return 'arco-'; },
    store: {
        clearFields: constant_1.NOOP,
        getFieldsValue: constant_1.NOOP,
        getFieldValue: constant_1.NOOP,
        getFieldError: constant_1.NOOP,
        getFieldsError: constant_1.NOOP,
        getTouchedFields: constant_1.NOOP,
        getFields: constant_1.NOOP,
        setFieldValue: constant_1.NOOP,
        setFieldsValue: constant_1.NOOP,
        setFields: constant_1.NOOP,
        resetFields: constant_1.NOOP,
        submit: constant_1.NOOP,
        validate: constant_1.NOOP,
        getFieldsState: constant_1.NOOP,
        scrollToField: constant_1.NOOP,
        getInnerMethods: function () { return ({
            registerField: constant_1.NOOP,
            innerGetStore: constant_1.NOOP,
            registerStateWatcher: constant_1.NOOP,
            registerWatcher: constant_1.NOOP,
            innerGetStoreStatus: constant_1.NOOP,
        }); },
    },
});
exports.FormItemContext = (0, react_1.createContext)({});
exports.FormProviderContext = (0, react_1.createContext)({});
exports.FormListContext = (0, react_1.createContext)({});
