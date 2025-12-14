"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var table_1 = __importDefault(require("./table"));
var index_1 = __importDefault(require("./summary/index"));
var TableComponent = table_1.default;
TableComponent.Summary = index_1.default;
exports.default = TableComponent;
