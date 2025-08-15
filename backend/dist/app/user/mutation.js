"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql
    verifyGoogleToken(token:String!): String
    createCredentialsToken(email:String!,password:String!,name:String!): String
    changePassword(email:String!,newPassword:String!):Boolean
`;
//# sourceMappingURL=mutation.js.map