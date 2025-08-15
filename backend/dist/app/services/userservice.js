"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserService {
    static async verifyCredentialsToken(payload) {
        console.log(payload.email);
        return "mock-jwt-token";
    }
    static async getCurrentUser(id) {
        console.log(id);
        return {
            id,
            email: "u",
            name: "T",
            profileImageURL: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    static async sendOtpEmail(email, otp) {
        console.log(email, otp);
        return true;
    }
    static async getAllUser(id) {
        console.log(id);
        return [{
                id: "1",
                email: "user1@example.com",
                name: "User 1",
                profileImageURL: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }];
    }
    static async createCredentialsToken(payload) {
        console.log(payload.email);
        return "mock-jwt-token";
    }
    static async verifyGoogleAuthToken(token) {
        console.log(token);
        return "mock-jwt-token";
    }
    static async changePassword(email, newPassword) {
        console.log(email);
        return true;
    }
}
exports.default = UserService;
//# sourceMappingURL=userservice.js.map