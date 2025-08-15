import { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "../user_interface"
class UserService{
  public static async verifyCredentialsToken(payload: VerifyCredentialsTokenType): Promise<string> {
  
    console.log(payload.email);
    return "mock-jwt-token";
  }
  
  public static async getCurrentUser(id: string) {
    console.log(id);
    return {
      id,
      email: "u",
      name: "T",
      profileImageURL: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  public static async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    console.log( email, otp);
    return true;
  }
  
  public static async getAllUser(id: string) {
    console.log(id);
    return [{
      id: "1",
      email: "user1@example.com",
      name: "User 1",
      profileImageURL: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }];
  }
  
  public static async createCredentialsToken(payload: CreateCredentialsTokenType): Promise<string> {
    console.log(payload.email);
    return "mock-jwt-token";
  }
  
  public static async verifyGoogleAuthToken(token: string): Promise<string> {
    console.log( token);
    return "mock-jwt-token";
  }
  
  public static async changePassword(email: string, newPassword: string): Promise<boolean> {
    console.log(email);
    return true;
  }
}

export default UserService;