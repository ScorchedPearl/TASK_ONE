"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const userservice_1 = __importDefault(require("../services/userservice"));
const queries = {
    verifyCredentialsToken: async (parent, payload) => {
        const session = userservice_1.default.verifyCredentialsToken(payload);
        return session;
    },
    getCurrentUser: async (parent, args, ctx) => {
        const id = ctx.user?.id;
        if (!id) {
            throw new Error("Unauthorized");
        }
        const user = await userservice_1.default.getCurrentUser(id);
        return user;
    },
    sendOtpEmail: async (parent, { email, otp }) => {
        const sent = userservice_1.default.sendOtpEmail(email, otp);
        return sent;
    },
    getAllUser: async (parent, args, ctx) => {
        if (!ctx.user || !ctx.user.id)
            throw new Error("User not authenticated");
        const users = await userservice_1.default.getAllUser(ctx.user.id);
        return users;
    }
};
const mutations = {
    createCredentialsToken: async (parent, payload) => {
        const session = userservice_1.default.createCredentialsToken(payload);
        return session;
    },
    verifyGoogleToken: async (parent, { token }) => {
        const session = userservice_1.default.verifyGoogleAuthToken(token);
        return session;
    },
    changePassword: async (parent, { email, newPassword }) => {
        const success = await userservice_1.default.changePassword(email, newPassword);
        return success;
    },
};
exports.resolvers = { queries, mutations };
//# sourceMappingURL=resolver.js.map