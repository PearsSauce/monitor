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
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyList = exports.getModalConfig = exports.setModalConfig = exports.getConfigProviderProps = exports.setConfigProviderProps = void 0;
var configProvider = {};
function setConfigProviderProps(configProviderProps) {
    configProvider = __assign({}, configProviderProps);
}
exports.setConfigProviderProps = setConfigProviderProps;
function getConfigProviderProps() {
    return configProvider;
}
exports.getConfigProviderProps = getConfigProviderProps;
var modalConfig = {
    simple: true,
};
var setModalConfig = function (config) {
    modalConfig = __assign(__assign({}, modalConfig), config);
};
exports.setModalConfig = setModalConfig;
var getModalConfig = function () {
    return modalConfig;
};
exports.getModalConfig = getModalConfig;
exports.destroyList = [];
