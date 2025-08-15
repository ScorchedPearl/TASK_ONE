import { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "../user_interface";
declare class UserService {
    static verifyCredentialsToken(payload: VerifyCredentialsTokenType): Promise<string>;
    static getCurrentUser(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        profileImageURL: null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static sendOtpEmail(email: string, otp: string): Promise<boolean>;
    static getAllUser(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        profileImageURL: null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static createCredentialsToken(payload: CreateCredentialsTokenType): Promise<string>;
    static verifyGoogleAuthToken(token: string): Promise<string>;
    static changePassword(email: string, newPassword: string): Promise<boolean>;
}
export default UserService;
//# sourceMappingURL=userservice.d.ts.map