"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jose_1 = require("jose");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_interface_1 = require("../auth_interface");
const jwterror_1 = require("../errors/jwterror");
dotenv_1.default.config();
class JWTService {
    constructor() {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret.length < 32) {
            throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.MISSING_SECRET, 'env bhul gya jwt_secret ni milra mereko', 500);
        }
        this.encodedKey = new TextEncoder().encode(secret);
    }
    static getInstance() {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }
        return JWTService.instance;
    }
    async encode(payload, expiry) {
        try {
            return new jose_1.SignJWT(payload)
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime(expiry)
                .sign(this.encodedKey);
        }
        catch (error) {
            console.error('Token encoding failed:', error);
            throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.INVALID_TOKEN, 'Failed to encode token', 500);
        }
    }
    async decode(token) {
        if (!token?.trim()) {
            throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.MALFORMED_TOKEN, 'header me token dalde bhai');
        }
        try {
            const { payload } = await (0, jose_1.jwtVerify)(token, this.encodedKey, {
                algorithms: ['HS256']
            });
            const jwtPayload = payload;
            if (!jwtPayload.id || !jwtPayload.email || !jwtPayload.name) {
                throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.INVALID_TOKEN, 'glt token format, missing required fields');
            }
            return {
                id: jwtPayload.id,
                email: jwtPayload.email,
                name: jwtPayload.name,
                expiresAt: new Date((jwtPayload.exp || 0) * 1000),
                issuedAt: new Date((jwtPayload.iat || 0) * 1000),
                tokenId: jwtPayload.jti || 'unknown'
            };
        }
        catch (error) {
            console.error('Token validation failed:', error.message);
            if (error instanceof jwterror_1.JWTError) {
                throw error;
            }
            if (error.code === 'ERR_JWT_EXPIRED') {
                throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.TOKEN_EXPIRED, 'Expiry');
            }
            if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
                throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.INVALID_SIGNATURE, 'Signed Wrong');
            }
            throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.INVALID_TOKEN, 'Invalid');
        }
    }
}
exports.default = JWTService;
//# sourceMappingURL=jwtservice.js.map