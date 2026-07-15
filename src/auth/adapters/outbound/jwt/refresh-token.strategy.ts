import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { REDIS_CLIENT } from "../../../../common/infrastructure/redis/redis.module";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private configService: ConfigService,
  ) {
    super({
      // 1. 헤더에서 Refresh Token 추출 (예: x-refresh-token: <token>)
      jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
      passReqToCallback: true, // validate 메서드에서 req 객체에 접근할 수 있도록 설정
    })
  }

  async validate(req: Request, payload) {
    const refreshToken = req.get('x-refresh-token')?.trim();

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh Token not exists.");
    }

    const savedToken = await this.redis.get(`user:${payload.userId}:refresh_token`);

    if (refreshToken !== savedToken) {
      throw new UnauthorizedException("Invalid refresh Token");
    }

    return { userId: payload.userId, refreshToken };
  }
}