"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 计算字符串长度，中文字符占两个长度
function default_1(str) {
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94) {
            len += 2;
        }
        else {
            len++;
        }
    }
    return len;
}
exports.default = default_1;
