import { BadRequestException, ConflictException, Injectable, Request, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '../redis/redis.service';
import { randomUUID } from 'crypto';
import { EmailService } from '../notifications/email.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days


@Injectable()
export class AuthService {
  
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
    });

    const { passwordHash: _, ...safeUser } = user;

    const verificationToken = await this.emailVerificationService.createToken(user.id);
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await this.emailService.sendMail(
      dto.email,
      'Verify your E-Classroom account',
      `<p>Hi ${dto.fullName},</p><p>Welcome to E-Classroom! Please verify your email:</p><p><a href="${verificationLink}">Verify Email</a></p>`,
    );


    return safeUser;
  }

  async verifyEmail(token: string) {
    const userId = await this.emailVerificationService.consumeToken(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    await this.usersService.markEmailVerified(userId);
    return { verified: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Deliberately say the same thing whether or not the email exists —
      // otherwise this endpoint becomes a way to check which emails are registered.
      return { message: 'If that email exists, a reset link has been sent' };
    }

    const token = await this.passwordResetService.createToken(user.id);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.emailService.sendMail(
      user.email,
      'Reset your E-Classroom password',
      `<p>Click to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p><p>This link expires in 30 minutes.</p>`,
    );

    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.passwordResetService.consumeToken(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, passwordHash);
    await this.redis.del(`refresh:${userId}`); // force logout everywhere — a password reset should invalidate old sessions

    return { message: 'Password updated successfully' };
  }


  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.fullName, user.id, user.email, user.role);

  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; jti: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedJti = await this.redis.get(`refresh:${payload.sub}`);
    if (!storedJti || storedJti !== payload.jti) {
      throw new UnauthorizedException('Refresh token has been revoked or expired');
    }

    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Rotate: invalidate the old refresh token, issue a brand new pair
    return this.issueTokens(user.fullName, user.id, user.email, user.role);
  }


  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    return { message: 'Logged out' };
  }


  private async issueTokens(fullName: string,userId: string, email: string, role: string) {
    const accessToken = await this.jwtService.signAsync(
      { fullName: fullName, sub: userId, email, role },
      { expiresIn: '15m' },
    );

    const jti = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    await this.redis.set(`refresh:${userId}`, jti, 'EX', REFRESH_TOKEN_TTL_SECONDS);

    return { accessToken, refreshToken };
  }



  
}