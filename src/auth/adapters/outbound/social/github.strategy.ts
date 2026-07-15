import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-github2";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
  ) {
    const clientID = configService.get<string>('oauth.github.clientId') as string;
    const clientSecret = configService.get<string>('oauth.github.clientSecret') as string;

    super({
      clientID,
      clientSecret,
      callbackURL: 'http://localhost:3000/auth/signin/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
    const { username, photos } = profile;
    let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

    // 깃허브 비공개 이메일(Private Email) 함정 카드 해결
    if (!email) {
      try {
        const response = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        // 주요(primary) 이메일이거나 인증된 이메일을 우선 선택
        const primaryEmailObj = response.data.find((e: any) => e.primary);
        email = primaryEmailObj ? primaryEmailObj.email : response.data[0]?.email;
      } catch (error) {
        return done(error, null);
      }
    }

    const user = {
      email,
      username,
      picture: photos && photos[0] ? photos[0].value : null,
      accessToken,
    };

    done(null, user);
  }
}