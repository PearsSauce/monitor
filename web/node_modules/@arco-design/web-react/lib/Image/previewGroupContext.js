"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewGroupContext = void 0;
var react_1 = require("react");
exports.PreviewGroupContext = (0, react_1.createContext)({
    previewGroup: false,
    previewUrlMap: new Map(),
    previewPropsMap: new Map(),
    infinite: true,
    currentIndex: 0,
    setCurrentIndex: function () { return null; },
    setPreviewUrlMap: function () { return null; },
    registerPreviewUrl: function () { return null; },
    registerPreviewProps: function () { return null; },
    visible: false,
    handleVisibleChange: function () { return null; },
});
