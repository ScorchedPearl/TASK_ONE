import { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "../user/types";
declare class UserService {
    static verifyCredentialsToken(payload: VerifyCredentialsTokenType): void;
    static getCurrentUser(id: string): void;
    static sendOtpEmail(email: string, otp: string): void;
    static getAllUser(id: string): void;
    static createCredentialsToken(payload: CreateCredentialsTokenType): void;
    static verifyGoogleAuthToken(token: string): void;
    static changePassword(email: string, newPassword: string): void;
}
export default UserService;
//# sourceMappingURL=userservice.d.ts.map