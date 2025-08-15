import type { GraphqlContext } from "../auth_interface";
import type { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "./types";
export declare const resolvers: {
    queries: {
        verifyCredentialsToken: (parent: any, payload: VerifyCredentialsTokenType) => Promise<void>;
        getCurrentUser: (parent: any, args: any, ctx: GraphqlContext) => Promise<void>;
        sendOtpEmail: (parent: any, { email, otp }: {
            email: string;
            otp: string;
        }) => Promise<void>;
        getAllUser: (parent: any, args: any, ctx: GraphqlContext) => Promise<void>;
    };
    mutations: {
        createCredentialsToken: (parent: any, payload: CreateCredentialsTokenType) => Promise<void>;
        verifyGoogleToken: (parent: any, { token }: {
            token: string;
        }) => Promise<void>;
        changePassword: (parent: any, { email, newPassword }: {
            email: string;
            newPassword: string;
        }) => Promise<void>;
    };
};
//# sourceMappingURL=resolver.d.ts.map