import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    const user = await this.usersService.create(registerDto);
    const { password, refreshToken, ...result } = user.toObject();
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Username hoặc password không đúng');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username hoặc password không đúng');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.username, user.role);

    // Lưu refresh token vào database
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refresh_token,
    );

    return {
      ...tokens,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findByIdWithRefreshToken(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.username,
      user.role,
    );

    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refresh_token,
    );

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Đăng xuất thành công' };
  }

  private async generateTokens(userId: string, username: string, role: string) {
    const payload = { sub: userId, username, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'your_very_long_and_random_secret_key_here_12345',
        expiresIn: '15m', // Access token ngắn
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'another_random_secret_for_refresh_token',
        expiresIn: '7d', // Refresh token dài hơn
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}