"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTErrorType = void 0;
var JWTErrorType;
(function (JWTErrorType) {
    JWTErrorType["INVALID_TOKEN"] = "INVALID_TOKEN";
    JWTErrorType["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    JWTErrorType["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
    JWTErrorType["MALFORMED_TOKEN"] = "MALFORMED_TOKEN";
    JWTErrorType["MISSING_SECRET"] = "MISSING_SECRET";
})(JWTErrorType || (exports.JWTErrorType = JWTErrorType = {}));
//# sourceMappingURL=auth_interface.js.map