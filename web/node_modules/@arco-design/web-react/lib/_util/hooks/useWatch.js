"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var usePrevious_1 = __importDefault(require("./usePrevious"));
function useWatch(value, callback) {
    var prevValue = (0, usePrevious_1.default)(value);
    (0, react_1.useEffect)(function () {
        if (value !== prevValue) {
            callback(value, prevValue);
        }
    }, [value]);
}
exports.default = useWatch;
