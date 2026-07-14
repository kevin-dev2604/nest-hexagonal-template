import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UserInfoRepositoryPort } from '../../src/auth/ports/outbound/user-info-repository.port';
import { LoginHistoryRepositoryPort } from '../../src/auth/ports/outbound/login-history-repository.port';
import { AuthRepositoryPort } from '../../src/auth/ports/outbound/auth-repository.port';
import { JwtPort } from '../../src/auth/ports/outbound/jwt.port';
import { AuthCredentialDto } from '../../src/auth/adapters/inbound/dto/auth-credential.dto';
import * as bcrypt from "bcrypt";
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService (단위 테스트)', () => {
  let authService: AuthService;
  let userRepositoryPort: UserInfoRepositoryPort;
  let loginHistoryRepositoryPort: LoginHistoryRepositoryPort;
  let authRepositoryPort: AuthRepositoryPort;
  let jwtPort: JwtPort;

  // 1. 가짜 레포지토리 포트(Mock) 정의
  const mockUserInfoRepositoryPort = {
    createUser: jest.fn(),
    getUserInfo: jest.fn(),
    getSocialUserInfo: jest.fn(),
    getUserInfoByUserId: jest.fn(),
    updateUserInfo: jest.fn()
  }
  const mockLoginHistoryRepositoryPort = {
    saveHistory: jest.fn()
  }
  const mockAuthRepositoryPort = {
    saveRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn()
  }
  const mockJwtPort = {
    generateToken: jest.fn()
  }

  beforeEach(async () => {
    // 2. Nest.js 테스트 컨테이너 세팅
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          // 💡 인터페이스/추상클래스 토큰에 가짜 객체를 바인딩
          provide: UserInfoRepositoryPort,
          useValue: mockUserInfoRepositoryPort,
        },
        {
          // 💡 인터페이스/추상클래스 토큰에 가짜 객체를 바인딩
          provide: LoginHistoryRepositoryPort,
          useValue: mockLoginHistoryRepositoryPort,
        },
        {
          // 💡 인터페이스/추상클래스 토큰에 가짜 객체를 바인딩
          provide: AuthRepositoryPort,
          useValue: mockAuthRepositoryPort,
        },
        {
          // 💡 인터페이스/추상클래스 토큰에 가짜 객체를 바인딩
          provide: JwtPort,
          useValue: mockJwtPort,
        },
      ],
    }).compile();

    // 3. 테스트에 사용할 인스턴스 확보
    authService = module.get<AuthService>(AuthService);
    userRepositoryPort = module.get<UserInfoRepositoryPort>(UserInfoRepositoryPort);
    loginHistoryRepositoryPort = module.get<LoginHistoryRepositoryPort>(LoginHistoryRepositoryPort);
    authRepositoryPort = module.get<AuthRepositoryPort>(AuthRepositoryPort);
    jwtPort = module.get<JwtPort>(JwtPort);
  });

  // 매 테스트 종료 후 가짜 함수의 기록 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Success: access-token and refresh-token is made upon successful login', async () => {
    // given (상황 설정)
    const userId = 1;
    const loginId = "test-id";
    const loginPw = "test-pw";
    const encodedPassword = await bcrypt.hash(loginPw, await bcrypt.genSalt());

    userRepositoryPort.getUserInfo = jest.fn().mockResolvedValue({
      userId,
      loginId,
      encodedPassword,
      usernameValue: "tester"
    });

    const accessToken = "test-access-token-value";
    const refreshToken = "test-refresh-token-value";

    jwtPort.generateToken = jest.fn().mockResolvedValue({ accessToken, refreshToken });

    // when (행위)
    const authCredentialDto = new AuthCredentialDto(loginId, loginPw);
    const result = await authService.signin(authCredentialDto);

    // then (검증)
    expect(userRepositoryPort.getUserInfo).toHaveBeenCalledWith(loginId);
    expect(jwtPort.generateToken).toHaveBeenCalledWith(userId);
    expect(result).toHaveProperty("accessToken", accessToken);
    expect(result).toHaveProperty("refreshToken", refreshToken);
  });

  it('Fail: login fail if login-id is unsigned', async () => {
    // given (상황 설정)
    const loginId = "test-id";
    const loginPw = "test-pw";

    userRepositoryPort.getUserInfo = jest.fn().mockRejectedValue(new NotFoundException("User test-id is not found"));

    // when & then (행위 및 검증을 동시에 처리)
    const authCredentialDto = new AuthCredentialDto(loginId, loginPw);
    await expect(
      authService.signin(authCredentialDto)
    ).rejects.toThrow(NotFoundException)

    // then (검증)
    expect(jwtPort.generateToken).not.toHaveBeenCalled();
  });

  it('Fail: login fail if login password is wrong', async () => {
    // given (상황 설정)
    const userId = 1;
    const loginId = "test-id";
    const loginPw = "test-pw";
    const encodedPassword = await bcrypt.hash("test-pw-2", await bcrypt.genSalt());

    userRepositoryPort.getUserInfo = jest.fn().mockResolvedValue({
      userId,
      loginId,
      encodedPassword,
      usernameValue: "tester"
    });

    // when & then (행위 및 검증을 동시에 처리)
    const authCredentialDto = new AuthCredentialDto(loginId, loginPw);
    await expect(
      authService.signin(authCredentialDto)
    ).rejects.toThrow(UnauthorizedException)

    // then (검증)
    expect(jwtPort.generateToken).not.toHaveBeenCalled();
  });

  it('Fail: id & password login fails if user account is from oauth2 service', async () => {
    // given (상황 설정)
    const userId = 1;
    const loginId = "tester_fake@google.com";
    const loginPw = "test-pw";
    const encodedPassword = await bcrypt.hash(loginPw, await bcrypt.genSalt());

    userRepositoryPort.getUserInfo = jest.fn().mockResolvedValue({
      userId,
      loginId,
      encodedPassword,
      provider: "google",
      usernameValue: "tester",
      emailValue: loginId
    });

    // when & then (행위 및 검증을 동시에 처리)
    const authCredentialDto = new AuthCredentialDto(loginId, loginPw);
    await expect(
      authService.signin(authCredentialDto)
    ).rejects.toThrow(ConflictException)

    // then (검증)
    expect(jwtPort.generateToken).not.toHaveBeenCalled();
  });

  it('Fail: if redis server is stopped', async () => {
    // given (상황 설정)
    const accessToken = "test-access-token-value";
    const refreshToken = "test-refresh-token-value";

    jwtPort.generateToken = jest.fn().mockResolvedValue({ accessToken, refreshToken });
    authRepositoryPort.saveRefreshToken = jest.fn().mockRejectedValue({ name: "ETIMEDOUT", message: "Connection refused" });

    // when (행위)
    await expect(
      authService.refresh(1)
    ).rejects.toHaveProperty("name", "ETIMEDOUT")
    // then (검증)
  });

  /*
  it('Success: ', async () => {
    // given (상황 설정)
    // when (행위)
    // then (검증)
  });

  it('Fail: ', async () => {
    // given (상황 설정)
    // when (행위)
    // then (검증)
  });

  it('Fail: ', async () => {
    // given (상황 설정)
    // when (행위)
    // then (검증)
  });
  */
})