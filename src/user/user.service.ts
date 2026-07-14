import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserUseCase } from "./ports/inbound/user.usecase";
import { UserInfoRepositoryPort } from "../auth/ports/outbound/user-info-repository.port";
import { UserProfileDto } from "./adapters/inbound/dto/user-profile.dto";
import { UpdateUserProfileDto } from "./adapters/inbound/dto/update-user-profile.dto";
import { UpdatePasswordDto } from "./adapters/inbound/dto/update-password.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService implements UserUseCase {
  constructor(
    private readonly userRepositoryPort: UserInfoRepositoryPort,
  ) { }

  async getUserProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.userRepositoryPort.getUserInfoByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return new UserProfileDto(user.usernameValue, user.emailValue, user.provider, user.pictureValue);
  }

  async updateUserProfile(userId: number, updateUserProfileDto: UpdateUserProfileDto): Promise<void> {
    const { username, email, picture } = updateUserProfileDto;
    const user = await this.userRepositoryPort.getUserInfoByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} is not found`);
    }

    user.updateInfo(username, email, picture);
    await this.userRepositoryPort.updateUserInfo(user);
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const { oldPassword, newPassword } = updatePasswordDto;

    if (oldPassword === newPassword) {
      throw new ConflictException('Previous password cannot be reused');
    }

    const user = await this.userRepositoryPort.getUserInfoByUserId(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} is not found`);
    }

    const isValid = await bcrypt.compare(oldPassword, user.encodedPassword);

    if (!isValid) {
      throw new UnauthorizedException('Previous password is wrong input');
    }

    const salt = await bcrypt.genSalt();
    user.changePassword(await bcrypt.hash(newPassword, salt));

    await this.userRepositoryPort.updateUserInfo(user);
  }

}