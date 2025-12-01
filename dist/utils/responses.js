"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.success = void 0;
const success = (body, statusCode = 200) => ({
    statusCode,
    body: JSON.stringify(body),
});
exports.success = success;
const error = (message, statusCode = 500) => ({
    statusCode,
    body: JSON.stringify({ error: message }),
});
exports.error = error;
//# sourceMappingURL=responses.js.map