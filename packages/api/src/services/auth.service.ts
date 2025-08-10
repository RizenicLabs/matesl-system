import { prisma } from '@matesl/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createSuccessResponse, createErrorResponse } from '@matesl/shared';
import { UserRole } from '@matesl/shared';

export class AuthService {
  private jwtSecret: string;
  private jwtExpire: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtExpire = process.env.JWT_EXPIRE || '15m';
  }

  async register(data: {
    email: string;
    name: string;
    password: string;
  }) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return createErrorResponse('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: UserRole.CITIZEN,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate JWT
      const token = this.generateToken(user.id);

      return createSuccessResponse({
        user,
        token,
      }, 'User registered successfully');
    } catch (error) {
      console.error('Registration error:', error);
      return createErrorResponse('Registration failed');
    }
  }

  async login(email: string, password: string) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        return createErrorResponse('Invalid email or password');
      }

      if (!user.isActive) {
        return createErrorResponse('Account is deactivated');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password!);
      if (!isValidPassword) {
        return createErrorResponse('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return createSuccessResponse({
        user: userWithoutPassword,
        token,
      }, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return createErrorResponse('Login failed');
    }
  }

  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return createErrorResponse('User not found');
      }

      return createSuccessResponse(user);
    } catch (error) {
      console.error('Get user error:', error);
      return createErrorResponse('Failed to fetch user');
    }
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          updatedAt: true,
        },
      });

      return createSuccessResponse(user, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return createErrorResponse('Failed to update profile');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        return createErrorResponse('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password!);
      if (!isValidPassword) {
        return createErrorResponse('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return createSuccessResponse(null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return createErrorResponse('Failed to change password');
    }
  }

  async deleteAccount(userId: string) {
    try {
      // In a real app, you might want to anonymize data instead of deleting
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          email: `deleted_${userId}@deleted.local`,
          name: 'Deleted User',
        },
      });

      return createSuccessResponse(null, 'Account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      return createErrorResponse('Failed to delete account');
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: this.jwtExpire });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      return decoded;
    } catch {
      return null;
    }
  }
}