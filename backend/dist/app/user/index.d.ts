export declare const User: {
    queries: string;
    mutations: string;
    resolvers: {
        queries: {
            verifyCredentialsToken: (parent: any, payload: import("./types").VerifyCredentialsTokenType) => Promise<string>;
            getCurrentUser: (parent: any, args: any, ctx: import("../auth_interface").GraphqlContext) => Promise<{
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
            getAllUser: (parent: any, args: any, ctx: import("../auth_interface").GraphqlContext) => Promise<{
                id: string;
                email: string;
                name: string;
                profileImageURL: null;
                createdAt: Date;
                updatedAt: Date;
            }[]>;
        };
        mutations: {
            createCredentialsToken: (parent: any, payload: import("./types").CreateCredentialsTokenType) => Promise<string>;
            verifyGoogleToken: (parent: any, { token }: {
                token: string;
            }) => Promise<string>;
            changePassword: (parent: any, { email, newPassword }: {
                email: string;
                newPassword: string;
            }) => Promise<boolean>;
        };
    };
    Types: string;
};
//# sourceMappingURL=index.d.ts.map