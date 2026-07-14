import { Body, Controller, Get, Post, Req, Res, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthUseCase } from "../../ports/inbound/auth.usecase";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthCredentialDto } from "./dto/auth-credential.dto";
import { TokenInfoDto } from "./dto/token-info.dto";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { GetUser } from "../../../common/decorators/user.decorator";
import { GoogleOauthGuard } from "./guards/google-oauth.guard";
import { GithubOauthGuard } from "./guards/github-oauth.guard";
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";

@ApiTags('회원가입 및 인증 API') // Swagger UI에서 그룹핑할 태그명
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authUseCase: AuthUseCase,
  ) { }

  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse({ status: 200, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 양식 또는 이메일 중복' })
  async signup(
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ): Promise<void> {
    await this.authUseCase.signup(createUserDto);
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인', description: 'ID와 패스워드를 통해 로그인합니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '패스워드 오류' })
  @ApiResponse({ status: 404, description: '미가입 ID' })
  @ApiResponse({ status: 409, description: 'OAuth 로그인 대상' })
  async signin(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialDto
  ): Promise<TokenInfoDto> {
    const result = await this.authUseCase.signin(authCredentialDto);
    return result;
  }

  @Get('signin/google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Google 로그인', description: 'Google 인증 플랫폼에서 OAuth 인증을 거치는 로그인을 호출하는 경로이며, 웹에서 호출해야 동작합니다.' })
  async googleAuth(@Req() req) {
  }

  @Get('signin/google/callback')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Google 로그인 (콜백)', description: 'Google 인증 플랫폼에서 OAuth 인증이 통과되면 이어서 토근을 생성하고 프론트엔드로 전달합니다.' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    // req.user에 위에서 validate한 구글 유저 정보가 들어있습니다.
    const tokens = await this.authUseCase.signinOAuth(req.user, 'google');

    // 프론트엔드로 JWT(Access/Refresh) 토큰을 전달하며 리다이렉트
    res.redirect(`http://localhost:3001/oauth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  }


  @Get('signin/github')
  @UseGuards(GithubOauthGuard)
  @ApiOperation({ summary: 'Github 로그인', description: 'Github 인증 플랫폼에서 OAuth 인증을 거치는 로그인을 호출하는 경로이며, 웹에서 호출해야 동작합니다.' })
  async githubAuth(@Req() req) {
  }

  @Get('signin/github/callback')
  @UseGuards(GithubOauthGuard)
  @ApiOperation({ summary: 'Github 로그인 (콜백)', description: 'Github 인증 플랫폼에서 OAuth 인증이 통과되면 이어서 토근을 생성하고 프론트엔드로 전달합니다.' })
  async githubAuthRedirect(@Req() req, @Res() res) {
    const tokens = await this.authUseCase.signinOAuth(req.user, 'github');

    res.redirect(`http://localhost:3001/oauth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  }

  @ApiSecurity('refresh-token') // 🌟 여기는 'refresh-token' 자물쇠를 활성화합니다.
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신', description: '헤더에 담긴 Refresh Token을 검증하여 새로운 JWT를 발급합니다.' })
  @ApiResponse({ status: 200, description: 'JWT 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token' })
  async refresh(
    @GetUser() user: { userId: number, refreshToken: string }
  ): Promise<TokenInfoDto> {
    const { userId } = user;
    const result = await this.authUseCase.refresh(userId);
    return result;
  }

  @ApiSecurity('refresh-token') // 🌟 여기는 'refresh-token' 자물쇠를 활성화합니다.
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '유저의 JWT를 무효화합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token' })
  async logout(
    @GetUser() user: { userId: number, refreshToken: string }
  ): Promise<void> {
    await this.authUseCase.logout(user.userId);
  }
}