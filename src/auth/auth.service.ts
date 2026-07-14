import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthUseCase } from "./ports/inbound/auth.usecase";
import { UserInfoRepositoryPort } from "./ports/outbound/user-info-repository.port";
import { AuthRepositoryPort } from "./ports/outbound/auth-repository.port";
import { CreateUserDto } from "./adapters/inbound/dto/create-user.dto";
import { User } from "./domain/user.model";
import { AuthCredentialDto } from "./adapters/inbound/dto/auth-credential.dto";
import { TokenInfoDto } from "./adapters/inbound/dto/token-info.dto";
import * as bcrypt from "bcrypt";
import { LoginHistory } from "./domain/login-history.model";
import { LoginHistoryRepositoryPort } from "./ports/outbound/login-history-repository.port";
import { JwtPort } from "./ports/outbound/jwt.port";

@Injectable()
export class AuthService implements AuthUseCase {
  constructor(
    private readonly userRepositoryPort: UserInfoRepositoryPort,
    private readonly loginHistoryRepositoryPort: LoginHistoryRepositoryPort,
    private readonly authRepositoryPort: AuthRepositoryPort,
    private readonly jwtPort: JwtPort,
  ) { }

  async signup(createUserDto: CreateUserDto): Promise<void> {
    const signupProps = {
      loginId: createUserDto.loginId,
      loginPw: await this.encode(createUserDto.loginPw),
      username: createUserDto.username
    }
    const user: User = new User(signupProps);
    await this.userRepositoryPort.createUser(user);
  }

  async signin(authCredentialDto: AuthCredentialDto): Promise<TokenInfoDto> {
    let tokenInfo: TokenInfoDto;
    const { loginId, loginPw } = authCredentialDto;
    const user = await this.userRepositoryPort.getUserInfo(loginId);

    if (await this.validatePassword(loginPw, user)) {
      if (user.provider) {
        await this.saveHistory(loginId, false, user.userId!);
        throw new ConflictException({
          statusCode: 409,
          errorCode: 'AUTH_PROVIDER_MISMATCH',
          message: `${user.provider} 계정으로 가입된 이메일입니다. 해당 플랫폼을 통해 다시 로그인하시기 바랍니다.`,
          registeredProvider: user.provider, // 🔥 중요: 프론트가 판단할 수 있게 원본 공급자를 넘겨줌
        });

      } else {
        tokenInfo = await this.processSignIn(user.loginId, user.userId!);
      }

    } else {
      await this.saveHistory(loginId, false, user.userId!);
      throw new UnauthorizedException('login failed');
    }

    return tokenInfo;
  }

  async signinOAuth(oauthUser: any, provider: string): Promise<TokenInfoDto> {
    const { email, username, picture } = oauthUser;

    // 1. 기존에 가입된 소셜 유저가 있는지 이메일과 공급자 등록여부로 조회
    let user: User | null = await this.userRepositoryPort.getSocialUserInfo(email);

    if (!user) {
      // 2. 없다면 신규 소셜 유저로 가입 처리
      const signupOauthProps = {
        loginId: email,
        loginPw: await this.encode('social-login'),
        username,
        provider,
        email,
        picture
      }
      const newUser: User = new User(signupOauthProps);
      await this.userRepositoryPort.createUser(newUser);

      user = await this.userRepositoryPort.getSocialUserInfo(email);

    } else {
      // 2. 존재하는데, 방금 로그인 시도한 소셜(currentProvider)과 기존 가입 소셜(provider)이 다른 경우!
      if (user.provider !== provider) {
        throw new ConflictException({
          statusCode: 409,
          errorCode: 'AUTH_PROVIDER_MISMATCH',
          message: `이미 ${user.provider} 계정으로 가입된 이메일입니다.`,
          registeredProvider: user.provider, // 🔥 중요: 프론트가 판단할 수 있게 원본 공급자를 넘겨줌
        });
      }

    }

    // 3. 구현 완료하신 기존 JWT 발급 로직(Access/Refresh Token) 그대로 가동!
    return await this.processSignIn(user!.loginId, user!.userId!);
  }

  async refresh(userId: number): Promise<TokenInfoDto> {
    let tokenInfo = await this.jwtPort.generateToken(userId);

    await this.authRepositoryPort.saveRefreshToken(userId, tokenInfo.refreshToken);

    return tokenInfo;
  }

  async logout(userId: number): Promise<void> {
    await this.authRepositoryPort.removeRefreshToken(userId);
  }

  private async encode(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  private async validatePassword(password: string, user: User): Promise<boolean> {
    let isValid = await bcrypt.compare(password, user.encodedPassword);
    return isValid;
  }

  private async saveHistory(loginId: string, isSuccess: boolean, createdBy: number): Promise<void> {
    await this.loginHistoryRepositoryPort.saveHistory(
      new LoginHistory({ loginId, isSuccess, createdBy })
    );
  }

  private async processSignIn(loginId: string, userId: number): Promise<TokenInfoDto> {
    const tokenInfo = await this.jwtPort.generateToken(userId);

    await this.authRepositoryPort.saveRefreshToken(userId!, tokenInfo.refreshToken);
    await this.saveHistory(loginId, true, userId!);

    return tokenInfo;
  }

}