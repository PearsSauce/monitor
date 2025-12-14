"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var row_1 = __importDefault(require("./row"));
var cell_1 = __importDefault(require("./cell"));
function Summary(props) {
    return props.children;
}
Summary.Row = row_1.default;
Summary.Cell = cell_1.default;
exports.default = Summary;
