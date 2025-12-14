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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var IconLeft_1 = __importDefault(require("../../icon/react-icon-cjs/IconLeft"));
var IconRight_1 = __importDefault(require("../../icon/react-icon-cjs/IconRight"));
var ConfigProvider_1 = require("../ConfigProvider");
var classNames_1 = __importDefault(require("../_util/classNames"));
function ImagePreviewArrow(props) {
    var _a, _b;
    var current = props.current, previewCount = props.previewCount, _c = props.infinite, infinite = _c === void 0 ? false : _c, onPrev = props.onPrev, onNext = props.onNext;
    var getPrefixCls = (0, react_1.useContext)(ConfigProvider_1.ConfigContext).getPrefixCls;
    var prefixCls = getPrefixCls('image-preview');
    var classNames = (0, classNames_1.default)(prefixCls + "-arrow");
    var disableLeft = !infinite && current <= 0;
    var disableRight = !infinite && current >= previewCount - 1;
    return (react_1.default.createElement("div", { className: classNames },
        react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-arrow-left", (_a = {},
                _a[prefixCls + "-arrow-disabled"] = disableLeft,
                _a)), onClick: function (e) {
                e.preventDefault();
                !disableLeft && (onPrev === null || onPrev === void 0 ? void 0 : onPrev());
            } },
            react_1.default.createElement(IconLeft_1.default, null)),
        react_1.default.createElement("div", { className: (0, classNames_1.default)(prefixCls + "-arrow-right", (_b = {},
                _b[prefixCls + "-arrow-disabled"] = disableRight,
                _b)), onClick: function (e) {
                e.preventDefault();
                !disableRight && (onNext === null || onNext === void 0 ? void 0 : onNext());
            } },
            react_1.default.createElement(IconRight_1.default, null))));
}
exports.default = ImagePreviewArrow;
