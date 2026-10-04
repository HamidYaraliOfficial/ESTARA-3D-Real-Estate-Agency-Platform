import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: "CUSTOMER",
      },
    });

    return this.issueTokens(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return this.issueTokens(user.id, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret",
      });
      return this.issueTokens(payload.sub, payload.role);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private async issueTokens(userId: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret",
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, role },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret",
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
      },
    );
    return { accessToken, refreshToken };
  }
}
