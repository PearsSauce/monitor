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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ConfigProvider_1 = require("../ConfigProvider");
var ContextHolderElement = (0, react_1.forwardRef)(function (_props, ref) {
    var configContext = (0, react_1.useContext)(ConfigProvider_1.ConfigContext);
    var _a = __read((0, react_1.useState)([]), 2), instances = _a[0], setInstances = _a[1];
    function addInstance(ins) {
        setInstances(function (originInstances) { return __spreadArray(__spreadArray([], __read(originInstances), false), [ins], false); });
    }
    function removeInstance(ins) {
        setInstances(function (originInstances) { return originInstances.filter(function (originIns) { return ins !== originIns; }); });
    }
    function getContextConfig() {
        return configContext;
    }
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        addInstance: addInstance,
        removeInstance: removeInstance,
        getContextConfig: getContextConfig,
    }); });
    return (react_1.default.createElement(react_1.default.Fragment, null, react_1.default.Children.map(instances, function (child, index) { return react_1.default.cloneElement(child, { key: index }); })));
});
exports.default = ContextHolderElement;
