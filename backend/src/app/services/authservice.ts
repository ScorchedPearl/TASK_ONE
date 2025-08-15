import bcrypt from 'bcrypt';
import crypto from 'crypto';
import axios from 'axios';
import User from '../schema/user';
import TokenService from './tokenservice';
import RedisService from './redisservice';
import type { User as UserType, TokenPair, GoogleTokenResult, AuthResult, PasswordResetToken } from '../auth_interface';
import type { CreateCredentialsTokenType, VerifyCredentialsTokenType } from '../user_interface';
import { JWTError } from '../errors/jwterror';
import { JWTErrorType } from '../auth_interface';



class AuthService {
  private static instance: AuthService;
  private readonly tokenService: TokenService;
  private readonly redisService: RedisService;
  private readonly saltRounds = 12;
  private readonly RESET_TOKEN_PREFIX = 'password_reset:';
  private readonly RESET_TOKEN_EXPIRY = 30 * 60; 
  private constructor() {
    this.tokenService = TokenService.getInstance();
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async registerWithCredentials(payload: CreateCredentialsTokenType): Promise<AuthResult> {
    try {
      const { email, password, name } = payload;
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'User already exists with this email',
          409
        );
      }

      const hashedPassword = await this.hashPassword(password.toString());
      const newUser = new User({
        email: email.toLowerCase(),
        name: name.toString(),
        password: hashedPassword,
        provider: 'credentials',
        isEmailVerified: false
      });

      const savedUser = await newUser.save();
      const user: UserType = {
        id: savedUser._id.toString(),
        email: savedUser.email,
        name: savedUser.name,
        profileImage: savedUser.profileImage
      };

      const tokens = await this.tokenService.generateTokenPair(user);

      return { user, tokens };
    } catch (error) {
      if (error instanceof JWTError) {
        throw error;
      }
      console.error('Registration failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Registration failed',
        500
      );
    }
  }
  public async signInWithCredentials(payload: VerifyCredentialsTokenType): Promise<AuthResult> {
    try {
      const { email, password } = payload;
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        provider: 'credentials'
      });

      if (!user || !user.password) {
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'Invalid email or password',
          401
        );
      }

      const isPasswordValid = await this.verifyPassword(password.toString(), user.password);
      if (!isPasswordValid) {
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'Invalid email or password',
          401
        );
      }

      const userType: UserType = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      };

      const tokens = await this.tokenService.generateTokenPair(userType);

      return { user: userType, tokens };
    } catch (error) {
      if (error instanceof JWTError) {
        throw error;
      }
      console.error('Sign in failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Sign in failed',
        500
      );
    }
  }

  public async signInWithGoogle(googleToken: string): Promise<AuthResult> {
    try {
      const googleUser = await this.verifyGoogleToken(googleToken);
      let user = await User.findOne({
        $or: [
          { email: googleUser.email },
          { googleId: googleUser.sub }
        ]
      });

      if (user) {
        if (!user.googleId && googleUser.sub) {
          user.googleId = googleUser.sub;
          user.provider = 'google';
          user.isEmailVerified = googleUser.email_verified === 'true';
          if (googleUser.picture) {
            user.profileImage = googleUser.picture;
          }
          await user.save();
        }
      } else {
        user = new User({
          email: googleUser.email,
          name: googleUser.name || googleUser.given_name,
          provider: 'google',
          googleId: googleUser.sub,
          isEmailVerified: googleUser.email_verified === 'true',
          profileImage: googleUser.picture
        });
        await user.save();
      }
      const userType: UserType = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      };

      const tokens = await this.tokenService.generateTokenPair(userType);

      return { user: userType, tokens };
    } catch (error) {
      if (error instanceof JWTError) {
        throw error;
      }
      console.error('Google sign in failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Google authentication failed',
        500
      );
    }
  }
  public async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      return await this.tokenService.refreshAccessToken(refreshToken);
    } catch (error) {
      if (error instanceof JWTError) {
        throw error;
      }
      console.error('Token refresh failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Token refresh failed',
        401
      );
    }
  }
  public async getUserById(userId: string): Promise<UserType | null> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      };
    } catch (error) {
      console.error('Get user failed:', error);
      return null;
    }
  }

  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user || user.provider !== 'credentials' || !user.password) {
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'Cannot change password for this account',
          400
        );
      }

      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'Current password is incorrect',
          401
        );
      }

      const hashedNewPassword = await this.hashPassword(newPassword);
      user.password = hashedNewPassword;
      await user.save();

      return true;
    } catch (error) {
      if (error instanceof JWTError) {
        throw error;
      }
      console.error('Change password failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Failed to change password',
        500
      );
    }
  }

  public async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        provider: 'credentials'
      });

      if (!user) {
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'If this email exists, you will receive a reset link',
          200
        );
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenData: PasswordResetToken = {
        userId: user._id.toString(),
        token: resetToken,
        expiresAt: new Date(Date.now() + this.RESET_TOKEN_EXPIRY * 1000)
      };

      const redisKey = `${this.RESET_TOKEN_PREFIX}${resetToken}`;
      await this.redisService.setJson(redisKey, tokenData, this.RESET_TOKEN_EXPIRY);

      return resetToken;
    } catch (error) {
      if (error instanceof JWTError) {
        throw error;
      }
      console.error('Generate reset token failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Failed to generate reset token',
        500
      );
    }
  }

  public async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
    try {
      const redisKey = `${this.RESET_TOKEN_PREFIX}${resetToken}`;
      const tokenData = await this.redisService.getJson<PasswordResetToken>(redisKey);
      
      if (!tokenData) {
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'Invalid or expired reset token',
          400
        );
      }

      if (new Date(tokenData.expiresAt) < new Date()) {
        await this.redisService.del(redisKey);
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'Invalid or expired reset token',
          400
        );
      }

      const user = await User.findById(tokenData.userId);
      if (!user || user.provider !== 'credentials') {
        await this.redisService.del(redisKey);
        throw new JWTError(
          JWTErrorType.INVALID_TOKEN,
          'Invalid reset token',
          400
        );
      }

      const hashedPassword = await this.hashPassword(newPassword);
      user.password = hashedPassword;
      await user.save();

      await this.redisService.del(redisKey);

      return true;
    } catch (error) {
      if (error instanceof JWTError) {
        throw error;
      }
      console.error('Reset password failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Failed to reset password',
        500
      );
    }
  }
  private async verifyGoogleToken(token: string): Promise<GoogleTokenResult> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`
      );

      if (response.status !== 200) {
        throw new Error('Invalid Google token');
      }

      return response.data as GoogleTokenResult;
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new JWTError(
        JWTErrorType.INVALID_TOKEN,
        'Invalid Google token',
        401
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  public async getUserResetTokens(userId: string): Promise<string[]> {
    try {
      const pattern = `${this.RESET_TOKEN_PREFIX}*`;
      const keys = await this.redisService.keys(pattern);
      const userTokens: string[] = [];

      for (const key of keys) {
        const tokenData = await this.redisService.getJson<PasswordResetToken>(key);
        if (tokenData && tokenData.userId === userId) {
          userTokens.push(tokenData.token);
        }
      }

      return userTokens;
    } catch (error) {
      console.error('Get user reset tokens failed:', error);
      return [];
    }
  }
  public async revokeUserResetTokens(userId: string): Promise<number> {
    try {
      const pattern = `${this.RESET_TOKEN_PREFIX}*`;
      const keys = await this.redisService.keys(pattern);
      let revokedCount = 0;

      for (const key of keys) {
        const tokenData = await this.redisService.getJson<PasswordResetToken>(key);
        if (tokenData && tokenData.userId === userId) {
          await this.redisService.del(key);
          revokedCount++;
        }
      }

      return revokedCount;
    } catch (error) {
      console.error('Revoke user reset tokens failed:', error);
      return 0;
    }
  }

  public async isResetTokenValid(resetToken: string): Promise<boolean> {
    try {
      const redisKey = `${this.RESET_TOKEN_PREFIX}${resetToken}`;
      const tokenData = await this.redisService.getJson<PasswordResetToken>(redisKey);
      
      if (!tokenData) {
        return false;
      }

      return new Date(tokenData.expiresAt) > new Date();
    } catch (error) {
      console.error('Check reset token validity failed:', error);
      return false;
    }
  }

  public async cleanupExpiredResetTokens(): Promise<number> {
    try {
      const pattern = `${this.RESET_TOKEN_PREFIX}*`;
      const keys = await this.redisService.keys(pattern);
      let cleanedCount = 0;
      const now = new Date();

      for (const key of keys) {
        const tokenData = await this.redisService.getJson<PasswordResetToken>(key);
        if (tokenData && new Date(tokenData.expiresAt) < now) {
          await this.redisService.del(key);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Cleanup expired tokens failed:', error);
      return 0;
    }
  }
}

export default AuthService;