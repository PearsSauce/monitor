"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//  react 19 的 index.js 不会再导出 createRoot，必须从 react-dom/client 导入 createRoot
// @ts-ignore-next-line
var client_1 = require("react-dom/client");
var react_dom_1 = require("./react-dom");
(0, react_dom_1.setCreateRoot)(client_1.createRoot);
