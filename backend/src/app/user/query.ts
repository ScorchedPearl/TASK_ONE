export const queries=`#graphql
 verifyCredentialsToken(email:String!,password:String!): String
 getCurrentUser: User
 getAllUser:[User]
 sendOtpEmail(email:String!,otp:String!):Boolean
`