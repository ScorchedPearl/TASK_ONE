import type { GraphqlContext } from "../auth_interface";
import type { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "./types";
export declare const resolvers: {
    queries: {
        verifyCredentialsToken: (parent: any, payload: VerifyCredentialsTokenType) => Promise<string>;
        getCurrentUser: (parent: any, args: any, ctx: GraphqlContext) => Promise<{
            id: string;
            email: string;
            name: string;
            profileImageURL: null;
            createdAt: Date;
            updatedAt: Date;
        }>;
        sendOtpEmail: (parent: any, { email, otp }: {
            email: string;
            otp: string;
        }) => Promise<boolean>;
        getAllUser: (parent: any, args: any, ctx: GraphqlContext) => Promise<{
            id: string;
            email: string;
            name: string;
            profileImageURL: null;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
    };
    mutations: {
        createCredentialsToken: (parent: any, payload: CreateCredentialsTokenType) => Promise<string>;
        verifyGoogleToken: (parent: any, { token }: {
            token: string;
        }) => Promise<string>;
        changePassword: (parent: any, { email, newPassword }: {
            email: string;
            newPassword: string;
        }) => Promise<boolean>;
    };
};
//# sourceMappingURL=resolver.d.ts.map