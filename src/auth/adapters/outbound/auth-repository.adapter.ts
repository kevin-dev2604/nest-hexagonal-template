import { Inject, Injectable } from "@nestjs/common";
import { AuthRepositoryPort } from "../../ports/outbound/auth-repository.port";
import { JwtService } from "@nestjs/jwt";
import { TokenInfoDto } from "../inbound/dto/token-info.dto";
import { REDIS_CLIENT } from "../../../common/infrastructure/redis/redis.module";
import Redis from "ioredis";
import config from "config";
import { JwtConfig } from "../../../common/configs/global-types";

const jwtConfig = config.get<JwtConfig>('jwt');
const refreshTokenExpiresIn = +(process.env.JWT_REFRESH_TOKEN_EXPIRESIN || jwtConfig.refreshTokenExpiresIn);

@Injectable()
export class AuthRepositoryAdapter implements AuthRepositoryPort {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private jwtService: JwtService
  ) { }

  async generateToken(userId: number): Promise<TokenInfoDto> {
    const payload = { userId };


    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || jwtConfig.accessSecret,
        expiresIn: +(process.env.JWT_ACCESS_TOKEN_EXPIRESIN || jwtConfig.accessTokenExpiresIn),
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || jwtConfig.refreshSecret,
        expiresIn: refreshTokenExpiresIn,
      })
    ]);

    return new TokenInfoDto(accessToken, refreshToken);
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const key = `user:${userId}:refresh_token`;
    await this.redis.set(key, token, 'EX', refreshTokenExpiresIn);
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    const key = `user:${userId}:refresh_token`;
    return await this.redis.get(key);
  }

  async removeRefreshToken(userId: number): Promise<void> {
    const key = `user:${userId}:refresh_token`;
    await this.redis.del(key);
  }

}