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
var contextHolder_1 = __importDefault(require("../../_util/contextHolder"));
var hookModal_1 = __importDefault(require("./hookModal"));
var confirm_1 = require("../confirm");
var config_1 = require("../config");
function useModal() {
    var contextHolderRef = (0, react_1.useRef)();
    var holderEle = react_1.default.createElement(contextHolder_1.default, { ref: contextHolderRef });
    var uuid = 0;
    function addNewModal(config) {
        var _a;
        uuid += 1;
        var modalRef = (0, react_1.createRef)();
        var currentConfig = __assign({}, config);
        function afterClose() {
            config.afterClose && config.afterClose();
            removeModalInstance();
        }
        var modal = (react_1.default.createElement(hookModal_1.default, __assign({ key: uuid, ref: modalRef }, (0, confirm_1.normalizeConfig)(__assign({}, config)), { afterClose: afterClose })));
        (_a = contextHolderRef.current) === null || _a === void 0 ? void 0 : _a.addInstance(modal);
        function removeModalInstance() {
            var _a;
            (_a = contextHolderRef.current) === null || _a === void 0 ? void 0 : _a.removeInstance(modal);
        }
        function close() {
            var _a;
            (_a = modalRef.current) === null || _a === void 0 ? void 0 : _a.close();
        }
        function update(newConfig) {
            var _a;
            currentConfig = __assign(__assign({}, currentConfig), newConfig);
            (_a = modalRef.current) === null || _a === void 0 ? void 0 : _a.update((0, confirm_1.normalizeConfig)(__assign({}, currentConfig)));
        }
        config_1.destroyList.push(close);
        return {
            close: close,
            update: update,
        };
    }
    var modalFuncs = {
        confirm: function (config) {
            return addNewModal(__assign({}, config));
        },
    };
    ['info', 'success', 'warning', 'error'].forEach(function (type) {
        modalFuncs[type] = function (config) {
            return addNewModal(__assign(__assign({}, config), { isNotice: true, noticeType: type }));
        };
    });
    return [modalFuncs, holderEle];
}
exports.default = useModal;
