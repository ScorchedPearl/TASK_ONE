"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const jwtservice_1 = __importDefault(require("./jwtservice"));
const auth_interface_1 = require("../auth_interface");
const jwterror_1 = require("../errors/jwterror");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class TokenService {
    constructor() {
        this.jwtService = jwtservice_1.default.getInstance();
        this.config = {
            accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
            refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
        };
    }
    static getInstance() {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }
    async generateTokenPair(user) {
        try {
            const tokenId = this.generateTokenId();
            const accessPayload = {
                id: user.id,
                email: user.email,
                name: user.name,
                tokenType: 'access',
                jti: tokenId,
                expiresAt: new Date(Date.now() + this.parseExpiryToSeconds(this.config.accessTokenExpiry) * 1000),
                issuedAt: new Date(Date.now()),
                tokenId: tokenId
            };
            const refreshPayload = {
                id: user.id,
                email: user.email,
                name: user.name,
                tokenType: 'refresh',
                jti: `${tokenId}_refresh`,
                expiresAt: new Date(Date.now() + this.parseExpiryToSeconds(this.config.refreshTokenExpiry) * 1000),
                issuedAt: new Date(Date.now()),
                tokenId: tokenId
            };
            const accessToken = await this.jwtService.encode(accessPayload, this.config.accessTokenExpiry);
            const refreshToken = await this.jwtService.encode(refreshPayload, this.config.refreshTokenExpiry);
            const expiresIn = this.parseExpiryToSeconds(this.config.accessTokenExpiry);
            return {
                accessToken,
                refreshToken,
                expiresIn,
                tokenType: 'Bearer'
            };
        }
        catch (error) {
            console.error('Token pair generation failed:', error);
            throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.INVALID_TOKEN, 'Failed to generate token pair', 500);
        }
    }
    async generateAccessToken(user) {
        const tokenPair = await this.generateTokenPair(user);
        return tokenPair.accessToken;
    }
    async validateAccessToken(token) {
        const decoded = await this.jwtService.decode(token);
        return decoded;
    }
    async refreshAccessToken(refreshToken) {
        const decoded = await this.jwtService.decode(refreshToken);
        if (!decoded || !decoded.id) {
            throw new jwterror_1.JWTError(auth_interface_1.JWTErrorType.INVALID_TOKEN, 'Invalid refresh token');
        }
        const user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
        };
        return await this.generateTokenPair(user);
    }
    extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
    isTokenExpiringSoon(user) {
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        return user.expiresAt <= fiveMinutesFromNow;
    }
    generateTokenId() {
        return (0, crypto_1.randomBytes)(16).toString('hex');
    }
    parseExpiryToSeconds(expiry) {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return 900;
        const [, value, unit] = match;
        const num = parseInt(value, 10);
        switch (unit) {
            case 's': return num;
            case 'm': return num * 60;
            case 'h': return num * 60 * 60;
            case 'd': return num * 60 * 60 * 24;
            default: return 900;
        }
    }
}
exports.default = TokenService;
//# sourceMappingURL=tokenservice.js.map