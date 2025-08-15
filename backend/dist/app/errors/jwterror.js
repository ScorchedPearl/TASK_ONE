"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTError = void 0;
class JWTError extends Error {
    constructor(type, message, statusCode = 401) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
        this.name = 'JWTError';
    }
}
exports.JWTError = JWTError;
//# sourceMappingURL=jwterror.js.map