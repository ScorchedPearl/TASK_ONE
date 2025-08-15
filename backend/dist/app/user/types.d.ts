export interface CreateCredentialsTokenType {
    email: String;
    password: String;
    name: String;
}
export interface VerifyCredentialsTokenType {
    email: String;
    password: String;
}
export declare const Types = "#graphql\ntype User{\n id:ID!\n email:String!\n name:String!\n profileImageURL:String\n createdAt:DateTime!\n updatedAt:DateTime\n}\nscalar DateTime\n";
//# sourceMappingURL=types.d.ts.map