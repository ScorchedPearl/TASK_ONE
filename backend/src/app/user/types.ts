export interface CreateCredentialsTokenType{
 email:String,
 password:String,
 name:String,
}
export interface VerifyCredentialsTokenType{
 email:String,
 password:String,
}

export const Types=`#graphql
type User{
 id:ID!
 email:String!
 name:String!
 profileImageURL:String
 createdAt:DateTime!
 updatedAt:DateTime
}
scalar DateTime
`