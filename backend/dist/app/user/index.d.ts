export declare const User: {
    queries: string;
    mutations: string;
    resolvers: {
        queries: {
            verifyCredentialsToken: (parent: any, payload: import("./types").VerifyCredentialsTokenType) => Promise<void>;
            getCurrentUser: (parent: any, args: any, ctx: import("../auth_interface").GraphqlContext) => Promise<void>;
            sendOtpEmail: (parent: any, { email, otp }: {
                email: string;
                otp: string;
            }) => Promise<void>;
            getAllUser: (parent: any, args: any, ctx: import("../auth_interface").GraphqlContext) => Promise<void>;
        };
        mutations: {
            createCredentialsToken: (parent: any, payload: import("./types").CreateCredentialsTokenType) => Promise<void>;
            verifyGoogleToken: (parent: any, { token }: {
                token: string;
            }) => Promise<void>;
            changePassword: (parent: any, { email, newPassword }: {
                email: string;
                newPassword: string;
            }) => Promise<void>;
        };
    };
    Types: string;
};
//# sourceMappingURL=index.d.ts.map