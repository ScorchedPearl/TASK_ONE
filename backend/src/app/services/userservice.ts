import { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "../user/types";

class UserService{
  public static verifyCredentialsToken(payload: VerifyCredentialsTokenType) {
  }
  public static getCurrentUser(id: string) {
  }
  public static sendOtpEmail(email: string, otp: string) {
  }
  public static getAllUser(id: string) {
  }
  public static createCredentialsToken(payload: CreateCredentialsTokenType) {
  }
  public static verifyGoogleAuthToken(token: string) {
  }
  public static changePassword(email: string, newPassword: string) {
  }
}

export default UserService;