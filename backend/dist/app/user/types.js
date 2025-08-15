"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Types = void 0;
exports.Types = `#graphql
type User{
 id:ID!
 email:String!
 name:String!
 profileImageURL:String
 createdAt:DateTime!
 updatedAt:DateTime
}
scalar DateTime
`;
//# sourceMappingURL=types.js.map