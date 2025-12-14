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
var modal_1 = __importDefault(require("../modal"));
function HookModal(props, ref) {
    var _a = __read((0, react_1.useState)(true), 2), visible = _a[0], setVisible = _a[1];
    var _b = __read((0, react_1.useState)(props), 2), config = _b[0], setConfig = _b[1];
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        update: function (config) {
            setConfig(config);
        },
        close: function () {
            setVisible(false);
        },
    }); });
    function onOk() {
        var ret = config.onOk && config.onOk();
        if (ret && ret.then) {
            setConfig(function (config) { return (__assign(__assign({}, config), { confirmLoading: true })); });
            ret.then(function () {
                setVisible(false);
            }, function (e) {
                console.error(e);
                setConfig(function (config) { return (__assign(__assign({}, config), { confirmLoading: false })); });
            });
        }
        if (!ret) {
            setVisible(false);
        }
    }
    function onCancel() {
        config.onCancel && config.onCancel();
        setVisible(false);
    }
    return (react_1.default.createElement(modal_1.default, __assign({ unmountOnExit: true, simple: true }, config, { visible: visible, onOk: onOk, onCancel: onCancel }), config.content));
}
exports.default = (0, react_1.forwardRef)(HookModal);
