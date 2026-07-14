import { Module } from '@nestjs/common';
import { AuthController } from './adapters/inbound/auth.controller';
import { AuthUseCase } from './ports/inbound/auth.usecase';
import { AuthService } from './auth.service';
import { AuthRepositoryPort } from './ports/outbound/auth-repository.port';
import { AuthRepositoryAdapter } from './adapters/outbound/auth-repository.adapter';
import { JwtPort } from './ports/outbound/jwt.port';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './adapters/outbound/jwt/access-token.strategy';
import config from 'config';
import { JwtConfig } from '../common/configs/global-types';
import { RefreshTokenStrategy } from './adapters/outbound/jwt/refresh-token.strategy';
import { LoginHistoryRepositoryAdapter } from './adapters/outbound/login-history.adapter';
import { LoginHistoryRepositoryPort } from './ports/outbound/login-history-repository.port';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginHistoryEntiry } from './adapters/outbound/orm/login-history-orm.entity';
import { UserInfoRepositoryAdapter } from './adapters/outbound/user-info-repository.adapter';
import { UserInfoRepositoryPort } from './ports/outbound/user-info-repository.port';
import { UserInfoEntity } from './adapters/outbound/orm/user-info-orm.entity';
import { GoogleStrategy } from './adapters/outbound/social/google.strategy';
import { GithubStrategy } from './adapters/outbound/social/github.strategy';
import { GoogleOauthGuard } from './adapters/inbound/guards/google-oauth.guard';
import { GithubOauthGuard } from './adapters/inbound/guards/github-oauth.guard';
import { JwtAccessGuard } from './adapters/inbound/guards/jwt-access.guard';
import { JwtRefreshGuard } from './adapters/inbound/guards/jwt-refresh.guard';

const jwtConfig = config.get<JwtConfig>('jwt');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // secret: process.env.JWT_ACCESS_SECRET || jwtConfig.accessSecret,
      // signOptions: {
      //   expiresIn: +(process.env.JWT_ACCESS_TOKEN_EXPIRESIN || jwtConfig.accessTokenExpiresIn)
      // }
    }),

    // 💡 이 부분이 반드시 들어가 있어야 Nest.js가 (Domain의)Repository를 생성해 줍니다!
    TypeOrmModule.forFeature([UserInfoEntity, LoginHistoryEntiry]),
  ],
  controllers: [AuthController],
  providers: [
    // =======================================================
    // 1. Outbound 영역 (Driven Port & Adapter)
    // =======================================================
    // [실체 인스턴스] 실제 DB를 찌르는 어댑터 클래스를 먼저 등록합니다.
    UserInfoRepositoryAdapter,
    // [상황 A/B 지원] 자식 포트 타입으로 주입받는 곳에 어댑터를 연결
    {
      provide: UserInfoRepositoryPort,
      useExisting: UserInfoRepositoryAdapter,
    },

    AuthRepositoryAdapter,
    // [상황 A/B 지원] 자식 포트 타입으로 주입받는 곳에 어댑터를 연결
    {
      provide: AuthRepositoryPort,
      useExisting: AuthRepositoryAdapter,
    },
    // [상황 B 지원] 부모 포트 타입으로 주입받는 곳에도 '동일한' 어댑터 인스턴스를 연결
    {
      provide: JwtPort,
      useExisting: AuthRepositoryAdapter,
    },

    LoginHistoryRepositoryAdapter,
    // [상황 A/B 지원] 자식 포트 타입으로 주입받는 곳에 어댑터를 연결
    {
      provide: LoginHistoryRepositoryPort,
      useExisting: LoginHistoryRepositoryAdapter,
    },

    // =======================================================
    // 2. Inbound 영역 (Driving UseCase & Service)
    // =======================================================
    // [실체 인스턴스] 비즈니스 로직을 수행하는 서비스를 등록합니다.
    // 💡 이때 AuthService 내부 생성자에서 위에서 정의한 포트들을 안전하게 주입받습니다.
    AuthService,

    // [상황 A/B 지원] 자식 유즈케이스 타입으로 주입받는 곳에 서비스를 연결
    {
      provide: AuthUseCase,
      useExisting: AuthService,
    },
    // [상황 B 지원] 공통/부모 유즈케이스 타입으로 주입받는 곳에도 '동일한' 서비스 인스턴스를 연결 (지금은 미사용)

    // JWT 및 OAuth (Google, Github) 로그인 연계 관련
    AccessTokenStrategy,
    JwtAccessGuard,
    RefreshTokenStrategy,
    JwtRefreshGuard,
    GoogleStrategy,
    GoogleOauthGuard,
    GithubStrategy,
    GithubOauthGuard,
  ],
  exports: [AccessTokenStrategy, JwtAccessGuard, RefreshTokenStrategy, JwtRefreshGuard, PassportModule, UserInfoRepositoryPort],
})
export class AuthModule { }
