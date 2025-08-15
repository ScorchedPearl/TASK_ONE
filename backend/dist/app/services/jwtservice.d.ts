import type { JWTUser, JWTPayload } from "../auth_interface";
declare class JWTService {
    private static instance;
    private readonly encodedKey;
    private constructor();
    static getInstance(): JWTService;
    encode(payload: JWTPayload, expiry: string): Promise<string>;
    decode(token: string): Promise<JWTUser>;
}
export default JWTService;
//# sourceMappingURL=jwtservice.d.ts.map