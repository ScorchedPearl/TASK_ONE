import type { User, TokenPair, JWTUser } from "../auth_interface";
declare class TokenService {
    private static instance;
    private readonly jwtService;
    private readonly config;
    private constructor();
    static getInstance(): TokenService;
    generateTokenPair(user: User): Promise<TokenPair>;
    generateAccessToken(user: User): Promise<string>;
    validateAccessToken(token: string): Promise<JWTUser>;
    refreshAccessToken(refreshToken: string): Promise<TokenPair>;
    extractTokenFromHeader(authHeader: string | undefined): string | null;
    isTokenExpiringSoon(user: JWTUser): boolean;
    private generateTokenId;
    private parseExpiryToSeconds;
}
export default TokenService;
//# sourceMappingURL=tokenservice.d.ts.map