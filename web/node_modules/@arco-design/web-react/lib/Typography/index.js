"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var typography_1 = __importDefault(require("./typography"));
var title_1 = __importDefault(require("./title"));
var text_1 = __importDefault(require("./text"));
var paragraph_1 = __importDefault(require("./paragraph"));
var ellipsis_1 = __importDefault(require("./ellipsis"));
var Typography = typography_1.default;
Typography.Title = title_1.default;
Typography.Text = text_1.default;
Typography.Paragraph = paragraph_1.default;
Typography.Ellipsis = ellipsis_1.default;
exports.default = Typography;
