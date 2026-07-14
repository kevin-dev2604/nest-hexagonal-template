import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import config from "config";
import { JwtConfig } from "../../../../common/configs/global-types";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const jwtConfig = config.get<JwtConfig>('jwt');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || jwtConfig.accessSecret,
    });
  }

  async validate(payload) {
    // req.user에 바인딩될 유저 페이로드 반환
    return { userId: payload.userId };
  }
}