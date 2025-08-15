import type { GraphqlContext, User } from "../auth_interface"
import UserService from "../services/userservice";
import type { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "./types";
const queries={
 verifyCredentialsToken:async(parent:any,payload:VerifyCredentialsTokenType)=>{
  const session=UserService.verifyCredentialsToken(payload);
  return session;
 },
 getCurrentUser:async(parent:any,args:any,ctx:GraphqlContext)=>{
  const id=ctx.user?.id;
  if(!id){
   throw new Error("Unauthorized");
  }
  const user=await UserService.getCurrentUser(id);
  return user;
 },
 sendOtpEmail:async(parent:any,{email,otp}:{email:string,otp:string})=>{
  const sent= UserService.sendOtpEmail(email,otp);
  return sent;
 },
 getAllUser:async(parent:any,args:any,ctx:GraphqlContext)=>{
  if(!ctx.user||!ctx.user.id) throw new Error("User not authenticated");
  const users=await UserService.getAllUser(ctx.user.id);
  return users;
 }
}
const mutations={
 createCredentialsToken:async(parent:any,payload:CreateCredentialsTokenType)=>{
  const session=UserService.createCredentialsToken(payload);
  return session;
 },
 verifyGoogleToken:async(parent:any,{token}:{token:string})=>{
  const session=UserService.verifyGoogleAuthToken(token);
  return session;
 },
 changePassword:async(parent:any,{email,newPassword}:{email:string,newPassword:string})=>{
  const success=await UserService.changePassword(email,newPassword);
  return success;
 },
}
export const resolvers={queries,mutations};