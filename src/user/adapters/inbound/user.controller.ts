import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserUseCase } from "../../ports/inbound/user.usecase";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetUser } from "../../../common/decorators/user.decorator";
import { UserProfileDto } from "./dto/user-profile.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { JwtAccessGuard } from "../../../auth/adapters/inbound/guards/jwt-access.guard";

@ApiTags('회원 정보 API') // Swagger UI에서 그룹핑할 태그명
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(
    private readonly userUseCase: UserUseCase,
  ) { }

  @Get('profile')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: '유저 프로필 조회', description: '유저의 프로필 정보를 조회합니다.' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '유효하지 않은 유저 토큰' })
  async getUserProfile(
    @GetUser() user: { userId: number }
  ): Promise<UserProfileDto> {
    return await this.userUseCase.getUserProfile(user.userId);
  }

  @Post('profile')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: '유저 프로필 수정', description: '유저의 프로필 정보를 수정합니다.' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 404, description: '유효하지 않은 유저 토큰' })
  async updateUserProfile(
    @GetUser() user: { userId: number },
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ): Promise<void> {
    await this.userUseCase.updateUserProfile(user.userId, updateUserProfileDto);
  }

  @Post('password')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({ summary: '유저 패스워드 변경', description: '유저의 로그인 패스워드를 변경합니다.' })
  @ApiResponse({ status: 200, description: '패스워드 변경 성공' })
  @ApiResponse({ status: 401, description: '기존 패스워드 입력 오류' })
  @ApiResponse({ status: 404, description: '유효하지 않은 유저 토큰' })
  @ApiResponse({ status: 409, description: '기존 패스워드 재입력 경고' })
  async updatePassword(
    @GetUser() user: { userId: number },
    @Body() updatePasswordDto: UpdatePasswordDto
  ): Promise<void> {
    await this.userUseCase.updatePassword(user.userId, updatePasswordDto);
  }
}