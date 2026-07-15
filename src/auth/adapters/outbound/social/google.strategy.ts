import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
  ) {
    const clientID = configService.get<string>('oauth.google.clientId') as string;
    const clientSecret = configService.get<string>('oauth.google.clientSecret') as string;

    super({
      clientID,
      clientSecret,
      callbackURL: 'http://localhost:3000/auth/signin/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
    const { name, emails, photos } = profile;

    const user = {
      username: `${name?.givenName}${name?.middleName ? " " + name.middleName : ""}${name?.familyName ? " " + name.familyName : ""}`,
      email: emails![0].value,
      picture: photos![0].value,
      accessToken, // 필요 시 보관
    };

    done(null, user);
  }
}