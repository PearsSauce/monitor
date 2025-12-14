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
var contextHolder_1 = __importDefault(require("../_util/contextHolder"));
var _1 = __importDefault(require("."));
var is_1 = require("../_util/is");
function useNotification(commonConfig) {
    if (commonConfig === void 0) { commonConfig = {}; }
    var maxCount = commonConfig.maxCount, _a = commonConfig.duration, duration = _a === void 0 ? 3000 : _a, _prefixCls = commonConfig.prefixCls, getContainer = commonConfig.getContainer;
    var contextHolderRef = (0, react_1.createRef)();
    var holderEle = react_1.default.createElement(contextHolder_1.default, { ref: contextHolderRef });
    var notificationInstance = {};
    var notice;
    function addNotice(noticeProps) {
        var prefixCls, rtl;
        if (contextHolderRef.current) {
            var contextConfig = contextHolderRef.current.getContextConfig();
            rtl = contextConfig.rtl;
            prefixCls = contextConfig.prefixCls;
        }
        var mergedPrefixCls = _prefixCls || prefixCls;
        var position = noticeProps.position;
        if ((0, is_1.isUndefined)(noticeProps.position)) {
            position = rtl ? 'topLeft' : 'topRight';
        }
        var _noticeProps = __assign({ duration: duration }, noticeProps);
        var id;
        if (notificationInstance[position]) {
            var notices = notificationInstance[position].state.notices;
            if (notices.length >= maxCount) {
                var updated = notices[0];
                id = updated.id;
                notices.shift();
                notificationInstance[position].add(__assign(__assign({}, _noticeProps), { id: id }));
            }
            else {
                id = notificationInstance[position].add(_noticeProps);
            }
        }
        else {
            notice = (react_1.default.createElement(_1.default, { ref: function (instance) {
                    notificationInstance[position] = instance;
                    if (notificationInstance[position]) {
                        id = notificationInstance[position].add(_noticeProps);
                    }
                }, prefixCls: mergedPrefixCls, rtl: rtl, getContainer: getContainer }));
            contextHolderRef.current.addInstance(notice);
        }
        return notificationInstance[position];
    }
    var notificationFuncs = {};
    ['info', 'success', 'warning', 'error', 'normal'].forEach(function (type) {
        notificationFuncs[type] = function (config) {
            return addNotice(__assign(__assign({}, config), { type: type }));
        };
    });
    return [notificationFuncs, holderEle];
}
exports.default = useNotification;
