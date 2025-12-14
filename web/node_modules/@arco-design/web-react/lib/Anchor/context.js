"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
exports.default = (0, react_1.createContext)({
    direction: 'vertical',
    currentLink: '',
    onLinkClick: function () { },
    addLink: function () { },
    removeLink: function () { },
});
