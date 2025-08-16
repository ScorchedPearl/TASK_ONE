import nodemailer from 'nodemailer';
import crypto from 'crypto';
import RedisService from './redisservice';
import * as dotenv from 'dotenv';

dotenv.config();


interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter!: nodemailer.Transporter;
  private redisService: RedisService;
  private readonly EMAIL_VERIFICATION_PREFIX = 'email_verify:';
  private readonly EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60; 

  private constructor() {
    this.redisService = RedisService.getInstance();
    this.initializeTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'pearlautherizer@gmail.com',
        pass: process.env.APP_PASSWORD 
      }
    });
  }

  public async sendVerificationEmail(email: string, name: string): Promise<string> {
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationData = {
        email,
        name,
        token: verificationToken,
        expiresAt: new Date(Date.now() + this.EMAIL_VERIFICATION_EXPIRY * 1000)
      };

      const redisKey = `${this.EMAIL_VERIFICATION_PREFIX}${verificationToken}`;
      await this.redisService.setJson(redisKey, verificationData, this.EMAIL_VERIFICATION_EXPIRY);

      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

      const emailTemplate = this.getVerificationEmailTemplate(name, verificationUrl);

      await this.transporter.sendMail({
        from: `"GeekHeaven" <${process.env.EMAIL_USER || 'noreply@geekheaven.com'}>`,
        to: email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html
      });

      return verificationToken;
    } catch (error) {
      console.error('Send verification email failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  public async verifyEmailToken(token: string): Promise<{ email: string; name: string } | null> {
    try {
      const redisKey = `${this.EMAIL_VERIFICATION_PREFIX}${token}`;
      const verificationData = await this.redisService.getJson<{
        email: string;
        name: string;
        token: string;
        expiresAt: string;
      }>(redisKey);

      if (!verificationData) {
        return null;
      }

      if (new Date(verificationData.expiresAt) < new Date()) {
        await this.redisService.del(redisKey);
        return null;
      }

      await this.redisService.del(redisKey);

      return {
        email: verificationData.email,
        name: verificationData.name
      };
    } catch (error) {
      console.error('Verify email token failed:', error);
      return null;
    }
  }

  public async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      const emailTemplate = this.getPasswordResetEmailTemplate(name, resetUrl);

      await this.transporter.sendMail({
        from: `"GeekHeaven" <${process.env.EMAIL_USER || 'noreply@geekheaven.com'}>`,
        to: email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html
      });
    } catch (error) {
      console.error('Send password reset email failed:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): EmailTemplate {
    return {
      subject: 'Verify your GeekHeaven account',
      text: `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nGeekHeaven Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">GeekHeaven</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 20px;">Hi ${name}!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                Welcome to GeekHeaven! Please verify your email address to complete your account setup.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #999999; font-size: 14px; line-height: 1.5;">
                This link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
              <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px;">
                <p style="color: #999999; font-size: 12px; text-align: center;">
                  © 2025 GeekHeaven. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): EmailTemplate {
    return {
      subject: 'Reset your GeekHeaven password',
      text: `Hi ${name},\n\nYou requested to reset your password. Click the link below to set a new password:\n${resetUrl}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nGeekHeaven Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">GeekHeaven</h1>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #333333; margin-bottom: 20px;">Hi ${name}!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                You requested to reset your password. Click the button below to set a new password.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #999999; font-size: 14px; line-height: 1.5;">
                This link will expire in 30 minutes. If you didn't request this, please ignore this email.
              </p>
              <div style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 20px;">
                <p style="color: #999999; font-size: 12px; text-align: center;">
                  © 2025 GeekHeaven. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;