import User, { IUser } from '../schema/user';
import AuthService from './authservice';
import type { CreateCredentialsTokenType, VerifyCredentialsTokenType } from "../user_interface";

class UserService {
  private static authService = AuthService.getInstance();
  public static async verifyCredentialsToken(payload: VerifyCredentialsTokenType): Promise<string> {
    try {
      const result = await this.authService.signInWithCredentials(payload);
      return result.tokens.accessToken;
    } catch (error) {
      console.error('Verify credentials failed:', error);
      throw error;
    }
  }
  public static async getCurrentUser(id: string) {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImageURL: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }
  public static async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
      console.log(`OTP for ${email}: ${otp}`);
      

      return true;
    } catch (error) {
      console.error('Send OTP email failed:', error);
      return false;
    }
  }
  
  public static async getAllUsers(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;
      let query: any = {};

      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      return {
        users: users.map(user => ({
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          profileImageURL: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          provider: user.provider,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Get all users failed:', error);
      throw error;
    }
  }
  public static async createCredentialsToken(payload: CreateCredentialsTokenType): Promise<string> {
    try {
      const result = await this.authService.registerWithCredentials(payload);
      return result.tokens.accessToken;
    } catch (error) {
      console.error('Create credentials token failed:', error);
      throw error;
    }
  }
  
  public static async verifyGoogleAuthToken(token: string): Promise<string> {
    try {
      const result = await this.authService.signInWithGoogle(token);
      return result.tokens.accessToken;
    } catch (error) {
      console.error('Verify Google auth token failed:', error);
      throw error;
    }
  }
  
  public static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<boolean> {
    try {
      return await this.authService.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  public static async updateUserProfile(
    userId: string, 
    updateData: { name?: string; profileImage?: string }
  ) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          ...updateData,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImageURL: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Update user profile failed:', error);
      throw error;
    }
  }

  public static async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(userId);
      return !!result;
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }
  public static async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImageURL: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error('Get user by email failed:', error);
      throw error;
    }
  }


  public static async verifyUserEmail(userId: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndUpdate(
        userId,
        { isEmailVerified: true },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Verify user email failed:', error);
      return false;
    }
  }

  public static async getUserStats() {
    try {
      const [
        totalUsers,
        credentialUsers,
        googleUsers,
        verifiedUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ provider: 'credentials' }),
        User.countDocuments({ provider: 'google' }),
        User.countDocuments({ isEmailVerified: true })
      ]);

      return {
        totalUsers,
        credentialUsers,
        googleUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers
      };
    } catch (error) {
      console.error('Get user stats failed:', error);
      throw error;
    }
  }
}

export default UserService;